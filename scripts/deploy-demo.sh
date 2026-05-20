#!/usr/bin/env bash
# Bring up (or refresh) the demo stack on 4feb.
#
# Reuses .env in PROJECT_DIR for IMAGE_TAG/IMAGE_REGISTRY (same env as prod
# deploy-prod.sh — single source of truth for what tag is current).
#
# Idempotent: safe to re-run. Does NOT seed the DB — that's reset-demo.sh.
#
# Health-gate logic mirrors deploy-prod.sh.

set -euo pipefail

PROJECT_DIR="${PROJECT_DIR:-/home/deploy/bio_collection}"
HEALTH_TIMEOUT_SEC="${HEALTH_TIMEOUT_SEC:-90}"
HEALTH_POLL_INTERVAL="${HEALTH_POLL_INTERVAL:-2}"

cd "$PROJECT_DIR"

if [ -f .env ]; then
    set -a
    # shellcheck disable=SC1091
    . ./.env
    set +a
    echo ">>> Loaded .env (IMAGE_TAG=${IMAGE_TAG:-unset}, IMAGE_REGISTRY=${IMAGE_REGISTRY:-unset})"
fi

echo ">>> Pulling demo images..."
docker compose -f docker-compose.demo.yml pull

echo ">>> Recreating demo containers..."
docker compose -f docker-compose.demo.yml up -d

cid=$(docker compose -f docker-compose.demo.yml ps -q backend)
if [ -z "$cid" ]; then
    echo "ERROR: could not resolve demo backend container id" >&2
    exit 1
fi

echo ">>> Waiting up to ${HEALTH_TIMEOUT_SEC}s for demo backend ($cid) to become healthy..."
deadline=$(( $(date +%s) + HEALTH_TIMEOUT_SEC ))
while :; do
    status=$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' "$cid" 2>/dev/null || echo missing)
    case "$status" in
        healthy)
            echo ">>> demo backend is healthy"
            break
            ;;
        unhealthy)
            echo "ERROR: demo backend reported unhealthy — recent logs:" >&2
            docker logs --tail 50 "$cid" >&2 || true
            exit 1
            ;;
        none)
            echo "WARN: demo backend has no HEALTHCHECK — falling back to single HTTP probe" >&2
            if docker exec "$cid" node -e "require('http').get('http://127.0.0.1:3000', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"; then
                echo ">>> demo backend responded 200 to fallback probe"
                break
            else
                echo "ERROR: demo backend did not respond to fallback probe" >&2
                docker logs --tail 50 "$cid" >&2 || true
                exit 1
            fi
            ;;
    esac

    if [ "$(date +%s)" -ge "$deadline" ]; then
        echo "ERROR: demo backend health timeout after ${HEALTH_TIMEOUT_SEC}s (last status: $status)" >&2
        docker logs --tail 50 "$cid" >&2 || true
        exit 1
    fi
    sleep "$HEALTH_POLL_INTERVAL"
done

echo ">>> Demo deploy complete."
