#!/usr/bin/env bash
# Nightly reset of the demo instance back to mock data.
#
# Steps:
#   1. Pull latest demo images (D4: demo follows :latest tag).
#   2. Restart containers if images changed.
#   3. Wait for backend container to be running (not necessarily healthy —
#      DB may be empty if this is first run).
#   4. Wipe DB and re-run the existing prisma seed.
#   5. Probe backend health (same loop as deploy-prod.sh).
#
# Triggered by /etc/systemd/system/strain-demo-reset.timer @ 03:00 MSK daily.
# Also safe to run manually for first bootstrap.

set -euo pipefail

PROJECT_DIR="${PROJECT_DIR:-/home/deploy/bio_collection}"
HEALTH_TIMEOUT_SEC="${HEALTH_TIMEOUT_SEC:-90}"
LOG="${RESET_LOG:-/var/log/strain-demo-reset.log}"

# Append all output to the log so cron has a paper trail.
exec >> "$LOG" 2>&1
echo
echo "=== $(date -Iseconds) demo reset start (PROJECT_DIR=$PROJECT_DIR) ==="

cd "$PROJECT_DIR"

if [ -f .env ]; then
    set -a
    # shellcheck disable=SC1091
    . ./.env
    set +a
fi

echo ">>> Pulling latest demo images..."
docker compose -f docker-compose.demo.yml pull backend frontend

echo ">>> Restarting demo containers (if image changed, docker compose up -d will recreate)..."
docker compose -f docker-compose.demo.yml up -d

# Container must be running before we exec into it. Allow ~10s for startup.
echo ">>> Waiting for demo backend container to be in 'running' state..."
for _ in $(seq 1 10); do
    state=$(docker inspect --format '{{.State.Status}}' strain_v2_demo_backend 2>/dev/null || echo missing)
    if [ "$state" = "running" ]; then
        break
    fi
    sleep 1
done
if [ "$state" != "running" ]; then
    echo "ERROR: demo backend container did not reach 'running' state (last: $state)"
    exit 1
fi

echo ">>> Resetting demo DB and re-seeding via existing seed.ts..."
# --skip-seed because Prisma's automatic seed hook isn't reliable in
# production-mode containers; we invoke the compiled seed.js explicitly.
docker exec strain_v2_demo_backend sh -c '
    npx prisma migrate reset --force --skip-seed &&
    node dist/prisma/seed.js
'

echo ">>> Waiting up to ${HEALTH_TIMEOUT_SEC}s for demo backend to be healthy after reset..."
deadline=$(( $(date +%s) + HEALTH_TIMEOUT_SEC ))
while :; do
    status=$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' strain_v2_demo_backend 2>/dev/null || echo missing)
    case "$status" in
        healthy)
            echo ">>> demo backend healthy"
            break
            ;;
        unhealthy)
            echo "ERROR: demo backend reported unhealthy after reset"
            docker logs --tail 80 strain_v2_demo_backend
            exit 1
            ;;
        none)
            # HEALTHCHECK absent — single HTTP probe fallback.
            if docker exec strain_v2_demo_backend node -e "require('http').get('http://127.0.0.1:3000', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"; then
                echo ">>> demo backend responded 200 to fallback probe"
                break
            fi
            ;;
    esac
    if [ "$(date +%s)" -ge "$deadline" ]; then
        echo "ERROR: demo backend health timeout (last: $status)"
        docker logs --tail 80 strain_v2_demo_backend
        exit 1
    fi
    sleep 2
done

echo "=== $(date -Iseconds) demo reset done ==="
