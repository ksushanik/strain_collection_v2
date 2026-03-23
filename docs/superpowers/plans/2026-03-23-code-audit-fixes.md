# Code Audit Fixes — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all critical and important issues found during the 5-agent code audit (security, backend architecture, frontend quality, infrastructure, DB schema).

**Architecture:** Fixes are organized into 4 sprints by priority and dependency. Each sprint has independent tasks that can run in parallel sessions. Every task ends with a verification step (tests + build) to catch regressions.

**Tech Stack:** NestJS 10 + Prisma 6 (backend), Next.js 16 + React 19 (frontend), PostgreSQL 16, Docker Compose, Nginx

**Existing tests:** Backend has 21 Jest tests (11 spec files), 1 failing (`auth.service.spec.ts`). Frontend uses Vitest (no test files yet) + Playwright for e2e.

**Verification command (backend):** `cd backend && npm test -- --passWithNoTests`
**Verification command (frontend):** `cd frontend && npx next build`

---

## Sprint 1: Security Hotfixes (CRITICAL — do first)

> These issues affect production security RIGHT NOW. Must be done sequentially on the same branch, deployed immediately after.

### Task 1.1: Fix SSO nonce generation + remove @Public bypass

**Files:**
- Modify: `backend/src/admin/admin.sso.controller.ts`
- Test: `backend/src/admin/admin.sso.controller.spec.ts` (create)

- [ ] **Step 1: Replace `Math.random()` nonce with `crypto.randomBytes`**

In `admin.sso.controller.ts`, line 62, replace:
```ts
const nonce = Math.random().toString(36).slice(2) + Date.now().toString(36);
```
with:
```ts
import { randomBytes } from 'crypto';
// ...
const nonce = randomBytes(32).toString('hex');
```

- [ ] **Step 2: Remove `@Public()` from `ssoComplete` endpoint**

In `admin.sso.controller.ts`, line 73, remove the `@Public()` decorator from `ssoComplete`. This ensures JWT auth is checked before the nonce exchange completes.

- [ ] **Step 3: Run backend tests to verify no regression**

Run: `cd backend && npm test -- --passWithNoTests`
Expected: 20 passed, 1 failed (pre-existing auth.service.spec failure)

- [ ] **Step 4: Commit**

```bash
git add backend/src/admin/admin.sso.controller.ts
git commit -m "fix(security): use crypto.randomBytes for SSO nonce, remove @Public from ssoComplete"
```

---

### Task 1.2: Close exposed database ports in Docker Compose

**Files:**
- Modify: `docker-compose.yml`

- [ ] **Step 1: Bind PostgreSQL and Redis to localhost only**

In `docker-compose.yml`, change:
```yaml
# postgres
ports:
  - "5432:5432"
# redis
ports:
  - "6379:6379"
```
to:
```yaml
# postgres
ports:
  - "127.0.0.1:5432:5432"
# redis
ports:
  - "127.0.0.1:6379:6379"
```

- [ ] **Step 2: Add Redis password**

In `docker-compose.yml`, redis service, change command to:
```yaml
command: [ "redis-server", "--save", "60", "1", "--loglevel", "warning", "--requirepass", "${REDIS_PASSWORD:-changeme}" ]
```

Update backend environment `REDIS_URL` to include password:
```yaml
REDIS_URL: "redis://:${REDIS_PASSWORD:-changeme}@redis:6379/0"
```

- [ ] **Step 3: Add `restart: unless-stopped` to nginx service**

- [ ] **Step 4: Verify docker-compose config is valid**

Run: `docker compose -f docker-compose.yml config > /dev/null`

- [ ] **Step 5: Commit**

```bash
git add docker-compose.yml
git commit -m "fix(security): bind DB/Redis to localhost, add Redis password, nginx restart policy"
```

---

### Task 1.3: Add file upload magic-byte validation

**Files:**
- Modify: `backend/src/strains/strains.controller.ts`
- Modify: `backend/src/samples/samples.controller.ts`
- Modify: `backend/src/services/imagekit.service.ts`
- Modify: `backend/package.json` (add `file-type` dependency)

- [ ] **Step 1: Install `file-type` package**

Run: `cd backend && npm install file-type`

