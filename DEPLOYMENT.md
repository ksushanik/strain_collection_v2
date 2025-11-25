# Deployment Guide

## 🚀 Деплой в Production

### Обычный деплой (обновление кода)

```bash
# Git Bash или WSL
make push-all && make deploy-prod
```

**Что происходит:**
1. Собираются Docker образы backend и frontend
2. Образы пушатся в Docker Hub (registry: gimmyhat)
3. На сервере `4feb` скачиваются новые образы и перезапускается стек

---

## 💾 Загрузка тестовых данных в Production

### ⚠️ ВАЖНО: Seed удалит все существующие данные!

```bash
# Git Bash или WSL
make seed-prod
```

**Workflow для первого запуска:**
```bash
# 1. Деплой приложения
make push-all && make deploy-prod

# 2. Загрузка тестовых данных (40 samples, 20 strains, 16 boxes)
make seed-prod
```

**Что будет создано:**
- 40 образцов (Samples)
- 20 штаммов (Strains)
- 16 коробок хранения (Storage Boxes)
- 3 пользователя:
  - `admin@example.com` / `admin123` (ADMIN)
  - `manager@example.com` / `manager123` (MANAGER)
  - `viewer@example.com` / `viewer123` (USER)

---

## 🧹 Очистка Docker на Production

Если возникает ошибка `no space left on device`:

```bash
# Git Bash или WSL
make clean-prod
```

**Что удаляется:**
- Все остановленные контейнеры
- Все неиспользуемые образы
- Неиспользуемые volumes
- Build cache

**Безопасность:** Активные данные БД сохраняются.

---

## 📊 Проверка использования диска

```bash
# Git Bash или WSL
make disk-usage-prod
```

---

## 🛠️ Troubleshooting

### PowerShell не находит SSH

**Проблема:** `ssh : The term 'ssh' is not recognized`

**Решение:** Используйте **Git Bash** или **WSL** вместо PowerShell для команд с `make`.

### Нехватка места на диске

1. Проверьте использование:
```bash
make disk-usage-prod
```

2. Очистите неиспользуемые ресурсы:
```bash
make clean-prod
```

3. При необходимости очистите вручную на сервере:
```bash
ssh 4feb "docker system prune -af --volumes"
```

### Проверка статуса контейнеров

```bash
ssh 4feb "cd /home/user/bio_collection && docker compose ps"
```

### Просмотр логов

```bash
# Backend логи
ssh 4feb "cd /home/user/bio_collection && docker compose logs backend --tail=100"

# Frontend логи
ssh 4feb "cd /home/user/bio_collection && docker compose logs frontend --tail=100"
```

---

## 📁 Структура Production

**Сервер:** `4feb` (SSH alias)  
**Путь:** `/home/user/bio_collection`  
**Registry:** `gimmyhat/strain-collection-v2-*:latest`

**Контейнеры:**
- `strain_v2_backend` - NestJS API (порт 3000)
- `strain_v2_frontend` - Next.js (порт 3001)
- `strain_v2_db` - PostgreSQL
- `strain_v2_redis` - Redis

---

## 🔄 Откат к предыдущей версии

```bash
# Используйте конкретный тег вместо latest
ssh 4feb "cd /home/user/bio_collection && docker compose pull && docker compose up -d"
```

Для этого нужно предварительно изменить теги в `docker-compose.yml` на сервере или использовать переменные окружения.

---

## 📝 Manage Commands

| Команда | Описание |
|---------|----------|
| `make push-all` | Собрать и запушить все образы |
| `make deploy-prod` | Деплой на production |
| `make seed-prod` | Загрузить seed данные |
| `make clean-prod` | Очистить Docker ресурсы |
| `make disk-usage-prod` | Проверить использование диска |

**Примечание:** Все команды требуют Git Bash или WSL (не PowerShell).
