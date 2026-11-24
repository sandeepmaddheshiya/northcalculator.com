import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'change') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Percentage Change Calculator',
  promise: 'The percent increase or decrease from an old value to a new one.',
  title: 'Percentage Change Calculator: Percent Increase or Decrease',
  description:
    'Find the percentage increase or decrease between an old and a new value, the change that would reverse it, and the multiplier. Works with negative values.',
  summary:
    'Percentage change measures how much a value moved relative to where it started. Subtract the original value from the new value, divide by the original, and multiply by 100. A positive result is an increase and a negative one a decrease. The same move in reverse is a different percentage, because the starting point changes.',
  synonyms: [
    'percent increase calculator',
    'percent decrease calculator',
    'percent change calculator',
    'percentage increase',
    'percentage decrease',
    'how much did it go up',
  ],
  ui: {
    from: 'Original value',
    to: 'New value',
    'out.change': 'Percentage change',
    'out.difference': 'Change in value',
    'out.multiplier': 'New value as a multiple of the original',
    'out.reverse': 'Change needed to go back',
    'explain.up': 'Going from {a} to {b} is an increase of {r}.',
    'explain.down': 'Going from {a} to {b} is a decrease of {r}.',
    'explain.same': '{a} and {b} are equal, so there is no change.',
    'step.difference': 'Subtract the original value from the new value.',
    'step.divide': 'Divide by the original value (its size, if it is negative).',
    'step.percent': 'Multiply by 100.',
    'warn.zero':
      'The original value is zero, so a percentage change is undefined. Quote the change in value instead.',
    'warn.negative':
      'One of the values is negative. The change is measured against the size of the original, so the sign still means up or down, but interpret it with care.',
    rounding:
      'Calculated in double precision; the percentage is rounded half-up to 4 decimal places and shown to 2.',
  },
  HowItWorks: () => (
    <>
      <p>
        OpenStax <em>Prealgebra</em> describes it in two steps: find the amount of the increase or
        decrease, then express it as a percent of the original amount.
      </p>
      <Formula
        label="Percentage change"
        where={[
          { symbol: 'V₀', meaning: 'original (old) value' },
          { symbol: 'V₁', meaning: 'new value' },
        ]}
      >
        {'change = (V₁ − V₀) ÷ |V₀| × 100'}
      </Formula>
      <p>
        The original value is always the reference. That is why a rise from 80 to 100 is +25%, but
        the fall from 100 back to 80 is −20%. The calculator shows the change that would undo yours
        so you can see this asymmetry directly.
      </p>
      <Formula label="Undoing a change">{'reverse = (V₀ − V₁) ÷ |V₁| × 100'}</Formula>
      <p>
        Dividing by the absolute value |V₀| keeps the sign honest when the original is negative. A
        loss shrinking from −50 to −20 is a move upward, so it shows as +60%, not −60%.
      </p>
    </>
  ),
  examples: [
    {
      id: 'fees',
      title: 'College fees rising from $26 to $36 a unit',
      body: (r, fmt) => (
        <p>
          The increase is $10, and 10 ÷ 26 = 0.3846…, so the fees rose by{' '}
          <strong>{fmt.pct(o(r), 2)}</strong>. OpenStax’s Example 6.23 rounds this to 38.5%. Note
          that $10 is 27.8% of the new fee: always divide by the old value.
        </p>
      ),
    },
    {
      id: 'gas',
      title: 'Gas falling from $3.71 to $3.64 a gallon',
      body: (r, fmt) => (
        <p>
          The price dropped 7 cents. 0.07 ÷ 3.71 gives a change of{' '}
          <strong>{fmt.pct(o(r), 2)}</strong>, the 1.9% decrease in OpenStax’s Example 6.24. Small
          absolute moves on a large base give small percentages.
        </p>
      ),
    },
    {
      id: 'roundtrip',
      title: 'Why a 25% fall needs a 33% rise to recover',
      body: (r, fmt) => (
        <p>
          A share price falls from 80 to 60, a change of <strong>{fmt.pct(o(r), 2)}</strong>. To get
          back to 80, it has to rise by 20 on a base of 60, which is {fmt.pct(o(r, 'reverse'), 2)}.
          Losses always need a larger percentage gain to recover.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Say which way you measured.</strong> “Prices are 20% lower than last year” and “last
        year’s prices were 25% higher” describe the same two numbers. Name the starting point when
        you report a change.
      </li>
      <li>
        <strong>Rates change in points.</strong> When the values are themselves percentages, such as
        an interest rate going from 2% to 3%, the move is 1 percentage point, or a 50% change. Say
        which one you mean.
      </li>
      <li>
        <strong>Over several years, use the compound rate.</strong> A 60% rise over five years is
        not 12% a year. The yearly equivalent is about 9.9%, which the CAGR calculator works out.
      </li>
      <li>
        <strong>Changes from near zero explode.</strong> Going from 1 to 4 is +300%. When the
        original is tiny, the absolute change usually tells the story better.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do I calculate a percentage increase?',
      a: 'Subtract the old value from the new value, divide the result by the old value, and multiply by 100. If rent goes from $1,200 to $1,290, the increase is $90, and 90 ÷ 1,200 = 0.075, so the rent rose by 7.5%.',
    },
    {
      q: 'How do I calculate a percentage decrease?',
      a: 'Use the same formula: (new − old) ÷ old × 100. The answer comes out negative, which means a decrease. A laptop that drops from $900 to $765 changes by −135 ÷ 900 = −15%, so it is 15% cheaper.',
    },
    {
      q: 'Why is going up 50% and then down 50% not back to the start?',
      a: 'Each percentage is taken of a different base. Up 50% from 100 gives 150. Down 50% of 150 removes 75, leaving 75. The fall is measured from the higher value, so it removes more than the rise added.',
    },
    {
      q: 'Can percentage change be more than 100%?',
      a: 'An increase can be any size: going from 20 to 70 is +250%, and doubling is +100%. A decrease of a positive quantity stops at −100%, which means it fell to zero. Values below zero, like a profit turning into a loss, can go further.',
    },
    {
      q: 'What is the difference between percentage change and percentage difference?',
      a: 'Percentage change has a direction, an old value and a new one, and divides by the old value. Percentage difference compares two values with no order and divides by their average. Use change for before-and-after figures and difference for comparing two measurements side by side.',
    },
  ],
  ogSample: (r, fmt) => `$26 → $36: +${fmt.pct(o(r), 2)}`,
};
