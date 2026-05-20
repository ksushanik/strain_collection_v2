# Demo instance — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Поднять полнофункциональную песочницу-копию приложения на отдельном поддомене `culturedb-demo.duckdns.org`, размещённую вторым Docker-стеком на том же VPS `4feb`, с ночным cron-сбросом БД к существующему `seed.ts`.

**Architecture:** Второй docker-compose файл (`docker-compose.demo.yml`) поднимает изолированные `strain_v2_demo_*` контейнеры на портах 3011/8083, использующих **те же** GHCR-образы, что и prod. nginx на хосте маршрутизирует DuckDNS-сабдомен на эти порты. Reset делает systemd-timer ежедневно в 03:00 MSK. Существующий `backend/prisma/seed.ts` даёт мок-данные as-is — отдельный `seed-demo.ts` не нужен.

**Tech Stack:** Docker Compose v2, NestJS 11, Next.js 16, next-intl, Postgres 16, Redis 7, nginx (host), certbot, systemd, DuckDNS, GitHub Container Registry.

**Spec:** [docs/superpowers/specs/2026-05-20-demo-instance-design.md](../specs/2026-05-20-demo-instance-design.md)

**Branch:** `feat/demo-instance` (создать перед началом).

---

## Phase 1 — Local code changes (committable, через PR в `main`)

Локальные изменения собираются в один PR. После merge GH Actions опубликует свежий backend/frontend образы в GHCR — они будут готовы для Phase 2.

### Task 1: Создать `docker-compose.demo.yml`

**Files:**
- Create: `docker-compose.demo.yml`

Демо-стек должен:
- Не пересекаться по `container_name`, портам, volumes, и docker-network с prod-стеком.
- Использовать те же image-теги, что и prod (`${IMAGE_REGISTRY}/strain-collection-v2-*:${IMAGE_TAG}`).
- Не выполнять `migrate deploy` при старте (миграции накатываются `reset-demo.sh`, чтобы избежать дублирования логики и race при первом запуске на пустой БД).
- Ограничивать ресурсы demo-контейнеров.
- Использовать отдельные `.env.demo` файлы.

- [ ] **Step 1: Создать файл**

Содержимое `docker-compose.demo.yml`:

```yaml
# Demo / sandbox compose for strain_collection_v2.
# Runs alongside docker-compose.prod.yml on the same host (4feb), in a separate
# docker network with separate containers, ports, and volumes.
#
# Reuses the same backend/frontend images as prod. IMAGE_REGISTRY and IMAGE_TAG
# come from the prod .env (see scripts/deploy-demo.sh).

services:
  postgres:
    image: postgres:16-alpine
    container_name: strain_v2_demo_db
    restart: unless-stopped
    environment:
      POSTGRES_DB: strain_collection_v2_demo
      POSTGRES_USER: demo
      POSTGRES_PASSWORD: demo
    volumes:
      - postgres_v2_demo_data:/var/lib/postgresql/data
    networks: [strain_v2_demo]
    mem_limit: 256m
    cpus: 0.5

  redis:
    image: redis:7-alpine
    container_name: strain_v2_demo_redis
    restart: unless-stopped
    networks: [strain_v2_demo]
    mem_limit: 128m
    cpus: 0.25

  backend:
    image: ${IMAGE_REGISTRY:-ghcr.io/ksushanik}/strain-collection-v2-backend:${IMAGE_TAG:-latest}
    container_name: strain_v2_demo_backend
    restart: unless-stopped
    depends_on: [postgres, redis]
    env_file: ./backend/.env.demo
    # No `migrate deploy` here — reset-demo.sh handles schema + seed.
    # Backend just starts; first run waits for the first reset-demo.sh
    # invocation to populate the DB.
    command: ["node", "dist/src/main.js"]
    networks: [strain_v2_demo]
    ports: ["3011:3000"]
    mem_limit: 512m
    cpus: 0.5

  frontend:
    image: ${IMAGE_REGISTRY:-ghcr.io/ksushanik}/strain-collection-v2-frontend:${IMAGE_TAG:-latest}
    container_name: strain_v2_demo_frontend
    restart: unless-stopped
    env_file: ./frontend/.env.demo
    networks: [strain_v2_demo]
    ports: ["8083:3001"]
    mem_limit: 256m
    cpus: 0.5

volumes:
  postgres_v2_demo_data:

networks:
  strain_v2_demo:
    driver: bridge
```

- [ ] **Step 2: Локально провалидировать синтаксис compose**

Run: `docker compose -f docker-compose.demo.yml config --quiet`
Expected: ноль вывода, exit 0.

Если `docker compose` не установлен локально — пропустить (валидируется на сервере). Не считать blocker'ом.

- [ ] **Step 3: Commit**

```bash
git add docker-compose.demo.yml
git commit -m "feat(demo): add docker-compose.demo.yml for sandbox stack"
```

---

### Task 2: Создать `scripts/deploy-demo.sh`

**Files:**
- Create: `scripts/deploy-demo.sh`

Аналог `deploy-prod.sh`, но проще: нет AdminJS-bundle-sync, нет `migrate deploy` (этим занимается reset). Использует тот же `.env` для `IMAGE_TAG`/`IMAGE_REGISTRY`.

- [ ] **Step 1: Создать файл**

