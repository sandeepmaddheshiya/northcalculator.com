import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('search answers "15% of 240" inline and links to the working', async ({ page }) => {
  await page.goto('/en', { waitUntil: 'networkidle' });
  await page.keyboard.press('Control+k');
  const input = page.getByRole('combobox', { name: /search calculators/i });
  await input.fill('15% of 240');
  const first = page.getByRole('option').first();
  await expect(first).toContainText('15% of 240 = 36');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/percentage-calculator\?q=of&a=15&b=240$/);
  await expect(page.getByText('15% of 240 is 36.')).toBeVisible();
});

test('search converts units inline', async ({ page }) => {
  await page.goto('/en', { waitUntil: 'networkidle' });
  await page.keyboard.press('Control+k');
  await page.getByRole('combobox', { name: /search calculators/i }).fill('5 ft to m');
  await expect(page.getByRole('option').first()).toContainText('1.524 m');
});

test('homepage samples are computed results that open the calculator', async ({ page }) => {
  await page.goto('/en', { waitUntil: 'networkidle' });
  const sample = page.getByRole('link', { name: /15% of 240/ });
  await expect(sample).toContainText('36');
  await sample.click();
  // 15% of 240 is the calculator's default state, so the link needs no query string.
  await expect(page).toHaveURL(/percentage-calculator$/);
  await expect(page.getByText('15% of 240 is 36.')).toBeVisible();
});

test('history remembers a calculation and Save keeps it', async ({ page }) => {
  await page.goto('/en/finance/loan-calculator', { waitUntil: 'networkidle' });
  await page.getByLabel('Loan amount').fill('12000');
  await page.waitForTimeout(2300); // auto-history settles after 2 s
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByText('Saved in this browser')).toBeVisible();
  await page.goto('/en/finance/loan-calculator', { waitUntil: 'networkidle' });
  await page.getByText(/^History \(/).click();
  await expect(page.getByRole('heading', { name: 'Saved' })).toBeVisible();
  await page
    .getByRole('button', { name: /\$249\.10/ })
    .first()
    .click(); // 12,000 at 9% over 60 months
  await expect(page.getByLabel('Loan amount')).toHaveValue('12,000');
});

test('health calculators never keep history automatically', async ({ page }) => {
  await page.goto('/en/health/bmi-calculator', { waitUntil: 'networkidle' });
  await page.getByRole('textbox', { name: 'Weight', exact: true }).fill('80');
  await page.waitForTimeout(2300);
  const stored = await page.evaluate(() => localStorage.getItem('nc:history:bmi'));
  expect(stored).toBeNull();
});

test('compare pins scenario A against the current inputs', async ({ page }) => {
  await page.goto('/en/finance/mortgage-calculator', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Compare' }).click();
  await page.getByLabel('Interest rate (annual)').fill('5.5');
  const table = page.getByRole('table').filter({ hasText: 'A (pinned)' });
  await expect(table).toContainText('$2,022.62');
  await expect(table).toContainText('$1,816.92'); // 320,000 at 5.5% over 30 years
  await expect(table).toContainText('−$205.70');
  const axe = await new AxeBuilder({ page })
    .include('table')
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();
  expect(axe.violations.map((v) => v.id)).toEqual([]);
});

test('offline page exists, is noindex, and the service worker registers', async ({ page }) => {
  const res = await page.goto('/en/offline');
  expect(res?.status()).toBe(200);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  await page.goto('/en', { waitUntil: 'networkidle' });
  const scope = await page.evaluate(async () => (await navigator.serviceWorker.ready).scope);
  expect(scope).toMatch(/\/$/);
});

test('embed: calculator alone, noindex with canonical, axe clean, links back', async ({ page }) => {
  await page.goto('/embed/en/mortgage', { waitUntil: 'networkidle' });
  await expect(page.locator('h1')).toHaveText('Mortgage Calculator');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    /\/en\/finance\/mortgage-calculator$/,
  );
  await expect(page.getByRole('link', { name: /Open the full calculator/ })).toHaveAttribute(
    'href',
    /\/en\/finance\/mortgage-calculator$/,
  );
  await expect(page.locator('header')).toHaveCount(0); // no site chrome
  const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(axe.violations.map((v) => v.id)).toEqual([]);
});

test('calculator pages offer an embed snippet', async ({ page }) => {
  await page.goto('/en/finance/mortgage-calculator');
  await page.getByText('Embed this calculator on your site').click();
  await expect(page.locator('pre').filter({ hasText: '/embed/en/mortgage' })).toBeVisible();
});
