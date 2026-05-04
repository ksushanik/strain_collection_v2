# Automated CI/CD — Design Spec

**Date:** 2026-05-04
**Branch:** feat/rbac-rollout (CI/CD will land in a separate branch per § 4.4)
**Status:** Draft → User review

## Problem

Current CI/CD is half-built:

- **CI** (`.github/workflows/ci.yml`) runs lint + test + e2e on every push/PR. Works.
- **CD** is fully manual:
  - Developer runs `make push-all` from their laptop → builds Docker images locally → pushes to Docker Hub (`gimmyhat/strain-collection-v2-{backend,frontend}:latest`).
  - Developer runs `make deploy-prod` → SSH to alias `4feb` → `docker compose pull && up -d` (now with health-gate per `scripts/deploy-prod.sh`).
- **Consequences:**
  - Builds depend on the developer's local Docker daemon and `docker login` state — not reproducible across team.
  - Images are tagged `:latest` only — no rollback target.
  - Server compose file lives only on the server, drifting from repo.
  - The first user to forget `make push-all` ships an old image.
  - `gh` CLI was authed under the wrong account, blocking PR creation (resolved separately).

## Goal

Ship a **build-auto + deploy-by-button** pipeline:

1. Every push to `main` automatically builds and pushes Docker images to a registry, tagged `:latest` and `:<sha>`.
2. Production deploys are triggered by a **manual button** (`workflow_dispatch`) in the GitHub UI, with optional `tag` input. The default (`latest`) deploys the freshest build; specifying an old SHA performs rollback.
3. The deploy SSH-es to the production host, writes `IMAGE_TAG` to a server-side `.env`, and runs the existing `scripts/deploy-prod.sh` (which already has a 90-second health-gate from the previous commit).

Out of scope for this iteration:
- Auto-deploy on every merge (intentionally; see § 1)
- Staging environment (none exists)
- Slack/email notifications
- Auto-rollback on health failure (manual button click, same flow)

## Decisions

These are settled — design proceeds from them:

| # | Decision | Rationale |
|---|---|---|
| 1 | **Trigger model:** build auto, deploy button | Build automation closes the "forgot to push" gap. Manual deploy keeps a human in the loop for production. Best-of-both. |
| 2 | **Registry:** GHCR (`ghcr.io/ksushanik/...`) | Authenticated via built-in `GITHUB_TOKEN` — no PAT plumbing for CI. One-time `docker login` on server with read-only PAT. |
| 3 | **Tagging:** dual `:latest` + `:<sha>` | `:latest` keeps current default behavior; `:<sha>` enables rollback by re-running deploy with the old SHA. |
| 4 | **Server compose file:** committed as `docker-compose.prod.yml` | Stops the local-vs-prod compose drift. Deploy `scp`s it to the server before each run. |
| 5 | **Server account:** new `deploy` user (not existing `user`) | Isolates CI access from interactive admin account. CI key cannot reach `user`'s data or sudo. |
| 6 | **Rollout strategy:** parallel-path cutover | New automation deploys to `/home/deploy/bio_collection`. Old `/home/user/bio_collection` keeps serving traffic until manual nginx upstream switch. |
| 7 | **Order of operations:** CI/CD first, then RBAC | feat/rbac-rollout becomes the first real workload on the new pipeline, not an emergency hotfix to it. |

## Architecture

Three GitHub Actions workflows:

| Workflow | Trigger | Purpose |
|---|---|---|
| `ci.yml` (existing, unchanged) | `push:`, `pull_request:` | lint + unit tests + e2e |
| `build.yml` (new) | `push:` to `main` | buildx build → push to GHCR with `:latest` and `:<sha>` |
| `deploy.yml` (new) | `workflow_dispatch` | scp compose + script → SSH → write `IMAGE_TAG` → run `scripts/deploy-prod.sh` |

### `build.yml` shape

- Two parallel jobs: `backend` and `frontend`
- Each: `actions/checkout@v4` → `docker/setup-buildx-action@v3` → `docker/login-action@v3` (with `GITHUB_TOKEN`) → `docker/build-push-action@v5` (with `tags: latest, sha`, `cache-from: type=gha`, `cache-to: type=gha,mode=max`)
- `concurrency` group separate from `ci.yml` so they don't cancel each other
- `permissions: { contents: read, packages: write }`

### `deploy.yml` shape

