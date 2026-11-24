import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'scientific') => String(r.outputs[k]);

export const content: CalculatorContent = {
  name: 'Scientific Notation Calculator',
  promise: 'Convert numbers to and from scientific, engineering and e notation.',
  title: 'Scientific Notation Calculator: Convert to Standard Form',
  description:
    'Convert any number to scientific notation (standard form), e notation and engineering notation, or turn a power of ten back into an ordinary decimal.',
  summary:
    'Scientific notation writes a number as a × 10ⁿ, where a is at least 1 and less than 10 and n is a whole number. Move the decimal point until one non-zero digit is left of it; the places moved give the exponent. Large numbers get a positive exponent and numbers between 0 and 1 a negative one: 37,000 = 3.7 × 10⁴ and 0.0052 = 5.2 × 10⁻³.',
  synonyms: [
    'standard form calculator',
    'convert to scientific notation',
    'e notation converter',
    'engineering notation calculator',
    'scientific notation to decimal',
    'powers of ten converter',
  ],
  ui: {
    value: 'Number',
    'value.help':
      'A decimal like 0.0052 or 37,000, or a power of ten like 8.9 × 10^-2, 8.9e-2 or 6.2×10³.',
    sig: 'Significant figures (0 = keep all)',
    'sig.help': 'Rounds the mantissa half-up to this many significant figures.',
    'out.scientific': 'Scientific notation',
    'out.eNotation': 'E notation',
    'out.engineering': 'Engineering notation',
    'out.decimal': 'Decimal form',
    'explain.big':
      'In scientific notation the number is {s}: move the decimal point {n} places right to get it back.',
    'explain.small':
      'In scientific notation the number is {s}: move the decimal point {n} places left to get it back.',
    'step.moveLeft': 'Move the decimal point {n} place(s) left so one non-zero digit is before it.',
    'step.moveRight':
      'Move the decimal point {n} place(s) right so one non-zero digit is before it.',
    'step.positive': 'Moving left makes the exponent positive.',
    'step.negative': 'Moving right makes the exponent negative.',
    'warn.parse': 'This doesn’t look like a number. Try 0.0052, 37000 or 8.9e-2.',
    rounding:
      'Conversion is exact: it works on the digits you type, not on a binary approximation. Rounding happens only if you set significant figures.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Scientific notation">{'x = a × 10ⁿ,   1 ≤ |a| < 10,   n an integer'}</Formula>
      <p>
        OpenStax <em>Prealgebra</em> gives the method: move the decimal point so that the first
        factor is between 1 and 10, count the places moved, and use that count as the exponent of
        10. If the original number was 10 or more the exponent is positive; if it was less than 1 it
        is negative.
      </p>
      <p>
        <strong>E notation</strong> is the same thing for computers and calculators: 5.2e-3 means
        5.2 × 10⁻³. <strong>Engineering notation</strong> restricts the exponent to multiples of 3,
        so it lines up with SI prefixes: 37 × 10³ m is 37 km, and 5.2 × 10⁻³ g is 5.2 mg.
      </p>
      <Formula label="Back to a decimal">
        {'positive n: move the point n places right\nnegative n: move the point |n| places left'}
      </Formula>
    </>
  ),
  examples: [
    {
      id: 'small',
      title: '0.0052 in scientific notation',
      body: (r) => (
        <p>
          Move the decimal point 3 places right to get 5.2, so the exponent is −3:{' '}
          <strong>{o(r)}</strong>, as in OpenStax’s Example 10.75. In e notation that is{' '}
          {o(r, 'eNotation')}.
        </p>
      ),
    },
    {
      id: 'large',
      title: '37,000 in scientific and engineering notation',
      body: (r) => (
        <p>
          Move the point 4 places left: <strong>{o(r)}</strong>. Engineering notation keeps a
          multiple of 3 in the exponent, giving {o(r, 'engineering')}, which reads directly as 37
          thousand.
        </p>
      ),
    },
    {
      id: 'back',
      title: 'Converting 8.9 × 10⁻² back to a decimal',
      body: (r) => (
        <p>
          A negative exponent of 2 means moving the decimal point 2 places left:{' '}
          <strong>{o(r, 'decimal')}</strong>. This is Example 10.77 in OpenStax Prealgebra.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Multiply by adding exponents.</strong> (4 × 10⁵)(2 × 10⁻⁷) = 8 × 10⁻², because 5 +
        (−7) = −2. Then adjust if the mantissa leaves the 1–10 range.
      </li>
      <li>
        <strong>Trailing zeros carry meaning.</strong> Writing 2.50 × 10³ says the value is known to
        three significant figures; 2.5 × 10³ says two. Use the significant figures option to choose.
      </li>
      <li>
        <strong>Spreadsheets use e notation.</strong> A cell showing 1.23E+08 means 1.23 × 10⁸ =
        123,000,000.
      </li>
      <li>
        <strong>UK schools call it standard form.</strong> It is the same notation; some US texts
        use “standard form” for ordinary decimals instead.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do you write a number in scientific notation?',
      a: 'Place the decimal point after the first non-zero digit and count how many places it moved. Moving left gives a positive exponent and moving right a negative one. So 602,000 becomes 6.02 × 10⁵ and 0.00047 becomes 4.7 × 10⁻⁴.',
    },
    {
      q: 'What does a negative exponent mean in scientific notation?',
      a: 'It means the number is smaller than 1. The exponent counts how many places to move the decimal point left: 3.1 × 10⁻⁴ = 0.00031. A negative sign in front of the whole number, as in −3.1 × 10⁴, is a different thing: it makes the number itself negative.',
    },
    {
      q: 'What is e notation?',
      a: 'E notation writes “× 10 to the power” as the letter e, so 6.02e23 means 6.02 × 10²³. Calculators, spreadsheets and programming languages use it because it needs no superscripts. The calculator accepts e notation as input too.',
    },
    {
      q: 'What is the difference between scientific and engineering notation?',
      a: 'Scientific notation keeps exactly one digit before the decimal point. Engineering notation keeps one to three digits so the exponent is always a multiple of 3, which matches metric prefixes. 47,000 is 4.7 × 10⁴ in scientific notation and 47 × 10³ in engineering notation.',
    },
  ],
  ogSample: (r) => `0.0052 = ${o(r)}`,
};
