# Automated CI/CD Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace manual `make push-all` + manual SSH deploy with `build.yml` (auto on push to main) + `deploy.yml` (workflow_dispatch button), images on GHCR with `:latest + :<sha>` for rollback.

**Architecture:** Two new GitHub Actions workflows. Server-side stack moves from `/home/user/bio_collection` (managed by `user`) to `/home/deploy/bio_collection` (managed by new `deploy` user with no sudo). Production compose committed as `docker-compose.prod.yml`, parameterized with `${IMAGE_TAG}`. Migration is parallel-path: new stack runs alongside old until manual nginx cutover.

**Tech Stack:** GitHub Actions (build-push-action@v5, ssh-agent@v0.9), GHCR (`ghcr.io/ksushanik`), bash, Docker Compose v2. Source spec: [docs/superpowers/specs/2026-05-04-automated-cicd-design.md](../specs/2026-05-04-automated-cicd-design.md).

**User environment:** Windows 11, PowerShell. SSH alias `4feb` resolves to production host. `gh` CLI active account is `ksushanik`.

**Branching:** All changes land on a NEW branch `feat/automated-cicd`, opened against `main` as a separate PR from feat/rbac-rollout. Per spec § Decision 7, RBAC will be the first real workload through this pipeline.

---

## Phase A — Server-side preparation (one-time, manual coordination)

These tasks change production server state. They are reversible (delete user/dirs) but visible. The user's PAT is never exposed to Claude.

### Task A1: Create `feat/automated-cicd` branch from main

**Files:** none (git operation)

- [ ] **Step 1: Verify main is up to date**

```powershell
git fetch origin
git status
```

Expected: branch info shown, no error.

- [ ] **Step 2: Create branch from main**

```powershell
git checkout -b feat/automated-cicd origin/main
```

Expected: `Switched to a new branch 'feat/automated-cicd'`

- [ ] **Step 3: Confirm branch position**

```powershell
git log --oneline -3
```

Expected: top commit matches `origin/main` HEAD.

---

### Task A2: Create `deploy` user on server

**Files:** server-side (`/etc/passwd`, `/home/deploy/`)

- [ ] **Step 1: SSH and create user**

```powershell
ssh 4feb "sudo useradd -m -s /bin/bash -G docker deploy && sudo passwd -l deploy && id deploy"
```

Expected: `uid=NNNN(deploy) gid=NNNN(deploy) groups=NNNN(deploy),NNN(docker)`. The `passwd -l` locks password login (key-only).

If `useradd` says "user exists" — skip; if it says no `docker` group — create one first via `sudo groupadd docker` and re-run.

- [ ] **Step 2: Verify deploy user can talk to docker**

```powershell
ssh 4feb "sudo -u deploy docker ps"
```

Expected: empty container list (no error). If "permission denied" — group membership not effective; user needs to log out and back in, or run `newgrp docker`.

---

### Task A3: Create directory layout under `/home/deploy/bio_collection`

**Files:** server-side filesystem

- [ ] **Step 1: Create directories**

```powershell
ssh 4feb "sudo -u deploy mkdir -p /home/deploy/bio_collection/{backend/.adminjs,frontend,scripts}"
```

Expected: no output (mkdir silent).

- [ ] **Step 2: Verify ownership and structure**

```powershell
ssh 4feb "ls -la /home/deploy/bio_collection/"
```

Expected: directories `backend/`, `frontend/`, `scripts/` owned by `deploy:deploy`.

---

### Task A4: Copy `.env` files from old location to new

**Files:** server-side `/home/deploy/bio_collection/{backend,frontend}/.env`

- [ ] **Step 1: Copy backend env**

```powershell
ssh 4feb "sudo cp /home/user/bio_collection/backend/.env /home/deploy/bio_collection/backend/.env && sudo chown deploy:deploy /home/deploy/bio_collection/backend/.env && sudo chmod 600 /home/deploy/bio_collection/backend/.env"
```

Expected: no output.

- [ ] **Step 2: Copy frontend env**

```powershell
ssh 4feb "sudo cp /home/user/bio_collection/frontend/.env /home/deploy/bio_collection/frontend/.env && sudo chown deploy:deploy /home/deploy/bio_collection/frontend/.env && sudo chmod 600 /home/deploy/bio_collection/frontend/.env"
```

Expected: no output.

- [ ] **Step 3: Sanity-check both files exist and are readable by `deploy`**

```powershell
ssh 4feb "sudo -u deploy ls -la /home/deploy/bio_collection/backend/.env /home/deploy/bio_collection/frontend/.env"
```