- `workflow_dispatch` with input `tag` (string, default `latest`)
- Single job:
  1. `actions/checkout@v4`
  2. `webfactory/ssh-agent@v0.9` to load `DEPLOY_SSH_KEY`
  3. Write `DEPLOY_SSH_KNOWN_HOSTS` to `~/.ssh/known_hosts`
  4. `scp docker-compose.prod.yml deploy@$HOST:/home/deploy/bio_collection/docker-compose.yml`
  5. `scp scripts/deploy-prod.sh deploy@$HOST:/home/deploy/bio_collection/scripts/deploy-prod.sh`
  6. `ssh deploy@$HOST` with a heredoc that:
     - `cd /home/deploy/bio_collection`
     - `printf 'IMAGE_TAG=%s\nIMAGE_REGISTRY=ghcr.io/ksushanik\n' "$TAG" > .env`
     - `bash scripts/deploy-prod.sh` (will fail loudly if backend doesn't go healthy in 90 s)
  7. Job exit status reflects deploy script exit status — visible red/green in GH UI

### `docker-compose.prod.yml`

Same as the current production compose, but with image references parameterized:

```yaml
services:
  postgres: ...   # unchanged: postgres:16-alpine, postgres_v2_data volume
  redis: ...      # unchanged
  backend:
    image: ${IMAGE_REGISTRY:-ghcr.io/ksushanik}/strain-collection-v2-backend:${IMAGE_TAG:-latest}
    container_name: strain_v2_backend
    ports: ["3010:3000"]
    env_file: ./backend/.env
    depends_on: [postgres, redis]
    command: sh -c "npx prisma migrate deploy && node dist/src/main.js"
    networks: [strain_v2]
  frontend:
    image: ${IMAGE_REGISTRY:-ghcr.io/ksushanik}/strain-collection-v2-frontend:${IMAGE_TAG:-latest}
    container_name: strain_v2_frontend
    ports: ["8082:3001"]
    env_file: ./frontend/.env
    networks: [strain_v2]
volumes:
  postgres_v2_data:
networks:
  strain_v2: { driver: bridge }
```

`backend/.env` and `frontend/.env` continue to live on the server only (they contain secrets and are not in repo).

### `scripts/deploy-prod.sh` updates

- Replace hardcoded `PROJECT_DIR="/home/user/bio_collection"` with `PROJECT_DIR="${PROJECT_DIR:-/home/deploy/bio_collection}"`
- Add `set -a; [ -f .env ] && source .env; set +a` early so `IMAGE_TAG` and `IMAGE_REGISTRY` propagate to `docker compose`
- Health-gate, AdminJS sync, retry loop — unchanged

### Makefile updates

- `REGISTRY ?= ghcr.io/ksushanik` (was `gimmyhat`)
- Keep `push-all`, `deploy-prod`, `deploy-prod-win` as **escape hatches** for emergencies when CI/CD is down. Mark in comments.

## One-time setup checklist

| # | Step | Where | Who |
|---|---|---|---|
| 1 | `useradd -m -s /bin/bash -G docker deploy` | server | Claude (via SSH) |
| 2 | Generate `deploy_ed25519` keypair locally; `cat deploy_ed25519.pub` → server `/home/deploy/.ssh/authorized_keys` | local + server | Claude |
| 3 | `mkdir -p /home/deploy/bio_collection/{backend,frontend,scripts,backend/.adminjs}` and `chown -R deploy:deploy` | server | Claude |
| 4 | `cp /home/user/bio_collection/{backend,frontend}/.env /home/deploy/bio_collection/{backend,frontend}/.env` | server | Claude |
| 5 | `docker login ghcr.io -u ksushanik -p <PAT with read:packages>` as `deploy` user | server | **User** (PAT not exposed to Claude) |
| 6 | `ssh-keyscan -H <DEPLOY_SSH_HOST>` → value for `DEPLOY_SSH_KNOWN_HOSTS` | local | Claude |
| 7 | Add 4 GH Action secrets in Settings → Secrets → Actions: `DEPLOY_SSH_KEY`, `DEPLOY_SSH_HOST`, `DEPLOY_SSH_USER=deploy`, `DEPLOY_SSH_KNOWN_HOSTS` | github.com | **User** (Claude provides values as files) |

## First-run safety

Three-step rollout, each step reversible:

1. **Build smoke**: merge the CI/CD PR. Watch `build.yml` push images to GHCR. If broken — fix in another PR. Production untouched.
2. **Parallel deploy**: trigger `deploy.yml` from GH UI. New stack comes up at `/home/deploy/bio_collection` with ports `3010` (backend) / `8082` (frontend). External nginx still routes to old `strain_v2_*` containers in `/home/user/bio_collection`. If new stack fails health-gate — debug at leisure, no user impact.
3. **Cutover**: when new stack is verified, change external nginx `proxy_pass` from old container ports to new ones, `nginx -s reload`. After a week of silence, `docker compose -f /home/user/bio_collection/docker-compose.yml down` + remove the old directory.

## Cleanup (after step 3 of First-run safety completes)

- Delete old `gimmyhat/strain-collection-v2-*` images from Docker Hub (optional)
- Delete `/home/user/bio_collection/` from server
- Update `docs/wiki/playbooks.md` to make CI/CD the primary documented path; demote `make push-all` / `make deploy-prod` to "escape hatch" status

## Open issues / risks

- **External nginx config is not in this repo** — for cutover step we'll need to find/edit it manually. If it's also config-managed elsewhere, that's a related but separate cleanup.
- **No automated rollback on health failure** — the new pipeline lets you _trigger_ a rollback (deploy with old SHA), but it doesn't _detect_ a bad deploy and roll back automatically. Acceptable for MVP; can be added later via a follow-up workflow that watches the health endpoint after deploy and triggers redeploy with previous SHA on persistent failure.
- **GHCR image visibility** — repos default to private images. After the first push, user must go to package settings and set visibility to "public" if pulling without auth from anywhere else (server still has auth, so technically optional).
- **Codex adversarial review** — under usage limit until 2026-05-06 09:02. Re-run after that date for an independent challenge of the deploy script's bash edge cases and the workflow's secret handling.

## Acceptance criteria

- A push to `main` results in `:latest` and `:<sha>` images on GHCR within ~5 minutes (cached buildx).
- A `workflow_dispatch` of `deploy.yml` with default input deploys the latest image to `/home/deploy/bio_collection`, the backend reports healthy within 90 s, and the workflow exits green.
- A `workflow_dispatch` with `tag=<old sha>` deploys that exact image. Manual rollback works.
- If the backend never goes healthy after deploy, the workflow exits red with the last 50 lines of `docker logs backend` visible in the job output.
- After cutover, the documented production deploy path in `docs/wiki/playbooks.md` is "Settings → Actions → Run workflow", not "make push-all then make deploy-prod".

## Implementation plan

To be authored by `superpowers:writing-plans` after this spec is approved.
