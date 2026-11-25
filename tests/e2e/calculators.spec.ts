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
  ['/en/conversion/length-converter', 'Result'],
  ['/en/conversion/weight-converter', 'Result'],
  ['/en/conversion/temperature-converter', 'Result'],
  ['/en/conversion/volume-converter', 'Result'],
  ['/en/conversion/area-converter', 'Result'],
  ['/en/conversion/speed-converter', 'Result'],
  ['/en/conversion/pressure-converter', 'Result'],
  ['/en/conversion/energy-converter', 'Result'],
  ['/en/conversion/data-storage-converter', 'Result'],
  ['/en/conversion/fuel-economy-converter', 'Result'],
  ['/en/conversion/power-converter', 'Result'],
  ['/en/conversion/time-unit-converter', 'Result'],
  ['/en/education/percentage-to-gpa-calculator', 'GPA (4.0 scale)'],
  ['/en/date-time/hours-worked-calculator', 'Total hours (decimal)'],
  ['/en/date-time/time-duration-calculator', 'Duration'],
  ['/en/finance/break-even-calculator', 'Units to sell'],
  ['/en/date-time/time-zone-converter', 'Converted time'],
  ['/en/finance/inflation-calculator', 'Equivalent value'],
  ['/en/health/calories-burned-calculator', 'Calories burned (kcal)'],
  ['/en/finance/debt-payoff-calculator', 'Months until debt-free'],
  ['/en/geometry/area-calculator', 'Area (square units)'],
  ['/en/geometry/circle-calculator', 'Area (square units)'],
  ['/en/geometry/pythagorean-theorem-calculator', 'Hypotenuse c'],
  ['/en/geometry/volume-calculator', 'Volume (cubic units)'],
  ['/en/statistics/permutation-combination-calculator', 'Combinations, nCr'],
  ['/en/statistics/z-score-calculator', 'Z-score'],
  ['/en/statistics/probability-calculator', 'P(A or B)'],
  ['/en/physics/speed-distance-time-calculator', 'Average speed'],
  ['/en/physics/kinetic-energy-calculator', 'Kinetic energy (J)'],
  ['/en/electronics/ohms-law-calculator', 'Resistance (Ω)'],
  ['/en/electronics/electricity-cost-calculator', 'Total cost'],
  ['/en/chemistry/molar-mass-calculator', 'Molar mass (g/mol)'],
  ['/en/construction/concrete-calculator', 'Concrete needed (yd³)'],
  ['/en/math/quadratic-formula-calculator', 'Solutions'],
  ['/en/geometry/triangle-calculator', 'Area (square units)'],
  ['/en/math/slope-calculator', 'Slope (m)'],
  ['/en/chemistry/dilution-calculator', 'Dilution factor (C₁ ÷ C₂)'],
  ['/en/statistics/confidence-interval-calculator', 'Confidence interval'],
  ['/en/physics/density-calculator', 'Density in kg/m³'],
  ['/en/electronics/series-parallel-resistor-calculator', 'Parallel resistance (Ω)'],
  ['/en/math/trigonometry-calculator', 'csc (1/sin)'],
  ['/en/chemistry/ideal-gas-law-calculator', 'Temperature (K)'],
  ['/en/physics/force-calculator', 'Weight of the mass at gₙ (N)'],
  ['/en/physics/free-fall-calculator', 'Landing speed (km/h)'],
  ['/en/statistics/sample-size-calculator', 'Sample size needed'],
  ['/en/chemistry/ph-calculator', 'Solution is'],
  ['/en/chemistry/percent-yield-calculator', 'Shortfall (theoretical − actual)'],
  ['/en/physics/projectile-motion-calculator', 'Time of flight (s)'],
  ['/en/statistics/linear-regression-calculator', 'Regression line'],
  ['/en/construction/board-foot-calculator', 'Total board feet'],
  ['/en/electronics/rc-time-constant-calculator', 'Time constant τ (s)'],
  ['/en/physics/work-and-power-calculator', 'Work (kJ)'],
  ['/en/physics/wavelength-frequency-calculator', 'Period (s)'],
  ['/en/finance/vat-calculator', 'Price including VAT'],
  ['/en/physics/momentum-impulse-calculator', 'Final momentum (kg·m/s)'],
  ['/en/physics/pressure-calculator', 'Pressure (kPa)'],
  ['/en/physics/hookes-law-spring-calculator', 'Stored energy (J)'],
  ['/en/statistics/binomial-probability-calculator', 'Mean (np)'],
  ['/en/physics/specific-heat-calculator', 'Heat (kJ)'],
  ['/en/chemistry/half-life-calculator', 'Number of half-lives'],
  ['/en/physics/gravitational-force-calculator', 'Gravitational force (N)'],
  ['/en/statistics/poisson-distribution-calculator', 'Standard deviation √μ'],
  ['/en/physics/pendulum-period-calculator', 'Full swings per minute'],
  ['/en/physics/centripetal-force-calculator', 'Centripetal force (N)'],
  ['/en/physics/thin-lens-equation-calculator', 'Lens power (diopters)'],
  ['/en/electronics/capacitor-energy-calculator', 'Charge Q (C)'],
  ['/en/electronics/voltage-divider-calculator', 'Voltage across R1 (V)'],
  ['/en/geometry/arc-length-sector-area-calculator', 'Chord length'],
  ['/en/geometry/surface-area-calculator', 'Volume (cubic units)'],
  ['/en/chemistry/combined-gas-law-calculator', 'PV ÷ T (stays constant)'],
  ['/en/math/system-of-equations-calculator', 'Determinant D'],
  ['/en/physics/doppler-effect-calculator', 'Frequency ratio'],
  ['/en/physics/buoyancy-calculator', 'Mass of fluid displaced (kg)'],
  ['/en/math/prime-factorization-calculator', 'Number of divisors'],
  ['/en/statistics/percentile-calculator', 'Interquartile range (IQR)'],
  ['/en/electronics/coulombs-law-calculator', 'Field of charge 1 at that distance (N/C)'],
  ['/en/physics/torque-calculator', 'Torque (lbf·ft)'],
  ['/en/finance/npv-irr-calculator', 'Profitability index'],
  ['/en/statistics/expected-value-calculator', 'Sum of probabilities'],
  ['/en/chemistry/molarity-calculator', 'Moles of solute'],
  ['/en/statistics/standard-deviation-calculator', 'Sum of squared deviations'],
  ['/en/finance/depreciation-calculator', 'Depreciation schedule'],
  ['/en/physics/potential-energy-calculator', 'Speed after falling that height from rest (m/s)'],
  ['/en/chemistry/percent-composition-calculator', 'Composition by element'],
  ['/en/physics/acceleration-calculator', 'Acceleration in g'],
  ['/en/electronics/reactance-calculator', 'Angular frequency ω (rad/s)'],
  ['/en/chemistry/empirical-formula-calculator', 'Moles and mole ratio'],
  ['/en/physics/snells-law-calculator', 'Speed of light in the second material (m/s)'],
  ['/en/electronics/rlc-impedance-calculator', 'Power factor (cos φ)'],
  ['/en/statistics/t-test-calculator', 'Degrees of freedom'],
  ['/en/physics/orbital-period-calculator', 'Orbital speed (km/h)'],
  ['/en/chemistry/buffer-ph-calculator', 'Base-to-acid ratio'],
  ['/en/statistics/two-sample-t-test-calculator', 'Standard error of the difference'],
  ['/en/physics/collision-calculator', 'Total momentum (kg·m/s)'],
  ['/en/chemistry/gibbs-free-energy-calculator', 'Entropy term TΔS (kJ/mol)'],
  ['/en/construction/stair-calculator', 'Number of treads'],
  ['/en/physics/heat-conduction-calculator', 'Heat flux (W/m²)'],
  ['/en/chemistry/arrhenius-equation-calculator', 'Rate ratio k₂ ÷ k₁'],
  ['/en/electronics/transformer-calculator', 'Turns ratio N_s ÷ N_p'],
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