Expected: both files listed with `-rw------- deploy deploy`.

---

### Task A5: Generate dedicated SSH keypair for CI deploy

**Files:** local `~/.ssh/deploy_ed25519` and `.pub`

- [ ] **Step 1: Generate ed25519 key with no passphrase**

```powershell
ssh-keygen -t ed25519 -C "github-actions-deploy@strain-collection-v2" -f $env:USERPROFILE\.ssh\deploy_ed25519 -N '""'
```

Expected: two files created. (PowerShell quoting: `-N '""'` passes an empty passphrase. If that fails, try `-N """"`. `ssh-keygen` outputs `Your identification has been saved` etc.)

- [ ] **Step 2: Print the public key for transfer**

```powershell
Get-Content $env:USERPROFILE\.ssh\deploy_ed25519.pub
```

Expected: one line `ssh-ed25519 AAAA... github-actions-deploy@strain-collection-v2`

- [ ] **Step 3: Install public key on server**

```powershell
$pub = Get-Content $env:USERPROFILE\.ssh\deploy_ed25519.pub -Raw
ssh 4feb "sudo -u deploy mkdir -p /home/deploy/.ssh && sudo -u deploy chmod 700 /home/deploy/.ssh && echo '$pub' | sudo -u deploy tee -a /home/deploy/.ssh/authorized_keys >/dev/null && sudo -u deploy chmod 600 /home/deploy/.ssh/authorized_keys"
```

Expected: no output.

- [ ] **Step 4: Verify SSH-as-deploy works with new key**

```powershell
ssh -i $env:USERPROFILE\.ssh\deploy_ed25519 -o IdentitiesOnly=yes deploy@<DEPLOY_SSH_HOST> "echo deploy-ssh-ok && id"
```

Replace `<DEPLOY_SSH_HOST>` with the real hostname behind the `4feb` alias (look it up: `ssh -G 4feb | findstr -i hostname`).

Expected: `deploy-ssh-ok` followed by `uid=NNNN(deploy) ...`.

---

### Task A6: Capture `known_hosts` entry for the deploy host

**Files:** local file `deploy_known_hosts.txt` (gitignored, used only for secret upload)

- [ ] **Step 1: Generate known_hosts entry**

```powershell
$host_real = (ssh -G 4feb | Select-String '^hostname ').ToString().Split(' ')[1]
ssh-keyscan -H $host_real 2>$null | Out-File -FilePath deploy_known_hosts.txt -Encoding ascii
Get-Content deploy_known_hosts.txt
```

Expected: 1-3 lines starting with `|1|...` (hashed host entries, one per algorithm).

- [ ] **Step 2: Add `deploy_known_hosts.txt` to `.gitignore` so it never lands in git**

Edit `.gitignore` and append:

```
deploy_known_hosts.txt
deploy_ed25519
deploy_ed25519.pub
```

Verify it's ignored:

```powershell
git check-ignore -v deploy_known_hosts.txt
```

Expected: `.gitignore:NN:deploy_known_hosts.txt deploy_known_hosts.txt`.

---

### Task A7: User adds GH Actions secrets (manual UI step)

**Files:** github.com → Settings → Secrets and variables → Actions on `ksushanik/strain_collection_v2`

This task is performed by the user. Claude provides the four exact values to paste.

- [ ] **Step 1: Open the secrets settings page**

User navigates to: `https://github.com/ksushanik/strain_collection_v2/settings/secrets/actions`

- [ ] **Step 2: Add `DEPLOY_SSH_KEY`**

Click "New repository secret". Name: `DEPLOY_SSH_KEY`. Value:

```powershell
Get-Content $env:USERPROFILE\.ssh\deploy_ed25519 -Raw
```

(Paste the entire output including `-----BEGIN OPENSSH PRIVATE KEY-----` and trailing newline.)

- [ ] **Step 3: Add `DEPLOY_SSH_HOST`**

Name: `DEPLOY_SSH_HOST`. Value: the real hostname from `(ssh -G 4feb | Select-String '^hostname ').ToString().Split(' ')[1]`.

- [ ] **Step 4: Add `DEPLOY_SSH_USER`**

Name: `DEPLOY_SSH_USER`. Value: `deploy`

- [ ] **Step 5: Add `DEPLOY_SSH_KNOWN_HOSTS`**

Name: `DEPLOY_SSH_KNOWN_HOSTS`. Value:

```powershell
Get-Content deploy_known_hosts.txt -Raw
```

