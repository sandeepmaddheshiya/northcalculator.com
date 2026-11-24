import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'result') => r.outputs[k];

export const content: CalculatorContent = {
  name: 'Exponent Calculator',
  promise: 'Raise any number to any power, including negative and fractional exponents.',
  title: 'Exponent Calculator: Negative and Fractional Powers',
  description:
    'Raise a number to any power: whole, negative, decimal or fractional exponents like 2/3, with exact results for whole numbers and scientific notation.',
  summary:
    'An exponent says how many times to multiply a number by itself: 2⁵ = 2 × 2 × 2 × 2 × 2 = 32. A negative exponent means the reciprocal, so 4⁻² = 1/4² = 1/16. A fractional exponent is a root: 27^(2/3) is the cube root of 27, squared, which is 9. Any non-zero number to the power 0 is 1.',
  synonyms: [
    'power calculator',
    'negative exponent calculator',
    'fractional exponent calculator',
    'x to the power of y',
    'exponents calculator',
    'raise to a power',
  ],
  ui: {
    base: 'Base',
    power: 'Exponent',
    'power.help': 'A whole number, a decimal, or a fraction such as 2/3 or -1/2.',
    'out.result': 'Result',
    'out.exact': 'Exact value',
    'out.scientific': 'In scientific notation',
    explain: '{b} to the power {n} is {r}.',
    'step.negative': 'A negative exponent means one over the positive power.',
    'step.root': 'The denominator {q} means take the {q}th root first.',
    'step.power': 'Then raise to the power of the numerator.',
    'warn.parse': 'Enter the exponent as a number or a fraction like 2/3.',
    'warn.zeroNegative':
      'Zero to a negative power is undefined, because it means dividing by zero.',
    'warn.evenRoot':
      'An even root of a negative number is not a real number, so this power has no real value.',
    'warn.overflow': 'The result is too large to represent. Try a smaller base or exponent.',
    rounding:
      'Whole-number powers are exact (shown in full up to 200 digits). Other results use double precision and show 12 significant digits.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Exponent rules">
        {'bⁿ = b × b × … × b   (n factors)\nb⁰ = 1   (b ≠ 0)\nb⁻ⁿ = 1 ÷ bⁿ\nb^(p/q) = (q√b)^p'}
      </Formula>
      <p>
        OpenStax <em>Prealgebra</em> defines a negative exponent as the reciprocal of the positive
        power: 4⁻² = 1/16 and 10⁻³ = 1/1000. Brackets matter. (−3)⁻² = 1/9, because the negative
        sign is part of the base, but −3⁻² = −1/9, because only 3 is raised to the power. Enter −3
        as the base for the first.
      </p>
      <p>
        A fractional exponent combines a root and a power. The calculator takes the root first,
        which keeps numbers small and lets odd roots of negative bases work: (−8)^(1/3) = −2. Even
        roots of negative numbers are not real numbers.
      </p>
    </>
  ),
  examples: [
    {
      id: 'negative',
      title: '4 to the power −2',
      body: (r, fmt) => (
        <p>
          4⁻² = 1 ÷ 4² = <strong>{String(o(r, 'exact'))}</strong>, which is{' '}
          {fmt.num(o(r) as number, 6)} as a decimal. This is Example 10.63 in OpenStax Prealgebra.
        </p>
      ),
    },
    {
      id: 'big',
      title: '2 to the power 64',
      body: (r) => (
        <p>
          Doubling 64 times gives <strong>{String(o(r, 'exact'))}</strong>, about{' '}
          {String(o(r, 'scientific'))}. A double-precision calculator rounds this to about 16
          significant digits; the calculator shows every digit for whole-number powers.
        </p>
      ),
    },
    {
      id: 'fraction',
      title: '27 to the power 2/3',
      body: (r) => (
        <p>
          The denominator 3 means a cube root: ∛27 = 3. The numerator 2 means squaring it: 3² ={' '}
          <strong>{String(o(r))}</strong>. Typing 0.667 instead of 2/3 would give about 9.01, so
          enter fractions as fractions.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Powers come before multiplication.</strong> In 2 × 3², square first: 2 × 9 = 18, not
        6² = 36.
      </li>
      <li>
        <strong>Adding exponents multiplies powers.</strong> bᵐ × bⁿ = b^(m+n), so 10³ × 10⁴ = 10⁷.
        Dividing subtracts them, and a power of a power multiplies them.
      </li>
      <li>
        <strong>0⁰ is a special case.</strong> Algebra and most software treat it as 1, but some
        texts leave it undefined. This calculator returns 1.
      </li>
      <li>
        <strong>For growth over time,</strong> exponents do the compounding: 5% a year for 10 years
        multiplies a value by 1.05¹⁰ ≈ 1.629.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'What does a negative exponent mean?',
      a: 'It means one divided by the positive power. 2⁻³ = 1/2³ = 1/8 = 0.125, and 10⁻² = 1/100 = 0.01. A negative exponent never makes the result negative; a negative base with an odd exponent does.',
    },
    {
      q: 'How do I calculate a fractional exponent?',
      a: 'The denominator is a root and the numerator is a power. 16^(3/4) is the fourth root of 16, which is 2, raised to the third power: 8. Taking the root first keeps the numbers small, and the order does not change the answer.',
    },
    {
      q: 'Why is any number to the power 0 equal to 1?',
      a: 'Dividing powers subtracts exponents: bⁿ ÷ bⁿ = b^(n−n) = b⁰. But any non-zero number divided by itself is 1, so b⁰ must be 1. The same pattern gives b⁻¹ = 1/b.',
    },
    {
      q: 'What is the difference between (−3)² and −3²?',
      a: 'In (−3)² the base is −3, so (−3) × (−3) = 9. In −3² only the 3 is squared and the minus sign is applied afterwards, giving −9. Calculators and spreadsheets follow this order, so use brackets when you mean a negative base.',
    },
  ],
  ogSample: (r) => `4⁻² = ${String(o(r, 'exact'))}`,
};
