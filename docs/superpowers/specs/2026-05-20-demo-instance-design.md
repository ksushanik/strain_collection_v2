# Demo instance — Design Spec

**Date:** 2026-05-20
**Branch:** TBD (предлагается `feat/demo-instance`)
**Status:** Draft → User review

## Problem

Сейчас у проекта есть только prod на `culturedb.elcity.ru`. Нужен **отдельный демонстрационный инстанс с мок-данными** — песочница, в которой:

- Любой посетитель может зайти, залогиниться готовыми кредами, потрогать всё подряд: создавать/редактировать/удалять штаммы, импортировать CSV, аллоцировать ячейки хранения.
- Данные сбрасываются по расписанию к фиксированному мок-набору — чтобы демо не «зарастало» хламом.
- Демо живёт **изолированно от prod**: упасть, переполниться, быть взломанным не должно затрагивать боевые данные.
- Не требует покупки нового домена и не требует доступа к зоне `elcity.ru` (пользователь подтвердил — доступа нет).

Решение, которое выбрано после анализа альтернатив:
второй Docker-compose стек на том же VPS `4feb`, реюзящий те же GHCR-образы, под бесплатным сабдоменом (DuckDNS).

Альтернативы (Railway, Vercel+managed backend, отдельный VPS, путь `/demo` на основном домене) рассмотрены и отвергнуты — см. § «Rejected alternatives».

## Goals

1. Поднять полностью функциональную копию приложения на `culturedb-demo.duckdns.org` (или аналогичный бесплатный сабдомен) с HTTPS через Let's Encrypt.
2. Изолировать demo-стек от prod на уровне БД, Redis, AdminJS-сессий, ImageKit-хранилища, cookies.
3. Заполнить осмысленным мок-набором: ~30-50 штаммов с фенотипами/генетикой, ~5-10 sample'ов с GPS, минимум 1 storage-box с заполненными ячейками, заранее заведённые demo- и admin-пользователи.
4. Сбрасывать БД demo-инстанса каждую ночь по cron-расписанию обратно к мок-набору; сброс не должен зависеть от пуша в git.
5. Реюзить GHCR-образы prod-сборки — никаких отдельных «demo-only» образов.
6. Гарантировать, что demo не может выесть ресурсы хоста и положить prod (resource limits на demo-контейнерах).

**Out of scope:**
- Бэкапы demo-БД (данные эфемерные).
- Отдельный pipeline сборки.
- Промо-лендинг или маркетинговая обёртка вокруг демо.
- Регрессия / e2e против демо.
- Авто-rollback demo-стека при ошибке (полагаемся на следующий cron-reset).

## Decisions

| # | Decision | Rationale |
|---|----------|-----------|
| D1 | Хостить на том же VPS `4feb` вторым compose-стеком | Реюз nginx, образов, операционного контекста. Платформы (Railway/Fly) требуют параллельного CI и российскую оплату — overkill для песочницы. |
| D2 | Использовать DuckDNS-сабдомен (`culturedb-demo.duckdns.org`) | Доступа к DNS-зоне elcity.ru нет; DuckDNS бесплатен, поддерживает Let's Encrypt, ничего не правит в коде. Можно бесшовно мигрировать на свой домен позже. |
| D3 | Полная изоляция данных: отдельные Postgres + Redis + volumes | Никакого риска кросс-контаминации с prod. Демо-stack может быть стёрт целиком одной командой. |
| D4 | Демо следует за `latest` GHCR-тегом автоматически | Showcase всегда демонстрирует свежие фичи. Риск регрессии лечится cron-reset'ом, после которого demo-БД накатывается заново с актуальными миграциями. |
| D5 | Reset через systemd-timer на хосте, не через GitHub Actions | Меньше внешних зависимостей. Если GH Actions упадёт, демо продолжит ресетиться. |
| D6 | Demo использует **те же** backend/frontend образы, что и prod, но **разные .env-файлы** на сервере | Не вводим build-time флаги вроде `NEXT_PUBLIC_DEMO_MODE` в основной CI. Demo-banner управляется runtime env. |
| D7 | Resource limits на demo-контейнерах (`mem_limit: 512m`, `cpus: 0.5` на backend; postgres `mem_limit: 256m`) | Гарантируем, что demo не задушит prod при нагрузке/CSV-импорте. |
| D8 | Self-signup на demo **включён**; на login-странице показываются готовые креды (`admin@example.com / admin123` и `manager@example.com / manager123` из существующего `seed.ts`) | Снижает порог входа. Любые созданные посетителями учётки сметаются reset'ом. |
| D9 | AdminJS на демо **включён** | Это часть продукта; демо без админки была бы неполной. |
| D10 | ImageKit для demo: отдельный `IMAGEKIT_URL_ENDPOINT` (та же учётка, другая папка `/demo-uploads`). При отсутствии — local-uploads mode | Не загрязняем prod-папку и не путаем биллинг. |
| D11 | Demo-banner рендерится на фронте при `NEXT_PUBLIC_DEMO_MODE=1` | Прозрачно для пользователя: «Это демо. Данные сбрасываются каждую ночь в 03:00 МСК». |