- [ ] **Step 6: Verify all four secrets are listed**

User confirms 4 secrets visible (values themselves are masked):
- `DEPLOY_SSH_KEY`
- `DEPLOY_SSH_HOST`
- `DEPLOY_SSH_USER`
- `DEPLOY_SSH_KNOWN_HOSTS`

---

### Task A8: User logs into GHCR on the server (manual)

**Files:** server-side `~/.docker/config.json` for `deploy` user

This task requires a Personal Access Token (classic, scope `read:packages`) which user generates at github.com/settings/tokens. Claude does NOT see the PAT.

- [ ] **Step 1: User generates GHCR-scoped PAT**

User goes to https://github.com/settings/tokens/new:
- Note: `strain-collection-v2 server GHCR pull`
- Expiration: 90 days (or per user policy)
- Scope: `read:packages` ONLY
- Click "Generate token", copy value

- [ ] **Step 2: User logs into GHCR on server as `deploy`**

```bash
ssh 4feb "sudo -u deploy bash -c 'echo <PAT> | docker login ghcr.io -u ksushanik --password-stdin'"
```

(User runs this from their local terminal with PAT inline. PAT is wiped from shell history after.)

Expected: `Login Succeeded`

- [ ] **Step 3: Verify creds cached**

```powershell
ssh 4feb "sudo -u deploy cat /home/deploy/.docker/config.json"
```

Expected: JSON with `"auths": { "ghcr.io": { "auth": "<base64>" } }`. The base64 is the credential — protect this file.

---

## Phase B — Repo artifacts (committed; tested locally where possible)

### Task B1: Add `docker-compose.prod.yml` to repo

**Files:**
- Create: `docker-compose.prod.yml`

- [ ] **Step 1: Write the file**

```yaml
# Production compose for the bio_collection stack on 4feb (user: deploy).
# Single source of truth — committed instead of drifting on the server.
# Image tag and registry are interpolated from .env written by deploy.yml.

services:
  postgres:
    image: postgres:16-alpine
    container_name: strain_v2_db
    restart: unless-stopped
    environment:
      POSTGRES_DB: strain_collection_v2
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres_v2_data:/var/lib/postgresql/data
    networks: [strain_v2]

  redis:
    image: redis:7-alpine
    container_name: strain_v2_redis
    restart: unless-stopped
    networks: [strain_v2]

  backend:
    image: ${IMAGE_REGISTRY:-ghcr.io/ksushanik}/strain-collection-v2-backend:${IMAGE_TAG:-latest}
    container_name: strain_v2_backend
    restart: unless-stopped
    depends_on: [postgres, redis]
    env_file: ./backend/.env
    command: sh -c "npx prisma migrate deploy && node dist/src/main.js"
    networks: [strain_v2]
    ports: ["3010:3000"]

  frontend:
    image: ${IMAGE_REGISTRY:-ghcr.io/ksushanik}/strain-collection-v2-frontend:${IMAGE_TAG:-latest}
    container_name: strain_v2_frontend
    restart: unless-stopped
    env_file: ./frontend/.env
    networks: [strain_v2]
    ports: ["8082:3001"]

volumes:
  postgres_v2_data:

networks:
  strain_v2:
    driver: bridge
```

- [ ] **Step 2: Verify YAML parses and image interpolation works**

```powershell
node -e "const y=require('js-yaml'); const fs=require('fs'); const d=y.load(fs.readFileSync('docker-compose.prod.yml','utf8')); console.log(d.services.backend.image); console.log(d.services.frontend.image);"
```

Expected: literal strings `${IMAGE_REGISTRY:-ghcr.io/ksushanik}/strain-collection-v2-backend:${IMAGE_TAG:-latest}` (interpolation happens at compose runtime, not parse time).

- [ ] **Step 3: Validate with docker compose locally**

```powershell
docker compose -f docker-compose.prod.yml config --quiet
```

Expected: no output (config valid). If you see `WARN[0000] The "IMAGE_TAG" variable is not set` — that's expected on local; the variable comes from server `.env`.

- [ ] **Step 4: Add `.gitattributes` entry for the new file (LF endings)**

Edit `.gitattributes`. Add line:

```
docker-compose.prod.yml text eol=lf
```

Verify:

```powershell
Get-Content .gitattributes
```

Expected: line is present.

- [ ] **Step 5: Commit**

```powershell
git add docker-compose.prod.yml .gitattributes
git commit -m "feat(deploy): add docker-compose.prod.yml for parameterized production stack"
```

---

