import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'equation') => r.outputs[k];

export const content: CalculatorContent = {
  name: 'Linear Regression Calculator',
  promise: 'Line of best fit, correlation and predictions from paired data.',
  title: 'Linear Regression Calculator: Line of Best Fit, r and R²',
  description:
    'Paste paired x and y data to get the least-squares line of best fit, the slope and intercept, the correlation coefficient r, R² and a prediction for any x.',
  summary:
    'Linear regression finds the straight line ŷ = a + bx that makes the squared vertical distances from the data points as small as possible. The slope b is the change in y per unit of x. The correlation r, from −1 to 1, measures how tightly the points follow a line, and r² is the share of variation explained.',
  synonyms: [
    'line of best fit calculator',
    'least squares regression calculator',
    'correlation coefficient calculator',
    'r squared calculator',
    'regression equation calculator',
    'trend line calculator',
  ],
  ui: {
    data: 'Data pairs (x y)',
    'data.help':
      'One pair per line or separated by semicolons; x and y separated by a space or comma.',
    x: 'Predict y at x =',
    'x.help': 'Optional.',
    'out.equation': 'Regression line',
    'out.slope': 'Slope (b)',
    'out.intercept': 'Intercept (a)',
    'out.r': 'Correlation (r)',
    'out.r2': 'R² (coefficient of determination)',
    'out.predicted': 'Predicted y',
    'out.se': 'Residual standard error (s)',
    'out.n': 'Pairs used',
    explain:
      'Across {n} pairs, y rises by {b} for each unit of x; r = {r}, so the line explains {pct} of the variation.',
    'explain.flat': 'All the y values are equal, so the line is flat and correlation is undefined.',
    'step.means': 'Means of x and y.',
    'step.slope': 'Slope = Σ(x − x̄)(y − ȳ) ÷ Σ(x − x̄)².',
    'step.intercept': 'Intercept = ȳ − slope × x̄.',
    'warn.few': 'Enter at least two pairs of numbers.',
    'warn.vertical': 'All the x values are the same, so no line y = a + bx fits.',
    'warn.bad': '{n} line(s) were not two numbers and were skipped.',
    rounding:
      'Uses centred sums for accuracy (it reproduces NIST’s certified Norris results). Results keep 12 significant digits; the equation is shown to 8.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Least squares">
        {'b = Σ(x − x̄)(y − ȳ) ÷ Σ(x − x̄)²\na = ȳ − b·x̄\nŷ = a + bx'}
      </Formula>
      <Formula label="Correlation">{'r = Σ(x − x̄)(y − ȳ) ÷ √(Σ(x − x̄)² · Σ(y − ȳ)²)'}</Formula>
      <p>
        The residual standard error s = √(Σ(y − ŷ)² ÷ (n − 2)) is the typical distance of a point
        from the line. Predictions are reliable only within the range of x values in the data;
        extending the line far beyond them is extrapolation.
      </p>
    </>
  ),
  examples: [
    {
      id: 'exams',
      title: 'Third-exam scores predicting final-exam scores',
      body: (r, fmt) => (
        <p>
          The 11 students give <strong>{String(o(r))}</strong>, with r ={' '}
          {fmt.sig(o(r, 'r') as number, 4)} and r² = {fmt.sig(o(r, 'r2') as number, 4)}, as in
          OpenStax <em>Introductory Statistics</em> Example 12.6 (ŷ = −173.51 + 4.83x). A third-exam
          score of 73 predicts a final of {fmt.sig(o(r, 'predicted') as number, 5)}.
        </p>
      ),
    },
    {
      id: 'perfect',
      title: 'Points exactly on y = 1 + 2x',
      body: (r, fmt) => (
        <p>
          The fit is <strong>{String(o(r))}</strong> with r = {fmt.sig(o(r, 'r') as number, 4)}, and
          at x = 10 it predicts {fmt.sig(o(r, 'predicted') as number, 4)}.
        </p>
      ),
    },
    {
      id: 'cones',
      title: 'Temperature and ice cream sales',
      body: (r, fmt) => (
        <p>
          Nine days of temperature (°F) and cones sold, from OpenStax Table 12.5, fit{' '}
          <strong>{String(o(r))}</strong> with r = {fmt.sig(o(r, 'r') as number, 4)}: about{' '}
          {fmt.sig(o(r, 'slope') as number, 3)} more cones per degree.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Plot first.</strong> A curved pattern or an outlier can give a misleading line even
        when r looks respectable.
      </li>
      <li>
        <strong>Correlation is not causation.</strong> Ice cream sales and sunburn both rise with
        temperature without one causing the other.
      </li>
      <li>
        <strong>Stay inside the data.</strong> OpenStax warns that the exam line is only for
        third-exam scores between 65 and 75.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'What does the slope of a regression line mean?',
      a: 'It is the average change in y for a one-unit increase in x. In the exam example the slope is about 4.83, so each extra point on the third exam goes with about 4.83 more points on the final, on average.',
    },
    {
      q: 'What is a good r value?',
      a: 'It depends on the field. Values near ±1 mean the points lie close to a line, and values near 0 mean little linear relationship. r = 0.66 is a moderate positive correlation; r² = 0.44 says the line explains about 44% of the variation.',
    },
    {
      q: 'What is the difference between r and R²?',
      a: 'r, the correlation coefficient, has a sign showing direction and ranges from −1 to 1. R², its square for a single predictor, ranges from 0 to 1 and is the fraction of the variation in y accounted for by the line.',
    },
    {
      q: 'How should I enter my data?',
      a: 'Type or paste each x and y pair on its own line, or separate pairs with semicolons, with a space or comma between x and y. A pasted two-column spreadsheet selection works because the columns arrive separated by tabs.',
    },
  ],
  ogSample: (r) => `11 exam scores → ${String(o(r))}`,
};
