import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'result') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Z-Score Calculator',
  promise: 'Turn a value into a z-score and percentile, or a z-score back into a value.',
  title: 'Z-Score Calculator: Standard Score and Percentiles',
  description:
    'Find the z-score of a value from the mean and standard deviation, the share of a normal distribution below and above it, or the value for a z-score.',
  summary:
    'A z-score says how many standard deviations a value lies from the mean: z = (x − μ) ÷ σ. A z-score of 2 is two standard deviations above average, and −1 is one below. For data that follow a normal distribution, the z-score also gives a percentile: about 97.7% of values fall below z = 2.',
  synonyms: [
    'standard score calculator',
    'z score to percentile',
    'z table calculator',
    'normal distribution calculator',
    'how many standard deviations from the mean',
    'z value calculator',
  ],
  ui: {
    mode: 'Find',
    'mode.z': 'Z-score',
    'mode.x': 'Value',
    x: 'Value (x)',
    'x.z': 'Value (x)',
    'x.x': 'Z-score (z)',
    mean: 'Mean (μ)',
    sd: 'Standard deviation (σ)',
    'out.result': 'Z-score',
    'out.result.z': 'Z-score',
    'out.result.x': 'Value (x)',
    'out.below': 'Below (percentile)',
    'out.above': 'Above',
    'out.between': 'Within ±z of the mean',
    'explain.above':
      'The value {x} is {z} standard deviations above the mean. In a normal distribution, {p} of values fall below it.',
    'explain.below':
      'The value {x} is {z} standard deviations below the mean. In a normal distribution, {p} of values fall below it.',
    'step.z': 'z = (x − μ) ÷ σ.',
    'step.x': 'x = μ + zσ.',
    'warn.sd': 'The standard deviation must be greater than 0.',
    'warn.extreme':
      'This is more than 3 standard deviations from the mean, which happens for fewer than 0.3% of values in a normal distribution.',
    rounding:
      'Z-scores and values keep 12 significant digits and are shown to 8. Percentages come from the normal curve, accurate to better than 0.00001%, and are shown to 2 decimals.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Z-score">{'z = (x − μ) ÷ σ\nx = μ + zσ'}</Formula>
      <p>
        μ is the mean and σ the standard deviation. The percentage below a z-score is the area to
        the left of z under the standard normal curve, Φ(z). The calculator uses the Abramowitz and
        Stegun approximation, which matches the NIST/SEMATECH table to all 5 decimals: for example,
        the area between 0 and 1.96 is 0.47500, so 95% of values lie within ±1.96.
      </p>
    </>
  ),
  examples: [
    {
      id: 'height',
      title: 'A height of 168 cm when the mean is 170 cm',
      body: (r, fmt) => (
        <p>
          With σ = 6.28 cm, z = (168 − 170) ÷ 6.28 = <strong>{fmt.sig(o(r), 4)}</strong>, about a
          third of a standard deviation below average. OpenStax <em>Introductory Statistics</em>{' '}
          Example 6.3 rounds this to −0.32.
        </p>
      ),
    },
    {
      id: 'score',
      title: 'A score of 17 when the mean is 5 and σ is 6',
      body: (r, fmt) => (
        <p>
          z = (17 − 5) ÷ 6 = <strong>{fmt.sig(o(r), 4)}</strong>, two standard deviations above the
          mean. In a normal distribution {fmt.pct(o(r, 'below'), 2)} of scores fall below it.
        </p>
      ),
    },
    {
      id: 'reverse',
      title: 'The height with a z-score of 1.27',
      body: (r, fmt) => (
        <p>
          x = 170 + 1.27 × 6.28 = <strong>{fmt.sig(o(r), 8)} cm</strong>. Example 6.3 gives 177.98
          cm.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>The 68–95–99.7 rule:</strong> in a normal distribution about 68% of values lie
        within 1 standard deviation of the mean, 95% within 2 and 99.7% within 3.
      </li>
      <li>
        <strong>Percentiles assume a normal shape.</strong> The z-score itself works for any data,
        but the percentages are only right when the data are roughly bell-shaped.
      </li>
      <li>
        <strong>Comparing different tests:</strong> a z-score puts scores from tests with different
        means and spreads on one scale, so the higher z-score is the better relative result.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'What is a good z-score?',
      a: 'It depends on what you measure. A z-score of 0 is exactly average. Above 1 is better than about 84% of a normal population, and above 2 is better than about 97.7%. For things where lower is better, such as race times, a negative z-score is the good one.',
    },
    {
      q: 'Can a z-score be negative?',
      a: 'Yes. A negative z-score means the value is below the mean. A z-score of −1.5 is one and a half standard deviations below average, and about 6.7% of a normal distribution lies below it.',
    },
    {
      q: 'How do I convert a z-score to a percentile?',
      a: 'Find the area under the standard normal curve to the left of the z-score, using a z-table or this calculator. A z-score of 1.28 is about the 90th percentile, 1.645 about the 95th and 2.33 about the 99th.',
    },
    {
      q: 'Should I use the population or sample standard deviation?',
      a: 'Use the population standard deviation σ when you have every value, and the sample standard deviation s when your data are a sample from a larger group. The z-score formula is the same; only the spread you plug in changes.',
    },
  ],
  ogSample: (r, fmt) => `x = 168, μ = 170, σ = 6.28 → z = ${fmt.sig(o(r), 4)}`,
};
