# Frontend (Next.js)

## Audit Log UI

Located at `/audit`, this page allows Admins and Managers to view system logs. It is protected by `AuthGuard` and role-based checks.

## State Management

- **Локализация**: используется `next-intl` (или аналогичный подход) с маршрутами `src/app/[locale]/`.
- **Старт**: `cd frontend && npm install && npm run dev -- -p 3001`.
- **Навигация**: App Router, MainLayout центрирует контент (max-w-6xl), Sidebar строится по ui-bindings + статические ссылки (Media, Legend, Settings).
- **Страницы**:
  - `/` Dashboard — использует analytics overview.
  - `/dynamic/[slug]` — секции из ui-bindings (strain list, sample list, storage view).
  - `/strains/[id]` — карточка штамма, блоки taxonomy/growth/genetics/info/storage/media.
  - `/strains/new`, `/strains/[id]/edit` — формы (returnTo для навигации).
  - `/samples` — список/карточки проб.
  - `/methods` — список и CRUD методов.
  - `/dynamic/storage` — StorageView: выбор бокса, сетка ячеек, allocate/unallocate, подсветка по query `boxId`/`cell`.
  - `/media` — CRUD справочника питательных сред (поиск/пагинация, add/edit/delete).
  - `/legend` — просмотр/редактирование текстовой легенды.
  - `/settings` — управление ui-bindings (порядок, метки, иконки, routeSlug, field packs).
- **Ключевые компоненты**: 
  - `components/domain/strain-list`, `sample-list` — списки штаммов и образцов
  - `components/domain/sample-map` — интерактивная карта Leaflet для отображения местоположения образцов (SSR-safe через dynamic import)
  - `storage-view` — подсветка ячейки из query
  - `photo-upload` — загрузка фотографий образцов
- **Карты**: Leaflet + react-leaflet для Sample detail pages, маркеры с попапами, OpenStreetMap tiles (без API ключа)
- **API клиент**: `src/services/api.ts` — включает auth headers из localStorage, методы для strains/samples/storage/media/legend/ui-bindings/analytics.
- **ReturnTo**: ссылки на штаммы/формы передают `?returnTo=...` для возврата.
- **UI**: shadcn/ui, Tailwind; Badge/Select/Table/Card/Button.
"***
