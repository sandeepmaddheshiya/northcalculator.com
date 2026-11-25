import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'eq') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Binomial Probability Calculator',
  promise: 'Exact and cumulative binomial probabilities, with the mean and standard deviation.',
  title: 'Binomial Probability Calculator: P(X = x), P(X ≤ x) and More',
  description:
    'Find the probability of exactly, at most, at least, fewer than or more than x successes in n independent trials with success chance p, plus the mean and SD.',
  summary:
    'The binomial distribution counts successes in a fixed number n of independent trials, each with the same chance p of success, like heads in coin tosses. The chance of exactly x successes is C(n, x) pˣ(1 − p)ⁿ⁻ˣ. Cumulative probabilities add these up. On average you expect np successes, with a standard deviation of √(np(1 − p)).',
  synonyms: [
    'binomial distribution calculator',
    'binomial pdf calculator',
    'binomial cdf calculator',
    'binompdf binomcdf',
    'probability of x successes',
    'Bernoulli trials calculator',
  ],
  ui: {
    n: 'Number of trials (n)',
    p: 'Probability of success (p)',
    'p.help': 'A decimal from 0 to 1; 41% is 0.41.',
    x: 'Number of successes (x)',
    'out.eq': 'P(X = x)',
    'out.le': 'P(X ≤ x), at most x',
    'out.lt': 'P(X < x), fewer than x',
    'out.ge': 'P(X ≥ x), at least x',
    'out.gt': 'P(X > x), more than x',
    'out.mean': 'Mean (np)',
    'out.sd': 'Standard deviation √(npq)',
    explain: 'The chance of exactly {x} successes in {n} trials is {eq}; of at most {x}, {le}.',
    'step.pmf': 'P(X = x) = C(n, x) × pˣ × (1 − p)ⁿ⁻ˣ.',
    'step.cdf': 'Add the probabilities for every k up to x.',
    'warn.n': 'There must be at least one trial.',
    'warn.p': 'The probability must be between 0 and 1.',
    'warn.x': 'x must be between 0 and n.',
    rounding:
      'Each term is computed with logarithms, so large n stays accurate; results keep 12 significant digits and are shown to 10.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Exactly x">{'P(X = x) = C(n, x) × pˣ × (1 − p)ⁿ⁻ˣ'}</Formula>
      <Formula label="Cumulative">
        {'P(X ≤ x) = P(0) + P(1) + … + P(x)\nP(X ≥ x) = 1 − P(X < x)'}
      </Formula>
      <p>
        C(n, x) counts the ways to choose which trials succeed. The trials must be independent with
        the same p each time, and there must be a fixed number of them. These are the binompdf and
        binomcdf values a graphing calculator gives.
      </p>
    </>
  ),
  examples: [
    {
      id: 'workers',
      title: 'At most 12 of 20 workers, when 41% qualify',
      body: (r, fmt) => (
        <p>
          P(X ≤ 12) = <strong>{fmt.sig(o(r, 'le'), 4)}</strong> and σ = {fmt.sig(o(r, 'sd'), 3)}, as
          in OpenStax <em>Introductory Statistics</em> Example 4.13.
        </p>
      ),
    },
    {
      id: 'catalog',
      title: 'Exactly 2 picks out of 100 from 8 of 560 pages',
      body: (r, fmt) => (
        <p>
          With p = 8/560, P(X = 2) = <strong>{fmt.sig(o(r), 4)}</strong> (Example 4.14: 0.2466).
        </p>
      ),
    },
    {
      id: 'coin',
      title: 'An altered coin with P(heads) = 0.25, tossed 5 times',
      body: (r, fmt) => (
        <p>
          P(4 heads) = <strong>{fmt.sig(o(r), 4)}</strong> and P(more than 3) ={' '}
          {fmt.sig(o(r, 'ge'), 4)}. OpenStax Example 4.11 prints P(5 heads) as 0.0007, but 0.25⁵ =
          0.0009766, so the total is 0.0156 rather than 0.0153.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Check the conditions:</strong> a fixed n, two outcomes per trial, the same p and
        independent trials. Drawing without replacement from a small group breaks independence.
      </li>
      <li>
        <strong>“At least” and “more than” differ</strong> by the single value P(X = x).
      </li>
      <li>
        <strong>Large n:</strong> when np and n(1 − p) are both large, the normal curve with the
        same mean and SD is a close approximation.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'What is the binomial probability formula?',
      a: 'P(X = x) = C(n, x) pˣ(1 − p)ⁿ⁻ˣ, where C(n, x) = n!/(x!(n − x)!) counts the ways to place the successes. For 3 heads in 5 fair coin tosses: C(5, 3) = 10, so P = 10 × 0.5³ × 0.5² = 0.3125.',
    },
    {
      q: 'How do I find the probability of at least one success?',
      a: 'Use the complement: P(X ≥ 1) = 1 − P(X = 0) = 1 − (1 − p)ⁿ. The chance of at least one six in four rolls of a die is 1 − (5/6)⁴ ≈ 0.518.',
    },
    {
      q: 'What are the mean and standard deviation of a binomial distribution?',
      a: 'The mean is np and the standard deviation is √(np(1 − p)). For 200 people each with a 1.5% risk, the expected number is 3, with a standard deviation of about 1.72, as in OpenStax Example 4.15.',
    },
    {
      q: 'What is the difference between binompdf and binomcdf?',
      a: 'binompdf gives the probability of exactly x successes; binomcdf gives the probability of x or fewer. This calculator shows both, plus fewer than, at least and more than x, which follow from them.',
    },
  ],
  ogSample: (r, fmt) => `B(20, 0.41): P(X ≤ 12) = ${fmt.sig(o(r, 'le'), 4)}`,
};
