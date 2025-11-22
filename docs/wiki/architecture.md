# Обзор и архитектура

- **Frontend**: Next.js (App Router), порт 3001. Структура `src/app`, `components/domain|ui|layout`, `services/api.ts`.
- **Backend**: NestJS + Prisma, порт 3000. Модули: strains, samples, storage, media, settings, users/admin, audit, casl.
- **База**: PostgreSQL (docker-compose). Prisma schema в `backend/prisma/schema.prisma`.
- **Аутентификация**: register/login → Bearer JWT; токен хранится в localStorage на фронте.
- **Swagger**: `http://localhost:3000/docs`.
- **Порты**: API 3000, UI 3001 (см. compose).
- **Ключевые сущности**:
  - Sample: пробы, фото.
  - Strain: штаммы, характеристики, связь с media и storage.
  - Media: справочник питательных сред.
  - Storage: boxes/cells, allocate/unallocate/bulk, audit.
  - Settings: ui-bindings (динамические секции), legend (текст).
