import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'eq') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Poisson Distribution Calculator',
  promise: 'Probabilities for how many events happen in an interval, from the average rate.',
  title: 'Poisson Distribution Calculator: P(X = x) and Cumulative',
  description:
    'Find the Poisson probability of exactly, at most, at least, fewer or more than x events in an interval, from the average μ, plus the standard deviation √μ.',
  summary:
    'The Poisson distribution models how many times an event happens in a fixed interval of time or space when events occur independently at a steady average rate, such as calls per hour or typos per page. With an average of μ, the chance of exactly x events is μˣe^(−μ) ÷ x!. The mean and the variance are both μ.',
  synonyms: [
    'Poisson probability calculator',
    'poissonpdf poissoncdf',
    'events per hour probability',
    'Poisson cdf calculator',
    'rare events calculator',
    'arrival rate probability',
  ],
  ui: {
    mean: 'Average number of events (μ)',
    'mean.help': 'Scale it to your interval: 12 per hour is 2 per 10 minutes.',
    x: 'Number of events (x)',
    'out.eq': 'P(X = x)',
    'out.le': 'P(X ≤ x), at most x',
    'out.lt': 'P(X < x), fewer than x',
    'out.ge': 'P(X ≥ x), at least x',
    'out.gt': 'P(X > x), more than x',
    'out.sd': 'Standard deviation √μ',
    explain: 'With an average of {mu}, P(X = {x}) is {eq} and P(X ≤ {x}) is {le}.',
    'step.pmf': 'P(X = x) = μˣ × e^(−μ) ÷ x!.',
    'step.cdf': 'Add the probabilities below and above x.',
    'warn.mean': 'The average cannot be negative.',
    'warn.x': 'x must be a whole number of 0 or more.',
    rounding:
      'Terms are computed with logarithms, so large means stay accurate. Results are shown to 10 significant digits.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Exactly x">{'P(X = x) = μˣ × e^(−μ) ÷ x!'}</Formula>
      <Formula label="Mean and spread">{'mean = μ, variance = μ, SD = √μ'}</Formula>
      <p>
        μ must match the interval you ask about. OpenStax’s example of 6 calls in 2 hours becomes μ
        = 0.75 for a 15-minute window. The Poisson distribution also approximates the binomial when
        n is large and p small, with μ = np.
      </p>
    </>
  ),
  examples: [
    {
      id: 'calls',
      title: 'More than 1 call in 15 minutes, averaging 0.75',
      body: (r, fmt) => (
        <p>
          P(X &gt; 1) = <strong>{fmt.sig(o(r, 'gt'), 4)}</strong>, as in OpenStax{' '}
          <em>Introductory Statistics</em> Example 4.29 (0.1734).
        </p>
      ),
    },
    {
      id: 'email',
      title: 'Exactly 160 emails on a day averaging 147',
      body: (r, fmt) => (
        <p>
          P(X = 160) = <strong>{fmt.sig(o(r), 4)}</strong> and P(X ≤ 160) = {fmt.sig(o(r, 'le'), 4)}
          , with SD = √147 ≈ {fmt.sig(o(r, 'sd'), 6)} (Example 4.30).
        </p>
      ),
    },
    {
      id: 'texts',
      title: 'Exactly 2 texts in an hour, at 41.5 a day',
      body: (r, fmt) => (
        <p>
          μ = 41.5 ÷ 24 ≈ 1.7292 per hour, so P(X = 2) = <strong>{fmt.sig(o(r), 4)}</strong> and P(X
          &gt; 2) = {fmt.sig(o(r, 'gt'), 4)} (Example 4.31).
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Check the assumptions:</strong> events must be independent and the rate steady.
        Rush-hour bursts or clustered arrivals break the model.
      </li>
      <li>
        <strong>Mean ≈ variance</strong> is a quick test: if your counts vary much more than their
        average, the data are overdispersed.
      </li>
      <li>
        <strong>None at all:</strong> P(X = 0) = e^(−μ), so with μ = 2 there is a 13.5% chance of no
        events.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'When should I use the Poisson distribution?',
      a: 'For counts of events in a fixed interval when events happen independently at a constant average rate: customers per hour, defects per metre of cable, goals per match. Unlike the binomial, there is no fixed number of trials and no upper limit on the count.',
    },
    {
      q: 'What is the formula for Poisson probability?',
      a: 'P(X = x) = μˣ e^(−μ) ÷ x!, where μ is the average number of events in the interval. With μ = 2, the chance of exactly 3 events is 2³ × e⁻² ÷ 6 ≈ 0.1804.',
    },
    {
      q: 'How do I change the interval?',
      a: 'Scale the mean in proportion. If a bakery sells 12 loaves per half hour, the mean for 5 minutes is 12 × 5 ÷ 30 = 2. If calls average 3 per hour, the mean for a working day of 8 hours is 24.',
    },
    {
      q: 'How is the Poisson related to the binomial?',
      a: 'When the number of trials n is large and the success chance p is small, the binomial is close to a Poisson with μ = np. OpenStax compares B(200, 0.0102) at 10 successes, about 0.000039, with the Poisson value 0.000045.',
    },
  ],
  ogSample: (r, fmt) => `μ = 0.75: P(X > 1) = ${fmt.sig(o(r, 'gt'), 4)}`,
};