```bash
#!/usr/bin/env bash
# Bring up (or refresh) the demo stack on 4feb.
#
# Reuses .env in PROJECT_DIR for IMAGE_TAG/IMAGE_REGISTRY (same env as prod
# deploy-prod.sh — single source of truth for what tag is current).
#
# Idempotent: safe to re-run. Does NOT seed the DB — that's reset-demo.sh.
#
# Health-gate logic mirrors deploy-prod.sh.

set -euo pipefail

PROJECT_DIR="${PROJECT_DIR:-/home/deploy/bio_collection}"
HEALTH_TIMEOUT_SEC="${HEALTH_TIMEOUT_SEC:-90}"
HEALTH_POLL_INTERVAL="${HEALTH_POLL_INTERVAL:-2}"

cd "$PROJECT_DIR"

if [ -f .env ]; then
    set -a
    # shellcheck disable=SC1091
    . ./.env
    set +a
    echo ">>> Loaded .env (IMAGE_TAG=${IMAGE_TAG:-unset}, IMAGE_REGISTRY=${IMAGE_REGISTRY:-unset})"
fi

echo ">>> Pulling demo images..."
docker compose -f docker-compose.demo.yml pull

echo ">>> Recreating demo containers..."
docker compose -f docker-compose.demo.yml up -d

cid=$(docker compose -f docker-compose.demo.yml ps -q backend)
if [ -z "$cid" ]; then
    echo "ERROR: could not resolve demo backend container id" >&2
    exit 1
fi

echo ">>> Waiting up to ${HEALTH_TIMEOUT_SEC}s for demo backend ($cid) to become healthy..."
deadline=$(( $(date +%s) + HEALTH_TIMEOUT_SEC ))
while :; do
    status=$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' "$cid" 2>/dev/null || echo missing)
    case "$status" in
        healthy)
            echo ">>> demo backend is healthy"
            break
            ;;
        unhealthy)
            echo "ERROR: demo backend reported unhealthy — recent logs:" >&2
            docker logs --tail 50 "$cid" >&2 || true
            exit 1
            ;;
        none)
            echo "WARN: demo backend has no HEALTHCHECK — falling back to single HTTP probe" >&2
            if docker exec "$cid" node -e "require('http').get('http://127.0.0.1:3000', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"; then
                echo ">>> demo backend responded 200 to fallback probe"
                break
            else
                echo "ERROR: demo backend did not respond to fallback probe" >&2
                docker logs --tail 50 "$cid" >&2 || true
                exit 1
            fi
            ;;
    esac

    if [ "$(date +%s)" -ge "$deadline" ]; then
        echo "ERROR: demo backend health timeout after ${HEALTH_TIMEOUT_SEC}s (last status: $status)" >&2
        docker logs --tail 50 "$cid" >&2 || true
        exit 1
    fi
    sleep "$HEALTH_POLL_INTERVAL"
done

echo ">>> Demo deploy complete."
```

- [ ] **Step 2: Сделать исполняемым (для прод-Linux)**

Run: `chmod +x scripts/deploy-demo.sh`
(Windows-локально не сработает; Linux на 4feb разберётся сам. Но `git add` подхватит +x bit, что важно.)

- [ ] **Step 3: Локально провалидировать bash-синтаксис**

Run: `bash -n scripts/deploy-demo.sh`
Expected: ноль вывода, exit 0.

Если `bash` недоступен (нативный Windows без git-bash) — пропустить.

- [ ] **Step 4: Commit**

```bash
git add scripts/deploy-demo.sh
git commit -m "feat(demo): add scripts/deploy-demo.sh"
```

---

### Task 3: Создать `scripts/reset-demo.sh`

**Files:**
- Create: `scripts/reset-demo.sh`

Cron-friendly: пишет в `/var/log/strain-demo-reset.log`, выходит с кодом ошибки если что-то сломалось (systemd увидит). Перед reset'ом пуллит свежий образ (D4 — demo follows latest).

- [ ] **Step 1: Создать файл**

```bash
#!/usr/bin/env bash
# Nightly reset of the demo instance back to mock data.
#
# Steps:
#   1. Pull latest demo images (D4: demo follows :latest tag).
#   2. Restart containers if images changed.
#   3. Wait for backend container to be running (not necessarily healthy —
#      DB may be empty if this is first run).
#   4. Wipe DB and re-run the existing prisma seed.
#   5. Probe backend health (same loop as deploy-prod.sh).
#
# Triggered by /etc/systemd/system/strain-demo-reset.timer @ 03:00 MSK daily.
# Also safe to run manually for first bootstrap.

set -euo pipefail

PROJECT_DIR="${PROJECT_DIR:-/home/deploy/bio_collection}"
HEALTH_TIMEOUT_SEC="${HEALTH_TIMEOUT_SEC:-90}"
LOG="${RESET_LOG:-/var/log/strain-demo-reset.log}"

# Append all output to the log so cron has a paper trail.
exec >> "$LOG" 2>&1
echo
echo "=== $(date -Iseconds) demo reset start (PROJECT_DIR=$PROJECT_DIR) ==="

cd "$PROJECT_DIR"

if [ -f .env ]; then
    set -a
    # shellcheck disable=SC1091
    . ./.env
    set +a
fi

echo ">>> Pulling latest demo images..."
docker compose -f docker-compose.demo.yml pull backend frontend

echo ">>> Restarting demo containers (if image changed, docker compose up -d will recreate)..."
docker compose -f docker-compose.demo.yml up -d

# Container must be running before we exec into it. Allow ~10s for startup.
echo ">>> Waiting for demo backend container to be in 'running' state..."
for _ in $(seq 1 10); do
    state=$(docker inspect --format '{{.State.Status}}' strain_v2_demo_backend 2>/dev/null || echo missing)
    if [ "$state" = "running" ]; then
        break
    fi
    sleep 1
done
if [ "$state" != "running" ]; then
    echo "ERROR: demo backend container did not reach 'running' state (last: $state)"
    exit 1
fi

echo ">>> Resetting demo DB and re-seeding via existing seed.ts..."
# --skip-seed because Prisma's automatic seed hook isn't reliable in
# production-mode containers; we invoke the compiled seed.js explicitly.
docker exec strain_v2_demo_backend sh -c '
    npx prisma migrate reset --force --skip-seed &&
    node dist/prisma/seed.js
'

echo ">>> Waiting up to ${HEALTH_TIMEOUT_SEC}s for demo backend to be healthy after reset..."
deadline=$(( $(date +%s) + HEALTH_TIMEOUT_SEC ))
while :; do
    status=$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' strain_v2_demo_backend 2>/dev/null || echo missing)
    case "$status" in
        healthy)
            echo ">>> demo backend healthy"
            break
            ;;
        unhealthy)
            echo "ERROR: demo backend reported unhealthy after reset"
            docker logs --tail 80 strain_v2_demo_backend
            exit 1
            ;;
        none)
            # HEALTHCHECK absent — single HTTP probe fallback.
            if docker exec strain_v2_demo_backend node -e "require('http').get('http://127.0.0.1:3000', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"; then
                echo ">>> demo backend responded 200 to fallback probe"
                break
            fi
            ;;
    esac
    if [ "$(date +%s)" -ge "$deadline" ]; then
        echo "ERROR: demo backend health timeout (last: $status)"
        docker logs --tail 80 strain_v2_demo_backend
        exit 1
    fi
    sleep 2
done

echo "=== $(date -Iseconds) demo reset done ==="
```