## Architecture

### Топология на хосте `4feb`

```
                                  4feb (89.169.171.236)
                                  ┌──────────────────────────────────────────────┐
                                  │  nginx (host)                                │
                                  │   ├─ culturedb.elcity.ru   → :8082 + :3010   │
                                  │   └─ culturedb-demo.duckdns.org              │
                                  │                            → :8083 + :3011   │
                                  ├──────────────────────────────────────────────┤
                                  │  prod-стек (docker-compose.prod.yml)         │
                                  │    strain_v2_backend         :3010 host      │
                                  │    strain_v2_frontend        :8082 host      │
                                  │    strain_v2_db (volume postgres_v2_data)    │
                                  │    strain_v2_redis                           │
                                  ├──────────────────────────────────────────────┤
                                  │  demo-стек (docker-compose.demo.yml) ← новое │
                                  │    strain_v2_demo_backend    :3011 host      │
                                  │    strain_v2_demo_frontend   :8083 host      │
                                  │    strain_v2_demo_db         (volume         │
                                  │                               postgres_v2_demo_data) │
                                  │    strain_v2_demo_redis                      │
                                  ├──────────────────────────────────────────────┤
                                  │  systemd-timer strain-demo-reset.timer       │
                                  │    runs scripts/reset-demo.sh @ 03:00 MSK    │
                                  └──────────────────────────────────────────────┘
```

Demo-стек использует ровно те же образы `ghcr.io/ksushanik/strain-collection-v2-{backend,frontend}:latest`, что и prod, — пересборка не нужна.

### Data flow при reset'е

```
03:00 MSK ─►  systemd-timer fires
            ►  scripts/reset-demo.sh (на хосте)
                 ▼
                 docker compose -f docker-compose.demo.yml pull
                 docker exec strain_v2_demo_backend npx prisma migrate reset --force --skip-seed
                 docker exec strain_v2_demo_backend node dist/prisma/seed.js
                 docker logs strain_v2_demo_backend --tail 50 >> /var/log/strain-demo-reset.log
            ►  Health-probe (как в deploy-prod.sh): 90s timeout
                 ▼
                 если backend healthy → лог success, exit 0
                 если timeout/unhealthy → лог error, отправить уведомление (TBD: stdout-only пока)
```

### Сетевая изоляция

- Demo-стек живёт в своей docker-сети `strain_v2_demo`, не пересекающейся с `strain_v2`.
- nginx на хосте — единственная точка входа. Hostname matching определяет upstream.
- TLS-сертификат для demo-сабдомена выпускается отдельно через `certbot --nginx`.
- JWT/Admin secrets в `.env.demo` отличаются от prod-овских — даже если ключ утечёт из demo, prod-сессии не подделать.

## Components

### `docker-compose.demo.yml` (новый)

Аналог `docker-compose.prod.yml`, отличия:

- Все `container_name` с суффиксом `_demo`: `strain_v2_demo_db`, `strain_v2_demo_redis`, `strain_v2_demo_backend`, `strain_v2_demo_frontend`.
- Хост-порты: backend `3011:3000`, frontend `8083:3001`.
- Postgres volume: `postgres_v2_demo_data` (новый именованный volume).
- Postgres credentials: `POSTGRES_USER=demo`, `POSTGRES_PASSWORD=demo` (изолированы; БД доступна только из docker-сети).
- env_file: `./backend/.env.demo` и `./frontend/.env.demo` соответственно.
- Resource limits через `deploy.resources.limits` (или `mem_limit`/`cpus` для старого compose v2 синтакса — выбрать после проверки версии docker compose на сервере).
- Network: `strain_v2_demo` (bridge), отдельная от `strain_v2`.
- Backend `command` не делает `migrate deploy` — миграции применяются reset-скриптом, чтобы не дублировать логику. Backend просто `node dist/src/main.js`.
  > **Уточнение для имплементации:** проверить, не сломается ли первый запуск demo-стека до первого reset'а. Если БД пуста — backend упадёт при попытке читать. Решение: первый шаг bootstrap-скрипта = `reset-demo.sh`. Compose поднимает контейнеры; reset набивает БД.

