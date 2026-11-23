import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k: string) => r.outputs[k];

export const content: CalculatorContent = {
  name: 'Fraction Calculator',
  promise:
    'Add, subtract, multiply and divide fractions and mixed numbers, simplified, with the steps.',
  title: 'Fraction Calculator: Add, Subtract, Multiply, Divide',
  description:
    'Add, subtract, multiply or divide fractions and mixed numbers. Get the simplified answer, mixed number and decimal, with every step shown.',
  summary:
    'To add or subtract fractions, rewrite them over the least common denominator, then add or subtract the numerators. To multiply, multiply the numerators and the denominators. To divide, multiply by the reciprocal of the second fraction. Every answer is simplified by dividing the top and bottom by their greatest common divisor, and the calculation is exact, with no rounding.',
  synonyms: [
    'adding fractions calculator',
    'subtracting fractions',
    'multiplying fractions',
    'dividing fractions',
    'mixed number calculator',
    'simplify fractions',
    'common denominator calculator',
  ],
  ui: {
    fracA: 'First fraction',
    fracB: 'Second fraction',
    whole: 'Whole (optional)',
    num: 'Numerator',
    den: 'Denominator',
    op: 'Operation',
    'op.add': '+',
    'op.sub': '−',
    'op.mul': '×',
    'op.div': '÷',
    'out.result': 'Result (simplified)',
    'out.mixed': 'As a mixed number',
    'out.decimal': 'As a decimal',
    explain: '{a} and {b} give {r}, which is {dec} as a decimal.',
    'step.lcd': 'Least common denominator of {a} and {b}: {l}.',
    'step.rewrite': 'Rewrite both fractions over the common denominator.',
    'step.addNum': 'Add the numerators and keep the denominator.',
    'step.subNum': 'Subtract the numerators and keep the denominator.',
    'step.mul': 'Multiply the numerators, then the denominators.',
    'step.reciprocal': 'Dividing by a fraction is multiplying by its reciprocal.',
    'step.simplify': 'Divide the top and bottom by their greatest common divisor, {g}.',
    'warn.zeroDen': 'A denominator can’t be zero.',
    'warn.divZero': 'You can’t divide by zero: the second fraction is 0.',
    rounding:
      'No rounding: fractions are computed exactly with whole-number arithmetic of any size. Only the decimal is rounded, to 12 significant digits.',
  },
  HowItWorks: () => (
    <>
      <Formula label="The four operations">
        {
          'a/b + c/d = (a·L/b + c·L/d) / L,  L = lcm(b, d)\na/b − c/d = (a·L/b − c·L/d) / L\na/b × c/d = (a·c) / (b·d)\na/b ÷ c/d = (a·d) / (b·c)'
        }
      </Formula>
      <p>
        Adding and subtracting need a common denominator. The calculator uses the least common
        multiple of the two denominators, the least common denominator, which keeps the numbers
        small. Multiplying and dividing need no common denominator.
      </p>
      <p>
        Results are reduced to lowest terms by dividing the numerator and denominator by their
        greatest common divisor, found with Euclid’s algorithm. A negative sign is always placed in
        front of the fraction.
      </p>
      <h3>Mixed numbers</h3>
      <p>
        A mixed number such as 2 1/4 means 2 + 1/4 = 9/4. Enter the whole number, numerator and
        denominator separately. For a negative mixed number, make the whole number negative: −1 1/2
        is −3/2.
      </p>
    </>
  ),
  examples: [
    {
      id: 'lcd',
      title: '7/12 + 5/18',
      body: (r) => (
        <p>
          The least common denominator of 12 and 18 is 36. So 7/12 = 21/36 and 5/18 = 10/36, and the
          sum is <strong>{String(o(r, 'result'))}</strong>, already in lowest terms because 31 is
          prime. This is OpenStax Prealgebra’s Example 4.69.
        </p>
      ),
    },
    {
      id: 'divide',
      title: '7/18 ÷ 14/27',
      body: (r) => (
        <p>
          Multiply by the reciprocal: 7/18 × 27/14 = 189/252. The greatest common divisor of 189 and
          252 is 63, so the answer simplifies to <strong>{String(o(r, 'result'))}</strong>.
        </p>
      ),
    },
    {
      id: 'mixed',
      title: '2 1/4 × 1 1/3',
      body: (r) => (
        <p>
          Convert to improper fractions: 2 1/4 = 9/4 and 1 1/3 = 4/3. Then 9/4 × 4/3 = 36/12, which
          simplifies to <strong>{String(o(r, 'result'))}</strong>, a whole number.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Don’t add the denominators.</strong> 1/2 + 1/3 is 5/6, not 2/5. Only numerators are
        added, after the fractions share a denominator.
      </li>
      <li>
        <strong>Simplify before multiplying to keep numbers small.</strong> In 14/15 × 20/21, cancel
        7 from 14 and 21 and 5 from 15 and 20 first. The calculator gets the same result either way.
      </li>
      <li>
        <strong>Recurring decimals are exact as fractions.</strong> 1/3 is 0.333… forever. Keep the
        fraction for exact work and round the decimal only at the end.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do I add fractions with different denominators?',
      a: 'Find the least common denominator, rewrite each fraction over it, and add the numerators. For 1/2 + 1/3, the common denominator is 6, so 3/6 + 2/6 = 5/6. Then simplify if the numerator and denominator share a factor.',
    },
    {
      q: 'How do I divide fractions?',
      a: 'Multiply the first fraction by the reciprocal of the second, which means flipping it upside down. 2/5 ÷ 3/7 = 2/5 × 7/3 = 14/15. Dividing by a fraction less than 1 gives a larger number, because you are asking how many pieces of that size fit.',
    },
    {
      q: 'How do I simplify a fraction?',
      a: 'Divide the numerator and denominator by their greatest common divisor. For 210/385, the greatest common divisor is 35, so 210/385 = 6/11. The calculator always gives answers in lowest terms.',
    },
    {
      q: 'How do I convert an improper fraction to a mixed number?',
      a: 'Divide the numerator by the denominator. The whole-number result is the whole part and the remainder is the new numerator. 9/4 is 2 remainder 1, so it is 2 1/4. The calculator shows the mixed number whenever the result is improper.',
    },
  ],
  ogSample: (r) => `1/2 + 1/3 = ${String(r.outputs.result ?? '')}`,
};
