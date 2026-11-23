import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k: string) => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Scientific Calculator',
  promise:
    'Trigonometry, logs, powers, roots and factorials, typed or tapped, with correct order of operations.',
  title: 'Scientific Calculator Online: Trig, Logs and Powers',
  description:
    'Free online scientific calculator with sin, cos, tan and their inverses, logarithms, powers, roots, factorials and percentages, in degrees or radians.',
  summary:
    'Type or tap a whole expression, such as 2^10 + √144 − sin 30, and the result updates as you go. Operations follow the standard order: parentheses, powers, then multiplication and division from left to right, then addition and subtraction. Trigonometric functions work in degrees or radians. Results use double-precision arithmetic, shown to 12 significant digits.',
  synonyms: [
    'online calculator',
    'calculator',
    'trig calculator',
    'sin cos tan calculator',
    'log calculator',
    'exponent calculator',
    'factorial calculator',
    'square root calculator',
  ],
  ui: {
    expr: 'Expression',
    angle: 'Angle unit',
    'angle.deg': 'Degrees',
    'angle.rad': 'Radians',
    'out.result': 'Result',
    hint: 'Finish the expression to see the result.',
    'keys.functions': 'Functions',
    'keys.numbers': 'Numbers and operators',
    tape: 'History',
    'tape.empty': 'Press = or Enter to keep a result here. Tap an entry to reuse it.',
    'err.syntax': 'The expression isn’t complete or has an unexpected symbol near character {at}.',
    'err.domain':
      'Outside the function’s domain near character {at}, for example the square root of a negative number or tan 90°.',
    'err.divzero': 'Division by zero near character {at}.',
    'err.overflow':
      'The result is too large to represent (above about 1.8 × 10³⁰⁸). Factorials stop at 170!.',
    'err.tooLong': 'The expression is longer than 500 characters.',
    'err.tooDeep': 'Too many nested parentheses (more than 100 levels).',
    rounding:
      'Arithmetic uses IEEE 754 double precision (about 15–17 significant digits). Results are shown to 12 significant digits, which hides binary rounding such as 0.1 + 0.2 = 0.30000000000000004.',
  },
  HowItWorks: () => (
    <>
      <p>
        The calculator reads the whole expression and applies the standard order of operations, as
        taught in algebra courses: parentheses first, then exponents, then multiplication and
        division from left to right, then addition and subtraction from left to right.
      </p>
      <Formula label="Precedence, highest first">
        {
          '( )        parentheses and functions: sin( ), √( ), ln( )\n! %        factorial and percent (postfix)\n^          powers, right to left: 2^3^2 = 2^9\n− (unary)  negation: −2^2 = −4\n× ÷        left to right, including implicit 2π or 3(4)\n+ −        left to right'
        }
      </Formula>
      <p>
        Two conventions are worth knowing. A minus sign in front of a power negates the result of
        the power, so −2² = −4, as in standard mathematical notation. Powers group from the right,
        so 2^3^2 means 2^(3^2) = 512. Use parentheses whenever you mean something else.
      </p>
      <h3>Functions</h3>
      <p>
        Trigonometric functions take angles in the unit you select. In degree mode, exact angles
        give exact results, so sin 30° is exactly 0.5 and tan 90° is reported as undefined rather
        than a huge number. log is base 10, ln is the natural logarithm, and % divides by 100, so
        200 × 15% = 30. n! is the factorial for whole numbers up to 170, the largest that fits in
        double precision.
      </p>
      <h3>Precision</h3>
      <p>
        Numbers are IEEE 754 doubles, the same format scientific software uses. Decimal fractions
        like 0.1 can’t be stored exactly in binary, so results are shown to 12 significant digits,
        which removes that noise without hiding real precision. For exact money sums, use the
        finance calculators, which work in whole cents.
      </p>
    </>
  ),
  examples: [
    {
      id: 'order',
      title: 'Order of operations: 18 ÷ 6 + 4(5 − 2)',
      body: (r, fmt) => (
        <p>
          The parentheses come first: 5 − 2 = 3. Then multiplication and division from left to
          right: 18 ÷ 6 = 3 and 4 × 3 = 12. Finally 3 + 12 ={' '}
          <strong>{fmt.int(o(r, 'result'))}</strong>. Typing it exactly as written, with 4(…)
          meaning multiplication, gives the same answer.
        </p>
      ),
    },
    {
      id: 'ramp',
      title: 'Height of a 3.2 m ramp at 15°',
      body: (r, fmt) => (
        <p>
          The rise of a slope is its length times the sine of its angle. In degree mode, 3.2 ×
          sin(15) = <strong>{fmt.sig(o(r, 'result'), 4)} m</strong>. Entering the same in radian
          mode would treat 15 as about 859° and give a wrong answer, so check the angle unit before
          using trigonometry.
        </p>
      ),
    },
    {
      id: 'combos',
      title: 'How many 5-card poker hands are there?',
      body: (r, fmt) => (
        <p>
          Choosing 5 cards from 52 without regard to order is 52! ÷ (5! × 47!). The factorials are
          enormous (52! has 68 digits) but the result is exact here:{' '}
          <strong>{fmt.int(o(r, 'result'))}</strong> different hands.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Check degrees or radians before any trig.</strong> School geometry and surveying use
        degrees. Calculus, physics formulas and most programming languages use radians. sin(30) is
        0.5 in degrees but −0.988 in radians.
      </li>
      <li>
        <strong>Add parentheses around fractions.</strong> 1/2x is read as (1 ÷ 2) × x. Write 1/(2x)
        if you mean one over 2x. The same applies to exponents: type 2^(1/3) for a cube root, or use
        cbrt( ).
      </li>
      <li>
        <strong>Use Ans to chain calculations.</strong> After pressing =, Ans holds the result, so
        you can continue with Ans × 1.2 without retyping it. The history keeps your last ten
        results.
      </li>
      <li>
        <strong>Keyboard shortcuts.</strong> Type directly into the expression: * and / work as ×
        and ÷, Enter evaluates, and Escape clears.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'Why is −2² equal to −4 and not 4?',
      a: 'In standard mathematical notation, powers bind more tightly than a leading minus sign, so −2² means −(2²) = −4. To square negative two, write (−2)² or (−2)^2, which gives 4. Most scientific calculators and algebra courses follow the same rule.',
    },
    {
      q: 'Should I use degrees or radians?',
      a: 'Use degrees when angles are given in degrees, as in geometry, navigation and construction. Use radians in calculus, physics formulas and anywhere an angle is written with π. A full turn is 360° or 2π radians, so 180° = π radians.',
    },
    {
      q: 'Why does 0.1 + 0.2 not equal 0.3 exactly on some calculators?',
      a: 'Computers store numbers in binary, where 0.1 and 0.2 have no exact representation, so the raw sum is 0.30000000000000004. This calculator rounds results to 12 significant digits, which shows 0.3 while keeping all the precision your input actually has.',
    },
    {
      q: 'What is the largest factorial it can calculate?',
      a: '170!, about 7.257 × 10³⁰⁶. 171! exceeds the largest number double-precision arithmetic can store, about 1.8 × 10³⁰⁸, so the calculator reports an overflow instead of an inaccurate value. Larger factorials need arbitrary-precision software.',
    },
    {
      q: 'How do I calculate a percentage of a number?',
      a: 'Type the number, multiply, and add the percent sign: 200 × 15% gives 30, because % divides the number before it by 100. For percentage change, reverse percentages and differences, the dedicated percentage calculator explains each step.',
    },
  ],
  // OG images use the bundled Latin subset, which has no √ glyph.
  ogSample: (r, fmt) => `2^10 + sqrt(144) − sin(30) = ${fmt.sig(o(r, 'result'), 12)}`,
};
