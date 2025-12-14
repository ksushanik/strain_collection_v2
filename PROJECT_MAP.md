# Project Map — Strain Collection v2

Назначение: короткая карта проекта для быстрого онбординга/LLM. Держите файл в актуальном состоянии при появлении новых модулей, страниц, сервисов или схем БД.

## Как поддерживать
- При добавлении/удалении директорий или ключевых файлов обновляйте соответствующий раздел ниже.
- Миграции: фиксируйте новые каталоги в блоке `Prisma/migrations` (достаточно краткого названия/назначения).
- При крупных refactor’ах приложений (Nest/Next) обновляйте маршруты/модули списком.
- Игнорируйте сгенерированные артефакты (`dist`, `coverage`, `node_modules`).

## Корень
- `backend/` — NestJS API + Prisma, e2e tests в `backend/test/`.
- `frontend/` — Next.js (App Router) UI.
- `docs/` — wiki-источник (Markdown), диаграммы `IDEF*.puml/md`; синк в `frontend/public/wiki/`.
- Инфраструктура: `docker-compose.yml`, `nginx.conf`, `Makefile`, `DEPLOYMENT.md`, `README.md`.

## Backend (NestJS)
- Вход: `src/main.ts`, `app.module.ts` (агрегирует доменные модули).
- Доменные модули (каждый: controller + service + module + DTO при наличии):
  - `auth/` — JWT/Local стратегии и гарды, `auth.controller.ts`, `auth.service.ts`.
  - `users/` — `users.service.ts`, `users.module.ts`.
  - `strains/` — CRUD штаммов + фильтрация; DTO `create/strain-query/update`.
  - `samples/` — CRUD образцов + фото; DTO `create/sample-query/update/upload-photo`.
  - `storage/` — ящики/ячейки, выделение/освобождение, DTO `allocate/create/update`.
  - `media/` — CRUD питательных сред, DTO `create/media-query/update`.
  - `methods/` — CRUD методов исследования/хранения, DTO `create/method-query/update`.
  - `taxonomy/` — автодополнение таксономии (service/controller/module + result DTO).
  - `settings/` — настройки приложения.
  - `audit/` — логирование действий (`audit-log.interceptor.ts`, `audit-log.service.ts`, controller).
  - `casl/` — права доступа (ability factory, guard, decorator).
  - `admin/` — AdminJS (`admin.module.ts`, `admin.options.ts`, `sso-controller`, `components/` (React), `resources/`, `helpers/`).
  - `analytics/` — контроллер/сервис для метрик.
  - `services/imagekit.service.ts` — обёртка над ImageKit.
  - `decorators/` — общие декораторы (например, `public.decorator.ts`).
  - `prisma/` — `prisma.module.ts`, `prisma.service.ts`.
- Prisma:
  - `prisma/schema.prisma` — модели БД.
  - `prisma/migrations/*` — датированные миграции (init, auth models, audit log, roles table, legend/storage tweaks, sample types, taxonomy simplification, strain photos, add methods и т.д.).
  - `prisma/seed.ts` — сидинг.
- Скрипты: `create-admin.js`, `convert-taxonomy.js`, `download-engine.js`, `test-auth.js`.
- Тесты: юнит `src/**/*.spec.ts` (например auth/users/strains/storage); e2e в `test/*.e2e-spec.ts`, конфиг `test/jest-e2e.json`.
- Конфиги: `nest-cli.json`, `tsconfig*.json`, `eslint.config.mjs`, Dockerfile, `.env(.example)`.

## Frontend (Next.js, App Router)
- Глобальное: `src/app/layout.tsx`, стили `globals.css`.
- Локализация (i18n): `src/i18n/`, `src/app/[locale]/` (основные маршруты).
- Маршруты (директории в `src/app/[locale]`):
  - `login/` — страница входа (также доступна в корне `src/app/login`).
  - `strains/` — список; `strains/new/` — создание; `strains/[id]/` — карточка; `strains/[id]/edit/` — редактирование.
  - `samples/` — список; `samples/new/` — создание; `samples/[id]/` — карточка; `samples/[id]/edit/` — редактирование.
  - `methods/` — список и CRUD методов.
  - `storage` — отображается через страничные формы.
  - `media/` — CRUD медиа.
  - `legend/` — редактор легенды.
  - `docs/` — wiki рендерер из `public/wiki`.
  - `audit/` — аудит-лог.
  - `settings/` — настройки UI/API.
  - `dynamic/[slug]/` — динамический контент.
  - API route: `src/app/wiki-api/docs-index/` (возвращает список wiki-доков).
- Компоненты:
  - `components/domain/` — бизнес-UI: формы/списки штаммов и образцов, storage grid, загрузка фото, taxonomy autocomplete, sample map.
  - `components/layout/` — каркас приложения (sidebar, main-layout).
  - `components/ui/` — библиотека общих контролов (button, input, select, dialog, table, rich-text, sonner, etc.).
  - `components/AuthGuard.tsx` — защищает маршруты.
  - `components/LanguageSwitcher.tsx` — переключатель языка.
  - `components/error-boundary.tsx` — обработка ошибок.
- Сервисы и состояние:
  - `services/` — модульные API клиенты (`auth.ts`, `strains.ts`, `samples.ts`, `methods.ts`, `analytics.ts` и др.).
  - `contexts/AuthContext.tsx` — auth состояние.
  - `hooks/` — `use-debounce.ts`, `use-api-error.ts`.
  - `lib/` — `utils.ts`, `translate-dynamic.ts`.
  - `types/` — `domain.ts`, `api/` (типизация ответов API).
- Конфиги: `next.config.ts`, `tsconfig.json`, ESLint, PostCSS, `components.json` (shadcn), Dockerfile.
- Assets: `public/` (статические SVG), `public/wiki/*` (копия wiki).

## Docs
- Исходные материалы: `docs/wiki/*.md` (архитектура, backend/frontend, API, audit, storage, media, legend, playbooks, changelog, testing, contrib).
- Диаграммы: `docs/IDEF*.puml/md`.
- Синк: файлы продублированы в `frontend/public/wiki/` для рендеринга страниц.

## Инфраструктура и окружение
- `docker-compose.yml` — Postgres + сервисы, порты 3000 (API) / 3001 (UI).
- `Makefile` — упрощённые цели для dev/test/build.
- `nginx.conf` — прокси/статик.
- Env: `backend/.env` (DATABASE_URL, PORT, ImageKit и т.д.), фронт читает `NEXT_PUBLIC_API_URL`.

## Быстрая ориентация
- Backend API точка входа: `backend/src/main.ts`.
- Prisma модели/миграции: `backend/prisma/schema.prisma` и `backend/prisma/migrations/`.
- Основные UI страницы: `frontend/src/app/[locale]/*/page.tsx`.
- Бизнес-компоненты: `frontend/src/components/domain/`.
- Wiki источник: `docs/wiki/` (рендерится через `frontend/src/app/[locale]/docs`).
