import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const PAGES = [
  '/en',
  '/en/about',
  '/en/methodology',
  '/en/editorial-policy',
  '/en/privacy',
  '/en/terms',
  '/en/contact',
];

function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(String(e)));
  return errors;
}

for (const path of PAGES) {
  test(`${path}: renders, no console/CSP errors, no horizontal scroll, axe clean`, async ({
    page,
  }) => {
    const errors = collectErrors(page);
    await page.goto(path, { waitUntil: 'networkidle' });
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow, 'horizontal scroll').toBeLessThanOrEqual(0);
    const axe = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(
      axe.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(', ')}`),
    ).toEqual([]);
    expect(errors).toEqual([]);
  });
}

test('dark theme is axe clean and persists', async ({ page }) => {
  await page.goto('/en');
  const toggle = page.getByRole('button', { name: /color theme/i });
  await toggle.click(); // system → light
  await toggle.click(); // light → dark
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  const axe = await new AxeBuilder({ page }).withTags(['wcag2aa']).analyze();
  expect(axe.violations.map((v) => v.id)).toEqual([]);
});

test('search opens with Ctrl+K and "/", closes with Escape, finds a page', async ({ page }) => {
  await page.goto('/en', { waitUntil: 'networkidle' });
  await page.keyboard.press('Control+k');
  const input = page.getByRole('combobox', { name: /search calculators/i });
  await expect(input).toBeFocused();
  await input.fill('methodology');
  await expect(page.getByRole('option').first()).toContainText('Methodology');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/en\/methodology$/);
  await page.keyboard.press('/');
  await expect(page.getByRole('combobox')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('skip link moves focus to main content', async ({ page }) => {
  await page.goto('/en');
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: /skip to content/i });
  await expect(skip).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#main$/);
});

test('primary content is in the server HTML (works without JavaScript)', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto('/en/methodology');
  await expect(page.locator('h1')).toHaveText('Methodology');
  await expect(page.getByText('Formulas come from primary sources')).toBeVisible();
  await ctx.close();
});

test('SEO head: canonical, hreflang, OG image, JSON-LD', async ({ page, request }) => {
  await page.goto('/en/about');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/en\/about$/);
  await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveCount(1);
  const og = await page.locator('meta[property="og:image"]').getAttribute('content');
  expect(og).toMatch(/\/en\/og\/home\.png$/);
  const res = await request.get('/en/og/home.png');
  expect(res.headers()['content-type']).toContain('image/png');
  const ld = await page.locator('script[type="application/ld+json"]').first().textContent();
  expect(JSON.parse(ld!)['@graph'][0]['@type']).toBe('BreadcrumbList');
});

test('unknown URL shows the 404 page', async ({ page }) => {
  const res = await page.goto('/en/does-not-exist');
  expect(res?.status()).toBe(404);
  await expect(page.locator('h1')).toContainText('doesn’t exist');
});
