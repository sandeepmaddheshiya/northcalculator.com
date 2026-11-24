import type { CalculatorDefinition } from '@/calculators/types';

export const definition: CalculatorDefinition = {
  id: 'linear-regression',
  slug: { en: 'linear-regression-calculator' },
  category: 'statistics',
  tags: [
    'linear regression',
    'line of best fit',
    'least squares',
    'correlation coefficient',
    'r squared',
    'slope and intercept',
  ],
  difficulty: 'advanced',
  ymyl: false,
  schemaCategory: 'EducationalApplication',
  roundingKey: 'rounding',
  inputs: [
    {
      id: 'data',
      param: 'd',
      type: 'text',
      labelKey: 'data',
      default:
        '65 175; 67 133; 71 185; 71 163; 66 126; 75 198; 67 153; 70 163; 71 159; 69 151; 69 159',
      maxLength: 20000,
      helpKey: 'data.help',
    },
    {
      id: 'x',
      param: 'x',
      type: 'number',
      labelKey: 'x',
      default: 73,
      allowNegative: true,
      min: -1e12,
      max: 1e12,
      helpKey: 'x.help',
    },
  ],
  outputs: [
    { id: 'equation', labelKey: 'out.equation', format: 'text', primary: true },
    { id: 'slope', labelKey: 'out.slope', format: 'sig', decimals: 10 },
    { id: 'intercept', labelKey: 'out.intercept', format: 'sig', decimals: 10 },
    { id: 'r', labelKey: 'out.r', format: 'sig', decimals: 10 },
    { id: 'r2', labelKey: 'out.r2', format: 'sig', decimals: 10 },
    { id: 'predicted', labelKey: 'out.predicted', format: 'sig', decimals: 10 },
    { id: 'se', labelKey: 'out.se', format: 'sig', decimals: 10 },
    { id: 'n', labelKey: 'out.n', format: 'integer' },
  ],
  sources: [
    {
      title: 'Introductory Statistics 2e, 12.3 The Regression Equation',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/introductory-statistics-2e/pages/12-3-the-regression-equation',
      accessed: '2026-11-24',
      locator:
        'ŷ = a + bx, b = Σ(x − x̄)(y − ȳ) ÷ Σ(x − x̄)², a = ȳ − b·x̄; Example 12.6: 11 third-exam and final-exam scores → ŷ = −173.51 + 4.83x, r = 0.6631, r² = 0.4397, s = 16.41237711',
    },
    {
      title: 'NIST Statistical Reference Datasets: Linear Least Squares Regression, Norris',
      publisher: 'National Institute of Standards and Technology',
      url: 'https://www.itl.nist.gov/div898/strd/lls/data/LINKS/DATA/Norris.dat',
      accessed: '2026-11-24',
      locator:
        '36 observations; certified B0 = −0.262323073774029, B1 = 1.00211681802045, residual SD 0.884796396144373, R² = 0.999993745883712',
    },
  ],
  review: { status: 'pending' },
  draftedWith: 'ai-assisted',
  version: '1.0.0',
  changelog: [{ version: '1.0.0', date: '2026-11-24', note: 'First published.' }],
  related: ['average', 'slope', 'confidence-interval'],
  examples: [
    {
      id: 'exams',
      inputs: {
        data: '65 175; 67 133; 71 185; 71 163; 66 126; 75 198; 67 153; 70 163; 71 159; 69 151; 69 159',
        x: 73,
      },
      expect: { slope: 4.82739420935, intercept: -173.513363029 },
    },
    {
      id: 'perfect',
      inputs: { data: '1 3; 2 5; 3 7; 4 9', x: 10 },
      expect: { equation: 'ŷ = 1 + 2x', predicted: 21, r: 1 },
    },
    {
      id: 'cones',
      inputs: {
        data: '70 105; 85 240; 65 49; 72 147; 80 231; 61 38; 75 193; 78 196; 68 89',
        x: 74,
      },
      expect: { n: 9 },
    },
  ],
  locales: ['en'],
  contentUpdated: '2026-11-24',
};
