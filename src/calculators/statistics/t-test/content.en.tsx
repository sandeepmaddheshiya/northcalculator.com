import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'p') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'One-Sample t-Test Calculator',
  promise: 'Test a sample mean against a claimed value: t statistic, p-value and decision.',
  title: 'One-Sample t-Test Calculator: t Statistic and p-Value',
  description:
    'Run a one-sample t-test from raw data or the mean, standard deviation and sample size: t statistic, degrees of freedom, p-value and critical value.',
  summary:
    'A one-sample t-test checks whether a sample mean differs from a claimed population mean when the population standard deviation is unknown. It measures the gap in standard errors, t = (x̄ − μ₀) ÷ (s ÷ √n), and converts it to a p-value with n − 1 degrees of freedom. A p-value below your significance level is evidence against the claim.',
  synonyms: [
    't-test calculator',
    'p-value from t statistic',
    'hypothesis test for a mean',
    'one sample t test',
    't critical value calculator',
    'student t test calculator',
  ],
  ui: {
    mode: 'Enter',
    'mode.summary': 'Summary statistics',
    'mode.data': 'Raw data',
    n: 'Sample size (n)',
    mean: 'Sample mean (x̄)',
    sd: 'Sample standard deviation (s)',
    data: 'Data values',
    'data.help': 'Separate numbers with commas, spaces or new lines.',
    mu0: 'Hypothesized mean (μ₀)',
    'mu0.help': 'The value claimed by the null hypothesis, H₀: μ = μ₀.',
    tail: 'Alternative hypothesis',
    'tail.two': 'μ ≠ μ₀ (two-tailed)',
    'tail.right': 'μ > μ₀ (right-tailed)',
    'tail.left': 'μ < μ₀ (left-tailed)',
    alpha: 'Significance level (α)',
    'alpha.10': '0.10',
    'alpha.05': '0.05',
    'alpha.01': '0.01',
    'out.p': 'p-value',
    'out.decision': 'Decision',
    'out.t': 't statistic',
    'out.df': 'Degrees of freedom',
    'out.critical': 'Critical value',
    'out.se': 'Standard error (s ÷ √n)',
    'out.mean': 'Sample mean',
    'out.sd': 'Sample standard deviation',
    'decision.reject': 'Reject H₀',
    'decision.keep': 'Do not reject H₀',
    'explain.reject':
      'p = {p} is below α = {a}: the data support μ {sym} {mu} at this significance level.',
    'explain.keep':
      'p = {p} is not below α = {a}: the data do not give enough evidence that μ {sym} {mu}.',
    'step.se': 'Standard error = s ÷ √n.',
    'step.t': 't = (x̄ − μ₀) ÷ standard error.',
    'step.p.two':
      'Two-tailed p-value: twice the t-distribution area beyond |t|, {df} degrees of freedom.',
    'step.p.right':
      'Right-tailed p-value: the t-distribution area above t, {df} degrees of freedom.',
    'step.p.left': 'Left-tailed p-value: the t-distribution area below t, {df} degrees of freedom.',
    'step.decide': 'Reject H₀ when p < α.',
    'warn.two': 'A t-test needs at least two values.',
    'warn.sd': 'The standard deviation must be above zero.',
    'warn.ignored': '{n} entries that are not numbers were skipped.',
    'warn.small':
      'With fewer than 30 values the test assumes the population is roughly normal. Check for strong skew or outliers.',
    rounding: 'p-values are exact to about 12 digits and shown to 6 significant figures.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Test statistic">{'t = (x̄ − μ₀) ÷ (s ÷ √n),  df = n − 1'}</Formula>
      <Formula label="p-value">
        {'right: P(T > t)\nleft: P(T < t)\ntwo-tailed: 2 × P(T > |t|)'}
      </Formula>
      <p>
        The p-value is the chance of a sample mean at least this far from μ₀ if the null hypothesis
        were true. The t distribution has heavier tails than the normal, which allows for the extra
        uncertainty of estimating the standard deviation from the sample; with large samples the two
        are nearly identical.
      </p>
      <p>
        Choose the alternative before looking at the data. A one-tailed test has more power in its
        direction but cannot detect an effect the other way.
      </p>
    </>
  ),
  examples: [
    {
      id: 'scores',
      title: 'Test scores: is the mean above 65?',
      body: (r, fmt) => (
        <p>
          Ten scores average 67 with s = 3.1972, so t = 2 ÷ (3.1972 ÷ √10) = {fmt.sig(o(r, 't'), 4)}{' '}
          on 9 degrees of freedom, and p = <strong>{fmt.sig(o(r), 3)}</strong>. That is below 0.05,
          so the mean is significantly above 65, as in OpenStax <em>Introductory Statistics</em>{' '}
          Example 9.16.
        </p>
      ),
    },
    {
      id: 'conductivity',
      title: 'Conductivity: 11 readings, mean 1.04, s = 0.0659; above 1?',
      body: (r, fmt) => (
        <p>
          t = {fmt.sig(o(r, 't'), 4)} with 10 degrees of freedom gives p ={' '}
          <strong>{fmt.sig(o(r), 2)}</strong>, so reject H₀ at 5% (Example 9.20).
        </p>
      ),
    },
    {
      id: 'nist',
      title: 'NIST: 195 measurements averaging 9.26146 against μ₀ = 5',
      body: (r, fmt) => (
        <p>
          t = {fmt.sig(o(r, 't'), 7)}, far beyond the critical value {fmt.sig(o(r, 'critical'), 5)},
          so H₀ is rejected; the p-value is <strong>effectively zero</strong>.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Not rejecting is not proof.</strong> A large p-value means the data are consistent
        with μ₀, not that μ₀ is true; a small sample may simply lack power.
      </li>
      <li>
        <strong>Significant is not the same as important.</strong> With a huge sample, a tiny
        difference can be significant. Look at the size of x̄ − μ₀ too.
      </li>
      <li>
        <strong>Comparing two groups?</strong> This test compares one sample with a fixed value. Two
        independent samples, or paired before-and-after data, need a different t-test.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do I calculate a one-sample t statistic?',
      a: 'Subtract the hypothesized mean from the sample mean and divide by the standard error, s ÷ √n. Ten scores with mean 67 and s = 3.1972 tested against 65 give t = 2 ÷ 1.0110 ≈ 1.978, with 9 degrees of freedom.',
    },
    {
      q: 'How do I get the p-value from a t statistic?',
      a: 'Find the area of the t distribution with n − 1 degrees of freedom beyond t: above it for a right-tailed test, below for left-tailed, and double the smaller tail for two-tailed. For t = 1.978 with 9 degrees of freedom the right-tail area is about 0.0396.',
    },
    {
      q: 'When should I use a t-test instead of a z-test?',
      a: 'Use a t-test when the population standard deviation is unknown and estimated from the sample, which is almost always. A z-test needs the true population σ. For large samples the results are nearly the same.',
    },
    {
      q: 'What does the critical value mean?',
      a: 'It is the t value that cuts off α in the tail, or α/2 in each tail for a two-tailed test. If your t statistic is beyond it, the p-value is below α. With 194 degrees of freedom and α = 0.05 two-tailed it is 1.9723, as in the NIST e-Handbook.',
    },
  ],
  ogSample: (r, fmt) => `x̄ = 67, s = 3.1972, n = 10 vs 65 → p = ${fmt.sig(o(r), 3)}`,
};
