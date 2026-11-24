import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'root') => r.outputs[k];

export const content: CalculatorContent = {
  name: 'Square Root Calculator',
  promise: 'Square roots, cube roots and any nth root, with radicals simplified.',
  title: 'Square Root Calculator: Square, Cube and Nth Roots',
  description:
    'Find the square root, cube root or any nth root of a number, simplify radicals such as √72 = 6√2, and see which two whole numbers the root lies between.',
  summary:
    'The square root of a number is the value that, multiplied by itself, gives that number: √144 = 12 because 12 × 12 = 144. A cube root uses three equal factors, and an nth root uses n. Negative numbers have real odd roots, such as ∛−125 = −5, but no real even roots. A radical simplifies by taking perfect powers outside the root sign.',
  synonyms: [
    'cube root calculator',
    'nth root calculator',
    'simplify square roots',
    'radical calculator',
    'simplest radical form',
    'root calculator',
  ],
  ui: {
    x: 'Number',
    n: 'Root (index)',
    'n.help': '2 for a square root, 3 for a cube root, and so on.',
    'out.root': 'Root',
    'out.simplified': 'Simplest radical form',
    'out.between': 'Lies between',
    'explain.square': 'The square root of {x} is {r}.',
    'explain.nth': 'The root of index {n} of {x} is {r}.',
    'step.factor':
      'Split the number into the largest perfect power of {n} times what is left, and take the root of the perfect power.',
    'step.perfect': 'It is a perfect power: the root multiplied by itself gives the number back.',
    'step.decimal': 'As a decimal:',
    'warn.notReal':
      'A negative number has no real even root, because any real number raised to an even power ({n}) is zero or positive.',
    rounding:
      'Simplified radicals are exact. Decimal roots are computed in double precision and shown to 12 significant digits.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Definition">{'ⁿ√a = b   when   bⁿ = a'}</Formula>
      <p>
        For square roots the answer is the non-negative number b with b² = a. Every positive number
        also has a negative square root, so the equation x² = 144 has two solutions, ±12, but the
        symbol √144 means only 12.
      </p>
      <p>
        <strong>Simplifying a radical.</strong> OpenStax <em>Intermediate Algebra</em> uses the
        product property ⁿ√(ab) = ⁿ√a × ⁿ√b: find the largest factor that is a perfect nth power,
        take its root outside, and leave the rest inside. The calculator does this with the prime
        factorization.
      </p>
      <Formula label="Example">{'√72 = √(36 × 2) = √36 × √2 = 6√2'}</Formula>
      <p>
        <strong>Estimating.</strong> If a number lies between two perfect squares, its root lies
        between their roots. 100 &lt; 105 &lt; 121, so √105 is between 10 and 11.
      </p>
    </>
  ),
  examples: [
    {
      id: 'simplify',
      title: 'Simplifying √72',
      body: (r, fmt) => (
        <p>
          72 = 2³ × 3², so the largest perfect square factor is 2² × 3² = 36. √72 = √36 × √2 ={' '}
          <strong>{String(o(r, 'simplified'))}</strong>, which is about {fmt.sig(o(r) as number, 8)}
          .
        </p>
      ),
    },
    {
      id: 'estimate',
      title: 'The square root of 17',
      body: (r, fmt) => (
        <p>
          17 is not a perfect square: 16 &lt; 17 &lt; 25, so √17 lies between{' '}
          {String(o(r, 'between'))}. Its value is <strong>{fmt.sig(o(r) as number, 10)}</strong>,
          which OpenStax’s Example 8.6 rounds to 4.12.
        </p>
      ),
    },
    {
      id: 'cube',
      title: 'The cube root of −125',
      body: (r) => (
        <p>
          (−5) × (−5) × (−5) = −125, so ∛−125 = <strong>{String(o(r))}</strong>, as in OpenStax’s
          Example 8.4. An odd root keeps the sign; the fourth root of −16 has no real value.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Learn the first perfect squares.</strong> 1, 4, 9, 16, 25, 36, 49, 64, 81, 100, 121,
        144: they make estimating roots and simplifying radicals much faster.
      </li>
      <li>
        <strong>Roots of fractions</strong> split: √(9/16) = 3/4. Roots of sums do not: √(9 + 16) =
        5, not 3 + 4.
      </li>
      <li>
        <strong>A root is a fractional power.</strong> ⁿ√a = a^(1/n), so the exponent calculator
        handles roots of powers too, such as 27^(2/3).
      </li>
      <li>
        <strong>Keep radicals exact in algebra.</strong> Write 6√2 rather than 8.485 until the last
        step, so rounding errors don’t build up.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do you simplify a square root?',
      a: 'Find the largest perfect square that divides the number, take its square root outside, and leave the rest inside. For √200: 200 = 100 × 2, so √200 = 10√2. If no perfect square other than 1 divides it, as with √15, it is already in simplest form.',
    },
    {
      q: 'Can you take the square root of a negative number?',
      a: 'Not as a real number, because squaring any real number gives zero or a positive result. In the complex numbers √−1 is written i, so √−16 = 4i. Cube roots and other odd roots of negative numbers are real: ∛−8 = −2.',
    },
    {
      q: 'What is a cube root?',
      a: 'The cube root of a number is the value that, used three times as a factor, gives that number. ∛64 = 4 because 4 × 4 × 4 = 64. Unlike square roots, cube roots exist for negative numbers too, so ∛−27 = −3.',
    },
    {
      q: 'How do I estimate a square root without a calculator?',
      a: 'Find the perfect squares on either side. For √50, 49 < 50 < 64, so √50 is just above 7. Each step between 49 and 64 adds roughly 1/15, so √50 ≈ 7 + 1/15 ≈ 7.07. The true value is 7.0711.',
    },
  ],
  ogSample: (r) => `√72 = ${String(o(r, 'simplified'))}`,
};
