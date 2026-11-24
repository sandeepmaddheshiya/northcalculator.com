import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const out = (r: { outputs: Record<string, unknown> }) => String(r.outputs.result);

export const content: CalculatorContent = {
  name: 'Ratio Calculator',
  promise: 'Simplify a ratio, or find the missing number in a proportion.',
  title: 'Ratio Calculator: Simplify Ratios and Solve Proportions',
  description:
    'Reduce a ratio such as 15 : 27 or 4.8 : 11.2 to simplest form, or solve A : B = C : D for the missing value to scale a recipe, a map or a dose.',
  summary:
    'A ratio compares two quantities, such as 15 to 27. To simplify it, divide both numbers by their greatest common factor, which gives 5 : 9. If the ratio has decimals, first multiply both by the same power of 10 to make them whole. To scale a ratio, set up a proportion A : B = C : D and cross-multiply: D = B × C ÷ A.',
  synonyms: [
    'simplify ratio calculator',
    'proportion calculator',
    'ratio solver',
    'missing ratio value',
    'scale a ratio',
    'cross multiplication calculator',
  ],
  ui: {
    mode: 'What do you want to do?',
    'mode.simplify': 'Simplify A : B',
    'mode.solve': 'Solve A : B = C : D',
    ab: 'Ratio A : B',
    a: 'A',
    b: 'B',
    c: 'C',
    'c.help':
      'The value that corresponds to A. The calculator finds D, the value that goes with B.',
    'out.result.simplify': 'Simplest form',
    'out.result.solve': 'Missing value D',
    'out.simplest': 'A : B in simplest form',
    'out.oneTo': 'As 1 : n',
    'out.quotient': 'A ÷ B as a decimal',
    'explain.simplify': '{a} : {b} reduces to {r}: both sides divided by the same number.',
    'explain.solve': 'If {a} goes with {b}, then {c} goes with {d}.',
    'step.scale': 'Move the decimal point {n} place(s) in both numbers to make them whole.',
    'step.gcf': 'Divide both by their greatest common factor, {g}.',
    'step.cross': 'Cross-multiply: A × D = B × C.',
    'step.divide': 'Divide both sides by A.',
    'warn.bothZero': 'A ratio of 0 : 0 has no meaning. Enter at least one value above zero.',
    'warn.zeroA': 'A cannot be zero when solving, because D = B × C ÷ A.',
    'warn.precision':
      'These numbers have too many decimal places to simplify exactly. Round them first.',
    rounding:
      'Simplifying is exact. A missing value is computed in double precision and shown to at most 10 decimal places.',
  },
  HowItWorks: () => (
    <>
      <p>
        A ratio A : B can also be written as the fraction A/B, so simplifying a ratio works exactly
        like reducing a fraction. Find the greatest common factor of A and B and divide both by it.
      </p>
      <Formula label="Simplest form">{'A : B = (A ÷ g) : (B ÷ g),   g = GCF(A, B)'}</Formula>
      <p>
        With decimals, OpenStax <em>Prealgebra</em> moves the decimal point the same number of
        places in both numbers. 4.8 : 11.2 becomes 48 : 112, and the GCF of 48 and 112 is 16, so the
        ratio is 3 : 7. Mixed numbers work the same way once they are written as decimals.
      </p>
      <p>
        A proportion says two ratios are equal. Its cross products are equal too, which gives the
        missing value directly.
      </p>
      <Formula label="Missing value in a proportion">
        {'A : B = C : D   ⇔   A × D = B × C   ⇒   D = B × C ÷ A'}
      </Formula>
    </>
  ),
  examples: [
    {
      id: 'simplify',
      title: 'Simplifying 15 : 27',
      body: (r) => (
        <p>
          15 = 3 × 5 and 27 = 3 × 9, so their greatest common factor is 3. Dividing both by 3 gives{' '}
          <strong>{out(r)}</strong>, as in OpenStax’s Example 5.58. No whole number above 1 divides
          both 5 and 9, so this is the simplest form.
        </p>
      ),
    },
    {
      id: 'decimals',
      title: 'A ratio with decimals: 4.8 to 11.2',
      body: (r) => (
        <p>
          Multiply both by 10 to get 48 : 112. Their GCF is 16, and 48 ÷ 16 = 3, 112 ÷ 16 = 7, so
          the ratio is <strong>{out(r)}</strong>. Converting to decimals first and dividing (0.4286)
          gives the same comparison but hides the simple whole-number form.
        </p>
      ),
    },
    {
      id: 'dose',
      title: 'Scaling a dose by body weight',
      body: (r) => (
        <p>
          A label gives 5 ml for every 25 pounds. For an 80-pound child, set 25 : 5 = 80 : D. Cross
          multiplying gives 25 × D = 5 × 80 = 400, so D = <strong>{out(r)}</strong> ml, matching
          OpenStax’s Example 6.45. Always follow the dosing table on the package or a pharmacist’s
          advice for real medicines.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Keep the order.</strong> 3 : 5 and 5 : 3 are different ratios. Write the quantities
        in the order the question names them, and keep the same order on both sides of a proportion.
      </li>
      <li>
        <strong>Use the same units.</strong> Before comparing 1 inch to 1 foot, convert: it is 1 :
        12, not 1 : 1. A ratio of quantities in different units is a rate, like miles per hour.
      </li>
      <li>
        <strong>Recipes and mixtures scale linearly.</strong> To make 3 batches instead of 2, every
        ingredient scales by the same 3 : 2. Cooking times and pan sizes do not, so adjust those by
        eye.
      </li>
      <li>
        <strong>Ratios with three parts.</strong> For a 2 : 3 : 5 mix, simplify or scale each part
        by the same factor. Solve one pair at a time if you need a missing amount.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do you simplify a ratio?',
      a: 'Divide both numbers by their greatest common factor. For 24 : 36 the GCF is 12, so the ratio is 2 : 3. If you can’t see the GCF, divide by any common factor and repeat until the numbers share none: 24 : 36 → 12 : 18 → 2 : 3.',
    },
    {
      q: 'How do I find the missing number in a ratio?',
      a: 'Write the two ratios as equal, A : B = C : D, and cross-multiply so that A × D = B × C. Then divide by A. If 3 cups of flour need 2 eggs, then 9 cups need 2 × 9 ÷ 3 = 6 eggs.',
    },
    {
      q: 'How do you simplify a ratio with decimals?',
      a: 'Multiply both numbers by 10, 100 or 1,000 until both are whole, then simplify as usual. For 2.7 : 0.54, multiply by 100 to get 270 : 54. The GCF is 54, so the ratio is 5 : 1.',
    },
    {
      q: 'What is the difference between a ratio and a fraction?',
      a: 'A fraction compares a part with the whole: 3 of 8 slices is 3/8 of the pizza. A ratio can compare any two quantities, including two parts: 3 eaten to 5 left is 3 : 5. A ratio can be written as a fraction, but it does not have to describe part of a whole.',
    },
    {
      q: 'How do I write a ratio as 1 : n?',
      a: 'Divide both numbers by the first one. 4 : 10 becomes 1 : 2.5. Map scales use this form: 1 : 50,000 means one unit on the map is 50,000 of the same unit on the ground. The calculator shows this form under the main result.',
    },
  ],
  ogSample: (r) => `15 : 27 = ${out(r)}`,
};
