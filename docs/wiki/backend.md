# Backend (NestJS/Prisma)

- **Старт**: `cd backend && npm install && npx prisma generate && npx prisma migrate dev && npm run start:dev`.
- **Модули**:
  - `strains`: CRUD, фильтры (taxonomy/search/sampleCode/seq/gram/hasGenome etc), связи media/storage.
  - `samples`: CRUD, фото (upload/delete).
  - `storage`: boxes/cells, allocate/unallocate/bulk-allocate по адресу ячейки; уникальность (boxId, cellCode).
  - `media`: CRUD, поиск/пагинация.
  - `settings`: ui-bindings (динамические разделы), legend (текстовая справка).
  - `analytics`: `/api/v1/analytics/overview` (totals, occupied/free, recent additions).
  - `audit`: перехват действий (CREATE/UPDATE/DELETE/ALLOCATE/UNALLOCATE/BULK_ALLOCATE/CONFIG).
  - `auth`: register/login → JWT; `@UseGuards(JwtAuthGuard, PoliciesGuard)`.
  - `casl`: роли ADMIN/MANAGER/USER.
- **Prisma**: schema в `prisma/schema.prisma`; миграции/seed в `prisma/migrations`, `prisma/seed.ts`.
- **Глобальные пайпы**: ValidationPipe с transform + enableImplicitConversion (query → числа/булевые).
- **Важные эндпоинты**:
  - `/api/v1/strains/:id/media` POST/DELETE — линковка media к штамму.
  - `/api/v1/storage/boxes/:boxId/cells/:cellCode/allocate|unallocate` — управление ячейками.
  - `/api/v1/settings/legend` — текст легенды.
- **Тесты**: unit в `src/**/*.spec.ts`, e2e в `test/`; команды `npm run test`, `npm run test:e2e`, `npm run test:cov`.