- [ ] **Step 2: Mark executable**

Run: `chmod +x scripts/reset-demo.sh`

- [ ] **Step 3: bash syntax check**

Run: `bash -n scripts/reset-demo.sh`
Expected: empty output, exit 0.

- [ ] **Step 4: Commit**

```bash
git add scripts/reset-demo.sh
git commit -m "feat(demo): add scripts/reset-demo.sh (nightly mock-data reset)"
```

---

### Task 4: Создать `.env.demo.example` файлы

**Files:**
- Create: `backend/.env.demo.example`
- Create: `frontend/.env.demo.example`

Эти файлы коммитятся в репо как **template'ы** (без секретов). Реальные `.env.demo` создаются на сервере, в гит не уходят (как и текущие `.env`).

- [ ] **Step 1: Создать `backend/.env.demo.example`**

```bash
# Demo-only environment for backend container (strain_v2_demo_backend).
# Copy to backend/.env.demo on the server and fill in real secrets.
# DO NOT commit the filled file.

# --- Database ---
# Uses the dedicated demo Postgres container (see docker-compose.demo.yml).
DATABASE_URL="postgresql://demo:demo@strain_v2_demo_db:5432/strain_collection_v2_demo?schema=public"

# --- Auth / JWT ---
# MUST differ from prod. Generate with: openssl rand -hex 32
JWT_SECRET="REPLACE_ME_WITH_openssl_rand_hex_32"
JWT_EXPIRES_IN="7d"

# --- Admin / Sessions ---
# MUST differ from prod. Generate with: openssl rand -hex 32
ADMIN_SESSION_SECRET="REPLACE_ME_WITH_openssl_rand_hex_32"
REDIS_URL="redis://strain_v2_demo_redis:6379"

# --- API / Server ---
PORT=3000
CORS_ORIGIN="https://culturedb-demo.duckdns.org"
RATE_LIMIT_TTL=60
RATE_LIMIT_LIMIT=120

# --- ImageKit ---
# Leave empty to use local-uploads mode (files live in the container volume
# and disappear on every reset — fine for demo). Recommended default.
IMAGEKIT_PUBLIC_KEY=""
IMAGEKIT_PRIVATE_KEY=""
IMAGEKIT_URL_ENDPOINT=""
IMAGEKIT_UPLOAD_TIMEOUT_MS=15000
IMAGEKIT_DELETE_TIMEOUT_MS=10000
IMAGEKIT_MAX_RETRIES=2
IMAGEKIT_RETRY_DELAY_MS=500

# --- NCBI E-utilities ---
NCBI_API_URL="https://eutils.ncbi.nlm.nih.gov/entrez/eutils"
NCBI_API_KEY=""

# --- Audit retention ---
AUDIT_RETENTION_DAYS=90
```

- [ ] **Step 2: Создать `frontend/.env.demo.example`**

```bash
# Demo-only environment for frontend container (strain_v2_demo_frontend).
# Copy to frontend/.env.demo on the server. DO NOT commit the filled file.

# Public API URL — must point at the demo subdomain (nginx routes /api → :3011).
NEXT_PUBLIC_API_URL="https://culturedb-demo.duckdns.org"

# Flag picked up by <DemoBanner /> to render the sandbox notice.
NEXT_PUBLIC_DEMO_MODE="1"

# Umami analytics (optional) — leave empty to disable.
NEXT_PUBLIC_UMAMI_WEBSITE_ID=""
NEXT_PUBLIC_UMAMI_SCRIPT_URL=""
```

- [ ] **Step 3: Verify these paths are NOT covered by an existing wildcard `.env*` ignore**

Run: `git check-ignore -v backend/.env.demo.example frontend/.env.demo.example`
Expected: оба файла должны быть **не** ignored (exit 1, без вывода). Если они ignored — проверить `.gitignore`, скорее всего там паттерн `.env*` слишком жадный; добавить негативное правило `!*.env.demo.example`.

