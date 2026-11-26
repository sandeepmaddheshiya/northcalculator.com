import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'below') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Exponential Distribution Calculator',
  promise: 'Waiting-time probabilities, percentiles and reliability for the exponential model.',
  title: 'Exponential Distribution Calculator: P(X < x) and Percentile',
  description:
    'Find exponential distribution probabilities for waiting times or lifetimes: P(X < x), P(X > x), the chance between two values, percentiles and the median.',
  summary:
    'The exponential distribution models the time until an event when events happen at a steady average rate: the wait for the next customer, or the life of a part that does not wear out. With mean μ, the chance of waiting longer than x is e^(−x/μ). It is memoryless: having waited already does not change the odds of the wait ahead.',
  synonyms: [
    'exponential probability calculator',
    'waiting time calculator',
    'exponential CDF calculator',
    'reliability function calculator',
    'mean time between failures probability',
    'memoryless distribution',
  ],
  ui: {
    by: 'Describe it by',
    'by.mean': 'Mean μ',
    'by.rate': 'Rate m (or λ)',
    param: 'Value',
    'param.mean': 'Mean time μ',
    'param.rate': 'Rate per unit time m',
    x: 'Value x',
    x2: 'Second value (optional)',
    'x2.help': 'For the probability between x and this value; leave 0 to skip.',
    pct: 'Percentile to find',
    'out.below': 'P(X < x)',
    'out.above': 'P(X > x)',
    'out.between': 'P(x < X < second value)',
    'out.pdf': 'Density f(x)',
    'out.percentile': 'Percentile value',
    'out.mean': 'Mean (and standard deviation)',
    'out.median': 'Median',
    'out.rate': 'Rate m = 1/μ',
    explain: 'There is a {p} chance the wait is under {x}, when the mean is {mean}.',
    'step.m': 'Decay rate m = 1 ÷ μ.',
    'step.below': 'P(X < x) = 1 − e^(−mx).',
    'step.between': 'P(x₁ < X < x₂) = e^(−mx₁) − e^(−mx₂).',
    'step.pct': 'Percentile k = −ln(1 − p) ÷ m.',
    'warn.param': 'The mean or rate must be above zero.',
    'warn.x': 'Waiting times cannot be negative.',
    'warn.x2': 'The second value should be larger than x to give a probability between them.',
    rounding: 'Probabilities are exact to about 15 digits and shown to 6 significant figures.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Probabilities">
        {'P(X < x) = 1 − e^(−mx)\nP(X > x) = e^(−mx),  m = 1 ÷ μ'}
      </Formula>
      <Formula label="Summary values">
        {'mean = σ = 1 ÷ m\nmedian = ln 2 ÷ m\nk-th percentile = −ln(1 − k) ÷ m'}
      </Formula>
      <p>
        The mean and standard deviation are equal, and the median is only about 69% of the mean:
        most waits are short, but a long tail of occasional long ones pulls the average up.
      </p>
      <p>
        In reliability work the same model gives R(t) = e^(−λt), the chance a part survives to time
        t when it fails at a constant rate λ.
      </p>
    </>
  ),
  examples: [
    {
      id: 'parts',
      title: 'A computer part lasting 10 years on average: does it last more than 7?',
      body: (r, fmt) => (
        <p>
          P(X &gt; 7) = e^(−0.7) = <strong>{fmt.sig(o(r, 'above'), 4)}</strong>, and the 80th
          percentile is {fmt.sig(o(r, 'percentile'), 3)} years, as in OpenStax{' '}
          <em>Introductory Statistics</em> Example 5.9.
        </p>
      ),
    },
    {
      id: 'clerk',
      title: 'A clerk spending 4 minutes per customer on average: between 4 and 5 minutes?',
      body: (r, fmt) => (
        <p>
          P(4 &lt; X &lt; 5) = <strong>{fmt.sig(o(r, 'between'), 3)}</strong>, and half of all
          customers take less than {fmt.sig(o(r, 'percentile'), 2)} minutes (Example 5.8).
        </p>
      ),
    },
    {
      id: 'reliability',
      title: 'A failure rate of 0.01 per hour, at 100 hours',
      body: (r, fmt) => (
        <p>
          The chance of failure by 100 hours is <strong>{fmt.sig(o(r), 4)}</strong>: one mean
          lifetime always gives 1 − e⁻¹, as in the NIST e-Handbook example.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Memoryless:</strong> P(X &gt; 17 | X &gt; 10) = P(X &gt; 7). A part that has
        survived 10 years is as good as new under this model.
      </li>
      <li>
        <strong>Linked to the Poisson distribution:</strong> if events arrive at a Poisson rate of
        30 per hour, the time between them is exponential with a mean of 2 minutes.
      </li>
      <li>
        <strong>Not for wear-out:</strong> things that age, like car tyres, fail more often as they
        get older, which the exponential model cannot capture.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do I calculate an exponential probability?',
      a: 'Find the rate m = 1/μ, then P(X < x) = 1 − e^(−mx) and P(X > x) = e^(−mx). With a 10-year mean lifetime, the chance a part lasts more than 7 years is e^(−0.7) ≈ 0.4966.',
    },
    {
      q: 'What does memoryless mean?',
      a: 'The probability of waiting a further t units does not depend on how long you have already waited: P(X > r + t | X > r) = P(X > t). After 4 minutes with no customer, the chance of waiting 3 more is the same as at the start.',
    },
    {
      q: 'How do I find a percentile of the exponential distribution?',
      a: 'Solve 1 − e^(−mk) = p for k: k = −ln(1 − p)/m. For a mean of 10 years, the 80th percentile is −ln(0.2) × 10 ≈ 16.1 years. The median is ln 2 times the mean.',
    },
    {
      q: 'Why are the mean and standard deviation equal?',
      a: 'For an exponential distribution both equal 1/m, a property of its shape. A mean wait of 12 minutes means a standard deviation of 12 minutes too, reflecting how widely individual waits vary.',
    },
  ],
  ogSample: (r, fmt) => `Mean 10 years → P(X > 7) = ${fmt.sig(o(r, 'above'), 4)}`,
};
