# Changelog (кратко)

## 2025-12-11
- **AdminJS Access Control**: ужесточена защита AdminJS (assets только через guard, SSO-start требует JWT admin, nonce на complete публичный).
- **Public Read Policy**: публичными остаются только GET (strains/samples/media/storage/legend/analytics); запись/удаление требуют JWT и прав.
## 2025-12-05
- **RichTextEditor**: компактная панель инструментов, появляется только при фокусе; убраны Undo/Redo для упрощения UI.
- **AdminJS Backup**: исправлена проблема с отображением компонента backup на продакшене — nginx теперь проксирует бандл через бэкенд.
- **Инфраструктура**: упрощён `deploy-prod` в Makefile, убран шаг синхронизации бандла (больше не нужен).

## 2025-12-04
- AdminJS: раздел Maintenance → DatabaseMaintenance (Generate backup, Restore с загрузкой файла, Wipe), логирование в AuditLog.
- AdminJS: bulk delete для Strain/Sample с очисткой storage/media/photos и корректным возвратом на список.
- StorageView: крупнее/плотнее клетки, фикса ширины селектов в RU, более читаемые подписи.
- Wiki: добавлен раздел Admin (AdminJS); обновлён changelog.
- UI: кнопка выбора файла в Restore стилизована под AdminJS.
- **SampleForm**: добавлена возможность ручного ввода даты (dd.MM.yyyy, d.M.yy, yyyy-MM-dd) с валидацией и автоформатированием. Исправлено случайное сохранение формы по Enter/календарю.

## 2025-12-04
- AdminJS: добавлен раздел Maintenance → DatabaseMaintenance с действиями Generate backup (выгрузка JSON), Restore (загрузка/вставка JSON, перезаписывает доменные таблицы) и Wipe (полная очистка доменных данных).
- AdminJS: массовое удаление Strain/Sample (bulk delete) с корректной чисткой связей (storage/media/photos) и возвратом на список.
- StorageView: фиксированные селекты rows/cols в RU-локали и более крупные, плотные ячейки для лучшей читаемости.

## 2025-11-24
- **Карты образцов**: интегрирована интерактивная карта Leaflet на Sample detail pages с маркерами и попапами (координаты из lat/lng).
- Зависимости: `leaflet`, `react-leaflet`, `@types/leaflet`.
- SSR-совместимость через dynamic import, использование OpenStreetMap без API ключа.

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