- [ ] **Step 4: Commit**

```bash
git add backend/.env.demo.example frontend/.env.demo.example
git commit -m "feat(demo): add .env.demo.example templates"
```

---

### Task 5: Создать React-компонент `DemoBanner`

**Files:**
- Create: `frontend/src/components/layout/DemoBanner.tsx`

Простой клиентский компонент. Не рендерится, если `NEXT_PUBLIC_DEMO_MODE !== '1'`. Использует `useTranslations('DemoBanner')`.

- [ ] **Step 1: Создать компонент**

```tsx
'use client';

import { useTranslations } from 'next-intl';

export function DemoBanner() {
  if (process.env.NEXT_PUBLIC_DEMO_MODE !== '1') {
    return null;
  }
  const t = useTranslations('DemoBanner');

  return (
    <div
      role="status"
      className="bg-yellow-100 dark:bg-yellow-900/40 text-yellow-900 dark:text-yellow-100 text-sm py-2 px-4 text-center border-b border-yellow-300 dark:border-yellow-800"
    >
      {t('notice')}
      {' '}
      {t('credentials')}{' '}
      <code className="font-mono">admin@example.com / admin123</code>
      {' '}{t('or')}{' '}
      <code className="font-mono">manager@example.com / manager123</code>
    </div>
  );
}
```

Заметка: компонент гард `NEXT_PUBLIC_DEMO_MODE !== '1'` стоит **до** вызова хука `useTranslations`. Это **намеренно** — на prod-сборке компонент возвращает `null` сразу и `useTranslations` вообще не вызывается, что избавляет от любых зависимостей от i18n-контекста на тех страницах, где он не нужен.

> **Внимание:** правило React Hooks запрещает условные вызовы. Здесь это не нарушение, потому что `process.env.NEXT_PUBLIC_DEMO_MODE` — **build-time** константа: Next.js инлайнит её в бандл при сборке, и условие либо всегда `true`, либо всегда `false` в одном билде. Это идиоматический паттерн в Next.js (см. как используется `process.env.NODE_ENV` в коде). Линтер может выдать warning — если так, добавить на этой строке `// eslint-disable-next-line react-hooks/rules-of-hooks` с комментарием «build-time constant».

- [ ] **Step 2: Локально lint этого файла**

Run: `cd frontend && npx eslint src/components/layout/DemoBanner.tsx`
Expected: либо ноль warnings, либо тот единственный ожидаемый warning про rules-of-hooks, который мы подавили.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/layout/DemoBanner.tsx
git commit -m "feat(demo): add DemoBanner component (renders when NEXT_PUBLIC_DEMO_MODE=1)"
```

---

### Task 6: Добавить переводы для `DemoBanner`

**Files:**
- Modify: `frontend/messages/en.json`
- Modify: `frontend/messages/ru.json`

Добавить новый top-level namespace `DemoBanner` с ключами `notice`, `credentials`, `or`.

- [ ] **Step 1: Найти, куда вставить namespace в en.json**

Run: `grep -n '^    "[A-Z]' frontend/messages/en.json | head -20`
Expected: список top-level namespaces. Добавить `"DemoBanner"` сразу после `"Common"` или в алфавитном порядке, как в файле.

- [ ] **Step 2: Вставить namespace в `en.json`**

Добавить в `frontend/messages/en.json` после блока `"Common": { ... },`:

```json
    "DemoBanner": {
        "notice": "This is a demo instance. The database is wiped and reseeded every night at 03:00 MSK.",
        "credentials": "Log in with:",
        "or": "or"
    },
```

- [ ] **Step 3: Вставить namespace в `ru.json` (в той же позиции)**

```json
    "DemoBanner": {
        "notice": "Это демо-инстанс. База данных очищается и заполняется заново каждую ночь в 03:00 MSK.",
        "credentials": "Войти под:",
        "or": "или"
    },
```

- [ ] **Step 4: Провалидировать JSON**

Run (PowerShell):
```powershell
Get-Content frontend/messages/en.json | ConvertFrom-Json | Out-Null
Get-Content frontend/messages/ru.json | ConvertFrom-Json | Out-Null
```
Expected: ноль ошибок (если есть syntax error — увидим parse exception).

Альтернатива (если установлен node):
```bash
node -e "JSON.parse(require('fs').readFileSync('frontend/messages/en.json'))"
node -e "JSON.parse(require('fs').readFileSync('frontend/messages/ru.json'))"
```

- [ ] **Step 5: Commit**

```bash
git add frontend/messages/en.json frontend/messages/ru.json
git commit -m "feat(demo): add DemoBanner translations (en, ru)"
```

---

### Task 7: Смонтировать `DemoBanner` в layout

**Files:**
- Modify: `frontend/src/app/[locale]/layout.tsx`

Banner вставляется внутрь `<NextIntlClientProvider>` (нужен i18n-контекст) и **до** `<MainLayout>` — чтобы баннер прилипал к самому верху страницы независимо от того, какая secondary navigation у `MainLayout`.

- [ ] **Step 1: Прочитать текущий файл (контекст уже виден выше в плане)**

См. `frontend/src/app/[locale]/layout.tsx` — текущая структура `<NextIntlClientProvider> → <AuthProvider> → <ErrorBoundary> → <MainLayout>`.

- [ ] **Step 2: Добавить импорт**

В начало файла, рядом с другими импортами `@/components`:
```tsx
import { DemoBanner } from "@/components/layout/DemoBanner";
```

- [ ] **Step 3: Вставить `<DemoBanner />` внутрь провайдера**

Изменить блок:
```tsx
<NextIntlClientProvider messages={messages}>
  <AuthProvider>
    <ErrorBoundary>
      <MainLayout>