- [ ] **Step 2: Add magic-byte validation helper**

Create a shared validation function in `backend/src/common/validate-image.ts`:
```ts
import { fileTypeFromBuffer } from 'file-type';

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg', 'image/png', 'image/gif', 'image/webp'
]);

export async function validateImageBuffer(buffer: Buffer): Promise<boolean> {
  const result = await fileTypeFromBuffer(buffer);
  return !!result && ALLOWED_MIME_TYPES.has(result.mime);
}

export function safeExtensionFromMime(mime: string): string {
  const map: Record<string, string> = {
    'image/jpeg': '.jpg', 'image/png': '.png',
    'image/gif': '.gif', 'image/webp': '.webp',
  };
  return map[mime] || '.bin';
}
```

- [ ] **Step 3: Use validation in both controllers' upload endpoints**

In both `strains.controller.ts` (photo upload) and `samples.controller.ts` (photo upload), after receiving the file, add:
```ts
import { validateImageBuffer } from '../common/validate-image';

// Inside the upload handler, before passing to service:
const isValid = await validateImageBuffer(file.buffer);
if (!isValid) {
  throw new BadRequestException('Invalid image file');
}
```

- [ ] **Step 4: Fix extension derivation in `imagekit.service.ts`**

In `imagekit.service.ts` line 66, derive extension from validated MIME type instead of client filename. Pass the detected MIME from the controller.

- [ ] **Step 5: Run backend tests**

Run: `cd backend && npm test -- --passWithNoTests`

- [ ] **Step 6: Commit**

```bash
git add backend/
git commit -m "fix(security): validate uploaded files by magic bytes, derive extension from MIME"
```

---

### Task 1.4: Protect taxonomy endpoint + tighten rate limits

**Files:**
- Modify: `backend/src/taxonomy/taxonomy.controller.ts`
- Modify: `backend/src/auth/auth.controller.ts`

- [ ] **Step 1: Add `JwtAuthGuard` to taxonomy controller**

```ts
@UseGuards(JwtAuthGuard)
@Controller('api/v1/taxonomy')
export class TaxonomyController { ... }
```

- [ ] **Step 2: Add tighter throttle on login/register**

In `auth.controller.ts`, add per-route throttle decorator:
```ts
import { Throttle } from '@nestjs/throttler';

@Throttle({ default: { limit: 5, ttl: 60000 } })
@Post('login')
async login(...) { ... }

@Throttle({ default: { limit: 5, ttl: 60000 } })
@Post('register')
async register(...) { ... }
```

- [ ] **Step 3: Disable Swagger in production**

In `backend/src/main.ts`, wrap Swagger setup:
```ts
if (process.env.NODE_ENV !== 'production') {
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
}
```

- [ ] **Step 4: Run backend tests**

- [ ] **Step 5: Commit**

```bash
git add backend/src/
git commit -m "fix(security): protect taxonomy endpoint, tighten auth rate limits, hide Swagger in prod"
```

---

### Task 1.5: Deploy Sprint 1 to production

- [ ] **Step 1: Run full backend test suite**
- [ ] **Step 2: Build frontend to verify no breakage**
- [ ] **Step 3: Deploy**

```bash
make push-all
# SSH deploy
ssh 4feb "cd /home/user/bio_collection && docker compose pull && docker compose up -d"
```

- [ ] **Step 4: Smoke-test production** — verify login, strain list, sample list, admin panel

---

## Sprint 2: Database & Backend Integrity (can parallelize 2.A and 2.B)

> These fix data integrity bugs and performance issues. Two parallel tracks:
> **Track A** = DB schema/migrations (modifies `schema.prisma` + creates migration)
> **Track B** = Backend service logic (modifies `.service.ts` files only)

### Track A: Schema Fixes

### Task 2.A.1: Add cascade deletes and missing indexes

**Files:**
- Modify: `backend/prisma/schema.prisma`
- Create: new Prisma migration

- [ ] **Step 1: Add `onDelete: Cascade` to Sample's children**

In `schema.prisma`, on the `Strain` model's `sample` relation:
```prisma
sample Sample @relation(fields: [sampleId], references: [id], onDelete: Cascade)
```

