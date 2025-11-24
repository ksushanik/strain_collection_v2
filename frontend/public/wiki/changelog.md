# Changelog (кратко)

## 2025-11-23
- AdminJS: пользователи/группы теперь работают с JSON permissions, действия логируются в аудит.
- Seed: добавлены группы Admins/Managers/Viewers и пользователи с паролями `admin123` / `manager123` / `viewer123`.
- RBAC: Casl сначала смотрит на `group.permissions`, при пустой карте использует права роли.
- Роли вынесены в таблицу `roles` (редактируемые в AdminJS), fallback по роли сохранён.

## 2025-11-22
- Подсветка ячеек в Storage по query `boxId`/`cell`.
- Страницы: Media (CRUD), Legend (редактирование текста), Settings (ui-bindings).
- Связка Media со штаммами в карточке штамма (добавление/удаление, показ состава/notes).
- ValidationPipe с transform для корректной пагинации/фильтров.
- Исправлен парсинг булевых фильтров strains (без фильтра не ограничивает выборку).
- Контекстная легенда: привязка legend к ui-binding и вывод в Storage; override легенды в `/settings`.
- UI Storage: компактная сетка, скролл, улучшенный контраст пустых ячеек.
- e2e тесты для media CRUD и storage allocate/unallocate.

## Ранее
- Swagger включён на /docs.
- Storage: allocate/unallocate/bulk, уникальность boxId+cellCode.
- AuditLog расширен (ALLOCATE/UNALLOCATE/BULK_ALLOCATE/CONFIG).
- Analytics overview (totals, occupied/free, recent additions).
- Дашборд, StorageView, My Collection с returnTo, ссылки из штамма на склад.
