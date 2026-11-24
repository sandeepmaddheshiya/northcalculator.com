import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const out = (r: { outputs: Record<string, unknown> }) => String(r.outputs.result);

export const content: CalculatorContent = {
  name: 'Rounding Calculator',
  promise: 'Round to decimal places, significant figures or the nearest ten, hundred or more.',
  title: 'Rounding Calculator: Decimal Places and Significant Figures',
  description:
    'Round any number to decimal places, significant figures, or the nearest 10, 100 or 1,000, using round half up, half to even, truncation, ceiling or floor.',
  summary:
    'To round a number, find the last digit you want to keep and look at the digit after it. If that digit is 5 or more, add one to the kept digit; otherwise leave it. Then drop everything after it. Science and statistics often round an exact half to the nearest even digit instead, which avoids a bias upward over many values.',
  synonyms: [
    'round to nearest calculator',
    'significant figures calculator',
    'sig fig calculator',
    'decimal places calculator',
    'round to nearest hundredth',
    'round to nearest ten',
    'bankers rounding',
  ],
  ui: {
    value: 'Number',
    'value.help':
      'Type it as written, for example 0.051065, 48,350 or 1.30e3. The digits are used exactly, with no binary conversion.',
    to: 'Round to',
    'to.dp': 'Decimal places',
    'to.sf': 'Significant figures',
    digits: 'Places',
    'digits.dp': 'Decimal places',
    'digits.sf': 'Significant figures',
    'digits.help':
      'For decimal places, 0 rounds to a whole number, −1 to the nearest ten, −2 to the nearest hundred and so on.',
    method: 'Rounding rule',
    'method.halfUp': 'Round half up (school rule)',
    'method.halfEven': 'Round half to even (science, statistics)',
    'method.halfDown': 'Round half down',
    'method.up': 'Always up (away from zero)',
    'method.down': 'Always down (truncate toward zero)',
    'method.ceiling': 'Ceiling (toward +∞)',
    'method.floor': 'Floor (toward −∞)',
    'method.help':
      'Half up rounds 2.5 to 3 and −2.5 to −3. Half to even rounds both 2.5 and 1.5 to 2, as OpenStax Chemistry recommends.',
    'out.result': 'Rounded number',
    'out.scientific': 'In scientific notation',
    'out.sigfigs': 'Significant figures in the number you entered',
    'explain.dp': '{x} rounded to {n} decimal place(s) is {r}.',
    'explain.place': '{x} rounded to the nearest {p} is {r}.',
    'explain.sf': '{x} rounded to {n} significant figure(s) is {r}.',
    'step.keepDp': 'Keep {n} digit(s) after the decimal point and look at the next digit.',
    'step.keepSf': 'Count {n} digit(s) from the first non-zero digit, and look at the next digit.',
    'step.halfUp': 'If the next digit is 5 or more, add one to the last kept digit.',
    'step.halfEven':
      'Above half, round up; below, round down; exactly half, choose whichever makes the last kept digit even.',
    'step.halfDown': 'Round up only if the dropped part is more than half.',
    'step.up': 'Add one to the last kept digit if anything non-zero is dropped.',
    'step.down': 'Drop the extra digits without changing the rest.',
    'step.ceiling': 'Round toward positive infinity.',
    'step.floor': 'Round toward negative infinity.',
    'warn.parse':
      'This doesn’t look like a number. Use digits, one decimal point and an optional e for powers of ten.',
    'warn.sf': 'Significant figures must be at least 1.',
    'warn.exact': 'The number already has no more digits than requested, so nothing was rounded.',
    'warn.ambiguous':
      'Trailing zeros in a whole number don’t show how many figures are significant. Use the scientific notation to make it clear.',
    rounding:
      'Rounding is done on the decimal digits you typed, with arbitrary-precision integers, so results are exact. Results are not grouped with thousands separators, so they can be copied as is.',
  },
  HowItWorks: () => (
    <>
      <p>
        Rounding replaces a number with a nearby one that has fewer digits. You choose where to cut,
        and a rule decides what happens to the last digit you keep.
      </p>
      <Formula label="Where to cut">
        {
          'n decimal places:       keep digits down to 10⁻ⁿ\ns significant figures:  keep s digits from the first non-zero digit'
        }
      </Formula>
      <p>
        The OpenStax <em>Prealgebra</em> procedure is round half up: underline the digit after the
        place you keep, and if it is 5 or more, add 1. So 18.379 becomes 18.38, 18.4 or 18 depending
        on the place.
      </p>
      <p>
        <strong>Half to even.</strong> When the dropped part is exactly half, OpenStax{' '}
        <em>Chemistry</em> rounds so that the last kept digit is even: 92.85 to three figures is
        92.8, but 6.8752 is 6.88 because the 5 is followed by a 2. Over many values, half the ties
        go up and half go down, so sums and averages are not pushed upward. It is sometimes called
        banker’s rounding, and it is the default rounding mode of the IEEE 754 standard for computer
        arithmetic.
      </p>
      <h3>Counting significant figures</h3>
      <p>
        Count from the first non-zero digit. Zeros between digits count (70.607 has 5), leading
        zeros never do (0.00832407 has 6), and trailing zeros count after a decimal point (55.0 has
        3). Trailing zeros in a whole number like 1300 are ambiguous, so this calculator doesn’t
        count them. Write 1.30e3 to show three.
      </p>
    </>
  ),
  examples: [
    {
      id: 'school',
      title: 'Rounding 18.379 to the nearest hundredth',
      body: (r) => (
        <p>
          The hundredths digit is 7, and the digit after it is 9. Since 9 is 5 or more, the 7
          becomes 8: <strong>{out(r)}</strong>. To the nearest tenth it is 18.4, and to the nearest
          whole number 18. These are OpenStax’s Examples 5.9 and 5.10.
        </p>
      ),
    },
    {
      id: 'chem',
      title: 'Four significant figures with the half-to-even rule',
      body: (r) => (
        <p>
          0.90275 has five significant figures. Keeping four leaves 0.9027 with a 5 dropped and
          nothing after it, an exact tie. Rounding to even turns the 7 into 8:{' '}
          <strong>{out(r)}</strong>, the answer in OpenStax Chemistry’s Example 1.3. With 0.051065,
          the same rule keeps 0.05106, because 6 is already even.
        </p>
      ),
    },
    {
      id: 'hundreds',
      title: 'Rounding 48,350 to the nearest hundred',
      body: (r) => (
        <p>
          Enter −2 decimal places. The hundreds digit is 3 and the next digit is 5, so it rounds up
          to <strong>{out(r)}</strong>. With half to even it would also be 48,400, since 3 rounds up
          to the even 4. A tie at 48,250 would split the two rules: 48,300 or 48,200.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Round once, at the end.</strong> Rounding intermediate results adds errors that can
        build up. Keep full precision through a calculation and round only the final answer.
      </li>
      <li>
        <strong>Money has its own rules.</strong> Prices are rounded to the cent, but tax
        authorities may specify how, for example per line or per invoice. Follow those rules for tax
        returns and invoices.
      </li>
      <li>
        <strong>Match the precision of your data.</strong> In science, a result can’t be more
        precise than its least precise measurement. Multiplying 0.6238 by 6.6 gives 4.11708, but
        with only two significant figures in 6.6 the answer is 4.1.
      </li>
      <li>
        <strong>Spreadsheets may disagree.</strong> Excel’s ROUND rounds halves away from zero,
        while Python’s round() uses half to even. Binary floating point can also turn 2.675 into
        2.67499…, which is why this calculator works on the digits you type.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do you round to 2 decimal places?',
      a: 'Look at the third digit after the decimal point. If it is 5 or more, add one to the second digit; if it is less than 5, leave the second digit as it is. Then drop everything after it. 3.14159 becomes 3.14, and 2.71828 becomes 2.72.',
    },
    {
      q: 'What is round half to even?',
      a: 'It is a rule for exact ties. When the part you drop is exactly half, you round to whichever neighbour has an even last digit, so 2.5 becomes 2 and 3.5 becomes 4. Because ties go up and down equally often, averages of many rounded numbers stay unbiased.',
    },
    {
      q: 'How many significant figures does a number have?',
      a: 'Count every digit from the first non-zero one, including zeros between digits and zeros at the end after a decimal point. 0.0450 has three: 4, 5 and the final 0. A whole number with trailing zeros, like 2500, is ambiguous unless written as 2.5 × 10³ or 2.50 × 10³.',
    },
    {
      q: 'What is the difference between rounding and truncating?',
      a: 'Rounding goes to the nearest value, so 7.89 to one decimal place is 7.9. Truncating simply drops the extra digits, so it gives 7.8. Truncation always moves toward zero, which is why it is used where an amount must never be overstated.',
    },
    {
      q: 'How do I round to the nearest 10, 100 or 1,000?',
      a: 'Use negative decimal places: −1 for tens, −2 for hundreds, −3 for thousands. Look at the digit just right of that place. 2,749 to the nearest hundred looks at the 4 and becomes 2,700, while to the nearest ten it looks at the 9 and becomes 2,750.',
    },
  ],
  ogSample: (r) => `18.379 ≈ ${out(r)}`,
};
