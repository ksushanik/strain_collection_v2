# Changelog (кратко)

## 2025-11-22
- Подсветка ячеек в Storage по query `boxId`/`cell`.
- Страницы: Media (CRUD), Legend (редактирование текста), Settings (ui-bindings).
- Связка Media со штаммами в карточке штамма (добавление/удаление, показ состава/notes).
- ValidationPipe с transform для корректной пагинации/фильтров.
- Исправлен парсинг булевых фильтров strains (без фильтра не ограничивает выборку).

## Ранее
- Swagger включён на /docs.
- Storage: allocate/unallocate/bulk, уникальность boxId+cellCode.
- AuditLog расширен (ALLOCATE/UNALLOCATE/BULK_ALLOCATE/CONFIG).
- Analytics overview (totals, occupied/free, recent additions).
- Дашборд, StorageView, My Collection с returnTo, ссылки из штамма на склад.
