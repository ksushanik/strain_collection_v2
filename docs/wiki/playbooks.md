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
- **Деплой на прод (CI/CD)**:
  - **Основной путь**: push в `main` → `.github/workflows/build.yml` собирает backend+frontend образы и пушит в `ghcr.io/ksushanik/strain-collection-v2-{backend,frontend}` с тегами `:latest` и `:<sha>`. Деплой — кнопкой в GitHub UI: **Actions → "Deploy to Production" → Run workflow → выбрать tag** (default `latest`). Workflow `deploy.yml` SSH'ится на сервер как `deploy@...`, пишет `IMAGE_TAG` в `.env`, запускает [scripts/deploy-prod.sh](../../scripts/deploy-prod.sh). Скрипт ждёт до 90 секунд пока backend не станет `healthy` (Docker `HEALTHCHECK` в [backend/Dockerfile](../../backend/Dockerfile)) и **падает с ненулевым кодом**, если контейнер не поднялся.
  - **Rollback**: тот же deploy workflow, но в поле tag вводишь `<старый sha>`. Например, последние SHA можно увидеть в `gh run list --workflow=build.yml --limit 5`.
  - **Escape hatch (CI down)**: `make push-all` (нужен `docker login ghcr.io` локально + локальный Docker daemon) → `make deploy-prod-win`. Используй только если GH Actions недоступен. После Phase D cleanup эти таргеты будут переработаны или удалены.
  - **Очистка диска на проде**: `make clean-prod` — `docker system prune -af --filter 'until=168h'`. Фильтр оставляет образы новее недели для возможности отката (без фильтра prune снёс бы и образы соседних проектов на хосте).