```
на:
```tsx
<NextIntlClientProvider messages={messages}>
  <DemoBanner />
  <AuthProvider>
    <ErrorBoundary>
      <MainLayout>
```

- [ ] **Step 4: Локальный typecheck**

Run: `cd frontend && npx tsc --noEmit`
Expected: ноль ошибок.

- [ ] **Step 5: Local dev smoke (опционально — если есть Docker для Postgres)**

Run: `make dev-env` (Postgres + Redis), затем в одном терминале `cd backend && npm run start:dev`, в другом `cd frontend && NEXT_PUBLIC_DEMO_MODE=1 npm run dev`.

Open: `http://localhost:3001/en/login`
Expected: жёлтая полоска сверху с текстом «This is a demo instance...» и двумя credentials в `<code>`.

Если Docker не поднимается — пропустить этот step, оставить smoke на server-side проверку.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/app/[locale]/layout.tsx
git commit -m "feat(demo): mount DemoBanner in app/[locale]/layout"
```

---

### Task 8: Полный CI-mirror прогон локально

Проверка, что весь PR пройдёт CI без сюрпризов.

- [ ] **Step 1: Backend lint + build + test**

Run:
```bash
cd backend
npm run lint -- --max-warnings=0
npm run build
npm run test -- --runInBand
```
Expected: всё зелёное. Никакой код backend'а мы не меняли, но это safety net.

- [ ] **Step 2: Frontend lint + build**

Run:
```bash
cd frontend
npm run lint
npm run build
```
Expected: всё зелёное. Build особенно важен — он гоняет typecheck и собирает Next.js, что валидирует, что i18n-ключи существуют.

Если на этом шаге всплывут ошибки — фиксить и репитить. **Не двигаться дальше с красным CI mirror.**

- [ ] **Step 3: Если что-то поправили — отдельный commit**

```bash
git add -p  # выбрать соответствующие файлы
git commit -m "fix(demo): <короткое описание>"
```

---

### Task 9: Codex adversarial review (риск-зона: deploy automation + auth env)

Согласно `CLAUDE.md` §«Codex policy», изменения в `scripts/` + `.env.example` для auth-секретов — **обязательная** риск-зона. До PR прогоняем Codex.

- [ ] **Step 1: Push текущей ветки чтобы Codex видел diff**

```bash
git push -u origin feat/demo-instance
```

- [ ] **Step 2: Запустить Codex review через codex-companion**

Сначала найти текущий путь к скрипту (плагин может обновиться):

Run: `find ~/.claude/plugins -path '*codex*' -name 'codex-companion.mjs' | head -1`

Затем (заменив `<path>` найденным):

Run: `node <path> adversarial-review --wait --scope branch`

Альтернативно, если Claude Code сейчас сам владеет stack'ом — использовать sub-agent `codex-second-opinion` (он инкапсулирует вызов и возвращает summary):

```
@codex-second-opinion review the demo-instance branch focusing on:
- scripts/deploy-demo.sh: race conditions, exit codes, secrets in logs
- scripts/reset-demo.sh: idempotency, error handling around prisma migrate reset
- .env.demo.example: any secret accidentally committed
- docker-compose.demo.yml: container-name / volume isolation from prod
```

- [ ] **Step 3: Прочитать вывод Codex и решить**

Возможные исходы:
- **APPROVE** → двигаемся к PR.
- **CONCERNS** → если concerns мелкие/стилистические — задокументировать в PR description; если существенные — пофиксить и перепрогнать.
- **BLOCK** → пофиксить **обязательно**, перепрогнать.

- [ ] **Step 4: Если Codex просит правки — внести и закоммитить**

```bash
# fixes...
git add -p
git commit -m "fix(demo): address codex review feedback — <one line>"
git push
```

---

### Task 10: Открыть PR

- [ ] **Step 1: Создать PR через gh**

Run:
```bash
gh pr create --title "feat(demo): sandbox instance on 4feb with nightly reset" --body "$(cat <<'EOF'
## Summary
- Adds `docker-compose.demo.yml` for a second sandbox stack on 4feb (separate container names, ports 3011/8083, isolated network/volume).
- Adds `scripts/deploy-demo.sh` and `scripts/reset-demo.sh` (nightly mock-data reset).
- Adds `DemoBanner` component + en/ru translations, gated by `NEXT_PUBLIC_DEMO_MODE=1`.
- Adds `backend/.env.demo.example` and `frontend/.env.demo.example` templates.
- Reuses existing `backend/prisma/seed.ts` as the demo dataset — no separate seed.

Reads existing GHCR images (no Dockerfile changes).

Design spec: `docs/superpowers/specs/2026-05-20-demo-instance-design.md`

## Test plan
- [x] backend lint + build + test (CI mirror locally)
- [x] frontend lint + build (CI mirror locally)
- [x] docker compose -f docker-compose.demo.yml config --quiet (syntax)
- [x] bash -n on both scripts/deploy-demo.sh and scripts/reset-demo.sh
- [x] Codex adversarial review on diff
- [ ] After merge → server-side bootstrap on 4feb (Phase 2 in plan)

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- [ ] **Step 2: Записать PR URL в выводе**

`gh pr create` вернёт URL — сохранить для ссылок.

- [ ] **Step 3: Дождаться зелёного CI**

CI прогонит lint + build + test + e2e на этой ветке. Любой red ↔ blocker.

