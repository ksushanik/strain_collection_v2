## Цели
- Связать AdminJS с Nest-сервисами, чтобы административные операции проходили через доменную логику, а не напрямую через Prisma.
- Сделать раздел "Настройки" единым: те же сущности и правила в админке и во фронтенде, с консистентным аудитом.
- Усилить безопасность: права доступа по ролям и действиям, минимизировать риск обхода бизнес-логики.

## Изменения по интеграции AdminJS ↔ сервисы
- Расширить `AdminModule` для DI нужных сервисов:
  - Добавить в `imports` `SettingsModule`, `AuditModule`, при необходимости `StorageModule`/`StrainsModule`.
  - В `useFactory` инжектировать `SettingsService`, `AuditLogService` (и при необходимости другие), чтобы использовать их внутри action-хуков AdminJS.
  - Файлы: `backend/src/admin/admin.module.ts`, `backend/src/app.module.ts` (только подключение).

- Перенести операции настроек в сервисы:
  - Для AdminJS ресурсов `UiBinding` и `LegendContent` определить кастомные actions `new/edit/delete`, которые:
    - Вызывают `SettingsService.updateUiBindings(...)`/`SettingsService`-методы, вместо прямых вызовов `prisma`.
    - После успешного изменения — логируют событие через `AuditLogService.log({... action: 'CONFIG' ...})`.
  - Файл: `backend/src/admin/admin.options.ts` (замена прямого Prisma на вызовы сервисов в `actions.after`/`handler`).

- Для сложных доменных операций (например, массовое распределение в хранении):
  - В AdminJS добавить кастомные действия, которые вызывают методы соответствующих сервисов (`StorageService.bulkAllocate`, и т.п.).
  - Файл: `backend/src/admin/admin.options.ts` (добавление кнопок/действий на ресурсы `StorageBox`/`StorageCell`).

## Единый раздел настроек
- В админке оставить секцию "Настройки":
  - Ресурсы `UiBinding`, `LegendContent` как источники правды, совпадающие с фронтендом.
  - Валидация и маппинги enum `ProfileKey`, массивов `enabledFieldPacks` — единообразные со `SettingsService`.
  - Файл: `backend/src/admin/admin.options.ts` (уточнение полей/валидации).

- На API-слое убедиться, что фронтенд читает те же данные:
  - Проверить `SettingsController`/`SettingsService` на возврат идентичных DTO.
  - При необходимости добавить эндпоинты, отражающие административные изменения (без дублирования логики).
  - Файлы: `backend/src/settings/settings.controller.ts`, `backend/src/settings/settings.service.ts` (минимальные коррекции DTO и валидации).

## Безопасность и права
- Ограничить доступ AdminJS только для роли `ADMIN` (уже сделано), усилить ресурсы:
  - В AdminJS actions проверять роль текущего админа; для особо критичных — подтверждение/лог.
  - На Nest слоях — CASL/guards уже действуют для REST; AdminJS будет обходить REST, поэтому проверки должны быть в сервисах.
  - Файлы: `backend/src/admin/admin.options.ts` (isAccessible), сервисы — проверка прав при выполнении действий.

## Аудит
- Все действия из AdminJS по настройкам/массовым операциям записывать в `AuditLog` через `AuditLogService.log`:
  - С консистентными `entity`/`entityId`, `action: 'CONFIG' | 'BULK_ALLOCATE' | ...`, `metadata` (маршрут, userAgent).
  - Файлы: `backend/src/admin/admin.options.ts` (hooks), `backend/src/audit/audit-log.service.ts` (без изменений).

## Синхронизация фронта
- Фронтенд раздел Settings уже читает API; изменений в клиенте не требуется.
- При необходимости — добавить мягкую блокировку (конфликт правок), но базово достаточно аудита.

## Тесты и проверка
- Lint + unit-тесты:
  - Обновить/дописать тесты для `SettingsService` (создание/обновление binding, валидация enum/profileKey).
  - Добавить тесты на `AuditLogService.log` для `CONFIG`.
  - Запуск: `npm run lint`, `npm run test` в backend.

## Риски и откат
- Админка перестанет писать в БД напрямую — все операции пойдут через сервисы. Это повышает согласованность, но требует корректной обработки ошибок.
- При необходимости быстрый откат — оставить существующие ресурсы с прямым Prisma доступом и постепенно переводить на сервисы.

## Итоговые правки (точечные файлы)
- `backend/src/admin/admin.module.ts`: добавить нужные модули в `imports`, инжектировать сервисы в `useFactory`.
- `backend/src/admin/admin.options.ts`: заменить прямые prisma-вызовы в `actions` на вызовы `SettingsService`/других сервисов, оставить ресурсы, поля и доступ.
- `backend/src/settings/settings.service.ts` и `settings.controller.ts`: удостовериться, что DTO/валидация совместимы с админкой.
- Верификация: поднять backend, открыть `/admin`, выполнить операции в "Настройки" и проверить аудит, затем проверить фронт `GET /api/v1/settings`.

Подтвердите план — начну реализацию и в конце предоставлю результаты, проверку и ссылки на изменения.