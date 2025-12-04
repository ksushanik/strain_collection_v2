# Admin панель (AdminJS)

## Доступ
- URL: `/admin`
- Только роль `ADMIN` (email/пароль через обычный логин).

## Каталоги и массовые действия
- **Catalog → Strain/Sample**: теперь доступно **bulk delete**. Выделите записи в списке → `Delete all`.
  - Strain: при удалении очищаются размещения (storage), ссылки на media, фото.
  - Sample: удаляются связанные штаммы/их размещения/фото, затем sample.
  - После удаления возвращает на список, действие логируется в AuditLog.

## Maintenance (бэкап/восстановление/очистка)
- Раздел **Maintenance → DatabaseMaintenance**.
  - **Generate backup** (кнопка в форме Restore): скачивает JSON с доменными таблицами и подставляет его в текстовое поле.
  - **Restore**: выберите JSON-файл или вставьте содержимое в поле → `Восстановить`. Перезаписывает все доменные данные (samples, strains, media, storage, ui-bindings, legend и связи).
  - **Wipe**: полная очистка доменных таблиц (auth/roles остаются).
  - Audit: все действия пишутся в AuditLog (entity: Database).

## Storage/Settings/Media
- Storage: boxes/cells, allocate/unallocate/bulk allocate, подсветка по `boxId`/`cell`.
- Settings: ui-bindings (страницы My Collection/dynamic), legend для Storage.
- Media: CRUD питательных сред и привязка к штаммам.

## Аудит
- Раздел **Audit → Audit Log**: чтение, фильтры по user/entity, действия WRITE/DELETE/ALLOCATE и т.д.
- Бейджи действий: CREATE (primary), UPDATE (secondary), DELETE (outline красный).