### `scripts/deploy-demo.sh` (новый)

Упрощённый аналог `deploy-prod.sh`:

```bash
PROJECT_DIR=${PROJECT_DIR:-/home/deploy/bio_collection}
cd "$PROJECT_DIR"

# Source the same .env as prod (для IMAGE_TAG / IMAGE_REGISTRY)
set -a; . ./.env; set +a

docker compose -f docker-compose.demo.yml pull
docker compose -f docker-compose.demo.yml up -d

# Health-check тот же 90-second loop
```

Запускается:
- При первоначальной установке demo-стека (вручную).
- Опционально из `.github/workflows/deploy-demo.yml` через `workflow_dispatch` для ручного передёргивания.

### `scripts/reset-demo.sh` (новый)

```bash
#!/usr/bin/env bash
set -euo pipefail
LOG=/var/log/strain-demo-reset.log
exec >> "$LOG" 2>&1
echo "=== $(date -Iseconds) demo reset start ==="

cd /home/deploy/bio_collection

# 1. Pull latest image (D4: demo follows latest)
docker compose -f docker-compose.demo.yml pull backend frontend

# 2. Restart containers if image changed
docker compose -f docker-compose.demo.yml up -d

# 3. Wait for backend container to be running (not healthy yet — DB might be empty)
sleep 5

# 4. Wipe DB and reapply migrations + seed (already creates demo users, samples, strains, boxes)
docker exec strain_v2_demo_backend sh -c '
  npx prisma migrate reset --force --skip-seed &&
  node dist/prisma/seed.js
'

# 5. Health-check (90s timeout, same loop as deploy-prod.sh)
# ... (скопировать health-gate из deploy-prod.sh)

echo "=== $(date -Iseconds) demo reset done ==="
```

### Demo-данные — реюз существующего `backend/prisma/seed.ts`

Отдельный `seed-demo.ts` **не создаётся.** Существующий `seed.ts` уже даёт ровно то, что нужно для демо:

- **3 пользователя с bcrypt-паролями:**
  - `admin@example.com` / `admin123` — роль `ADMIN`
  - `manager@example.com` / `manager123` — роль `MANAGER`
  - `viewer@example.com` / `viewer123` — роль `VIEWER`
- **40 sample'ов** с lat/lng вокруг Москвы (55.0+, 37.0+) — карта Leaflet что-то покажет.
- **20 штаммов** с фенотипами (Gram Stain, Phosphate Solubilization, Siderophore, Pigment Secretion) — есть и положительные, и отрицательные результаты.
- **Genetics-блок** на половине штаммов (WgsStatus, assembly accession).
- **16 storage-боксов** (чередуются 9×9 и 10×10) с реальными ячейками.
- **Аллокации:** первые 15 штаммов уже распределены по ячейкам первого бокса.
- **Trait definitions** для системных traits (gram_stain, amylase и т.д.).

Этого хватает для презентации без отдельного demo-расширения. На login-странице будут показаны креды `admin@example.com / admin123` и `manager@example.com / manager123` через `DemoBanner` (см. ниже).

Dockerfile уже компилирует `seed.ts` в `dist/prisma/seed.js` (строка `RUN npx tsc prisma/seed.ts --outDir dist/prisma ...`). Никаких правок Dockerfile **не требуется**.

### `frontend/src/components/.../DemoBanner.tsx` (новый, опц.)

Простой жёлтый sticky-баннер сверху:

```tsx
'use client';
export function DemoBanner() {
  if (process.env.NEXT_PUBLIC_DEMO_MODE !== '1') return null;
  return (
    <div className="bg-yellow-100 text-yellow-900 text-sm py-2 px-4 text-center border-b">
      Это демо-инстанс. Данные сбрасываются каждую ночь в 03:00 MSK.
      {' '}Войти: <code>admin@example.com / admin123</code> или <code>manager@example.com / manager123</code>.
    </div>
  );
}
```

