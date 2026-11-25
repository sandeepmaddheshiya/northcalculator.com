import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'mean') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Expected Value Calculator',
  promise: 'The long-run average and spread of a probability distribution or game.',
  title: 'Expected Value Calculator: Mean and SD of a Distribution',
  description:
    'Enter outcomes and their probabilities to get the expected value, variance and standard deviation, with fractions or percentages, to judge bets and decisions.',
  summary:
    'The expected value is what you would average per trial over many repetitions: multiply each outcome by its probability and add. A fair die averages 3.5. For a bet, a negative expected value means you lose on average. The standard deviation measures how far a single result typically lands from that average.',
  synonyms: [
    'expected value formula',
    'mean of a probability distribution',
    'discrete random variable calculator',
    'is this bet worth it',
    'probability distribution standard deviation',
    'expected payoff calculator',
  ],
  ui: {
    pairs: 'Outcomes and probabilities',
    'pairs.help':
      'One outcome per line or separated by semicolons: value, then probability (0.25, 25% or 1/4).',
    'out.mean': 'Expected value (μ)',
    'out.sd': 'Standard deviation (σ)',
    'out.variance': 'Variance (σ²)',
    'out.total': 'Sum of probabilities',
    'out.count': 'Outcomes',
    explain: 'On average the result is {m}, typically varying by about {sd} either way.',
    'step.mean': 'μ = Σ value × probability.',
    'step.var': 'σ² = Σ (value − μ)² × probability; σ is its square root.',
    'warn.none': 'Enter at least one outcome and its probability.',
    'warn.total':
      'The probabilities add up to {t}, not 1. Check for a missing or mistyped outcome.',
    'warn.bad': '{n} lines were not a value and a probability and were skipped.',
    rounding: 'Results keep 12 significant digits and are shown to 10.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Expected value">{'μ = Σ x × P(x)'}</Formula>
      <Formula label="Spread">{'σ² = Σ (x − μ)² × P(x)\nσ = √σ²'}</Formula>
      <p>
        Every possible outcome must be listed and the probabilities must add to 1. For a game, list
        the net gain for each outcome, with losses as negative numbers, so the expected value is
        your average profit or loss per play.
      </p>
    </>
  ),
  examples: [
    {
      id: 'soccer',
      title: 'Soccer days per week: 0, 1 or 2 with 0.2, 0.5, 0.3',
      body: (r, fmt) => (
        <p>
          μ = 0 × 0.2 + 1 × 0.5 + 2 × 0.3 = <strong>{fmt.sig(o(r), 3)}</strong> days, with σ ={' '}
          {fmt.sig(o(r, 'sd'), 3)}, as in OpenStax <em>Introductory Statistics</em> Example 4.3.
        </p>
      ),
    },
    {
      id: 'die',
      title: 'One roll of a fair die',
      body: (r, fmt) => (
        <p>
          Each face has probability 1/6, so μ = (1 + 2 + … + 6) ÷ 6 ={' '}
          <strong>{fmt.sig(o(r), 3)}</strong>, as in OpenStax <em>Contemporary Mathematics</em>{' '}
          Example 7.37.
        </p>
      ),
    },
    {
      id: 'bet',
      title: 'A bet winning $50 with probability 0.2142, otherwise losing $20',
      body: (r, fmt) => (
        <p>
          μ = 50 × 0.2142 − 20 × 0.7858 = <strong>{fmt.sig(o(r), 4)}</strong>, an average loss of
          about $5.01 a bet (Example 4.8).
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Fair game:</strong> an expected value of 0 means neither side has an edge over many
        plays.
      </li>
      <li>
        <strong>One play can still win.</strong> Expected value describes the long run; a large
        standard deviation means individual results swing widely.
      </li>
      <li>
        <strong>Include the stake:</strong> for a $2 ticket that wins $100,000, the win is $99,998
        net, or list −2 and +100,000 as OpenStax does.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do I calculate expected value?',
      a: 'Multiply each possible outcome by its probability and add the results. For a game paying $10 on a six and costing $1 otherwise, E = 10 × 1/6 − 1 × 5/6 ≈ $0.83 per roll, as in OpenStax Contemporary Mathematics.',
    },
    {
      q: 'What does a negative expected value mean?',
      a: 'On average you lose. A bet with an expected value of −$5.01 costs about $5 per play over many plays, even though single plays sometimes win. Casino games are designed to have a negative expected value for the player.',
    },
    {
      q: 'How do I find the standard deviation of a distribution?',
      a: 'Subtract the mean from each outcome, square it, multiply by the outcome’s probability, add these up and take the square root. For 0, 1, 2 with probabilities 0.2, 0.5, 0.3, the squared deviations weighted give 0.49, so σ = 0.7.',
    },
    {
      q: 'Why must the probabilities add to 1?',
      a: 'Together the outcomes must cover everything that can happen, and something certainly happens. If they add to less than 1, an outcome is missing; if more, one is double-counted. The calculator warns when the total is off.',
    },
  ],
  ogSample: (r, fmt) => `0, 1, 2 at 0.2, 0.5, 0.3 → μ = ${fmt.sig(o(r), 3)}`,
};