### Task B2: Update `scripts/deploy-prod.sh` for env-driven config

**Files:**
- Modify: `scripts/deploy-prod.sh`

- [ ] **Step 1: Update `PROJECT_DIR` line and add `.env` sourcing**

Replace the top of the script (lines 14-19 of the current version) with:

```bash
set -euo pipefail

PROJECT_DIR="${PROJECT_DIR:-/home/deploy/bio_collection}"
HEALTH_TIMEOUT_SEC="${HEALTH_TIMEOUT_SEC:-90}"
HEALTH_POLL_INTERVAL="${HEALTH_POLL_INTERVAL:-2}"

cd "$PROJECT_DIR"

# Load IMAGE_TAG / IMAGE_REGISTRY (and any other deploy-time vars)
# from .env so docker compose sees them for image: ${...} interpolation.
if [ -f .env ]; then
    set -a
    # shellcheck disable=SC1091
    . ./.env
    set +a
fi
```

- [ ] **Step 2: Verify syntax**

```powershell
bash -n scripts/deploy-prod.sh
echo "exit: $LASTEXITCODE"
```

Expected: `exit: 0`

- [ ] **Step 3: Verify the new env-driven block evaluates correctly**

```powershell
bash -c "PROJECT_DIR=/tmp HEALTH_TIMEOUT_SEC=30 sh -c 'echo P=`$PROJECT_DIR T=`$HEALTH_TIMEOUT_SEC'"
```

(Note: this only smoke-checks the env vars; the full script needs Docker to fully run.)

Expected: `P=/tmp T=30`

- [ ] **Step 4: Commit**

```powershell
git add scripts/deploy-prod.sh
git commit -m "feat(deploy): make deploy-prod.sh env-driven (PROJECT_DIR, HEALTH_TIMEOUT_SEC) and source .env"
```

---

### Task B3: Add `.github/workflows/build.yml`

**Files:**
- Create: `.github/workflows/build.yml`

- [ ] **Step 1: Write the workflow**

```yaml
name: Build & Push Images

on:
  push:
    branches: [main]
  workflow_dispatch:  # allow manual rebuild without a code change

# Don't share concurrency with ci.yml — they're orthogonal.
concurrency:
  group: build-${{ github.ref }}
  cancel-in-progress: true

permissions:
  contents: read
  packages: write

jobs:
  backend:
    runs-on: ubuntu-latest
    timeout-minutes: 25
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3
      - name: Log in to GHCR
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - name: Build and push backend
        uses: docker/build-push-action@v5
        with:
          context: backend
          file: backend/Dockerfile
          push: true
          tags: |
            ghcr.io/ksushanik/strain-collection-v2-backend:latest
            ghcr.io/ksushanik/strain-collection-v2-backend:${{ github.sha }}
          cache-from: type=gha,scope=backend
          cache-to: type=gha,mode=max,scope=backend

  frontend:
    runs-on: ubuntu-latest
    timeout-minutes: 25
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3
      - name: Log in to GHCR
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - name: Build and push frontend
        uses: docker/build-push-action@v5
        with:
          context: .
          file: frontend/Dockerfile
          push: true
          build-args: |
            NEXT_PUBLIC_API_URL=https://culturedb.elcity.ru
          tags: |
            ghcr.io/ksushanik/strain-collection-v2-frontend:latest
            ghcr.io/ksushanik/strain-collection-v2-frontend:${{ github.sha }}
          cache-from: type=gha,scope=frontend
          cache-to: type=gha,mode=max,scope=frontend
```

- [ ] **Step 2: Validate as YAML**

```powershell
node -e "const y=require('js-yaml'); const fs=require('fs'); const d=y.load(fs.readFileSync('.github/workflows/build.yml','utf8')); console.log('jobs:', Object.keys(d.jobs)); console.log('backend tags:', d.jobs.backend.steps[3].with.tags);"
```

Expected: `jobs: [ 'backend', 'frontend' ]` and tags string visible.

- [ ] **Step 3: Commit**

```powershell
git add .github/workflows/build.yml
git commit -m "feat(ci): add build.yml — push GHCR images on every main"
```

---

### Task B4: Add `.github/workflows/deploy.yml`

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Write the workflow**