Монтируется в `app/[locale]/layout.tsx` сразу под `<body>`. Переводы — в `messages/{en,ru}.json` (`demoBanner.title`, `demoBanner.credentials`).

### `nginx/demo.conf` (на сервере, **не в репо**)

```
server {
  listen 80;
  server_name culturedb-demo.duckdns.org;
  location /.well-known/acme-challenge/ { root /var/www/certbot; }
  location / { return 301 https://$host$request_uri; }
}

server {
  listen 443 ssl http2;
  server_name culturedb-demo.duckdns.org;

  ssl_certificate     /etc/letsencrypt/live/culturedb-demo.duckdns.org/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/culturedb-demo.duckdns.org/privkey.pem;

  client_max_body_size 50M;

  location /api/ {
    proxy_pass http://127.0.0.1:3011/api/;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  location /admin/ {
    proxy_pass http://127.0.0.1:3011/admin/;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  location / {
    proxy_pass http://127.0.0.1:8083/;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

Конкретные пути для `/api/`, `/admin/` зависят от того, как prod-nginx уже маршрутизирует — будет уточнено при имплементации после `ssh 4feb cat /etc/nginx/sites-enabled/culturedb.conf`.

### `backend/.env.demo` и `frontend/.env.demo` (на сервере)

Те же ключи, что и `.env` prod, но:

- `DATABASE_URL=postgresql://demo:demo@strain_v2_demo_db:5432/strain_collection_v2_demo?schema=public`
- `JWT_SECRET` — свежий случайный (отличный от prod)
- `ADMIN_SESSION_SECRET` — свежий случайный
- `CORS_ORIGIN=https://culturedb-demo.duckdns.org`
- `IMAGEKIT_URL_ENDPOINT` — отдельная папка `/demo-uploads` (или пустые ImageKit-ключи для local-uploads)
- `NEXT_PUBLIC_API_URL=https://culturedb-demo.duckdns.org`
- `NEXT_PUBLIC_DEMO_MODE=1`

Хранятся **только на сервере** (как и prod `.env`). В репо появится `backend/.env.demo.example` и `frontend/.env.demo.example` с плейсхолдерами.

### systemd unit-файлы (на сервере, **не в репо**)

`/etc/systemd/system/strain-demo-reset.service`:
```ini
[Unit]
Description=Reset strain_collection_v2 demo instance to fresh mock data
After=docker.service

[Service]
Type=oneshot
User=deploy
WorkingDirectory=/home/deploy/bio_collection
ExecStart=/home/deploy/bio_collection/scripts/reset-demo.sh
```

`/etc/systemd/system/strain-demo-reset.timer`:
```ini
[Unit]
Description=Nightly reset of demo instance

[Timer]
OnCalendar=*-*-* 03:00:00 Europe/Moscow
Persistent=true

[Install]
WantedBy=timers.target
```

## Build sequence

Порядок имплементации (детально распишется в `writing-plans`):

1. **Локально:**
   - Создать `docker-compose.demo.yml`.
   - Написать `scripts/deploy-demo.sh`, `scripts/reset-demo.sh`.
   - Добавить `DemoBanner` компонент + переводы.
   - Создать `backend/.env.demo.example`, `frontend/.env.demo.example`.
   - PR в main (Codex review **обязателен** — затрагивает риск-зоны: deploy automation + auth env config).

2. **На сервере `4feb`** (после merge):
   - Регистрация DuckDNS-сабдомена (через GitHub-логин).
   - Создать `backend/.env.demo` и `frontend/.env.demo` (заполнить секреты через `openssl rand -hex 32`).
   - `bash scripts/deploy-demo.sh` — поднять стек.
   - `bash scripts/reset-demo.sh` — первый seed.
   - `certbot --nginx -d culturedb-demo.duckdns.org` — TLS.
   - Положить `nginx/demo.conf` в `/etc/nginx/sites-enabled/`, `nginx -t && systemctl reload nginx`.
   - Установить systemd unit-ы, `systemctl enable --now strain-demo-reset.timer`.
   - Проверка: открыть `https://culturedb-demo.duckdns.org` в браузере, залогиниться `admin@example.com / admin123`, проверить что список штаммов содержит мок-данные, создать штамм, выйти, выждать ночной reset, проверить что штамм исчез.

## Testing strategy

