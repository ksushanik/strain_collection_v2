# План исправлений и доработок

Дата обзора: 2026-04-07

Документ фиксирует приоритетные технические и UX-доработки по результатам ревью текущего состояния проекта.

## Высокий приоритет

### 1. Публичная регистрация выдает write-доступ

Проблема:
- `POST /auth/register` доступен публично.
- Новый пользователь по умолчанию получает роль `USER`.
- Роль `USER` уже имеет `create/update` по `Strain`, `Sample`, `Storage`, `Media`, `Method`, `TraitDefinition`.

Риск:
- Любой внешний пользователь может самостоятельно зарегистрироваться и начать изменять данные коллекции.

Затронутые места:
- `backend/src/auth/auth.controller.ts`
- `backend/src/users/users.service.ts`
- `backend/src/casl/casl-ability.factory.ts`

План исправления:
1. Решить, нужен ли вообще публичный self-signup.
2. Если self-signup сохраняется, выдавать только read-only роль или статус pending approval.
3. Развести роли `VIEWER` и `EDITOR`, чтобы write-доступ не доставался по умолчанию.
4. Добавить e2e-сценарии: регистрация, попытка write-операций новым пользователем, проверка `403`.

### 2. Разъехались auth-маршруты и базовые URL

Проблема:
- Login page ходит в `${NEXT_PUBLIC_API_URL}/auth/login`.
- Остальной frontend использует общий API-клиент и префикс `/api/v1/...`.
- В `nginx.conf` одновременно проксируются `/auth/*` и `/api/v1/auth/*`, при том backend-контроллер объявлен как `@Controller('auth')`.

Риск:
- Ломается совместимость между локальным запуском, docker/nginx и дальнейшими рефакторами API.
- Rate limit и auth-flow живут в разных маршрутах.

Затронутые места:
- `frontend/src/app/[locale]/login/page.tsx`
- `frontend/src/app/[locale]/settings/page.tsx`
- `frontend/src/services/http.ts`
- `backend/src/auth/auth.controller.ts`
- `nginx.conf`

План исправления:
1. Зафиксировать один публичный контракт для auth: либо `/auth/*`, либо `/api/v1/auth/*`.
2. Перевести login и admin SSO на общий API-клиент.
3. Убрать fallback на `http://localhost:3010` и прочие отдельные base URL.
4. Прогнать smoke в трех режимах: `frontend dev`, `docker-compose`, `nginx`.

### 3. Public-read / guest mode не доведен до рабочего состояния

Проблема:
- Backend явно поддерживает `GUEST` и публичные `GET` по части доменов.
- Frontend `AuthGuard` редиректит любого неавторизованного пользователя на `/login`.
- `Sidebar` не грузит `ui-bindings`, если `user === null`.
- `GET /api/v1/settings/ui-bindings` и `GET /api/v1/search` все еще требуют JWT.
- Страница dynamic sections зависит от `getUiBindings()`, поэтому public-read там не работает.

Риск:
- Заявленный read-only режим для гостей фактически недоступен.
- Поведение системы противоречит собственным правам и документации.

Затронутые места:
- `frontend/src/components/AuthGuard.tsx`
- `frontend/src/contexts/AuthContext.tsx`
- `frontend/src/components/layout/sidebar.tsx`
- `frontend/src/app/[locale]/dynamic/[slug]/page.tsx`
- `frontend/src/components/domain/global-search/global-search.tsx`
- `backend/src/settings/settings.controller.ts`
- `backend/src/search/search.controller.ts`
- `backend/src/casl/casl-ability.factory.ts`

План исправления:
1. Зафиксировать продуктовое решение: нужен ли гостевой read-only режим.
2. Если нужен, перестроить frontend-права так, чтобы `null user` трактовался как `GUEST`, а не как полный deny.
3. Сделать публичными только действительно необходимые guest-endpoints: `ui-bindings`, global search preview/full, public read pages.
4. Проверить, что guest видит навигацию, списки, detail pages и wiki, но не видит write-actions.
5. Добавить отдельный smoke/e2e сценарий для гостя.

## Средний приоритет

### 4. Сессия на фронте расходится после `401`

Проблема:
- При `401` удаляется только `token`.
- `user` в `localStorage` и в `AuthContext` остается.
- UI продолжает считать пользователя авторизованным, пока страница не будет перезагружена или явно не вызван `logout`.

Затронутые места:
- `frontend/src/services/http.ts`
- `frontend/src/contexts/AuthContext.tsx`
- `frontend/src/components/AuthGuard.tsx`

План исправления:
1. Ввести единый `logout()`/`clearSession()` путь.
2. На `401` очищать и токен, и пользователя, и синхронно обновлять контекст.
3. Добавить smoke на истекший/битый токен.

### 5. Storage reallocates silently

Проблема:
- При аллокации в занятую ячейку текущая привязка удаляется молча.
- Пользователь не получает явного подтверждения, что он вытесняет другой штамм.

