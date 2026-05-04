# Changelog (кратко)

## 2026-05-04
- **Инфраструктура (CI/CD)**:
  - `make deploy-prod` теперь fail-loud: логика вынесена в `scripts/deploy-prod.sh`, скрипт ждёт `healthy` статус backend (через Docker `HEALTHCHECK` на root `/`) до 90 с и падает с ненулевым кодом при таймауте. Раньше деплой всегда возвращал успех, даже если backend не поднялся.
  - Backend получил `HEALTHCHECK` в [backend/Dockerfile](../../backend/Dockerfile) — node-проба на `127.0.0.1:3000`, `start-period=30s` под Nest+Prisma migrate.
  - `make clean-prod` получил `--filter "until=168h"` — больше не сносит образы соседних проектов на хосте и оставляет окно для отката.
  - GitHub Actions: добавлены `concurrency` с `cancel-in-progress` (старые ранs прерываются при новом push) и `timeout-minutes` per-job (защита от зависших job'ов).
  - `.gitattributes`: пинит `.sh`/`Dockerfile`/`Makefile`/workflow YAML к LF — защита от Windows `core.autocrlf=true`, который иначе ломает bash на сервере.
  - AdminJS bundle sync в деплое теперь записывает в temp-файл и promotes через `mv` только если непустой — раньше при отсутствии bundle в контейнере перезаписывал host-файл нулём байт.
- **CI/CD автоматизация (build auto + deploy by button)** — продолжение того же дня:
  - Новый workflow `.github/workflows/build.yml`: на каждый push в `main` собирает backend+frontend образы (buildx + GH Actions cache) и пушит в **GHCR** (`ghcr.io/ksushanik/strain-collection-v2-{backend,frontend}`) с тегами `:latest` и `:<sha>`.
  - Новый workflow `.github/workflows/deploy.yml`: `workflow_dispatch` (кнопка в GH UI) с input `tag`, SSH'ится на сервер через `webfactory/ssh-agent`, scp'ит compose+скрипт, пишет `IMAGE_TAG` в `.env`, запускает `scripts/deploy-prod.sh`. Rollback = деплой со старым SHA.
  - `docker-compose.prod.yml` закоммичен в репо (image параметризован через `${IMAGE_REGISTRY}/...:${IMAGE_TAG}`), больше не дрейфует от серверного.
  - На сервере появился `deploy` user с docker-доступом (без sudo, password locked, key-only), стек переехал в `/home/deploy/bio_collection`. Старый `/home/user/bio_collection` параллельно работает до nginx-cutover.
  - `scripts/deploy-prod.sh` сделан env-driven: `PROJECT_DIR`, `HEALTH_TIMEOUT_SEC`, `HEALTH_POLL_INTERVAL` через env; источает `.env` при старте.
  - Реестр сменился с `gimmyhat/*` на `ghcr.io/ksushanik/*`. `make push-all` / `make deploy-prod` помечены как escape hatch.
  - 4 GH Actions secrets настроены: `DEPLOY_SSH_KEY`, `DEPLOY_SSH_HOST`, `DEPLOY_SSH_USER`, `DEPLOY_SSH_KNOWN_HOSTS`. Сервер залогинен в GHCR через single-scope `read:packages` PAT.
  - Spec: [docs/superpowers/specs/2026-05-04-automated-cicd-design.md](../superpowers/specs/2026-05-04-automated-cicd-design.md). Plan: [docs/superpowers/plans/2026-05-04-automated-cicd.md](../superpowers/plans/2026-05-04-automated-cicd.md).

## 2025-12-18
- **Strains (Edit)**: исправлено сохранение на странице редактирования (кнопка «Сохранить изменения»), триггеры автокомплитов больше не сабмитят форму.
- **Strains (Form UX)**: добавлена возможность очистить «Научное название (NCBI)» и вернуть пустые значения для селектов (например, «Регион изоляции», BSL).
- **Strains (List)**: колонка «Научное название (NCBI)» переименована в «Таксономия (16S)»; отображается `taxonomy16s`, а если оно пустое — fallback на `ncbiScientificName`.

## 2025-12-14
- **Methods**: добавлен модуль `methods` (Backend: module/controller/service, Frontend: CRUD страницы).
- **Localization**: внедрена поддержка i18n, маршруты перенесены в `[locale]/`.
- **Docs**: обновлена карта проекта и wiki (добавлен раздел Methods).

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