- [ ] **Step 4: Merge в main**

Когда CI зелёный и Codex approved — мерджить (squash или merge — по обычной конвенции этого репо).

**После merge** — `.github/workflows/build.yml` соберёт новые GHCR-образы, `deploy.yml` задеплоит prod (это безопасно — изменения только в demo-инфре + DemoBanner, который на prod возвращает `null`, потому что `NEXT_PUBLIC_DEMO_MODE` не выставлен).

---

## Phase 2 — Server-side bootstrap (на 4feb, после merge в main)

После того как новые образы опубликованы в GHCR (это произойдёт автоматически после merge), переходим к настройке сервера. Все шаги делаются вручную по этому чек-листу — `ssh 4feb` под пользователем `deploy`.

### Task 11: Зарегистрировать DuckDNS-сабдомен

- [ ] **Step 1: Открыть https://www.duckdns.org/**

В браузере. Залогиниться через GitHub (либо другой OAuth провайдер) — никакой пароль не нужен.

- [ ] **Step 2: Создать сабдомен**

В разделе **domains** ввести имя (рекомендуется `culturedb-demo`). Кликнуть **add domain**.

DuckDNS покажет:
- Полное FQDN: `culturedb-demo.duckdns.org`
- Поле **current ip** — установить в `89.169.171.236` (это IP `4feb` из MEMORY).
- Кликнуть **update ip**.

- [ ] **Step 3: Сохранить token**

DuckDNS выдаёт API-token (вверху страницы). Скопировать — пригодится, если когда-нибудь захотим автоматизировать DNS-обновление.

- [ ] **Step 4: Проверить DNS-резолвинг**

С локальной машины:
Run: `nslookup culturedb-demo.duckdns.org`
Expected: должен резолвиться в `89.169.171.236`. Может занять 1-5 минут после `update ip`.

---

### Task 12: Положить `.env.demo` файлы на сервер

- [ ] **Step 1: SSH на сервер**

Run: `ssh 4feb` (alias из локального `~/.ssh/config`).

- [ ] **Step 2: Перейти в каталог проекта**

Run: `cd /home/deploy/bio_collection`

- [ ] **Step 3: Сгенерировать секреты**

Run:
```bash
echo "JWT_SECRET=$(openssl rand -hex 32)"
echo "ADMIN_SESSION_SECRET=$(openssl rand -hex 32)"
```
Скопировать значения.

- [ ] **Step 4: Создать `backend/.env.demo` из template'а**

Run: `cp backend/.env.demo.example backend/.env.demo`

Затем отредактировать (`nano backend/.env.demo` или `vim`):
- Подставить сгенерированный `JWT_SECRET`
- Подставить сгенерированный `ADMIN_SESSION_SECRET`
- Остальные поля оставить как в template (DATABASE_URL, REDIS_URL, CORS_ORIGIN уже правильные).

- [ ] **Step 5: Создать `frontend/.env.demo`**

Run: `cp frontend/.env.demo.example frontend/.env.demo`
Этот файл правки не требует — все значения уже корректны (`NEXT_PUBLIC_API_URL=https://culturedb-demo.duckdns.org`, `NEXT_PUBLIC_DEMO_MODE=1`).

- [ ] **Step 6: Проверить permissions**

Run: `chmod 600 backend/.env.demo frontend/.env.demo`
Expected: чтобы `.env.demo` файлы не были world-readable.

---

### Task 13: Первый запуск demo-стека

- [ ] **Step 1: Pull новых GHCR-образов и поднять demo**

Run (всё ещё на 4feb, в `/home/deploy/bio_collection`):
```bash
bash scripts/deploy-demo.sh
```

Expected:
- `>>> Pulling demo images...` → должны скачаться `backend:latest` и `frontend:latest`.
- `>>> Recreating demo containers...` → создаются 4 контейнера `strain_v2_demo_*`.
- `>>> Waiting up to 90s for demo backend to become healthy...` — здесь backend **упадёт** в unhealthy, потому что БД ещё пустая (миграции не накатаны). Это **ожидаемо** — переходим к ресету.

Если backend упал с другой ошибкой (`config invalid`, `no image`, и т.п.) — это blocker. Прочитать `docker logs strain_v2_demo_backend --tail 80` и разбираться.

- [ ] **Step 2: Подготовить лог-файл для cron**

Run: `sudo touch /var/log/strain-demo-reset.log && sudo chown deploy:deploy /var/log/strain-demo-reset.log`
Expected: файл существует и принадлежит `deploy`.

- [ ] **Step 3: Прогнать первый reset**

Run: `bash scripts/reset-demo.sh`
Expected:
- `=== ... demo reset start ===`
- `>>> Pulling latest demo images...` (уже скачаны, no-op).
- `>>> Resetting demo DB and re-seeding via existing seed.ts...` → `npx prisma migrate reset --force --skip-seed` + `node dist/prisma/seed.js`. Должен пройти все миграции и создать 40 samples, 20 strains, 16 boxes, 3 demo users.
- `>>> demo backend healthy` — backend поднимается, потому что БД теперь полная.
- `=== ... demo reset done ===`

Если что-то падает — посмотреть `/var/log/strain-demo-reset.log`.

- [ ] **Step 4: Sanity-check данных**

Run: `docker exec strain_v2_demo_db psql -U demo -d strain_collection_v2_demo -c "SELECT COUNT(*) FROM strains;"`
Expected: 20.

