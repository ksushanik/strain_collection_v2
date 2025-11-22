# Repository Guidelines

## Project Structure & Module Organization
- Root split into `backend` (NestJS) and `frontend` (Next.js).
- Backend: `src/` modules `strains`, `samples`, `storage`, `settings`, `users`, `admin`, `audit`, `casl`, plus shared `services/` and Prisma layer under `prisma/` (schema, migrations, seed). Tests in `src/**/*.spec.ts` and e2e in `test/`.
- Frontend: `src/app` (App Router pages), `components/domain` + `components/ui`, `services/` for API clients, `types/` for DTOs, `contexts/` for auth/ACL, `lib/` helpers. Static assets in `public/`.

## Build, Test, and Development Commands
- Start DB: `docker-compose up -d`.
- Backend: `cd backend && npm install && npx prisma generate && npx prisma migrate dev && npm run start:dev`.
- Backend production bundle: `npm run build` then `npm run start:prod`.
- Backend tests: `npm run test`, `npm run test:cov`, e2e via `npm run test:e2e`.
- Frontend dev: `cd frontend && npm install && npm run dev -- -p 3001`.
- Frontend build/start: `npm run build && npm run start`.

## Coding Style & Naming Conventions
- TypeScript everywhere; prefer explicit interfaces and DTOs.
- Follow NestJS module/controller/service pattern in backend; keep Prisma access in dedicated services.
- Lint/format with ESLint + Prettier (`npm run lint`, `npm run format` backend). Default 2-space indent; keep semicolons.
- Filenames kebab-case for files and directories; classes/interfaces in PascalCase; variables camelCase.
- React components live under `components/` or `app/` segments; favor functional components and hooks.

## Current Feature Notes
- Storage: boxes/cells grid with allocate/unallocate/bulk; deep link highlights via `?boxId=&cell=` from strain cards.
- Media: `/media` CRUD for nutrient media; link/unlink to strains in strain card.
- Legend: `/legend` text editor for UI legend.
- Wiki: `/docs` renders Markdown from `docs/wiki`; keep wiki in sync with features (changelog, playbooks, architecture).
- Filters/pagination: lists for strains/samples support server filters & paging (search, sampleCode/taxonomy/genome/etc. for strains; site/type/date for samples).

## Testing Guidelines
- Unit tests colocated with backend sources as `.spec.ts`; e2e specs in `backend/test`.
- Use `npm run test:cov` before merge when backend changes touch logic.
- Frontend tests not yet set up; add Jest/React Testing Library or Playwright alongside new UI features when feasible; mirror route/component paths.

## Commit & Pull Request Guidelines
- Use conventional commits (`feat:`, `fix:`, `chore:`, `refactor:`) as in repo history.
- Scope commits to a single concern; include migration/test updates in same commit when relevant.
- PRs: clear summary, linked issue, setup notes, and screenshots/GIFs for UI changes; list test commands run.
- Note env changes (.env/.env.local) and include sample values in the PR description; avoid committing secrets.

## Environment & Data Notes
- Backend expects `DATABASE_URL` and runs on `PORT=3000`; seed via `npx prisma db seed`.
- Frontend reads `NEXT_PUBLIC_API_URL` pointing to backend; keep ports (`3000` API / `3001` UI) aligned with compose config.