```yaml
name: Deploy to Production

on:
  workflow_dispatch:
    inputs:
      tag:
        description: 'Image tag to deploy (commit SHA or "latest")'
        required: true
        default: 'latest'

concurrency:
  group: deploy-prod
  cancel-in-progress: false  # never cancel a running deploy

jobs:
  deploy:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    environment: production  # creates a deploy log/audit trail in GH UI
    steps:
      - uses: actions/checkout@v4

      - name: Set up SSH
        uses: webfactory/ssh-agent@v0.9.0
        with:
          ssh-private-key: ${{ secrets.DEPLOY_SSH_KEY }}

      - name: Trust the deploy host
        run: |
          mkdir -p ~/.ssh
          printf '%s\n' "${{ secrets.DEPLOY_SSH_KNOWN_HOSTS }}" >> ~/.ssh/known_hosts
          chmod 600 ~/.ssh/known_hosts

      - name: Sync compose + script to server
        env:
          USER: ${{ secrets.DEPLOY_SSH_USER }}
          HOST: ${{ secrets.DEPLOY_SSH_HOST }}
        run: |
          scp docker-compose.prod.yml "$USER@$HOST:/home/deploy/bio_collection/docker-compose.yml"
          scp scripts/deploy-prod.sh "$USER@$HOST:/home/deploy/bio_collection/scripts/deploy-prod.sh"

      - name: Deploy
        env:
          USER: ${{ secrets.DEPLOY_SSH_USER }}
          HOST: ${{ secrets.DEPLOY_SSH_HOST }}
          TAG: ${{ inputs.tag }}
        run: |
          ssh "$USER@$HOST" "bash -s" <<EOF
          set -euo pipefail
          cd /home/deploy/bio_collection
          printf 'IMAGE_REGISTRY=ghcr.io/ksushanik\nIMAGE_TAG=%s\n' "$TAG" > .env
          chmod +x scripts/deploy-prod.sh
          bash scripts/deploy-prod.sh
          EOF
```

- [ ] **Step 2: Validate as YAML**

```powershell
node -e "const y=require('js-yaml'); const fs=require('fs'); const d=y.load(fs.readFileSync('.github/workflows/deploy.yml','utf8')); console.log('trigger:', Object.keys(d.on)); console.log('inputs:', d.on.workflow_dispatch.inputs);"
```

Expected: `trigger: [ 'workflow_dispatch' ]` and tag input shown with default `latest`.

- [ ] **Step 3: Sanity-check the heredoc — `${TAG}` inside ssh heredoc must be expanded by GH runner, not by remote bash**

Re-read the workflow `Deploy` step. The pattern `<<EOF` (NOT `<<'EOF'`) means GH runner expands `$TAG` before sending to remote — that's what we want. Remote bash sees the literal value `latest` or `<sha>`. Confirm by mental-trace.

- [ ] **Step 4: Commit**

```powershell
git add .github/workflows/deploy.yml
git commit -m "feat(ci): add deploy.yml — workflow_dispatch deploy with tag input"
```

---

### Task B5: Update `Makefile` — switch REGISTRY default to GHCR, mark old targets as escape hatch

**Files:**
- Modify: `Makefile` (lines 1, plus inline comments on push/deploy targets)

- [ ] **Step 1: Change REGISTRY default**

Edit line 1 of `Makefile`:

```makefile
# Default registry. CI publishes to GHCR; local push-all is a fallback.
REGISTRY      ?= ghcr.io/ksushanik
```

(Was: `REGISTRY      ?= gimmyhat`)

- [ ] **Step 2: Mark `push-all` and `deploy-prod` as escape hatches**

Find the `push-all:` line and add a comment block above it:

```makefile
# === ESCAPE HATCH ===
# Normally CI builds and pushes images on every main push.
# Use these only if CI is broken and you must ship from your laptop.
push-all: push-backend push-frontend
```

Find the `deploy-prod:` block (with the script-pipe) and add:

```makefile
# === ESCAPE HATCH ===
# Normally deploy is triggered from GitHub UI: Actions → Deploy → Run workflow.
# Use this only if GitHub Actions is unavailable.
deploy-prod:
	ssh 4feb 'bash -s' < scripts/deploy-prod.sh
```

- [ ] **Step 3: Verify Makefile still parses**

```powershell
make -n push-all deploy-prod
```

Expected: shows the docker build/push commands with `ghcr.io/ksushanik/...` (not `gimmyhat`).

- [ ] **Step 4: Commit**

```powershell
git add Makefile
git commit -m "chore(deploy): switch REGISTRY default to ghcr.io/ksushanik, mark manual targets as escape hatches"
```

---

### Task B6: Update wiki — `playbooks.md` and `changelog.md`

**Files:**
- Modify: `docs/wiki/playbooks.md`
- Modify: `docs/wiki/changelog.md`

