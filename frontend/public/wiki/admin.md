# Admin (AdminJS)

## Доступ
- URL: `/admin`.
- Авторизация по логину/паролю с ролью `ADMIN` (seed или вручную через базу/AdminJS).
- SSO-поток: `POST /api/v1/admin-sso/sso/start` (нужен JWT админа) выдает nonce (TTL 60с); `GET /api/v1/admin-sso/sso/complete?nonce=...` публичный и ставит сессию AdminJS.
- Assets AdminJS (`/admin/frontend/assets/components.bundle.js`) защищены `JwtAuthGuard + PoliciesGuard`, требуется право `manage all`.

## Права (CASL)
- Источник прав: сначала группа, потом роль, затем дефолт по роли (или GUEST).
- PermissionsGrid поддерживает `read/create/update/delete/manage` для `Strain/Sample/Storage/Media/Settings/Legend/Analytics/User/Group/AuditLog/Photo/all`.
- Дефолтные роли:
  - ADMIN: `manage all`
  - MANAGER: CRUD для Strain/Sample/Storage/Media/Photo, read для Settings/Legend/Analytics/User/Group
  - USER: read/create/update для основных сущностей, read для Analytics/Legend/Settings
  - GUEST: read (используется для публичных GET, если endpoint помечен `@Public`)

## Safety / операции
- Каталоги Strain/Sample поддерживают bulk delete; при удалении чистятся связанные media/storage/photos.
- Maintenance (DatabaseMaintenance): backup/restore/wipe с аудитом в AuditLog (entity: Database). Используйте только под учеткой ADMIN.
- Audit Log: хранит CREATE/UPDATE/DELETE/ALLOCATE и операции бэкапа/restore.

## Storage/Settings/Media
- Storage: allocate/unallocate/bulk allocate; поддерживает `boxId`/`cell` для прямого перехода.
- Settings: ui-bindings (динамические секции меню), legend можно редактировать.
- Media: CRUD по справочнику сред.
