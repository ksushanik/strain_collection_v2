# Suggested Commands
- Start DB: `docker-compose up -d` (root).
- Backend setup/dev: `cd backend && npm install && npx prisma generate && npx prisma migrate dev && npm run start:dev`.
- Backend build/prod: `npm run build && npm run start:prod` (in backend).
- Backend tests: `npm run test`, coverage `npm run test:cov`, e2e `npm run test:e2e` (backend).
- Backend lint/format: `npm run lint`, `npm run format` (backend).
- Frontend dev: `cd frontend && npm install && npm run dev -- -p 3001`.
- Frontend build/start: `npm run build && npm run start` (frontend).
- Wiki sync script: `node sync-wiki.mjs` (root) if needed.
- Git helpers: typical Windows shell `pwsh`; list files `Get-ChildItem`; search `rg` or `Get-ChildItem -Recurse | Select-String` if ripgrep missing.