- [ ] **Step 1: Replace the deploy section in `playbooks.md`**

Find the "Деплой на прод (Docker/Make)" bullet and replace its sub-bullets with:

```markdown
- **Деплой на прод (CI/CD)**:
  - **Основной путь**: `main` ветка → `build.yml` собирает образы и пушит в `ghcr.io/ksushanik/strain-collection-v2-{backend,frontend}` (теги `:latest` и `:<sha>`). Деплой — кнопкой в GitHub UI: Actions → "Deploy to Production" → Run workflow → выбрать tag (default `latest`).
  - **Rollback**: запустить тот же deploy workflow с tag = `<старый sha>`. Скрипт здоровья откажет deploy, если новый стек не отвечает за 90 секунд.
  - **Escape hatch (CI down)**: `make push-all` (нужен docker login на ghcr.io) → `make deploy-prod-win`. Использовать только если GitHub Actions недоступен.
  - **Очистка диска**: `make clean-prod` оставляет образы новее недели для возможности отката (`--filter "until=168h"`).
```

- [ ] **Step 2: Add changelog entry to `changelog.md`**

At the top of the file (after the `# Changelog` heading), insert a new dated section. If a `## 2026-05-04` entry already exists from the previous CI/CD commit, append the new bullets to it instead of creating a duplicate header.

