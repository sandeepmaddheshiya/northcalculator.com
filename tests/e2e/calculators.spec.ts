import { readFileSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/** BRIEF §12: load, input, update, share round-trip, keyboard-only, no console errors, axe. */
const CALCULATORS = [
  ['/en/finance/mortgage-calculator', 'Monthly payment'],
  ['/en/finance/loan-calculator', 'Monthly payment (EMI)'],
  ['/en/finance/compound-interest-calculator', 'Future balance'],
  ['/en/math/percentage-calculator', 'Result'],
  ['/en/math/scientific-calculator', 'Expression'],
  ['/en/health/bmi-calculator', 'Your BMI'],
  ['/en/date-time/age-calculator', 'Age'],
  ['/en/conversion/unit-converter', 'Result'],
  ['/en/conversion/currency-converter', 'Converted amount'],
  ['/en/education/gpa-calculator', 'GPA (unweighted)'],
  ['/en/everyday/tip-calculator', 'Tip'],
  ['/en/everyday/discount-calculator', 'Result'],
  ['/en/finance/sales-tax-calculator', 'Result'],
  ['/en/finance/simple-interest-calculator', 'Interest'],
  ['/en/date-time/days-between-dates', 'Days'],
  ['/en/date-time/date-calculator', 'Date'],
  ['/en/math/fraction-calculator', 'Result (simplified)'],
  ['/en/math/average-calculator', 'Mean (average)'],
  ['/en/math/lcm-gcf-calculator', 'Greatest common factor (GCF)'],
  ['/en/finance/cagr-calculator', 'Compound annual growth rate'],
  ['/en/finance/margin-calculator', 'Gross margin'],
  ['/en/finance/hourly-to-salary-calculator', 'Annual salary'],
  ['/en/education/grade-calculator', 'Weighted grade'],
  ['/en/education/final-grade-calculator', 'Score needed on the final'],
  ['/en/date-time/time-calculator', 'Result'],
  ['/en/math/percentage-change-calculator', 'Percentage change'],
  ['/en/math/ratio-calculator', 'Simplest form'],
  ['/en/math/rounding-calculator', 'Rounded number'],
  ['/en/everyday/unit-price-calculator', 'Better buy'],
  ['/en/date-time/week-number-calculator', 'Week number'],
  ['/en/date-time/business-days-calculator', 'Working days'],
  ['/en/math/percent-difference-calculator', 'Percent difference'],
  ['/en/everyday/fuel-cost-calculator', 'Fuel cost'],
  ['/en/health/bmr-calculator', 'BMR (kcal per day)'],
  ['/en/health/calorie-calculator', 'Calories per day (kcal)'],
  ['/en/health/heart-rate-zone-calculator', 'Estimated maximum heart rate (bpm)'],
  ['/en/health/pace-calculator', 'Pace'],
  ['/en/math/exponent-calculator', 'Result'],
  ['/en/math/square-root-calculator', 'Root'],
  ['/en/math/log-calculator', 'Logarithm'],
  ['/en/math/scientific-notation-calculator', 'Scientific notation'],
  ['/en/finance/roi-calculator', 'Return on investment'],
  ['/en/finance/savings-goal-calculator', 'Save each year'],
  ['/en/date-time/days-until-calculator', 'Days'],
  ['/en/math/random-number-generator', 'Your numbers'],
  ['/en/math/dice-roller', 'Total'],
  ['/en/finance/auto-loan-calculator', 'Monthly payment'],
  ['/en/finance/debt-to-income-ratio-calculator', 'Debt-to-income ratio'],
  ['/en/education/test-score-calculator', 'Score'],
  ['/en/education/cgpa-to-percentage-calculator', 'Indicative percentage'],
  ['/en/everyday/split-bill-calculator', 'Total bill'],
] as const;

const snapshot = JSON.parse(
  readFileSync('src/calculators/conversion/currency-converter/rates.snapshot.json', 'utf8'),
);

/** Answer the rate providers from the snapshot: deterministic, and no network in CI. */
async function stubRates(page: Page) {
  await page.route('https://open.er-api.com/**', (r) =>
    r.fulfill({
      json: {
        result: 'success',
        base_code: 'USD',
        time_last_update_unix: snapshot.time,
        rates: snapshot.rates,
      },
    }),
  );
  await page.route('https://cdn.jsdelivr.net/**', (r) => r.fulfill({ status: 404, body: '' }));
}

function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(String(e)));
  return errors;
}

test.beforeEach(async ({ page }) => stubRates(page));

for (const [path, label] of CALCULATORS) {
  test(`${path}: renders, axe clean, no errors, no horizontal scroll`, async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto(path, { waitUntil: 'networkidle' });
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.getByText(label, { exact: true }).first()).toBeVisible();
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

test('the default result and page content are in the server HTML (no JavaScript)', async ({
  browser,
}) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto('/en/finance/mortgage-calculator');
  await expect(page.getByText('$2,022.62').first()).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Frequently asked questions' })).toBeVisible();
  await page.goto('/en/conversion/currency-converter');
  await expect(page.getByText('Converted amount').first()).toBeVisible();
  await ctx.close();
});

