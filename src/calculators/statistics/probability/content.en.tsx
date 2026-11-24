import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'or') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Probability Calculator',
  promise: 'P(A or B), P(A and B), complements and more for two events.',
  title: 'Probability Calculator: P(A or B), P(A and B), Not A',
  description:
    'Enter the probabilities of two events to find the chance of either, both, neither or exactly one, for independent, mutually exclusive or overlapping events.',
  summary:
    'For two events A and B, the chance that at least one happens is P(A) + P(B) − P(A and B). If the events cannot happen together, P(A and B) is 0. If they are independent, it is P(A) × P(B). The chance an event does not happen is 1 minus its probability. Enter probabilities as decimals from 0 to 1.',
  synonyms: [
    'P(A or B) calculator',
    'P(A and B) calculator',
    'independent events calculator',
    'mutually exclusive events',
    'addition rule probability',
    'complement probability',
  ],
  ui: {
    pa: 'P(A)',
    'p.help': 'A decimal from 0 to 1; 25% is 0.25.',
    pb: 'P(B)',
    relation: 'A and B are',
    'relation.independent': 'Independent',
    'relation.exclusive': 'Mutually exclusive',
    'relation.given': 'Overlapping, P(A and B) known',
    pab: 'P(A and B)',
    'out.or': 'P(A or B)',
    'out.and': 'P(A and B)',
    'out.notA': 'P(not A)',
    'out.notB': 'P(not B)',
    'out.neither': 'P(neither)',
    'out.exactlyOne': 'P(exactly one)',
    explain: 'The chance of A or B is {or} ({pct}); the chance of both is {and}.',
    'step.and.independent': 'Independent events: P(A and B) = P(A) × P(B).',
    'step.and.exclusive': 'Mutually exclusive events cannot happen together.',
    'step.and.given': 'P(A and B) as entered.',
    'step.or': 'Addition rule: P(A or B) = P(A) + P(B) − P(A and B).',
    'warn.range': 'Probabilities must be between 0 and 1.',
    'warn.exclusive':
      'Mutually exclusive events cannot have probabilities that add up to more than 1.',
    'warn.given':
      'P(A and B) must be no larger than the smaller of P(A) and P(B), and at least P(A) + P(B) − 1.',
    rounding: 'Results keep 12 significant digits and are shown to 10.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Addition rule">{'P(A or B) = P(A) + P(B) − P(A and B)'}</Formula>
      <Formula label="Both events">
        {'independent: P(A and B) = P(A) × P(B)\nmutually exclusive: P(A and B) = 0'}
      </Formula>
      <Formula label="Complements">
        {'P(not A) = 1 − P(A)\nP(neither) = 1 − P(A or B)\nP(exactly one) = P(A or B) − P(A and B)'}
      </Formula>
      <p>
        Adding P(A) and P(B) counts the outcomes where both happen twice, so the overlap is
        subtracted once. This is the inclusion–exclusion principle.
      </p>
    </>
  ),
  examples: [
    {
      id: 'die',
      title: 'Rolling an even number or a 3',
      body: (r, fmt) => (
        <p>
          The two cannot happen on one roll, so P = 3/6 + 1/6 = 2/3 ≈{' '}
          <strong>{fmt.sig(o(r), 6)}</strong> (OpenStax <em>Contemporary Mathematics</em>, Example
          7.29).
        </p>
      ),
    },
    {
      id: 'overlap',
      title: 'Overlapping events',
      body: (r, fmt) => (
        <p>
          With P(E) = 0.45, P(F) = 0.6 and P(E and F) = 0.2, P(E or F) = 0.45 + 0.6 − 0.2 ={' '}
          <strong>{fmt.sig(o(r), 6)}</strong> (Example 7.30), and neither happens with probability{' '}
          {fmt.sig(o(r, 'neither'), 6)}.
        </p>
      ),
    },
    {
      id: 'trip',
      title: 'One trip or the other',
      body: (r, fmt) => (
        <p>
          Klaus can take only one vacation: New Zealand with probability 0.6 or Alaska with 0.35.
          The chance he goes to one of them is <strong>{fmt.sig(o(r), 6)}</strong> (OpenStax{' '}
          <em>Introductory Statistics</em>, Example 3.14).
        </p>
      ),
    },
    {
      id: 'independent',
      title: 'Two independent events',
      body: (r, fmt) => (
        <p>
          With P(G) = 0.6 and P(H) = 0.5, both happen with probability 0.6 × 0.5 ={' '}
          <strong>{fmt.sig(o(r, 'and'), 6)}</strong>, as in Example 3.9, and at least one with{' '}
          {fmt.sig(o(r), 6)}.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Mutually exclusive is not independent.</strong> If A and B cannot both happen,
        knowing A happened tells you B did not, so they are dependent (unless one has probability
        0).
      </li>
      <li>
        <strong>&ldquo;At least one&rdquo; is often easiest as a complement:</strong> the chance of
        at least one tail in 3 coin flips is 1 − 1/8 = 7/8.
      </li>
      <li>
        <strong>Percentages:</strong> divide by 100 first, so 35% is 0.35.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'What does independent mean in probability?',
      a: 'Two events are independent when one happening does not change the chance of the other. Coin flips and separate dice rolls are independent. Drawing two cards without putting the first back is not, because the deck has changed. For independent events, P(A and B) = P(A) × P(B).',
    },
    {
      q: 'What does mutually exclusive mean?',
      a: 'Mutually exclusive events cannot happen at the same time, such as rolling a 2 and a 5 on one die. Their overlap is 0, so the chance of either is simply P(A) + P(B). Two outcomes of one roll, one draw or one race are usually mutually exclusive.',
    },
    {
      q: 'When do I add probabilities and when do I multiply?',
      a: 'Add for “or”: the chance of A or B is P(A) + P(B), minus the overlap. Multiply for “and”: the chance of A and then B is P(A) × P(B given A), which is P(A) × P(B) for independent events. Two heads in a row is 0.5 × 0.5 = 0.25.',
    },
    {
      q: 'How do I find the probability of something not happening?',
      a: 'Subtract its probability from 1. If there is a 0.3 chance of rain, there is a 0.7 chance of no rain. The chance of rolling more than 1 on a die is 1 − 1/6 = 5/6.',
    },
  ],
  ogSample: (r, fmt) => `0.45 + 0.6 − 0.2 → P(A or B) = ${fmt.sig(o(r), 6)}`,
};
