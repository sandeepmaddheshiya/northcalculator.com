import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const num = (r: { outputs: Record<string, unknown> }) => r.outputs.result as number;

export const content: CalculatorContent = {
  name: 'Percentage Calculator',
  promise:
    'Percent of a number, percentage change, difference and reverse percentages, with the working shown.',
  title: 'Percentage Calculator: Percent Of, Change and Reverse',
  description:
    'Work out X% of Y, what percent one number is of another, percentage increase or decrease, percentage difference and the original value before a change.',
  summary:
    'A percentage is a number divided by 100, so 15% means 0.15. To find a percent of a number, multiply the number by the percentage and divide by 100. Percentage change compares the difference with the starting value. Percentage difference compares it with the average of both values. Reverse percentage divides by 1 plus the change, which is how you recover a price before a discount or tax.',
  synonyms: [
    'percent calculator',
    'percent of a number',
    'percentage change calculator',
    'percent increase',
    'percent decrease',
    'reverse percentage',
    'percentage difference',
  ],
  ui: {
    mode: 'What do you want to work out?',
    'mode.of': 'X% of a number',
    'mode.is': 'X is what percent of Y',
    'mode.whole': 'X is P% of what number',
    'mode.change': 'Percentage change from A to B',
    'mode.diff': 'Percentage difference between A and B',
    'mode.increase': 'Increase a number by P%',
    'mode.decrease': 'Decrease a number by P%',
    'mode.original': 'Original value before a P% change',
    'a.of': 'Percentage (%)',
    'b.of': 'Of the number',
    'a.is': 'Part (X)',
    'b.is': 'Whole (Y)',
    'a.whole': 'Part (X)',
    'b.whole': 'Percentage (%)',
    'a.change': 'Starting value (A)',
    'b.change': 'Final value (B)',
    'a.diff': 'Value A',
    'b.diff': 'Value B',
    'a.increase': 'Starting value',
    'b.increase': 'Increase by (%)',
    'a.decrease': 'Starting value',
    'b.decrease': 'Decrease by (%)',
    'a.original': 'Value after the change',
    'b.original': 'Change that was applied (%, negative for a decrease)',
    a: 'First value',
    b: 'Second value',
    result: 'Result',
    'explain.of': '{a}% of {b} is {r}.',
    'explain.is': '{a} is {r}% of {b}.',
    'explain.whole': '{a} is {b}% of {r}.',
    'explain.increase': 'Going from {a} to {b} is an increase of {r}%.',
    'explain.decrease': 'Going from {a} to {b} is a decrease of {r}%.',
    'explain.diff': '{a} and {b} differ by {r}% of their average.',
    'explain.increaseBy': '{a} increased by {b}% is {r}.',
    'explain.decreaseBy': '{a} decreased by {b}% is {r}.',
    'explain.original': 'A value of {r} changed by {b}% gives {a}.',
    'step.toDecimal': 'Convert {a}% to a decimal by dividing by 100.',
    'step.multiply': 'Multiply by {b}.',
    'step.divide': 'Divide the part ({a}) by the whole ({b}).',
    'step.toPercent': 'Multiply by 100 to express it as a percentage.',
    'step.divideBy': 'Divide the part ({a}) by that decimal.',
    'step.difference': 'Subtract the starting value from the final value.',
    'step.divideStart': 'Divide the difference by the size of the starting value ({a}).',
    'step.absDifference': 'Take the absolute difference between the two values.',
    'step.mean': 'Find the average of the two values.',
    'step.divideMean': 'Divide the difference by the average and multiply by 100.',
    'step.factor.increase': 'Turn the {b}% increase into a multiplier.',
    'step.factor.decrease': 'Turn the {b}% decrease into a multiplier.',
    'step.factor.original': 'Turn the {b}% change into a multiplier.',
    'step.divideFactor': 'Divide the value after the change by the multiplier.',
    'warn.zeroWhole': 'The whole (Y) cannot be zero: nothing is a percentage of zero.',
    'warn.zeroPercent':
      'With a percentage of 0, no number has that part. Enter a non-zero percentage.',
    'warn.zeroStart':
      'Percentage change from zero is undefined. Any increase from 0 is infinitely large in relative terms.',
    'warn.zeroMean': 'The two values average to zero, so percentage difference is undefined.',
    'warn.negativeStart':
      'The starting value is negative. The change is measured against its size, so a rise from −50 to −25 counts as +50%.',
    'warn.negativeDiff':
      'Percentage difference is normally used for two positive quantities. With negative values the result is hard to interpret.',
    'warn.over100': 'A decrease of more than 100% takes the value below zero.',
    'warn.minus100': 'A −100% change takes any value to zero, so the original cannot be recovered.',
    rounding:
      'No rounding happens between steps. Results are shown to at most 6 decimal places after removing binary floating-point noise beyond 12 significant digits.',
  },
  HowItWorks: () => (
    <>
      <p>
        Percent means “per hundred”. The International System of Units guidance from NIST treats the
        % symbol as the pure number 0.01, so 15% is exactly 0.15. Every mode on this page is one of
        the following formulas.
      </p>
      <Formula label="Percent of a number">{'result = P ÷ 100 × N'}</Formula>
      <Formula label="What percent X is of Y">{'P = X ÷ Y × 100'}</Formula>
      <Formula label="Whole from a part and a percent">{'Y = X ÷ (P ÷ 100)'}</Formula>
      <Formula
        label="Percentage change"
        where={[
          { symbol: 'A', meaning: 'starting value' },
          { symbol: 'B', meaning: 'final value' },
        ]}
      >
        {'change = (B − A) ÷ |A| × 100'}
      </Formula>
      <Formula label="Percentage difference">
        {'difference = |A − B| ÷ ((A + B) ÷ 2) × 100'}
      </Formula>
      <Formula label="Increase, decrease and reverse">
        {
          'increased = N × (1 + P ÷ 100)\ndecreased = N × (1 − P ÷ 100)\noriginal  = V ÷ (1 + P ÷ 100)'
        }
      </Formula>
      <p>
        <strong>Change versus difference.</strong> Use percentage change when there is a direction:
        a before and an after, an old price and a new one. Use percentage difference when neither
        value is the reference, for example comparing two shops’ prices or two lab measurements. The
        difference divides by the average, so swapping A and B gives the same answer. Swapping them
        in percentage change does not.
      </p>
      <p>
        <strong>Why reverse percentages divide.</strong> If a price rose by 20% to 120, the original
        is 120 ÷ 1.2 = 100. Taking 20% off 120 gives 96, which is wrong, because the 20% was a share
        of the original price, not the new one.
      </p>
    </>
  ),
  examples: [
    {
      id: 'tip',
      title: 'A 20% tip on a $64.50 bill',
      body: (r, fmt) => (
        <p>
          Choose “X% of a number”, enter 20 and 64.50. Converting 20% to a decimal gives 0.2, and
          0.2 × 64.5 = <strong>{fmt.num(num(r), 2)}</strong>. The tip is $12.90, so the total comes
          to $77.40.
        </p>
      ),
    },
    {
      id: 'raise',
      title: 'A pay rise from $80,000 to $92,000',
      body: (r, fmt) => (
        <p>
          Choose “Percentage change”, with 80,000 as the starting value and 92,000 as the final
          value. The difference is 12,000, and 12,000 ÷ 80,000 = 0.15, so the raise is{' '}
          <strong>{fmt.pct(num(r))}</strong>. Thinking in thousands gives the same answer: 12 ÷ 80 =
          0.15.
        </p>
      ),
    },
    {
      id: 'sale',
      title: 'The price before a 15% discount',
      body: (r, fmt) => (
        <p>
          A jacket costs $68 after a 15% discount. Choose “Original value before a P% change”, enter
          68 and −15. The multiplier is 1 − 0.15 = 0.85, and 68 ÷ 0.85 ={' '}
          <strong>{fmt.num(num(r), 2)}</strong>, so the original price was $80. A common mistake is
          to add 15% back: 68 × 1.15 = 78.20, which is $1.80 short, because the discount was 15% of
          $80, not of $68.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Percentage points are not percent.</strong> An interest rate that moves from 4% to
        5% rose by 1 percentage point, but by 25% in relative terms. News reports often mix the two.
        Use percentage change only for the relative figure.
      </li>
      <li>
        <strong>Successive changes multiply, they don’t add.</strong> A 10% rise followed by a 10%
        fall leaves you at 99% of the start (1.1 × 0.9 = 0.99), not back where you began. To combine
        changes, chain the “Increase” and “Decrease” modes.
      </li>
      <li>
        <strong>Sales tax and VAT are reverse percentages.</strong> To strip 20% VAT out of a £120
        receipt, use the original-value mode with 20: £120 ÷ 1.2 = £100 before VAT, and the VAT
        itself is £20, not 20% of £120 (£24).
      </li>
      <li>
        <strong>Small bases produce dramatic percentages.</strong> Going from 2 to 5 complaints is a
        150% increase. When the starting value is small, quote the absolute numbers next to the
        percentage.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do I calculate a percentage of a number in my head?',
      a: 'Find 10% by moving the decimal point one place left, then scale it. For 15% of 240, 10% is 24 and 5% is half of that, 12, so 15% is 36. For 1%, move the point two places. The calculator uses the exact formula, the percentage divided by 100 times the number.',
    },
    {
      q: 'What is the difference between percentage change and percentage difference?',
      a: 'Percentage change measures a move from an old value to a new one and divides by the old value, so its sign shows the direction. Percentage difference compares two values with no natural order and divides by their average, so it is always positive and symmetric. From 80 to 100 is a 25% change but a 22.2% difference.',
    },
    {
      q: 'Is a 50% increase followed by a 50% decrease the same as no change?',
      a: 'No. Increasing 100 by 50% gives 150, and decreasing 150 by 50% gives 75, which is 25% below where you started. Each percentage applies to the current value, so the decrease removes more in absolute terms than the increase added.',
    },
    {
      q: 'How do I find the original price before a discount?',
      a: 'Divide the sale price by 1 minus the discount as a decimal. A $68 item after 15% off was $68 ÷ 0.85 = $80. In the calculator, choose “Original value before a P% change” and enter the discount as a negative number, −15.',
    },
    {
      q: 'Can a percentage be more than 100%?',
      a: 'Yes. A part can be larger than the whole it is compared with: 300 is 150% of 200, and a price that triples has risen by 200%. A decrease, however, cannot exceed 100% without the value going negative, which only makes sense for quantities like profit or temperature.',
    },
    {
      q: 'Why does the calculator say percentage change from zero is undefined?',
      a: 'Percentage change divides by the starting value. Dividing by zero has no answer, because any increase from nothing is infinitely large relative to nothing. Report the absolute change instead, for example “sales went from 0 to 40 units”.',
    },
  ],
  ogSample: (r, fmt) => `15% of 240 = ${fmt.num(num(r), 4)}`,
};
