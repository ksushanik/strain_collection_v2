# Deployment Guide

## Деплой на Production

### Основной флоу (обычный релиз)

```bash
# Git Bash или WSL
make push-all && make deploy-prod
```

Что делает:
1. Собирает Docker образы backend и frontend
2. Пушит образы в Docker Hub (registry: `gimmyhat`)
3. На сервере (`ssh 4feb`) выполняет `docker compose pull && docker compose up -d`

---

## Миграции (Prisma)

Перед запуском новой версии backend на production нужно применить Prisma migrations к production базе данных.

Обычно это делается автоматически на старте backend контейнера командой:

```bash
npx prisma migrate deploy
```

Если нужно выполнить миграции вручную (разовая процедура/контроль), используй:

```bash
make migrate-prod
```

Примечание:
- Для перехода на новую модель phenotypes часть legacy‑полей переносится в `strain_phenotypes` во время миграций (до удаления старых колонок).
- Для дополнительных разовых переносов данных можно использовать отдельные скрипты (например, `backend/scripts/import-prod-backup.ts` для локальной проверки на бэкапе).

---

## Сид (seed) данных на Production

Важно: seed предназначен для первоначального заполнения/тестовых данных.

```bash
# Git Bash или WSL
make seed-prod
```

Рекомендуемый workflow:
```bash
# 1) Деплой сервисов
make push-all && make deploy-prod

# 2) Seed (если нужно)
make seed-prod
```

---

## Очистка Docker на Production

Если получаешь ошибку `no space left on device`:

```bash
# Git Bash или WSL
make clean-prod
```

Внимание: команда удаляет неиспользуемые образы/кеш/volumes.

---

## Проверка места на диске

```bash
# Git Bash или WSL
make disk-usage-prod
```

---

## Troubleshooting

### PowerShell и SSH

Если в PowerShell нет `ssh`, используй Git Bash или WSL. Либо команды с суффиксом `-win` (например, `make deploy-prod-win`).

### Проверка статуса контейнеров

```bash
ssh 4feb "cd /home/user/bio_collection && docker compose ps"
```

### Логи

```bash
ssh 4feb "cd /home/user/bio_collection && docker compose logs backend --tail=100"
ssh 4feb "cd /home/user/bio_collection && docker compose logs frontend --tail=100"
```

---

## Production окружение

- Сервер: `4feb` (SSH alias)
- Путь: `/home/user/bio_collection`
- Registry: `gimmyhat/strain-collection-v2-*:latest`

Контейнеры:
- `strain_v2_backend` — NestJS API (порт 3000)
- `strain_v2_frontend` — Next.js (порт 3001)
- `strain_v2_db` — PostgreSQL
- `strain_v2_redis` — Redis

---

## Manage Commands

| Команда | Описание |
|--------|----------|
| `make push-all` | Собрать и запушить все образы |
| `make deploy-prod` | Деплой на production |
| `make migrate-prod` | Применить Prisma migrations на production |
| `make seed-prod` | Запустить seed на production |
| `make clean-prod` | Очистка Docker (образы/кеш/volumes) |
| `make disk-usage-prod` | Показать использование диска и Docker |

