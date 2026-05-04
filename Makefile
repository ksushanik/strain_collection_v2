# Default registry. CI publishes to GHCR via build.yml; the local push-all
# target is an escape hatch for shipping when GH Actions is unavailable.
REGISTRY      ?= ghcr.io/ksushanik
TAG           ?= latest
API_URL       ?= https://culturedb.elcity.ru
BACKEND_IMAGE := $(REGISTRY)/strain-collection-v2-backend:$(TAG)
FRONTEND_IMAGE:= $(REGISTRY)/strain-collection-v2-frontend:$(TAG)

.PHONY: build-backend build-frontend push-backend push-frontend push-all deploy-prod deploy-local update-prod-env update-prod-env-win backup-prod backup-prod-win backup-download backup-download-win

build-backend:
	docker build -t $(BACKEND_IMAGE) -f backend/Dockerfile backend

build-frontend:
	docker build -t $(FRONTEND_IMAGE) --build-arg NEXT_PUBLIC_API_URL=$(API_URL) -f frontend/Dockerfile .

push-backend: build-backend
	docker push $(BACKEND_IMAGE)

push-frontend: build-frontend
	docker push $(FRONTEND_IMAGE)

# === ESCAPE HATCH ===
# Normally CI builds and pushes images on every main push (build.yml).
# Use this only if GH Actions is broken and you must ship from your laptop.
# Requires `docker login ghcr.io` locally.
push-all: push-backend push-frontend

# Local deploy with local images (see docker-compose.local.yml override)
deploy-local:
	docker compose -f docker-compose.yml -f docker-compose.local.yml up -d postgres redis backend frontend

# === ESCAPE HATCH ===
# Normally deploy is triggered from GitHub UI: Actions → "Deploy to Production"
# → Run workflow → choose tag. Use this only if GH Actions is unavailable.
# Targets the LEGACY /home/user/bio_collection path because the alias `4feb`
# logs in as `user`, which has no access to /home/deploy/ (owned by deploy
# user, mode 750). After Phase D1 cleanup removes the legacy path, this
# target becomes obsolete; the deploy.yml workflow is the only supported
# route at that point.
deploy-prod:
	ssh 4feb 'PROJECT_DIR=/home/user/bio_collection bash -s' < scripts/deploy-prod.sh

# Обновить .env файлы на production (использует scp)
update-prod-env:
	scp backend/.env.prod user@4feb:/home/user/bio_collection/backend/.env
	scp frontend/.env.prod user@4feb:/home/user/bio_collection/frontend/.env

# One-off: explicitly run Prisma migrations on production (useful for schema/data migrations).
# Note: backend container is configured to run `prisma migrate deploy` on start, but this command is safer for manual control.
migrate-prod:
	ssh 4feb "bash -lc 'cd /home/user/bio_collection && cid=\$$(docker compose ps -q backend) && if [ -z \"\$$cid\" ]; then docker compose up -d backend; cid=\$$(docker compose ps -q backend); fi && docker exec \$$cid sh -lc \"npx prisma migrate deploy\"'"

# For PowerShell/Windows
migrate-prod-win:
	powershell -Command "ssh 4feb \"bash -lc 'cd /home/user/bio_collection \&\& cid=\\\$(docker compose ps -q backend) \&\& if [ -z \\\"\\\$cid\\\" ]; then docker compose up -d backend; cid=\\\$(docker compose ps -q backend); fi \&\& docker exec \\\$cid sh -lc \\\"npx prisma migrate deploy\\\"'\""

# Для PowerShell/Windows, где GNU make запускает cmd.exe и ssh не находится,
# используйте этот таргет (оборачивает ssh в powershell -Command).
# Get-Content -Raw сохраняет LF (важно: .gitattributes пинит scripts/*.sh к LF).
deploy-prod-win:
	powershell -NoProfile -Command "Get-Content -Raw scripts/deploy-prod.sh | ssh 4feb 'PROJECT_DIR=/home/user/bio_collection bash -s'"

# Windows: обновить .env файлы на production
update-prod-env-win:
	powershell -Command "scp backend/.env.prod user@4feb:/home/user/bio_collection/backend/.env; scp frontend/.env.prod user@4feb:/home/user/bio_collection/frontend/.env"

# Очистка неиспользуемых Docker ресурсов на production.
# --filter "until=168h" сохраняет образы новее недели — они нужны для отката
# на предыдущую версию. Без фильтра prune снёс бы все unused-образы, включая
# образы соседних проектов на том же хосте.
clean-prod:
	ssh 4feb "docker system prune -af --filter 'until=168h'"

# Для Windows
clean-prod-win:
	powershell -NoProfile -Command "ssh 4feb \"docker system prune -af --filter 'until=168h'\""

# Проверка использования диска на production
disk-usage-prod:
	ssh 4feb "df -h && echo '' && docker system df"

# Для Windows
disk-usage-prod-win:
	powershell -Command "ssh 4feb \"df -h; echo ''; docker system df\""

# --- Development ---

# Запускает только инфраструктуру (Postgres, Redis) в Docker
dev-env:
	docker compose up -d postgres redis

# Запускает бэкенд в режиме разработки (требует локального Node.js)
dev-backend:
	cd backend && npm run start:dev

# Запускает фронтенд в режиме разработки (требует локального Node.js)
dev-frontend:
	cd frontend && npm run dev

# Sync wiki (docs/wiki -> frontend/public/wiki)
sync-wiki:
	node sync-wiki.mjs

# Ручной бэкап PostgreSQL на production
backup-prod:
	ssh 4feb "/home/user/backups/pg_backup.sh"

# Для Windows
backup-prod-win:
	powershell -Command "ssh 4feb \"/home/user/backups/pg_backup.sh\""

# Скачать последний бэкап с production
backup-download:
	scp "user@4feb:/home/user/backups/$$(ssh 4feb 'ls -t /home/user/backups/*.sql.gz | head -1')" .

# Для Windows
backup-download-win:
	powershell -Command "$$latest = ssh 4feb 'ls -t /home/user/backups/*.sql.gz | head -1'; scp \"user@4feb:$$latest\" ."

# Загрузить seed данные в production
# Использует скомпилированный seed.js (см. backend/Dockerfile)
seed-prod:
	ssh 4feb "cd /home/user/bio_collection && docker compose exec -T backend node dist/prisma/seed.js"

# Для Windows
seed-prod-win:
	powershell -Command "ssh 4feb \"cd /home/user/bio_collection \&\& docker compose exec -T backend node dist/prisma/seed.js\""