Same for `SamplePhoto`:
```prisma
sample Sample @relation(fields: [sampleId], references: [id], onDelete: Cascade)
```

- [ ] **Step 2: Add `onDelete: Cascade` for Strain's children**

For `StrainStorage`, `StrainMedia`, `StrainPhoto`, `StrainPhenotype`, `StrainGenetics` — add `onDelete: Cascade` on their `strain` relation.

- [ ] **Step 3: Add missing indexes**

```prisma
// In model Strain
@@index([sampleId])
@@index([isolationRegion])
@@index([status])
@@index([createdAt])

// In model StrainPhenotype
@@index([strainId])
@@index([traitDefinitionId])

// In model Sample
@@index([collectedAt])
@@index([sampleTypeId])
```

- [ ] **Step 4: Add unique constraint for phenotypes**

```prisma
// In model StrainPhenotype
@@unique([strainId, traitDefinitionId])
```

Note: before applying migration, check for existing duplicate rows:
```sql
SELECT "strain_id", "trait_definition_id", COUNT(*)
FROM strain_phenotypes
WHERE trait_definition_id IS NOT NULL
GROUP BY "strain_id", "trait_definition_id"
HAVING COUNT(*) > 1;
```

- [ ] **Step 5: Generate and review migration**

Run: `cd backend && npx prisma migrate dev --name add-cascades-indexes`
Review the generated SQL before applying.

- [ ] **Step 6: Run backend tests**

- [ ] **Step 7: Commit**

```bash
git add backend/prisma/
git commit -m "fix(db): add cascade deletes, indexes on filtered columns, unique phenotype constraint"
```

---

### Track B: Service Logic Fixes (parallel with Track A)

### Task 2.B.1: Fix `getSampleTypes` write-on-read

**Files:**
- Modify: `backend/src/samples/samples.service.ts`

- [ ] **Step 1: Move seed logic out of `getSampleTypes()`**

Move the upsert logic from `getSampleTypes()` to an `onModuleInit()` method. Replace `getSampleTypes()` body with a plain `findMany()`.

- [ ] **Step 2: Run tests**

Run: `cd backend && npm test -- samples.service.spec`

- [ ] **Step 3: Commit**

```bash
git commit -m "fix: move sample type seeding to onModuleInit, make getSampleTypes read-only"
```

---

### Task 2.B.2: Fix deallocateStrain race condition

**Files:**
- Modify: `backend/src/storage/storage.service.ts`

- [ ] **Step 1: Wrap deallocateStrain in `$transaction`**

Wrap the cell update + strainStorage delete in a single `this.prisma.$transaction(async (tx) => { ... })`, matching the pattern already used in `allocateStrain`.

- [ ] **Step 2: Fix bulkAllocate to use single transaction**

Refactor the for-loop in `bulkAllocate` to batch all allocations inside one `$transaction`.

- [ ] **Step 3: Run tests**

Run: `cd backend && npm test -- storage.service.spec`

- [ ] **Step 4: Commit**

```bash
git commit -m "fix: wrap deallocateStrain in transaction, batch bulkAllocate"
```

---

### Task 2.B.3: Fix taxonomy+search filter logic

**Files:**
- Modify: `backend/src/strains/strains.service.ts`

- [ ] **Step 1: Separate taxonomy and search into AND conditions**

In `findAll()`, instead of merging taxonomy and search into a single `where.OR`, push each as a separate entry in the `andFilters` array:

```ts
if (taxonomy) {
  andFilters.push({
    OR: [
      { taxonomy16s: { contains: taxonomy, mode: 'insensitive' } },
      { ncbiScientificName: { contains: taxonomy, mode: 'insensitive' } },
    ],
  });
}
if (search) {
  andFilters.push({
    OR: [
      { identifier: { contains: search, mode: 'insensitive' } },
      { features: { contains: search, mode: 'insensitive' } },
      { comments: { contains: search, mode: 'insensitive' } },
      { ncbiScientificName: { contains: search, mode: 'insensitive' } },
      { taxonomy16s: { contains: search, mode: 'insensitive' } },
    ],
  });
}
```

- [ ] **Step 2: Run tests**

Run: `cd backend && npm test -- strains.service.spec`

