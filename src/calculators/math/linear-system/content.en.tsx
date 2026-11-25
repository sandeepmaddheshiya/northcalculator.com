import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'solution') => String(r.outputs[k]);

export const content: CalculatorContent = {
  name: 'System of Equations Calculator',
  promise: 'Solve two or three linear equations at once, with exact fractions.',
  title: 'System of Equations Solver: 2×2 and 3×3 with Cramer’s Rule',
  description:
    'Solve two equations in x and y or three in x, y and z, with exact fractions for whole numbers, the determinant, and no-solution or infinite cases.',
  summary:
    'A system of linear equations asks for values that satisfy every equation at once. Two lines usually cross at one point, but parallel lines never meet and identical lines meet everywhere. The determinant D of the coefficients tells which: if D is not zero there is exactly one solution, and Cramer’s rule gives each variable as a ratio of determinants.',
  synonyms: [
    'simultaneous equations calculator',
    'Cramer’s rule calculator',
    '3 variable system solver',
    'linear equations solver',
    'solve for x and y',
    'determinant calculator',
  ],
  ui: {
    size: 'Number of equations',
    'size.2': '2 (x, y)',
    'size.3': '3 (x, y, z)',
    eq1: 'Equation 1: ax + by + cz = d',
    eq2: 'Equation 2',
    eq3: 'Equation 3',
    'col.a': 'x',
    'col.b': 'y',
    'col.c': 'z',
    'col.d': '=',
    'out.solution': 'Solution',
    'out.x': 'x',
    'out.y': 'y',
    'out.z': 'z',
    'out.det': 'Determinant D',
    'solution.none': 'No solution',
    'solution.infinite': 'Infinitely many solutions',
    'explain.one': 'The equations meet at exactly one point: {sol}.',
    'explain.none':
      'The equations contradict each other, like parallel lines, so no values satisfy them all.',
    'explain.infinite': 'The equations overlap, so infinitely many values satisfy them all.',
    'step.det': 'Determinant of the coefficients.',
    'step.cramer': 'Cramer’s rule for {v}: replace its column with the constants.',
    rounding:
      'Exact fractions for whole-number inputs; otherwise decimals to 10 significant digits.',
  },
  HowItWorks: () => (
    <>
      <Formula label="2 × 2 determinant">{'D = a₁b₂ − a₂b₁'}</Formula>
      <Formula label="Cramer’s rule">{'x = Dₓ ÷ D, y = D_y ÷ D, z = D_z ÷ D'}</Formula>
      <p>
        Dₓ is the determinant with the x column replaced by the constants on the right-hand side,
        and so on. When D = 0, Cramer’s rule cannot decide, so the calculator uses elimination: a
        contradiction such as 0 = −8 means no solution, while 0 = 0 means infinitely many.
      </p>
    </>
  ),
  examples: [
    {
      id: 'three',
      title: 'x + y − z = 6, 3x − 2y + z = −5, x + 3y − 2z = 14',
      body: (r) => (
        <p>
          D = −3, and Cramer’s rule gives <strong>{o(r)}</strong>, as in OpenStax{' '}
          <em>College Algebra</em> §7.8 Example 4.
        </p>
      ),
    },
    {
      id: 'two',
      title: '12x + 3y = 15 and 2x − 3y = 13',
      body: (r) => (
        <p>
          D = −42, Dₓ = −84, D_y = 126, so <strong>{o(r)}</strong> (Example 2).
        </p>
      ),
    },
    {
      id: 'parallel',
      title: '3x − 2y = 4 and 6x − 4y = 0',
      body: (r) => (
        <p>
          D = 0 and elimination gives 0 = −8: <strong>{o(r)}</strong>. The lines are parallel
          (Example 5).
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Write each equation in standard form</strong> first, with x, y, z on the left and
        the constant on the right; use 0 for a missing variable.
      </li>
      <li>
        <strong>Check the answer</strong> by substituting it back into every equation.
      </li>
      <li>
        <strong>Word problems:</strong> one equation per fact, such as a total amount and a total
        interest, as in OpenStax’s $12,000 investment example.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do I solve a system of two equations?',
      a: 'Eliminate one variable by adding or subtracting multiples of the equations, or use Cramer’s rule: x = (c₁b₂ − c₂b₁) ÷ (a₁b₂ − a₂b₁). For x + y = 5 and x − y = 1, adding gives 2x = 6, so x = 3 and y = 2.',
    },
    {
      q: 'What does a zero determinant mean?',
      a: 'The equations are not independent: either they contradict each other and have no solution, or one is a combination of the others and there are infinitely many solutions. Elimination tells which, ending in a false statement like 0 = 2 or a true one like 0 = 0.',
    },
    {
      q: 'What is Cramer’s rule?',
      a: 'A formula for each variable as a ratio of determinants: replace that variable’s column of coefficients with the constants and divide that determinant by D. It works whenever D is not zero and is handy for 2 × 2 and 3 × 3 systems.',
    },
    {
      q: 'How do I set up a word problem as a system?',
      a: 'Name the unknowns, then write one equation per fact. For $12,000 split three ways at 3%, 4% and 7% earning $670, with $4,000 more in the 7% fund than the 4%, the solution is $2,000, $3,000 and $7,000.',
    },
  ],
  ogSample: (r) => `x + y − z = 6, … → ${o(r)}`,
};
