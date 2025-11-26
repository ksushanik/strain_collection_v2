# Improvement Tasks (temporary)
Purpose: track critical/high-priority improvements. Update checkboxes as you progress; delete the file when done.

## Critical
- [x] Remove `backend/.env` from repo, rotate secrets, keep `.env.example`.
- [x] Harden global `ValidationPipe` in `backend/src/main.ts` (`forbidNonWhitelisted`, keep `whitelist/transform`).
- [x] Add frontend smoke tests (Playwright/RTL) for login and main CRUD flows (strains/samples).
- [x] CI pipeline: lint, backend unit + e2e, `prisma migrate deploy`, frontend smokes.
- [x] Audit logs: ensure redaction/rotation. (Redaction + retention cleanup added; monitor size in prod.)

## High Priority
- [x] Expand e2e for auth/roles (CASL) and storage allocation/unallocation flows.
- [x] Improve frontend error handling (shared boundary/toast), safe messages in `services/api.ts`.
- [x] Automate wiki sync `docs/wiki` → `frontend/public/wiki` and document in README/Makefile.
