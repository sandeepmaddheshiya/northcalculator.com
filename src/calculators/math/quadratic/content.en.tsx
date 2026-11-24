import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'roots') => String(r.outputs[k]);

export const content: CalculatorContent = {
  name: 'Quadratic Formula Calculator',
  promise: 'Solve ax² + bx + c = 0, with exact radical answers and the discriminant.',
  title: 'Quadratic Formula Calculator: Solve ax² + bx + c = 0',
  description:
    'Solve any quadratic equation with the quadratic formula: real or complex roots as decimals and in exact simplified radical form, with the discriminant shown.',
  summary:
    'A quadratic equation ax² + bx + c = 0 has solutions x = (−b ± √(b² − 4ac)) ÷ 2a. The part under the square root, b² − 4ac, is the discriminant. If it is positive there are two real solutions, if it is zero there is one, and if it is negative there are two complex solutions. Enter a, b and c, with signs.',
  synonyms: [
    'quadratic equation solver',
    'quadratic solver',
    'discriminant calculator',
    'roots of a quadratic',
    'solve for x calculator',
    'complex roots calculator',
  ],
  ui: {
    a: 'a (x² coefficient)',
    b: 'b (x coefficient)',
    c: 'c (constant)',
    'out.roots': 'Solutions',
    'out.exact': 'Exact form',
    'out.discriminant': 'Discriminant (b² − 4ac)',
    'out.kind': 'Type of solutions',
    'roots.two': '{x1} or {x2}',
    'word.or': 'or',
    'kind.two': 'Two real solutions',
    'kind.one': 'One real (double) solution',
    'kind.complex': 'Two complex solutions',
    'kind.linear': 'Linear equation',
    explain: 'x = {roots}: {kind}.',
    'step.d': 'Discriminant = b² − 4ac.',
    'step.formula': 'Quadratic formula: x = (−b ± √discriminant) ÷ 2a.',
    'step.linear': 'With a = 0 the equation is linear: bx + c = 0.',
    'warn.linear': 'With a = 0 this is a linear equation, not a quadratic, so it has one solution.',
    'warn.degenerate': 'With a = 0 and b = 0 there is no x to solve for.',
    rounding:
      'Decimals are shown to 10 significant digits. The exact form is given when a, b and c are whole numbers.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Quadratic formula">{'x = (−b ± √(b² − 4ac)) ÷ 2a'}</Formula>
      <Formula label="Discriminant">
        {
          'b² − 4ac > 0: two real solutions\nb² − 4ac = 0: one real solution\nb² − 4ac < 0: two complex solutions'
        }
      </Formula>
      <p>
        Write the equation as ax² + bx + c = 0 first, moving every term to one side. When the
        discriminant is a perfect square the solutions are fractions; otherwise the square root is
        simplified, so √12 becomes 2√3. For decimals the calculator uses a rearranged formula that
        avoids losing digits when b is much larger than a and c.
      </p>
    </>
  ),
  examples: [
    {
      id: 'rational',
      title: 'Solve 2x² + 9x − 5 = 0',
      body: (r) => (
        <p>
          The discriminant is 81 + 40 = 121 = 11², so x = (−9 ± 11) ÷ 4 ={' '}
          <strong>{o(r, 'exact')}</strong>, as in OpenStax <em>Intermediate Algebra</em> Example
          9.21.
        </p>
      ),
    },
    {
      id: 'irrational',
      title: 'Solve 2x² + 10x + 11 = 0',
      body: (r) => (
        <p>
          b² − 4ac = 100 − 88 = 12, and √12 = 2√3, so x = <strong>{o(r, 'exact')}</strong> (Example
          9.23), about {o(r)}.
        </p>
      ),
    },
    {
      id: 'complex',
      title: 'Solve 3p² + 2p + 9 = 0',
      body: (r) => (
        <p>
          The discriminant is 4 − 108 = −104, so the solutions are complex:{' '}
          <strong>{o(r, 'exact')}</strong>, which Example 9.24 writes as −1/3 ± (√26/3)i.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Get the signs right.</strong> For x² − 6x = −5, rewrite as x² − 6x + 5 = 0, so a =
        1, b = −6 and c = 5.
      </li>
      <li>
        <strong>Check by substituting.</strong> Put each solution back into ax² + bx + c; the result
        should be 0, or very close for rounded decimals.
      </li>
      <li>
        <strong>Factoring is faster</strong> when the discriminant is a perfect square, because the
        equation then factors over the integers.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'What is the quadratic formula?',
      a: 'For ax² + bx + c = 0 with a not zero, x = (−b ± √(b² − 4ac)) ÷ 2a. The ± gives two solutions, one adding the square root and one subtracting it. It works for every quadratic, including ones that cannot be factored.',
    },
    {
      q: 'What does the discriminant tell you?',
      a: 'The discriminant b² − 4ac says how many real solutions there are. Positive means two, zero means one repeated solution, and negative means none that are real, only two complex ones. A positive perfect square means the solutions are rational.',
    },
    {
      q: 'What are complex solutions?',
      a: 'When the discriminant is negative, its square root is imaginary, written with i, where i² = −1. The solutions come as a pair a + bi and a − bi. On a graph, the parabola never crosses the x-axis.',
    },
    {
      q: 'What if a is zero?',
      a: 'Then there is no x² term and the equation is linear, bx + c = 0, with the single solution x = −c ÷ b. The calculator solves it that way and says so, because the quadratic formula would divide by zero.',
    },
  ],
  ogSample: (r) => `2x² + 9x − 5 = 0 → x = ${o(r, 'exact')}`,
};
