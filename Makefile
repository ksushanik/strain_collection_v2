REGISTRY      ?= gimmyhat
TAG           ?= latest
API_URL       ?= https://culturedb.elcity.ru
BACKEND_IMAGE := $(REGISTRY)/strain-collection-v2-backend:$(TAG)
FRONTEND_IMAGE:= $(REGISTRY)/strain-collection-v2-frontend:$(TAG)

.PHONY: build-backend build-frontend push-backend push-frontend push-all deploy-prod

build-backend:
	docker build -t $(BACKEND_IMAGE) -f backend/Dockerfile backend

build-frontend:
	docker build -t $(FRONTEND_IMAGE) --build-arg NEXT_PUBLIC_API_URL=$(API_URL) -f frontend/Dockerfile .

push-backend: build-backend
	docker push $(BACKEND_IMAGE)

push-frontend: build-frontend
	docker push $(FRONTEND_IMAGE)

push-all: push-backend push-frontend

# Простой деплой на прод (сервер alias ssh 4feb, путь /home/user/bio_collection).
# Обновляет образы и перезапускает стек.
deploy-prod:
	ssh 4feb "cd /home/user/bio_collection && docker compose pull && docker compose up -d"

# Для PowerShell/Windows, где GNU make запускает cmd.exe и ssh не находится,
# используйте этот таргет (оборачивает ssh в powershell -Command).
deploy-prod-win:
	powershell -Command "ssh 4feb \"cd /home/user/bio_collection && docker compose pull && docker compose up -d\""
