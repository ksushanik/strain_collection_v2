import { test, expect, Route } from '@playwright/test';

const fakeUser = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  role: 'ADMIN',
};

test('login page renders form', async ({ page }) => {
  // No token — show the login form
  await page.route('**/auth/login', (route: Route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ access_token: 'test-token', user: fakeUser }),
    }),
  );

  await page.goto('/login');
  // wait for locale redirect (/ru/login)
  await page.waitForURL('**/login');
  await expect(page.getByRole('heading', { name: /войти/i })).toBeVisible();
  await expect(page.getByLabel(/email/i)).toBeVisible();
});

test('strains page shows mocked table', async ({ page }) => {
  // Set auth token before navigation
  await page.addInitScript((user: typeof fakeUser) => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify(user));
  }, fakeUser);

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

  // Mock all API calls the strains page might make
  await page.route('**/api/v1/settings/ui-bindings', (route: Route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) }),
  );
  await page.route('**/api/v1/strains**', (route: Route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(strainsResponse) }),
  );
  await page.route('**/api/v1/traits**', (route: Route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) }),
  );
  await page.route('**/api/v1/media**', (route: Route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) }),
  );
  // Catch any remaining API calls (auth checks etc.)
  await page.route('**/api/v1/**', (route: Route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) }),
  );

  await page.goto('/strains');
  // wait for locale redirect (/ru/strains)
  await page.waitForURL('**/strains');

  await expect(page.getByRole('heading', { name: /штаммы/i })).toBeVisible({ timeout: 15000 });
  await expect(page.getByText('STR-001')).toBeVisible();
  await expect(page.getByText('S-001')).toBeVisible();
});
