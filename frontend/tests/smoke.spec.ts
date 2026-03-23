import { test, expect, Route } from '@playwright/test';

const fakeUser = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  role: 'ADMIN',
};

test('login page renders form', async ({ page }) => {
  // No token set — login form should be visible
  await page.route('**/auth/login', (route: Route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ access_token: 'test-token', user: fakeUser }),
    }),
  );

  await page.goto('/login');
  await page.waitForURL('**/login');
  await expect(page.getByRole('heading', { name: /войти/i })).toBeVisible();
  await expect(page.getByLabel(/email/i)).toBeVisible();
});

test('strains page renders for authenticated user', async ({ page }) => {
  // Set auth token before navigation
  await page.addInitScript((user: typeof fakeUser) => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify(user));
  }, fakeUser);

  // Mock all API calls so no real backend is needed
  await page.route('**/api/v1/**', (route: Route) => {
    const url = route.request().url();
    if (url.includes('/strains')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            {
              id: 101,
              identifier: 'STR-001',
              sample: { code: 'S-001' },
              taxonomy16s: 'Bacillus subtilis',
              gramStain: 'POSITIVE',
            },
          ],
          meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
        }),
      });
    }
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(url.includes('ui-bindings') ? [] : {}),
    });
  });

  await page.goto('/strains');
  await page.waitForURL('**/strains');

  // Page heading must be visible — verifies routing and i18n work
  await expect(page.getByRole('heading', { name: /штаммы/i })).toBeVisible({ timeout: 15000 });

  // Wait for network idle so data has a chance to load, then check data
  await page.waitForLoadState('networkidle');
  await expect(page.getByText('STR-001').first()).toBeVisible({ timeout: 10000 });
});
