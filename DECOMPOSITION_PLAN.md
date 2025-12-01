# План декомпозиции God Object

Ветка: `chore/god-object-decomposition-plan`  
Цель: разнести God Object по доменным слоям, сохранить поведение и пройти проверки.

## Бэкенд (`backend/src/admin/admin.options.ts`)
- [x] Вынести хелперы:
  - [x] `getCurrentAdminUser` / `logAudit` → `admin/helpers/audit.ts`
  - [x] `hashPasswordBefore` / `stripPasswordFromResponse` → `admin/helpers/password.ts`
  - [x] `normalizePermissionsBefore` → `admin/helpers/permissions.ts`
  - [x] `syncStorageBoxCells` → сервис слоя storage (например, `storage/storage-sync.service.ts`) с DI Prisma.
- [x] Разбить ресурсы AdminJS по доменам:
  - [x] `admin/resources/access-control` (users/roles/groups)
  - [x] `admin/resources/catalog` (strains/samples)
  - [x] `admin/resources/settings` (ui-binding/legend)
  - [x] `admin/resources/storage` (box/cell)
  - [x] `admin/resources/media` (sample/strain photos)
  - [x] `admin/resources/audit` (audit logs)
- [x] Собрать `createAdminOptions` из наборов ресурсо-строителей; оставить файл композиционным.
- [x] Унифицировать хуки действий через фабрики аудита/нормализации payload’ов.

## Фронтенд (`frontend/src/services/api.ts`)
- [x] Базовый HTTP-слой `services/http.ts`: base URL, `request`, `assertOk`, `toApiError`, `authHeaders`, логика 401-redirect.
- [x] Типы разнести в `types/`: `samples.ts`, `strains.ts`, `storage.ts`, `media.ts`, `settings.ts`, общий `common.ts`.
- [x] Доменные клиенты:
  - [x] `services/auth.ts` (SSO, токен-логика)
  - [x] `services/settings.ts` (ui-bindings, legend)
  - [x] `services/samples.ts` (CRUD, photos)
  - [x] `services/strains.ts` (CRUD, photos, media links)
  - [x] `services/storage.ts` (boxes/cells allocate/unallocate)
  - [x] `services/media.ts` (media CRUD)
  - [x] `services/taxonomy.ts` (search)
  - [ ] Опционально `services/uploads.ts` для FormData операций.
- [x] Аггрегатор `services/api.ts` для реэкспортов и совместимости со старыми импортами.

## Проверки
- [ ] `npm run lint` и `npm run build` в `backend`.
- [ ] `npm run lint` и `npm run build` в `frontend`.
- [ ] Локальные spot-check: 401-redirect работает, AdminJS CRUD с аудитом и синхронизацией storage остаётся рабочим.