Run: `docker exec strain_v2_demo_db psql -U demo -d strain_collection_v2_demo -c "SELECT email FROM users;"`
Expected: три строки — `admin@example.com`, `manager@example.com`, `viewer@example.com`.

- [ ] **Step 5: Проверить, что demo отвечает локально на сервере**

Run: `curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3011`
Expected: `200`.

Run: `curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:8083`
Expected: `200`.

---

### Task 14: Конфиг nginx + TLS

- [ ] **Step 1: Прочитать существующий prod-конфиг**

Run: `sudo cat /etc/nginx/sites-enabled/culturedb.conf` (имя файла может отличаться — `ls /etc/nginx/sites-enabled/`).

Это нужно, чтобы понять:
- Какие SSL-параметры применяются (тут не угадаешь, надо смотреть конкретный конфиг).
- Как именно prod-фронт проксируется (location `/`).
- Как именно prod-API проксируется (location `/api/`, location `/admin/`).

- [ ] **Step 2: Создать `/etc/nginx/sites-available/culturedb-demo.conf`**

Шаблон (адаптировать `ssl_*` директивы под то, что нашлось в шаге 1):

```nginx
# HTTP — only for Let's Encrypt webroot challenge; everything else 301-s to HTTPS.
server {
    listen 80;
    listen [::]:80;
    server_name culturedb-demo.duckdns.org;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

# HTTPS — actual demo entrypoint.
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name culturedb-demo.duckdns.org;

    # Certificates will be filled in by certbot in Task 14, step 3.
    # ssl_certificate     /etc/letsencrypt/live/culturedb-demo.duckdns.org/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/culturedb-demo.duckdns.org/privkey.pem;

    client_max_body_size 50M;

    # AdminJS — same priority routing as prod (must be before /api/).
    location /admin {
        proxy_pass http://127.0.0.1:3011;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_http_version 1.1;
    }

    # NestJS API routes.
    location /api/ {
        proxy_pass http://127.0.0.1:3011/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_http_version 1.1;
    }

    # Next.js frontend (catch-all).
    location / {
        proxy_pass http://127.0.0.1:8083;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_http_version 1.1;
        # WebSocket / Next.js HMR not needed in prod build, but harmless:
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

> **Внимание:** SSL-блок закомментирован специально — certbot в следующем шаге сам впишет правильные пути после успешного issuance. Если оставить незаполненные `ssl_certificate` директивы — nginx упадёт при reload'е.

Создание файла:
```bash
sudo nano /etc/nginx/sites-available/culturedb-demo.conf
# (вставить контент выше)
sudo ln -s /etc/nginx/sites-available/culturedb-demo.conf /etc/nginx/sites-enabled/culturedb-demo.conf
```

- [ ] **Step 3: Получить TLS-сертификат через certbot**

Run:
```bash
sudo certbot --nginx -d culturedb-demo.duckdns.org --non-interactive --agree-tos --email <твой-email>
```

Expected:
- certbot пройдёт HTTP-01 challenge на `:80`.
- В `/etc/letsencrypt/live/culturedb-demo.duckdns.org/` появятся `fullchain.pem` и `privkey.pem`.
- certbot **сам впишет** ssl_certificate директивы в наш `culturedb-demo.conf` и сам сделает `nginx -t && systemctl reload nginx`.

Если certbot падает с «Connection refused» — значит порт 80 не открыт для DuckDNS или nginx не слушает 80. Проверить `sudo ufw status` и `sudo nginx -t`.

- [ ] **Step 4: Проверить nginx-конфиг и reload**

Run: `sudo nginx -t`
Expected: `syntax is ok` + `test is successful`.

Run: `sudo systemctl reload nginx`
Expected: ноль вывода, exit 0.

- [ ] **Step 5: Smoke-test через домен**

Run (с локальной машины):
```bash
curl -sI https://culturedb-demo.duckdns.org/ | head -5
```
Expected: `HTTP/2 200` (или 301/308 если фронт редиректит на `/en`, что нормально).

Run: `curl -s https://culturedb-demo.duckdns.org/api/health` (если такой endpoint есть; альтернатива — любой публичный API-роут).

---

### Task 15: systemd-timer для ночного reset'а

- [ ] **Step 1: Создать service-unit**

Run: `sudo nano /etc/systemd/system/strain-demo-reset.service`

Содержимое:
```ini
[Unit]
Description=Reset strain_collection_v2 demo instance to fresh mock data
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
User=deploy
WorkingDirectory=/home/deploy/bio_collection
ExecStart=/home/deploy/bio_collection/scripts/reset-demo.sh
# Timeouts: reset includes image pull + DB reset + seed + health-probe.
# 5min is generous; if it takes longer, something is wrong.
TimeoutStartSec=300
```

- [ ] **Step 2: Создать timer-unit**

Run: `sudo nano /etc/systemd/system/strain-demo-reset.timer`

Содержимое:
```ini
[Unit]
Description=Nightly reset of demo instance @ 03:00 MSK

[Timer]
OnCalendar=*-*-* 03:00:00 Europe/Moscow
Persistent=true

[Install]
WantedBy=timers.target
```

`Persistent=true` важно — если сервер был выключен в 03:00, timer запустится при следующем boot'е.

- [ ] **Step 3: Включить и запустить timer**

Run:
```bash
sudo systemctl daemon-reload
sudo systemctl enable --now strain-demo-reset.timer
```

- [ ] **Step 4: Проверить расписание**

Run: `systemctl list-timers strain-demo-reset.timer`
Expected: одна строка с `NEXT=<сегодня или завтра> 03:00:00 MSK` и `LAST=n/a`.

