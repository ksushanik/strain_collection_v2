# Тестирование

- **Backend**:
  - Unit: `npm run test`
  - Coverage: `npm run test:cov`
  - E2E: `npm run test:e2e`
  - Где писать: `src/**/*.spec.ts`, e2e в `backend/test`.
- **Frontend**: пока нет настроенных тестов; добавлять Jest/RTL или Playwright рядом с новыми компонентами/страницами.
- **Рекомендации**:
  - Перед мерджем бэкенд-логики (storage/audit/analytics) — `npm run test:cov`.
  - Для UI — smoke через ручное тестирование, при добавлении критичных сценариев — автотесты.
