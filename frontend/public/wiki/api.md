# API и аутентификация

- **Base URL**: `http://localhost:3000/api/v1`
- **Swagger**: `/api/v1/docs`
- **Auth**: `POST /api/v1/auth/login`, `GET /api/v1/auth/profile` → Bearer JWT; передавать `Authorization: Bearer <token>`.
- **Регистрация**: `POST /api/v1/auth/register` отключена по умолчанию и включается только через `ALLOW_PUBLIC_REGISTRATION=true`.
- **Ключевые эндпоинты** (неполный список):
  - Strains: `GET /strains` (фильтры), `POST /strains`, `GET/PUT/DELETE /strains/:id`, `POST /strains/:id/media`, `DELETE /strains/:id/media/:mediaId`.
  - Samples: CRUD + `POST /samples/:id/photos`, `DELETE /samples/photos/:photoId`.
  - Storage: `GET /storage/boxes`, `GET /storage/boxes/:id`, `POST /storage/boxes`, allocate/unallocate/bulk via `/storage/boxes/:boxId/cells/:cellCode/allocate|unallocate`.
  - Media: `GET /media` (search/paginate), `GET /media/:id`, `POST /media`, `PUT /media/:id`, `DELETE /media/:id`.
  - Methods: `GET /methods` (list), `GET /methods/:id`, `POST /methods`, `PUT /methods/:id`, `DELETE /methods/:id`.
  - Settings: `GET/PUT /settings/ui-bindings`, `GET/PUT /settings/legend`.
  - Analytics: `GET /analytics/overview`.
- **Права (CASL)**:
  - ADMIN: manage all.
  - MANAGER: read all; create/update/delete Strain/Sample/Storage/Photo/Media; нет доступа к Users/Groups/AuditLog.
  - USER: read Strain/Sample/Storage/Photo/Media/Analytics/Legend/Settings; create/update Strain/Sample/Photo; delete запрещены; Storage update запрещен.