- [ ] **Step 3: Commit**

```bash
git commit -m "fix: taxonomy and search filters now combine with AND instead of OR"
```

---

### Task 2.B.4: Fix @ts-ignore and wrong exception types

**Files:**
- Modify: `backend/src/methods/traits.service.ts`

- [ ] **Step 1: Regenerate Prisma client**

Run: `cd backend && npx prisma generate`

- [ ] **Step 2: Remove all `@ts-ignore` comments** from `traits.service.ts`

- [ ] **Step 3: Replace `NotFoundException` with `BadRequestException`** for business-rule violations (lines 46-51, 63)

- [ ] **Step 4: Add `implements OnModuleInit`** to the class declaration

- [ ] **Step 5: Run tests**

Run: `cd backend && npm test -- traits`

- [ ] **Step 6: Commit**

```bash
git commit -m "fix: remove @ts-ignore, correct exception types in TraitsService"
```

---

### Task 2.B.5: Deploy Sprint 2

- [ ] **Step 1: Merge Track A and Track B if on separate branches**
- [ ] **Step 2: Run full test suite**: `cd backend && npm test -- --passWithNoTests`
- [ ] **Step 3: Build frontend**: `cd frontend && npx next build`
- [ ] **Step 4: Deploy and run migration on prod**:

```bash
make push-all
ssh 4feb "cd /home/user/bio_collection && docker compose pull && docker compose up -d"
make migrate-prod
```

- [ ] **Step 5: Create backup before and after migration**

```bash
make backup-prod  # before
# ... deploy ...
make backup-prod  # after
```

---

## Sprint 3: Infrastructure Hardening (can parallelize 3.A and 3.B)

> **Track A** = Docker/Nginx (infra files)
> **Track B** = Frontend fixes (React components)

### Track A: Infrastructure

### Task 3.A.1: Add Docker health checks

**Files:**
- Modify: `docker-compose.yml`

- [ ] **Step 1: Add healthcheck to postgres**

```yaml
postgres:
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U postgres -d strain_collection_v2"]
    interval: 10s
    timeout: 5s
    retries: 5
```

- [ ] **Step 2: Add healthcheck to redis**

```yaml
redis:
  healthcheck:
    test: ["CMD-SHELL", "redis-cli -a ${REDIS_PASSWORD:-changeme} ping | grep PONG"]
    interval: 10s
    timeout: 5s
    retries: 5
```

- [ ] **Step 3: Update backend `depends_on` with conditions**

```yaml
backend:
  depends_on:
    postgres:
      condition: service_healthy
    redis:
      condition: service_healthy
```

- [ ] **Step 4: Validate**: `docker compose config > /dev/null`

- [ ] **Step 5: Commit**

```bash
git commit -m "fix(infra): add Docker health checks, backend waits for healthy dependencies"
```

---

### Task 3.A.2: Add Nginx security headers

**Files:**
- Modify: `nginx.conf`

- [ ] **Step 1: Add security headers inside the `server` block**

```nginx
# Security headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
```

- [ ] **Step 2: Add rate limiting for auth endpoints**

```nginx
# At http level:
limit_req_zone $binary_remote_addr zone=auth:10m rate=5r/m;

# Inside server block, add location for auth:
location /api/v1/auth/ {
    limit_req zone=auth burst=3 nodelay;
    proxy_pass http://backend;
    # ... existing proxy headers ...
}
```

- [ ] **Step 3: Commit**

```bash
git commit -m "fix(infra): add Nginx security headers and auth rate limiting"
```

---

### Task 3.A.3: Fix `clean-prod` Makefile safety

**Files:**
- Modify: `Makefile`

- [ ] **Step 1: Remove `--volumes` from `clean-prod`**

Change:
```makefile
clean-prod:
	ssh 4feb "docker system prune -af --volumes"
```
to:
```makefile
clean-prod:
	ssh 4feb "docker system prune -af"
```

- [ ] **Step 2: Commit**

```bash
git commit -m "fix(safety): remove --volumes from clean-prod to protect database"
```

---

### Track B: Frontend Critical Fixes (parallel with Track A)

### Task 3.B.1: Localize login page