test('percentage: typing updates the result live and the URL round-trips', async ({ page }) => {
  await page.goto('/en/math/percentage-calculator', { waitUntil: 'networkidle' });
  const pct = page.getByLabel('Percentage (%)');
  await pct.fill('20');
  await expect(page.getByText('20% of 240 is 48.')).toBeVisible();
  await expect(page).toHaveURL(/a=20/);
  await page.reload({ waitUntil: 'networkidle' });
  await expect(page.getByLabel('Percentage (%)')).toHaveValue('20');
  await expect(page.getByText('20% of 240 is 48.')).toBeVisible();
});

test('mortgage: a shared link reopens the exact result', async ({ page }) => {
  await page.goto('/en/finance/mortgage-calculator?p=500000&d=10&r=7&y=15', {
    waitUntil: 'networkidle',
  });
  // 450,000 at 7% over 15 years → 4,044.73 (annuity formula, Python decimal)
  await expect(page.getByText('$4,044.73').first()).toBeVisible();
});

test('keyboard only: Enter moves to the next field and Reset restores defaults', async ({
  page,
}) => {
  await page.goto('/en/finance/loan-calculator', { waitUntil: 'networkidle' });
  const amount = page.getByLabel('Loan amount');
  await amount.focus();
  await page.keyboard.press('Control+a');
  await page.keyboard.type('10000');
  await page.keyboard.press('Enter');
  await expect(page.getByLabel('Interest rate (annual, reducing balance)')).toBeFocused();
  await expect(page.getByText('$207.58').first()).toBeVisible(); // 10,000 at 9% over 60 months
  await page.getByRole('button', { name: 'Reset' }).click();
  await expect(page.getByLabel('Loan amount')).toHaveValue('25,000');
});

test('scientific: keypad and keyboard entry, Enter evaluates into the history', async ({
  page,
}) => {
  await page.goto('/en/math/scientific-calculator', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: /clear all/ }).click();
  for (const k of ['7', 'multiply', '6'])
    await page.getByRole('button', { name: k, exact: true }).click();
  await expect(page.locator('#sci-result')).toContainText('= 42');
  await page.getByRole('textbox', { name: 'Expression' }).press('Enter');
  await expect(page.getByRole('complementary', { name: 'History' })).toContainText('7×6');
  await page.getByRole('textbox', { name: 'Expression' }).fill('1/0');
  await page.keyboard.press('Enter');
  await expect(page.locator('#sci-result')).toContainText('Division by zero');
});

test('GPA: adding and removing courses updates the result', async ({ page }) => {
  await page.goto('/en/education/gpa-calculator', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Add a course' }).click();
  await page.getByLabel('Grade, course 6').selectOption('F');
  await expect(
    page.getByText('6 courses and 19 credits give a GPA of 3.05 on the 4.0 scale.'),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Remove course 6' }).click();
  await expect(
    page.getByText('5 courses and 16 credits give a GPA of 3.63 on the 4.0 scale.'),
  ).toBeVisible();
});

test('unit converter: changing the quantity switches to valid units, swap works', async ({
  page,
}) => {
  await page.goto('/en/conversion/unit-converter', { waitUntil: 'networkidle' });
  await page.getByLabel('Quantity').selectOption('temperature');
  await expect(page.getByLabel('From', { exact: true })).toHaveValue('f');
  await expect(page.getByLabel('To', { exact: true })).toHaveValue('c');
  await page.getByLabel('Value', { exact: true }).fill('212');
  await expect(page.getByText('212 Fahrenheit (°F) is 100 Celsius (°C).')).toBeVisible();
  await page.getByRole('button', { name: 'Swap' }).click();
  await expect(page.getByLabel('From', { exact: true })).toHaveValue('c');
});

test('currency: rates source and date are shown, custom rate shows the markup', async ({
  page,
}) => {
  await page.goto('/en/conversion/currency-converter', { waitUntil: 'networkidle' });
  await expect(page.getByText(/ExchangeRate-API daily reference rates/).first()).toBeVisible();
  await page.getByText('My provider’s rate', { exact: true }).click();
  await page.getByLabel(/Your rate/).fill('0.5');
  await expect(
    page.getByText('Markup against the reference rate', { exact: true }).first(),
  ).toBeVisible();
});

test('the result label follows the mode (output labelBy)', async ({ page }) => {
  await page.goto('/en/finance/hourly-to-salary-calculator', { waitUntil: 'networkidle' });
  await expect(page.getByText('Annual salary', { exact: true }).first()).toBeVisible();
  await page.getByLabel('Paid per').selectOption('year');
  await expect(page.getByText('Hourly rate', { exact: true }).first()).toBeVisible();
});

test('random tools draw on load, reroll on demand and keep the seed in the URL', async ({
  page,
}) => {
  await page.goto('/en/math/dice-roller', { waitUntil: 'networkidle' });
  await expect(page).toHaveURL(/[?&]s=[0-9a-f]{32}/);
  const seed1 = new URL(page.url()).searchParams.get('s');
  await page.getByRole('button', { name: 'Roll', exact: true }).click();
  await expect.poll(() => new URL(page.url()).searchParams.get('s')).not.toBe(seed1);
  const shared = page.url();
  const rolls = await page
    .getByText(/^\d+(, \d+)+$/)
    .first()
    .textContent();
  await page.goto(shared, { waitUntil: 'networkidle' });
  await expect(page.getByText(rolls!, { exact: true }).first()).toBeVisible();
});
