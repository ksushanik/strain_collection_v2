REGISTRY      ?= gimmyhat
TAG           ?= latest
API_URL       ?= https://culturedb.elcity.ru
BACKEND_IMAGE := $(REGISTRY)/strain-collection-v2-backend:$(TAG)
FRONTEND_IMAGE:= $(REGISTRY)/strain-collection-v2-frontend:$(TAG)

.PHONY: build-backend build-frontend push-backend push-frontend push-all deploy-prod deploy-local

build-backend:
	docker build -t $(BACKEND_IMAGE) -f backend/Dockerfile backend

build-frontend:
	docker build -t $(FRONTEND_IMAGE) --build-arg NEXT_PUBLIC_API_URL=$(API_URL) -f frontend/Dockerfile .

push-backend: build-backend
	docker push $(BACKEND_IMAGE)

push-frontend: build-frontend
	docker push $(FRONTEND_IMAGE)

push-all: push-backend push-frontend

# Local deploy with local images (see docker-compose.local.yml override)
deploy-local:
	docker compose -f docker-compose.yml -f docker-compose.local.yml up -d postgres redis backend frontend

# Простой деплой на прод (сервер alias ssh 4feb, путь /home/user/bio_collection).
# Обновляет образы и перезапускает стек.
# AdminJS bundle теперь отдаётся через бэкенд (nginx проксирует /admin/*).
deploy-prod:
	ssh 4feb "cd /home/user/bio_collection && docker compose pull && docker compose up -d"

# Для PowerShell/Windows, где GNU make запускает cmd.exe и ssh не находится,
# используйте этот таргет (оборачивает ssh в powershell -Command).
deploy-prod-win:
	powershell -Command "ssh 4feb \"cd /home/user/bio_collection && docker compose pull && docker compose up -d\""

# Очистка неиспользуемых Docker ресурсов на production
clean-prod:
	ssh 4feb "docker system prune -af --volumes"

# Для Windows
clean-prod-win:
	powershell -Command "ssh 4feb \"docker system prune -af --volumes\""

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

# Загрузить seed данные в production
# Использует скомпилированный seed.js (см. backend/Dockerfile)
seed-prod:
	ssh 4feb "cd /home/user/bio_collection && docker compose exec -T backend node dist/prisma/seed.js"

# Для Windows
seed-prod-win:
	powershell -Command "ssh 4feb \"cd /home/user/bio_collection \&\& docker compose exec -T backend node dist/prisma/seed.js\""

