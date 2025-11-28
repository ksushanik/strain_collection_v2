# Style and Conventions
- Language: TypeScript across backend (NestJS) and frontend (Next.js). Prefer explicit interfaces/DTOs; keep Prisma access in dedicated services.
- NestJS pattern: module/controller/service per feature; tests colocated as `.spec.ts`; e2e under `backend/test`.
- Frontend: React functional components/hooks; components under `components/` or `app/` routes. DTO/types in `types/`; API clients in `services/`; contexts for auth/ACL; helpers in `lib/`.
- Formatting: ESLint + Prettier, 2-space indent, keep semicolons.
- Naming: files/dirs kebab-case; classes/interfaces PascalCase; variables camelCase.
- Docs/wiki: `docs/wiki` for markdown, keep changelog/playbooks/architecture in sync with features.