Поскольку demo — это операционная инфраструктура, а не код-фича, тестирование смещено в сторону smoke-проверок:

- **Unit:** `seed.ts` уже проверяется в существующих spec'ах (косвенно). Дополнительных unit-тестов для demo не требуется — мы не добавляем нового кода seed'а.
- **Integration:** не требуется — demo-стек проверяется в проде вручную smoke-листом.
- **CI:** существующие lint+build+test+e2e гоняются как обычно; demo-специфичный код (банер + seed) проходит через стандартный CI.
- **Production smoke:** ручной чек-лист после первого деплоя (см. § Build sequence шаг 2 финальный пункт).
- **Reset watchdog:** в `reset-demo.sh` ошибка `prisma migrate reset` или health-probe пишется в `/var/log/strain-demo-reset.log` — оператор смотрит вручную раз в неделю. Уведомления-в-Telegram — out of scope.

## Open questions / risks

1. **DuckDNS reliability.** DuckDNS — community-сервис, могут быть редкие даунтаймы. Митигация: купить дешёвый `.ru` домен (~500₽/год) при первом же инциденте. Пока живём с риском.
2. **Resource pressure on 4feb.** Если demo-нагрузка станет заметной (CSV-import тяжёлых файлов), prod может замедлиться. Митигация — `mem_limit` + `cpus` лимиты. Если их не хватит — выносим на отдельный $5-VPS (но компоненты уже изолированы compose'ом, миграция дешёвая).
3. **ImageKit billing.** Если выберем «отдельная папка в той же учётке» — demo-загрузки уйдут в общий квота-биллинг. Митигация — local-uploads mode (IMAGEKIT_PUBLIC_KEY="" в `.env.demo`); фото живёт в volume контейнера и сметается вместе с reset'ом.
4. **Latest tag drift.** Demo автоматически тянет latest GHCR-образ → если приедет breaking migration, ночной reset её накатит и БД заведомо в актуальном состоянии. Но если миграция упадёт — backend не поднимется до следующего успешного билда. Решается «вручную» (откат тега в `.env`).
5. **Демо как attack surface.** Через self-signup → ImageKit upload → S3-like квоты можно засрать ImageKit. Митигация — local-uploads mode (см. п.3) или rate-limit на upload endpoint (текущий global `RATE_LIMIT_LIMIT=120` достаточен для песочницы).
6. **CSV import limit.** Текущий лимит на размер CSV-импорта неизвестен. Если он отсутствует — добавляем ENV `CSV_IMPORT_ROW_LIMIT=1000` и проверку в `csv-import.ts` (это маленький отдельный fix). Уточнить во время реализации.

## Rejected alternatives

| Альтернатива | Почему отвергнута |
|--------------|-------------------|
| **Railway + managed Postgres** | $5-15/мес постоянно, российская оплата проблематична, отдельный CI/CD pipeline. Демо-песочница не стоит этих усилий, пока хватает 4feb. |
| **Vercel (frontend) + Railway/Fly (backend)** | Разделяет стек на 2 платформы — больше сложности, не меньше. Vercel не подходит для нашего NestJS backend. |
| **Отдельный дешёвый VPS** | Дублирует операционную нагрузку (обновления ОС, мониторинг). Преимущества полной изоляции не оправдывают накладные расходы, пока demo-нагрузка минимальна. |
| **Путь `/demo` на `culturedb.elcity.ru`** | Требует Next.js `basePath` rebuild → отдельный demo-образ; cookie-namespace в auth/AdminJS; правки в API-роутинге. +2-3 дня работы и регрессионный риск в auth (risk-zone по CLAUDE.md). Без преимуществ перед бесплатным сабдоменом. |
| **Свой `.ru` домен** | Стоит денег и требует регистрации; для песочницы DuckDNS подходит идеально. Можно мигрировать позже без правок кода. |
| **GitHub Actions cron для reset'а** | Зависимость от внешнего сервиса. systemd на хосте проще и не требует SSH-ключей в Actions. |

## Refs

- Prod compose: `docker-compose.prod.yml`
- Prod deploy script: `scripts/deploy-prod.sh`
- Текущий seed: `backend/prisma/seed.ts`
- CI/CD pipeline spec: `docs/superpowers/specs/2026-05-04-automated-cicd-design.md`
- Project guide: `CLAUDE.md` (root)
- Risk zones для Codex review: см. `CLAUDE.md` §«Codex policy»