```markdown
## 2026-05-04 (continued)
- **CI/CD автоматизация**:
  - Новый workflow `.github/workflows/build.yml`: на каждый push в main собирает backend+frontend образы и пушит в GHCR (`ghcr.io/ksushanik/...`) с тегами `:latest` и `:<sha>`.
  - Новый workflow `.github/workflows/deploy.yml`: workflow_dispatch (кнопка в GH UI), принимает tag, SSH'ит на 4feb, запускает `scripts/deploy-prod.sh`. Rollback = деплой со старым sha.
  - `docker-compose.prod.yml` закоммичен в репо (image tag параметризован), больше не дрейфует от серверного.
  - На сервере появился `deploy` user с docker-доступом (без sudo), стек переехал в `/home/deploy/bio_collection`. Старый `/home/user/bio_collection` остаётся параллельно до nginx-cutover.
  - Реестр сменился с `gimmyhat/*` на `ghcr.io/ksushanik/*`. `make push-all` / `make deploy-prod` остаются как escape hatch.
```

- [ ] **Step 3: Commit**

```powershell
git add docs/wiki/playbooks.md docs/wiki/changelog.md
git commit -m "docs(wiki): document automated CI/CD path, escape hatches, and migration to ghcr"
```

---

### Task B7: Push branch and open PR

**Files:** none (git/gh)

- [ ] **Step 1: Push branch**

```powershell
git push -u origin feat/automated-cicd
```

Expected: `branch 'feat/automated-cicd' set up to track 'origin/feat/automated-cicd'`.

- [ ] **Step 2: Create PR via gh (now authed as ksushanik)**

```powershell
gh pr create --base main --head feat/automated-cicd --title "feat(ci-cd): automated build + button-triggered deploy via GHCR" --body @"
## Summary

Replaces the manual ``make push-all`` + ``make deploy-prod`` flow with two GitHub Actions:

- ``build.yml`` — every push to ``main`` builds backend+frontend images and pushes to GHCR with ``:latest`` and ``:<sha>`` tags
- ``deploy.yml`` — manual button in GH UI; SSH-es to a new ``deploy`` user on the server, writes ``IMAGE_TAG`` to ``.env``, runs the existing health-gated ``scripts/deploy-prod.sh``

Rollback = re-run deploy with tag = old SHA. Manual ``make`` targets remain as escape hatches.

## Spec
docs/superpowers/specs/2026-05-04-automated-cicd-design.md

## Implementation plan
docs/superpowers/plans/2026-05-04-automated-cicd.md

## Test plan
- [ ] Build workflow runs and pushes both images to GHCR after merge
- [ ] Deploy workflow runs via UI button, deploys to /home/deploy/bio_collection, backend healthy in 90s
- [ ] Old stack at /home/user/bio_collection still serves traffic (parallel-path)
- [ ] After manual nginx cutover: new stack receives prod traffic, old can be torn down
- [ ] Rollback test: deploy with previous SHA, verify exact image is pulled

🤖 Generated with [Claude Code](https://claude.com/claude-code)
"@
```

(Note: PowerShell here-string with `@"..."@` — the closing `"@` MUST be at column 0.)

Expected: PR URL printed.

---

## Phase C — First-run validation (after PR merge)

These tasks happen sequentially after the PR is merged to main.

### Task C1: Watch the first build run

**Files:** github.com → Actions tab

- [ ] **Step 1: Confirm `Build & Push Images` workflow triggered on merge commit**

```powershell
gh run list --workflow=build.yml --limit 1
```

Expected: status `in_progress` initially, then `completed success`.

- [ ] **Step 2: Tail the build logs if anything looks off**

```powershell
gh run watch
```

(Picks up the most recent run interactively.)

- [ ] **Step 3: Confirm images are visible in GHCR**

```powershell
gh api /users/ksushanik/packages?package_type=container --jq ".[].name"
```

Expected: list includes `strain-collection-v2-backend` and `strain-collection-v2-frontend`.

- [ ] **Step 4: Confirm both tags exist for each image**

```powershell
gh api /users/ksushanik/packages/container/strain-collection-v2-backend/versions --jq ".[].metadata.container.tags"
gh api /users/ksushanik/packages/container/strain-collection-v2-frontend/versions --jq ".[].metadata.container.tags"
```

Expected: at least one version with `["latest", "<sha>"]` tags.

- [ ] **Step 5: If image is private, set to public (one-time per package)**

If pull on the server fails with auth in Task C2, go to https://github.com/users/ksushanik/packages/container/strain-collection-v2-backend/settings → "Change visibility" → public. (Server has GHCR login, so this is technically optional, but public makes future debugging easier.)

---

### Task C2: First parallel-path deploy

**Files:** none (server-side runtime)

- [ ] **Step 1: Trigger deploy.yml from GH UI**

User goes to: Actions → "Deploy to Production" → Run workflow → leave tag = `latest` → Run.

- [ ] **Step 2: Watch the workflow**

```powershell
gh run watch
```

Expected: each step completes, final exit 0. The "Deploy" step output shows ``>>> backend is healthy`` from the deploy script.

- [ ] **Step 3: Verify new stack containers are running on server**

```powershell
ssh 4feb "sudo -u deploy docker compose -f /home/deploy/bio_collection/docker-compose.yml ps"
```

Expected: 4 services up. `strain_v2_backend` shows `(healthy)`.

- [ ] **Step 4: Verify old stack still running and serving traffic**

```powershell
ssh 4feb "docker compose -f /home/user/bio_collection/docker-compose.yml ps"
```

Expected: same 4 services, also up. (Both stacks coexist; ports differ at the container level if container_name collides — see § Step 5 immediately below before celebrating.)

- [ ] **Step 5: Resolve container_name collision** ⚠

Both old and new compose files use `container_name: strain_v2_backend` (and `strain_v2_db`, `strain_v2_redis`, `strain_v2_frontend`). Docker rejects two containers with the same name. The first deploy WILL FAIL or replace the old container.

Pick one of two recovery paths:

**Path A — accept replacement:** the old containers were already replaced. Verify the public URL still serves traffic (the nginx upstream still points at the same container names + ports, which now serve from the new stack). If the app loads — proceed to cutover (Task C3) immediately, since traffic already moved.

**Path B — true parallel:** stop deploy, edit `docker-compose.prod.yml` to suffix container names (e.g. `strain_v2_backend_new`), edit ports (e.g. `3011:3000` instead of `3010:3000`), redeploy. Then nginx cutover is a real config change.

Recommend Path A unless the app misbehaves immediately. Document the choice in changelog.

---

### Task C3: nginx cutover (manual; document outcome)

**Files:** server-side nginx config (location depends on deploy)

- [ ] **Step 1: Find the external nginx config**

```powershell
ssh 4feb "sudo grep -rli 'strain_v2_\|bio_collection\|culturedb' /etc/nginx/ 2>/dev/null"
```

Expected: at least one .conf file path.

- [ ] **Step 2: If Path A (collision = replacement) was taken in C2**

Nothing to do — same container names, traffic flowing. Skip to Task C4.

- [ ] **Step 3: If Path B (true parallel) was taken**

Edit nginx upstream/proxy_pass to point at the new container names/ports. Reload:

```powershell
ssh 4feb "sudo nginx -t && sudo nginx -s reload"
```

Expected: `nginx -t` says OK; reload silent.

- [ ] **Step 4: Smoke-test public URL**

```powershell
curl -fsS https://culturedb.elcity.ru/ -o $null -w "HTTP %{http_code}\n"
```

Expected: `HTTP 200` (or `HTTP 308` if there's a redirect — follow it).

---

### Task C4: Test rollback flow

**Files:** none (workflow_dispatch)

- [ ] **Step 1: Note current deployed SHA**

```powershell
ssh 4feb "sudo -u deploy cat /home/deploy/bio_collection/.env"
```

Expected: `IMAGE_TAG=<sha>` (or `latest`).

- [ ] **Step 2: Find a previous SHA from build runs**

```powershell
gh run list --workflow=build.yml --limit 5 --json databaseId,headSha,conclusion
```

Pick a previous successful run's `headSha`.

- [ ] **Step 3: Trigger deploy with that SHA**

User: Actions → Deploy → Run workflow → tag = `<previous sha>` → Run.

- [ ] **Step 4: Verify the rolled-back image is what's running**

```powershell
ssh 4feb "sudo -u deploy docker inspect --format '{{.Config.Image}}' strain_v2_backend"
```

Expected: `ghcr.io/ksushanik/strain-collection-v2-backend:<previous sha>`.

- [ ] **Step 5: Roll forward back to latest**

User: Actions → Deploy → Run workflow → tag = `latest` → Run.

---

## Phase D — Cleanup (after Phase C succeeds + soak time)

### Task D1: Remove old `/home/user/bio_collection` after 1 week soak

**Files:** server-side

- [ ] **Step 1: Stop and remove old stack**

```powershell
ssh 4feb "cd /home/user/bio_collection && docker compose down"
```

Expected: containers stopped (no -v: keep volumes for safety).

- [ ] **Step 2: Verify postgres volume is detached and untouched**

```powershell
ssh 4feb "docker volume ls --filter name=postgres_v2_data"
```

Expected: volume still listed, used only by new stack containers (`docker volume inspect postgres_v2_data` shows nothing in `Mountpoint` use besides new containers).

- [ ] **Step 3: Archive (don't delete) old directory**

```powershell
ssh 4feb "sudo mv /home/user/bio_collection /home/user/bio_collection.archived-$(date +%Y%m%d)"
```

Expected: directory renamed.

- [ ] **Step 4: Optionally delete after another week**

Leave for now. Real deletion happens in a follow-up PR after sustained green.

---

### Task D2: Optionally delete old `gimmyhat/*` images from Docker Hub

**Files:** hub.docker.com UI

This is optional and reversible only by re-pushing. Decide whether to do it. If yes:

- [ ] **Step 1: User goes to Docker Hub**

https://hub.docker.com/r/gimmyhat/strain-collection-v2-backend → Tags → delete `:latest`. Repeat for `-frontend`.

(Skipping is fine — the images do nothing, just sit there.)

---

## Self-Review

**Spec coverage:**
- § Architecture (build.yml, deploy.yml, docker-compose.prod.yml) → Tasks B1, B3, B4 ✓
- § scripts/deploy-prod.sh updates → Task B2 ✓
- § Makefile updates → Task B5 ✓
- § Pre-flight setup checklist (8 steps) → Tasks A2-A8 ✓
- § First-run safety (3-step rollout) → Tasks C1, C2, C3 ✓
- § Cleanup → Tasks D1, D2 ✓
- § Decisions table → all reflected in artifact tasks ✓
- Open issue: external nginx config not in repo → addressed by Task C3 (find + edit, document outcome)
- Open issue: GHCR image visibility → addressed by Task C1 Step 5

**Placeholder scan:** no TBDs, no "implement later", no "similar to task N". All code blocks complete.

**Type consistency:** image references `ghcr.io/ksushanik/strain-collection-v2-{backend,frontend}` consistent across docker-compose.prod.yml, build.yml, deploy.yml, Makefile. SHA tag format `${{ github.sha }}` consistent. SSH user `deploy` consistent.

**Known gap intentionally surfaced (not a bug):** Task C2 Step 5 calls out the container_name collision risk that the spec's parallel-path strategy partially papers over. The two recovery paths are documented; user picks at runtime.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-05-04-automated-cicd.md`.

Two execution options:

1. **Subagent-Driven (recommended)** — Claude dispatches a fresh subagent per task, reviews between tasks, fast iteration. Best for the file-creation Phase B.
2. **Inline Execution** — Execute tasks in this session using executing-plans. Better for Phase A (server-side, requires interactive judgement on user creation conflicts) and Phase C (waiting on CI runs, watching logs).

For this plan, a hybrid is natural: **Phase A inline** (interactive server work, no point dispatching a subagent for SSH commands), **Phase B subagent-driven** (clean file creation), **Phase C inline** (real-time validation), **Phase D inline** (judgement calls + soak time).

Which approach?
