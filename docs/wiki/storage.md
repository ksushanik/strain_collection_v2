# Storage

- **Модель**: `StorageBox` (rows/cols 9 или 10, displayName, description) и `StorageCell` (row/col/cellCode, status FREE|OCCUPIED). Уникальность: (boxId, cellCode).
- **Операции**:
  - Получение списка боксов: `GET /storage/boxes` (включает occupied/free counts).
  - Детали бокса с ячейками: `GET /storage/boxes/:id`.
  - Создать бокс: `POST /storage/boxes`.
  - Allocate/unallocate: `POST /storage/boxes/:boxId/cells/:cellCode/allocate`, `DELETE /storage/boxes/:boxId/cells/:cellCode/unallocate`.
  - Bulk allocate: отдельный endpoint `bulk-allocate` (см. Swagger).
- **Аудит**: действия ALLOCATE/UNALLOCATE/BULK_ALLOCATE логируются через AuditLogInterceptor.
- **Фронтенд**: `StorageView` (страница `/dynamic/storage`):
  - Отрисовка сетки, выбор бокса, сортировка ячеек.
  - Панель действий: открыть штамм, unallocate, смена primary, reassign; пустая ячейка — выбрать штамм и primary.
  - Подсветка ячейки по query `?boxId=...&cell=...` (например, из карточки штамма).
- **Навигация из штамма**: ссылка `/dynamic/storage?boxId=<id>&cell=<code>`.
