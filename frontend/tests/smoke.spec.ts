import { test, expect, Page, Route } from '@playwright/test';

const fakeUser = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  role: 'ADMIN',
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript((user: typeof fakeUser) => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify(user));
  }, fakeUser);
});

test('login page renders form', async ({ page }) => {
  await page.route('**/auth/login', (route: Route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ access_token: 'test-token', user: fakeUser }),
    }),
  );

  await page.goto('/login');
  await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
  await expect(page.getByLabel(/email/i)).toBeVisible();
  await expect(page.getByLabel(/password/i)).toBeVisible();
});

test('strains page shows mocked table', async ({ page }) => {
  const strainsResponse = {
    data: [
      {
        id: 101,
        identifier: 'STR-001',
        sample: { code: 'S-001' },
        taxonomy16s: 'Bacillus subtilis',
        seq: true,
        phosphates: true,
        siderophores: false,
        pigmentSecretion: false,
        gramStain: 'POSITIVE',
      },
    ],
    meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
  };

  await page.route('**/api/v1/settings/ui-bindings', (route: Route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    }),
  );

  await page.route('**/api/v1/strains**', (route: Route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(strainsResponse),
    }),
  );

  await page.goto('/strains');

  await expect(page.getByRole('heading', { name: /all strains/i })).toBeVisible();
  await expect(page.getByText('STR-001')).toBeVisible();
  await expect(page.getByText('S-001')).toBeVisible();
});