Затронутые места:
- `backend/src/storage/storage.service.ts`
- `frontend/src/components/domain/storage-view.tsx`

План исправления:
1. На backend перестать молча удалять существующую привязку без явного режима replace.
2. На frontend добавить явный confirm-flow с показом текущего владельца ячейки.
3. Закрыть кейсы тестами: replace, cancel, forbidden replace.

### 6. После `unallocate` может не остаться primary-ячейки

Проблема:
- При снятии основной аллокации не выбирается новый `isPrimary`, если у штамма остаются другие ячейки.

Затронутые места:
- `backend/src/storage/storage.service.ts`

План исправления:
1. После удаления primary искать следующую аллокацию и назначать новую primary.
2. Добавить unit/e2e на цепочки allocate -> allocate secondary -> unallocate primary.

### 7. Контроллер поиска не пропускает роли с одним `Wiki:read`

Проблема:
- `SearchService` умеет искать по wiki.
- `SearchController` в pre-check не учитывает `ability.can('read', 'Wiki')`.

Риск:
- Пользователь с кастомной урезанной ролью увидит `403`, хотя сервисный уровень считает доступ валидным.

Затронутые места:
- `backend/src/search/search.controller.ts`
- `backend/src/search/search.service.ts`

План исправления:
1. Привести pre-check контроллера в соответствие с реальными секциями поиска.
2. Добавить тест на роль с доступом только к wiki.

## UI/UX и permission UX

### 8. UI показывает write-actions по факту логина, а не по реальным правам

Проблема:
- Кнопки создания в списках и часть storage-actions завязаны на `user`, а не на `hasPermission(...)`.
- В `/settings` часть кнопок завязана на строки ролей `ADMIN`/`MANAGER`, а не на capability-based access.

Следствие:
- Пользователь с кастомной ролью может видеть кнопки, которые дадут `403`.
- Пользователь с валидными правами, но нестандартной ролью, наоборот может не видеть нужные действия.

Затронутые места:
- `frontend/src/components/domain/strain-list.tsx`
- `frontend/src/components/domain/sample-list.tsx`
- `frontend/src/components/domain/storage-view.tsx`
- `frontend/src/app/[locale]/settings/page.tsx`

План исправления:
1. Во всех write-actions перейти на `hasPermission(...)`.
2. Удалить сравнения по строкам ролей из UI, кроме чисто декоративных мест.
3. Добавить фронтовые smoke-сценарии для custom-role пользователя.

### 9. Боковое меню не отражает реальную permission-модель

Проблема:
- `Sidebar` не грузит dynamic bindings для гостя.
- Доступ к Methods привязан к `TraitDefinition`, а не к доменной комбинации прав, которую реально требует страница.

Следствие:
- Навигация скрывает доступные разделы.
- При кастомных ролях меню может расходиться с backend-политиками.

Затронутые места:
- `frontend/src/components/layout/sidebar.tsx`
- `frontend/src/app/[locale]/dynamic/[slug]/page.tsx`

План исправления:
1. Вынести permission mapping для меню в единый слой.
2. Для dynamic sections опираться на реальные read-права и доступность `ui-bindings`.
3. Разделить право на чтение методов и traits там, где это нужно продуктово.

### 10. `AccessDenied` ведет пользователя в тупик

Проблема:
- Экран отказа в доступе не предлагает ни логин, ни возврат назад, ни объяснение дальнейшего действия.

Затронутое место:
- `frontend/src/components/common/access-denied.tsx`

План исправления:
1. Добавить CTA: `Войти`, `Назад`, `На главную`.
2. Для анонимного пользователя показывать отдельный вариант с приглашением к авторизации.

## План внедрения

### Этап 1. Безопасность и auth-контракт
1. Закрыть self-signup escalation.
2. Упростить и унифицировать auth routes/base URL.
3. Добавить e2e на register/login/profile/forbidden write.

### Этап 2. Public-read и session consistency
1. Привести guest-mode к одному продуктово согласованному состоянию.
2. Исправить очистку сессии на `401`.
3. Сделать permission-модель фронта capability-based.

### Этап 3. Storage integrity
1. Переделать replace/unallocate сценарии.
2. Добавить тесты на primary-allocation и вытеснение.
3. Обновить UX в storage dialog.

### Этап 4. UI/UX polish
1. Почистить тупиковые состояния: AccessDenied, empty states, role-based hidden actions.
2. Выровнять меню и dynamic routing с реальными правами.
3. Проверить мобильные сценарии login, storage, lists, settings.

## Проверка после исправлений

- Backend:
  - `npm run test`
  - `npm run test:e2e`
- Frontend:
  - `npm test`
  - smoke на login, guest, storage, settings, search
- Интеграционно:
  - локальный dev
  - `docker-compose`
  - nginx reverse proxy
