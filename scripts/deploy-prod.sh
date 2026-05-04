#!/usr/bin/env bash
# Production deploy for strain_collection_v2.
#
# Invoked by:
#   - .github/workflows/deploy.yml (primary path)
#   - `make deploy-prod` (escape hatch when GH Actions is down)
#
# Reads .env in PROJECT_DIR for IMAGE_REGISTRY / IMAGE_TAG (used by
# docker-compose.prod.yml's image: ${...} interpolation). Override
# PROJECT_DIR via env var if needed (default: /home/deploy/bio_collection).
#
# Steps:
#   1. Source .env (IMAGE_TAG, IMAGE_REGISTRY)
#   2. Pull new images
#   3. Recreate containers (docker compose up -d)
#   4. Wait for backend to report `healthy` via Docker HEALTHCHECK
#      (fail loudly if it does not — previous version exited 0 either way)
#   5. Best-effort sync of AdminJS components bundle to host so the
#      external nginx alias can serve the freshest file.

set -euo pipefail

PROJECT_DIR="${PROJECT_DIR:-/home/deploy/bio_collection}"
HEALTH_TIMEOUT_SEC="${HEALTH_TIMEOUT_SEC:-90}"
HEALTH_POLL_INTERVAL="${HEALTH_POLL_INTERVAL:-2}"

cd "$PROJECT_DIR"

# Load IMAGE_TAG / IMAGE_REGISTRY (and any other deploy-time vars) from .env
# so docker compose sees them for image: ${...} interpolation. set -a exports
# every assigned variable until set +a.
if [ -f .env ]; then
    set -a
    # shellcheck disable=SC1091
    . ./.env
    set +a
    echo ">>> Loaded .env (IMAGE_TAG=${IMAGE_TAG:-unset}, IMAGE_REGISTRY=${IMAGE_REGISTRY:-unset})"
fi

echo ">>> Pulling images..."
docker compose pull

echo ">>> Recreating containers..."
docker compose up -d

cid=$(docker compose ps -q backend)
if [ -z "$cid" ]; then
    echo "ERROR: could not resolve backend container id" >&2
    exit 1
fi

echo ">>> Waiting up to ${HEALTH_TIMEOUT_SEC}s for backend ($cid) to become healthy..."
deadline=$(( $(date +%s) + HEALTH_TIMEOUT_SEC ))
while :; do
    status=$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' "$cid" 2>/dev/null || echo missing)
    case "$status" in
        healthy)
            echo ">>> backend is healthy"
            break
            ;;
        unhealthy)
            echo "ERROR: backend reported unhealthy — recent logs:" >&2
            docker logs --tail 50 "$cid" >&2 || true
            exit 1
            ;;
        none)
            echo "WARN: backend has no HEALTHCHECK defined — falling back to single HTTP probe" >&2
            if docker exec "$cid" node -e "require('http').get('http://127.0.0.1:3000', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"; then
                echo ">>> backend responded 200 to fallback probe"
                break
            else
                echo "ERROR: backend did not respond to fallback probe" >&2
                docker logs --tail 50 "$cid" >&2 || true
                exit 1
            fi
            ;;
    esac

    if [ "$(date +%s)" -ge "$deadline" ]; then
        echo "ERROR: backend health timeout after ${HEALTH_TIMEOUT_SEC}s (last status: $status)" >&2
        docker logs --tail 50 "$cid" >&2 || true
        exit 1
    fi
    sleep "$HEALTH_POLL_INTERVAL"
done

echo ">>> Syncing AdminJS components.bundle.js to host (best-effort)..."
mkdir -p backend/.adminjs
target=backend/.adminjs/components.bundle.js
tmp="${target}.tmp.$$"

# Stage to a temp file and only promote it if non-empty.
# Direct `> $target` would truncate the existing host file to zero bytes
# whenever both candidate files are absent inside the container — silently
# breaking the nginx alias that serves this bundle.
# `if cmd && cmd` is exempt from `set -e`, so docker exec failures are caught.
if docker exec "$cid" sh -lc '
    src=
    if [ -f /app/.adminjs/components.bundle.js ]; then
        src=/app/.adminjs/components.bundle.js
    elif [ -f /app/.adminjs/bundle.js ]; then
        src=/app/.adminjs/bundle.js
    fi
    if [ -n "$src" ]; then cat "$src"; fi
' > "$tmp" 2>/dev/null && [ -s "$tmp" ]; then
    mv "$tmp" "$target"
    echo ">>> AdminJS bundle synced ($(wc -c < "$target") bytes)"
else
    rm -f "$tmp"
    echo "WARN: AdminJS bundle missing or empty — keeping previous host file (non-fatal)"
fi

echo ">>> Deploy complete."
