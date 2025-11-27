# Task Completion Checklist
- Run relevant backend tests when logic changes: `npm run test` or `npm run test:cov`; run `npm run test:e2e` for API flows touching routing/auth/storage.
- Lint/format backend changes: `npm run lint` and `npm run format`.
- Frontend: no formal test suite yet; add Jest/RTL or Playwright alongside new UI features when feasible; at minimum, manual check affected pages/components.
- Note env changes (e.g., `DATABASE_URL`, `NEXT_PUBLIC_API_URL`) in PR/notes; avoid committing secrets.
- Bundle/build checks when touching build paths: backend `npm run build`; frontend `npm run build`.
- Include migration/seed updates with schema changes; keep docs/wiki (`docs/wiki`) in sync with feature updates.