**Files:**
- Modify: `frontend/src/app/[locale]/login/page.tsx`
- Modify: `frontend/messages/en.json`
- Modify: `frontend/messages/ru.json`

- [ ] **Step 1: Add i18n keys for login page** to both locale files under a `"Login"` section

- [ ] **Step 2: Replace all hardcoded strings** in `login/page.tsx` with `useTranslations('Login')`

- [ ] **Step 3: Build to verify**: `cd frontend && npx next build`

- [ ] **Step 4: Commit**

```bash
git commit -m "fix(i18n): localize login page"
```

---

### Task 3.B.2: Localize ErrorBoundary

**Files:**
- Modify: `frontend/src/components/error-boundary.tsx`
- Modify: `frontend/messages/en.json`, `frontend/messages/ru.json`

- [ ] **Step 1: Create a wrapper function component** that reads translations and passes them as props to the class-based ErrorBoundary

- [ ] **Step 2: Add i18n keys** under `"Errors"` section

- [ ] **Step 3: Build to verify**

- [ ] **Step 4: Commit**

```bash
git commit -m "fix(i18n): localize ErrorBoundary via wrapper component"
```

---

### Task 3.B.3: Fix SampleAutocomplete re-render loop

**Files:**
- Modify: `frontend/src/components/domain/sample-autocomplete.tsx`

- [ ] **Step 1: Remove `selectedSample` from useEffect dependency array** (line 74)

Replace the effect with:
```ts
React.useEffect(() => {
    if (!value) { setSelectedSample(undefined); return; }
    if (initialSample && initialSample.id.toString() === value) {
        setSelectedSample(initialSample); return;
    }
    ApiService.getSample(parseInt(value)).then(setSelectedSample).catch(console.error);
}, [value, initialSample])
```

- [ ] **Step 2: Build to verify**

- [ ] **Step 3: Commit**

```bash
git commit -m "fix: remove selectedSample from useEffect deps to prevent re-render loop"
```

---

### Task 3.B.4: Fix AuthGuard — redirect unauthenticated users

**Files:**
- Modify: `frontend/src/components/AuthGuard.tsx`

- [ ] **Step 1: Add redirect for unauthenticated users** on protected pages

```ts
if (!isLoading && !isAuthenticated && !isLoginPage) {
    router.replace(`/login`);
    return null;
}
```

- [ ] **Step 2: Build to verify**

- [ ] **Step 3: Commit**

```bash
git commit -m "fix(auth): redirect unauthenticated users to login page"
```

---

### Task 3.B.5: Replace deprecated `onLoadingComplete`

**Files:**
- Modify: `frontend/src/components/domain/photo-upload.tsx`

- [ ] **Step 1: Replace `onLoadingComplete` with `onLoad`** (lines 322, 397)

- [ ] **Step 2: Build to verify**

- [ ] **Step 3: Commit**

```bash
git commit -m "fix: replace deprecated onLoadingComplete with onLoad in photo-upload"
```

---

### Task 3.B.6: Deploy Sprint 3

- [ ] **Step 1: Full backend tests + frontend build**
- [ ] **Step 2: Deploy**
- [ ] **Step 3: Smoke-test: login flow, strain CRUD, sample CRUD, admin panel**

---

## Sprint 4: Polish & Hardening (all tasks independent, can parallelize)

> Lower priority fixes. Each task is fully independent.

### Task 4.1: Localize remaining components

**Files to fix (all under `frontend/src/components/domain/`):**
- `taxonomy-autocomplete.tsx` — hardcoded English
- `sample-autocomplete.tsx` — hardcoded English
- `storage-view.tsx` — "Grid:" label
- `trait-select.tsx` — "Select trait...", "Search traits...", "No traits found."
- `sample-form.tsx` + `strain-form.tsx` — Zod validation messages
- `settings/page.tsx` — "Saved", "Save failed", etc.
- `hooks/use-api-error.ts` — Russian fallback string

- [ ] **Step 1: Add all missing i18n keys** to en.json and ru.json
- [ ] **Step 2: Replace hardcoded strings** with `useTranslations` in each file
- [ ] **Step 3: Build to verify**
- [ ] **Step 4: Commit**

---

