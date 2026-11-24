import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'interval') => r.outputs[k];

export const content: CalculatorContent = {
  name: 'Confidence Interval Calculator',
  promise: 'A confidence interval and margin of error for a mean or a proportion.',
  title: 'Confidence Interval Calculator: Mean or Proportion, 90–99%',
  description:
    'Find a confidence interval and margin of error for a mean (t or z) or a proportion, at any confidence level, with the critical value and the Wilson interval.',
  summary:
    'A confidence interval is an estimate plus or minus a margin of error. For a mean, the margin is a critical value times the standard error, s ÷ √n. For a proportion it is z times √(p̂(1 − p̂) ÷ n). A 95% level means that intervals built this way capture the true value in 95% of samples, not that this one has a 95% chance.',
  synonyms: [
    'margin of error calculator',
    'confidence interval for the mean',
    'confidence interval for a proportion',
    't interval calculator',
    'z interval calculator',
    '95% confidence interval',
  ],
  ui: {
    type: 'Interval for a',
    'type.mean': 'Mean',
    'type.proportion': 'Proportion',
    mean: 'Sample mean (x̄)',
    sd: 'Standard deviation',
    sdKind: 'Standard deviation is',
    'sdKind.sample': 'From the sample (s), use t',
    'sdKind.population': 'Known for the population (σ), use z',
    successes: 'Successes (x)',
    n: 'Sample size (n)',
    level: 'Confidence level (%)',
    'level.help': 'Usually 90, 95 or 99.',
    'out.interval': 'Confidence interval',
    'out.margin': 'Margin of error',
    'out.lower': 'Lower limit',
    'out.upper': 'Upper limit',
    'out.critical': 'Critical value (t or z)',
    'out.se': 'Standard error',
    'out.wilson': 'Wilson interval',
    'explain.mean': 'With {level}% confidence, the population mean is between {lo} and {hi}.',
    'explain.proportion':
      'With {level}% confidence, the population proportion is between {lo} and {hi}.',
    'step.t': 'Critical value from the t distribution with n − 1 degrees of freedom.',
    'step.z': 'Critical value from the standard normal distribution.',
    'step.se': 'Standard error = standard deviation ÷ √n.',
    'step.margin': 'Margin of error = critical value × standard error.',
    'step.p': 'Sample proportion p̂ = x ÷ n.',
    'step.ebp': 'Margin of error = z × √(p̂(1 − p̂) ÷ n).',
    'warn.level': 'The confidence level must be between 0 and 100%.',
    'warn.successes': 'Successes cannot be more than the sample size.',
    'warn.sd': 'The standard deviation cannot be negative.',
    'warn.n': 'A t interval needs a sample of at least 2.',
    'warn.small':
      'Fewer than 6 successes or failures: the normal approximation is unreliable here, so prefer the Wilson interval.',
    rounding:
      'Critical values are computed to about 15 digits rather than read from a table. Mean intervals are shown to 8 significant digits and proportions to 5 decimals.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Mean">{'x̄ ± t(1 − α/2, n − 1) × s ÷ √n\nx̄ ± z(1 − α/2) × σ ÷ √n'}</Formula>
      <Formula label="Proportion">{'p̂ ± z × √(p̂(1 − p̂) ÷ n)'}</Formula>
      <p>
        α is 1 minus the confidence level, so a 95% interval uses the 97.5th percentile: z = 1.96,
        or t with n − 1 degrees of freedom when the standard deviation comes from the sample, as the
        NIST/SEMATECH handbook does. OpenStax uses z with a known σ. For proportions, the calculator
        also gives the Wilson interval, which NIST recommends because it behaves better for small
        samples and proportions near 0 or 1.
      </p>
    </>
  ),
  examples: [
    {
      id: 'nist',
      title: '195 measurements, mean 9.261460, s = 0.022789',
      body: (r, fmt) => (
        <p>
          t(0.975, 194) = {fmt.sig(o(r, 'critical') as number, 5)}, so the 95% interval is{' '}
          <strong>{String(o(r))}</strong>. The NIST/SEMATECH handbook prints (9.258242, 9.264679)
          from the unrounded data.
        </p>
      ),
    },
    {
      id: 'heights',
      title: 'Mean 68, σ = 3, n = 36, 95%',
      body: (r, fmt) => (
        <p>
          1.96 × 3 ÷ 6 ≈ {fmt.sig(o(r, 'margin') as number, 4)}, giving{' '}
          <strong>{String(o(r))}</strong>, which OpenStax <em>Introductory Statistics</em> Example
          8.4 rounds to (67.02, 68.98).
        </p>
      ),
    },
    {
      id: 'poll',
      title: '421 of 500 people said yes, 95%',
      body: (r) => (
        <p>
          p̂ = 0.842, and the interval is <strong>{String(o(r))}</strong>, about 81.0% to 87.4%
          (Example 8.10). The Wilson interval is {String(o(r, 'wilson'))}.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Wider is more confident.</strong> Raising the level from 90% to 99% widens the
        interval; collecting more data narrows it, by a factor of √n.
      </li>
      <li>
        <strong>Use t when the standard deviation comes from your data,</strong> which is almost
        always. With large samples t and z give nearly the same answer.
      </li>
      <li>
        <strong>Random samples only.</strong> No formula fixes a biased sample, such as a poll that
        only reaches people who volunteer.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'What does a 95% confidence interval mean?',
      a: 'If you repeated the sampling many times and built an interval each time, about 95% of those intervals would contain the true value. Any single interval either contains it or not; the 95% describes how reliable the method is.',
    },
    {
      q: 'What is the margin of error?',
      a: 'It is half the width of the interval: the critical value times the standard error. A poll reporting 52% with a margin of 3 points means the interval is 49% to 55%. Quadrupling the sample size halves the margin.',
    },
    {
      q: 'When should I use t instead of z?',
      a: 'Use t when the standard deviation is estimated from the sample, which is the usual case. The t distribution has heavier tails, so its critical values are larger for small samples: 2.228 with 10 degrees of freedom versus 1.96 for z at 95%.',
    },
    {
      q: 'What are the z values for 90%, 95% and 99%?',
      a: 'They are 1.645, 1.960 and 2.576, the points that leave 5%, 2.5% and 0.5% in each tail of the standard normal curve. This calculator computes them, and the t values, for any confidence level you enter.',
    },
  ],
  ogSample: (r) => `x̄ = 68, σ = 3, n = 36 → 95% CI ${String(o(r))}`,
};
