# Playbooks (типовые операции)

- **Завести штамм**: /strains/new → заполнить поля → сохранить (returnTo вернет к предыдущему списку).
- **Привязать штамм к ячейке**: /dynamic/storage → выбрать бокс → выбрать ячейку → Assign strain + primary чекбокс → Allocate.
- **Перекинуть штамм**: выбрать ячейку (Occupied) → выбрать другой штамм или снять primary → Reassign → при необходимости Unallocate.
- **Перейти в ячейку из карточки штамма**: клик по Storage location → открывается `/dynamic/storage?boxId=...&cell=...` с подсветкой.
- **Добавить среду**: /media → заполнить форму → Add.
- **Привязать среду к штамму**: открыть штамм → блок Media → выбрать из списка → Link; Notes опционально.
- **Обновить легенду**: /legend → отредактировать текст → Save.
- **Настроить UI секции**: /settings → править заголовок/иконку/routeSlug/field packs, менять порядок стрелками или удалить секцию (кнопка ✕), при необходимости заполнить Legend override для конкретного раздела → Save order and labels.
- **Посмотреть легенду в Storage**: легенда выводится в разделе Storage, если для соответствующего binding в `/settings` задан текст (override).
- **Деплой на прод (Docker/Make)**:
  - Локально: `make push-all` (или `make push-backend`/`push-frontend`) — собирает и пушит образы в Docker Hub (`gimmyhat/strain-collection-v2-*` с тегом `latest` по умолчанию).
  - Прод: `make deploy-prod` — стримит `scripts/deploy-prod.sh` через SSH на `4feb`. Скрипт делает `docker compose pull` → `up -d`, ждёт до 90 секунд пока backend не станет `healthy` (по Docker `HEALTHCHECK` в [backend/Dockerfile](../../backend/Dockerfile)), и только затем синхронизирует AdminJS bundle. **Падает с ненулевым кодом, если backend не поднялся** — больше не считается успешным деплой при упавшем контейнере. Под Windows: `make deploy-prod-win`.
  - Очистка диска на проде: `make clean-prod` — `docker system prune -af --filter 'until=168h'`. Фильтр оставляет образы новее недели, чтобы был запас для отката (без фильтра prune снёс бы и образы соседних проектов на хосте).