### Task 4.2: Add photo lightbox accessibility

**Files:**
- Modify: `frontend/src/components/domain/photo-upload.tsx`

- [ ] **Step 1: Replace plain `<div>` lightbox** with Radix `Dialog` (already in project deps)
- [ ] **Step 2: Add `aria-label` to navigation buttons**
- [ ] **Step 3: Build to verify**
- [ ] **Step 4: Commit**

---

### Task 4.3: Replace StorageView strain select with autocomplete

**Files:**
- Modify: `frontend/src/components/domain/storage-view.tsx`

- [ ] **Step 1: Replace `limit: 500` getStrains call** with a search-backed autocomplete pattern (similar to `SampleAutocomplete`)
- [ ] **Step 2: Build to verify**
- [ ] **Step 3: Commit**

---

### Task 4.4: Copy Leaflet icons to public/

**Files:**
- Create: `frontend/public/leaflet/marker-icon.png`, `marker-icon-2x.png`, `marker-shadow.png`
- Modify: `frontend/src/components/domain/sample-map.tsx`

- [ ] **Step 1: Copy icons** from `node_modules/leaflet/dist/images/` to `public/leaflet/`
- [ ] **Step 2: Update icon URLs** in `sample-map.tsx` to use `/leaflet/...`
- [ ] **Step 3: Build to verify**
- [ ] **Step 4: Commit**

---

### Task 4.5: Add ImageKit module (fix duplicate instances)

**Files:**
- Create: `backend/src/services/imagekit.module.ts`
- Modify: `backend/src/strains/strains.module.ts`
- Modify: `backend/src/samples/samples.module.ts`

- [ ] **Step 1: Create `ImageKitModule`** that provides and exports `ImageKitService`
- [ ] **Step 2: Import `ImageKitModule`** in both strains and samples modules instead of registering the provider directly
- [ ] **Step 3: Run backend tests**
- [ ] **Step 4: Commit**

---

### Task 4.6: Add audit log pagination

**Files:**
- Modify: `backend/src/audit/audit-log.service.ts`
- Modify: `backend/src/audit/audit-log.controller.ts`

- [ ] **Step 1: Add `page` and `limit` params** to `findAll`, return `{ data, meta }` consistent with other endpoints
- [ ] **Step 2: Run backend tests**
- [ ] **Step 3: Commit**

---

### Task 4.7: Fix pre-existing auth.service.spec test failure

**Files:**
- Modify: `backend/src/auth/auth.service.spec.ts`

- [ ] **Step 1: Investigate and fix** the existing test failure
- [ ] **Step 2: Run**: `cd backend && npm test -- auth.service.spec`
- [ ] **Step 3: Commit**

---

## Dependency Map

```
Sprint 1 (security) ──────────────────────────> Deploy
    |
    v
Sprint 2 ─┬─ Track A (schema/migrations) ─┬─> Deploy
           └─ Track B (service logic)  ────┘
    |
    v
Sprint 3 ─┬─ Track A (infra/nginx) ───────┬─> Deploy
           └─ Track B (frontend fixes) ────┘
    |
    v
Sprint 4 (all independent) ──────────────────> Deploy
  Task 4.1 (i18n)
  Task 4.2 (a11y)
  Task 4.3 (storage autocomplete)
  Task 4.4 (leaflet icons)
  Task 4.5 (imagekit module)
  Task 4.6 (audit pagination)
  Task 4.7 (fix test)
```

## Parallelization Summary

| Sprint | Parallelizable? | Sessions needed |
|--------|----------------|-----------------|
| Sprint 1 | **Sequential** — security fixes must be deployed together | 1 session |
| Sprint 2 | **2 parallel tracks**: Track A (schema) + Track B (services) | 2 sessions |
| Sprint 3 | **2 parallel tracks**: Track A (infra) + Track B (frontend) | 2 sessions |
| Sprint 4 | **All 7 tasks independent** — max parallelism | Up to 7 sessions |

## Regression Checklist (after every task)

1. `cd backend && npm test -- --passWithNoTests` — all existing tests pass
2. `cd frontend && npx next build` — no TypeScript/build errors
3. After deploy: manual smoke-test (login, create strain, view samples, admin panel)