- [ ] **Step 5: Один раз дёрнуть руками, чтобы убедиться что unit отрабатывает**

Run: `sudo systemctl start strain-demo-reset.service`
Expected:
- Команда возвращается за <2 минуты.
- `systemctl status strain-demo-reset.service` показывает `inactive (dead)` со `ExitCode=0/SUCCESS`.
- `tail /var/log/strain-demo-reset.log` показывает свежую запись `demo reset done`.

Если падает с non-zero exit — debug по логу, поправить причину.

---

### Task 16: Production smoke-test (ручной)

- [ ] **Step 1: Открыть `https://culturedb-demo.duckdns.org` в браузере**

Expected:
- Загружается главная.
- Сверху видна жёлтая полоса DemoBanner с текстом «Это демо-инстанс...» и credentials.
- HTTPS-замок зелёный (валидный Let's Encrypt cert).

- [ ] **Step 2: Залогиниться под `admin@example.com / admin123`**

Expected:
- Логин принят.
- В sidebar видны все разделы (Strains, Samples, Storage, и т.д.).

- [ ] **Step 3: Открыть страницу штаммов**

Expected: список из 20 штаммов с identifier'ами `STR-2024-001`...`STR-2024-020`.

- [ ] **Step 4: Открыть карточку любого штамма**

Expected: phenotypes (Gram Stain, Phosphate Solubilization, и т.д.) и genetics видны.

- [ ] **Step 5: Открыть страницу образцов / карту**

Expected: на карте Leaflet появляются точки в районе Москвы (40 sample'ов с lat ~55.0, lng ~37.0).

- [ ] **Step 6: Создать новый штамм через UI**

Expected: создаётся успешно, попадает в список.

- [ ] **Step 7: Открыть `https://culturedb-demo.duckdns.org/admin`**

Expected: AdminJS-логин-форма. Залогиниться под `admin@example.com / admin123`.

- [ ] **Step 8: Проверить, что prod **не** пострадал**

Open: `https://culturedb.elcity.ru/`
Expected:
- Сайт работает как раньше.
- DemoBanner **отсутствует** (потому что prod не выставляет `NEXT_PUBLIC_DEMO_MODE`).

Если на prod что-то сломалось — это критический регрешн. Откатиться через `gh workflow run deploy.yml -f tag=<previous-sha>` и разбираться.

- [ ] **Step 9: Подождать первый ночной cron-reset**

В 03:01 MSK следующего дня (или дёрнуть `sudo systemctl start strain-demo-reset.service` руками сейчас, что эквивалентно).

Open: `https://culturedb-demo.duckdns.org/strains`
Expected: ровно 20 штаммов с identifier'ами `STR-2024-*` (т.е. созданный в шаге 6 штамм исчез — данные действительно сбрасываются).

---

## Self-Review

Проверка плана против spec'а:

**Spec coverage:**
- Goal 1 (поднять копию на `culturedb-demo.duckdns.org`): покрыто Tasks 1, 11, 14 ✅
- Goal 2 (изоляция БД/Redis/cookies/ImageKit): покрыто Tasks 1 (отдельные network/volumes/container_names), 4 (отдельные secrets), 12 (отдельные .env) ✅
- Goal 3 (мок-набор): покрыто реюзом существующего seed.ts, Task 13 ✅
- Goal 4 (ночной cron-reset): покрыто Tasks 3, 15 ✅
- Goal 5 (реюз GHCR-образов): покрыто Task 1 (image-теги используют те же env-vars), Task 10 (CI пересоберёт образы после merge) ✅
- Goal 6 (ресурс-лимиты): покрыто Task 1 (`mem_limit`, `cpus` на всех demo-сервисах) ✅
- Все 11 Decisions из spec'а отражены ✅

**Placeholder scan:**
- В Task 14 step 1 нужно «прочитать существующий конфиг» — это явный investigation step, не плейсхолдер.
- В Task 14 step 3 `--email <твой-email>` — пользователь подставит свой адрес.
- В Task 9 step 2 `<path>` к codex-companion.mjs — указан способ нахождения.
- Прочих TBD/TODO нет ✅

**Type consistency:**
- Имена контейнеров (`strain_v2_demo_backend`, `strain_v2_demo_db`) одинаковы во всех скриптах ✅
- Порты (3011 backend, 8083 frontend) согласованы в compose + nginx + smoke-тестах ✅
- Имена .env-файлов (`backend/.env.demo`, `frontend/.env.demo`) согласованы между compose, examples и server-side setup ✅
- Имя cron-сервиса (`strain-demo-reset`) согласовано между файлами и проверками ✅

**Ambiguity check:**
- Task 1 step 1: Может ли host выполнить compose v2 синтаксис `mem_limit`/`cpus`? Это стандартный compose v2 синтаксис, поддерживается из коробки docker compose v2 (что точно установлено на 4feb, иначе prod бы не работал). ОК.
- Task 13 step 1: Backend упадёт в unhealthy при первом запуске на пустой БД. Это **намеренно** — план явно говорит «это ожидаемо, переходим к ресету», который заселит БД и backend восстановится. Не баг плана.
- Task 14 step 2: Точная маршрутизация `/admin` vs `/api/` зависит от того, как prod nginx сейчас настроен. План говорит «прочитать prod-конфиг и адаптировать» — нет другого пути сделать это правильно с локального ноута. Это известная open-question из spec'а ✅

Плана хватает на полное прохождение от пустого `feat/demo-instance` бранча до работающего https://culturedb-demo.duckdns.org. Дополнительных тасков не нужно.
