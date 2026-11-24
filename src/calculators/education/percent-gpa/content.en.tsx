import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'gpa') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Percentage to GPA Calculator',
  promise: 'Turn percentage grades into a GPA on the 4.0 scale.',
  title: 'Percentage to GPA Calculator: Convert Grades to a 4.0 GPA',
  description:
    'Convert class percentages to a 4.0-scale GPA using the College Board’s common A–F ranges, with credits for each class and a table of how every grade counts.',
  summary:
    'To turn percentage grades into a GPA, each class percentage is first mapped to a letter and its grade points, and the points are then averaged. On the College Board’s common scale, 90–100% is an A (4.0), 80–89% a B (3.0), 70–79% a C (2.0) and 66–69% a D (1.0). Schools set their own cut-offs, so treat the result as an estimate.',
  synonyms: [
    'percent to GPA converter',
    'convert percentage to GPA',
    'grade percentage to 4.0 scale',
    'GPA from percentages',
    '4.0 scale converter',
    'percentage grade GPA',
  ],
  ui: {
    classes: 'Your classes',
    'classes.help':
      'Enter each class’s percentage grade and its credits (use 1 for every class if credits are equal).',
    'classes.row': 'class {n}',
    'classes.add': 'Add a class',
    'classes.remove': 'Remove class {n}',
    'col.percent': 'Grade (%)',
    'col.credits': 'Credits',
    'out.gpa': 'GPA (4.0 scale)',
    'out.average': 'Average percentage',
    'out.credits': 'Credits counted',
    explain: 'Across {n} classes your estimated GPA is {gpa} on the 4.0 scale.',
    'step.letters': 'Map each percentage to a letter grade and its grade points.',
    'step.average': 'Average the grade points, weighted by credits.',
    'table.caption': 'How each class converts',
    'table.n': 'Class',
    'table.pct': 'Percentage',
    'table.letter': 'Letter',
    'table.points': 'Grade points',
    'warn.empty': 'Enter at least one class with a percentage and credits above zero.',
    'warn.skipped': '{n} row(s) without a percentage or credits were left out.',
    'warn.scale':
      'This uses the College Board’s common scale without plus or minus grades. Your school’s scale and cut-offs may differ, so check your transcript for the official GPA.',
    'warn.65':
      'The College Board table does not assign 65% to a letter; it is counted here as an F.',
    rounding:
      'Percentages are not rounded before choosing the letter. The GPA is rounded half-up to 4 decimals and shown to 2.',
  },
  HowItWorks: () => (
    <>
      <Formula label="College Board scale (one commonly used system)">
        {
          'A  90–100%  → 4.0\nB  80–89%   → 3.0\nC  70–79%   → 2.0\nD  66–69%   → 1.0\nF  below 65% → 0.0'
        }
      </Formula>
      <Formula
        label="GPA"
        where={[
          { symbol: 'pᵢ', meaning: 'grade points for class i' },
          { symbol: 'cᵢ', meaning: 'credits for class i' },
        ]}
      >
        {'GPA = Σ(pᵢ × cᵢ) ÷ Σcᵢ'}
      </Formula>
      <p>
        The College Board notes that this table is not a formula for your true GPA: some schools use
        plus and minus grades, others have different cut-offs, and colleges may recalculate GPAs
        their own way. Converting through letters also loses detail: 90% and 100% both become 4.0.
      </p>
      <p>
        If your school reports letter grades with pluses and minuses, the GPA calculator gives a
        more precise result.
      </p>
    </>
  ),
  examples: [
    {
      id: 'collegeBoard',
      title: 'Five classes: 95, 92, 91, 84 and 76%',
      body: (r, fmt) => (
        <p>
          The three grades of 90% or above are A’s (4.0), 84% is a B (3.0) and 76% a C (2.0). (4 + 4
          + 4 + 3 + 2) ÷ 5 = <strong>{fmt.num(o(r), 2)}</strong>, the College Board’s worked
          example. The plain average of the percentages is {fmt.pct(o(r, 'average'), 1)}.
        </p>
      ),
    },
    {
      id: 'credits',
      title: 'Classes with different credits',
      body: (r, fmt) => (
        <p>
          88% in a 4-credit class (B, 3.0), 93% in 3 credits (A, 4.0) and 71% in 3 credits (C, 2.0)
          give (12 + 12 + 6) ÷ 10 = <strong>{fmt.num(o(r), 2)}</strong>.
        </p>
      ),
    },
    {
      id: 'boundary',
      title: 'Why 89.5% is not an A here',
      body: (r, fmt) => (
        <p>
          The calculator does not round percentages, so 89.5% is a B (3.0) and 90% an A (4.0),
          averaging <strong>{fmt.num(o(r), 2)}</strong>. If your school rounds 89.5 up to 90, enter
          90 instead.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Your transcript is the official GPA.</strong> Use this to estimate or plan; copy the
        figure your school reports onto applications.
      </li>
      <li>
        <strong>Plus and minus grades change the result.</strong> An 89% may be a B+ (3.3) at a
        school that uses them. Use the GPA calculator with letter grades if you have them.
      </li>
      <li>
        <strong>Weighted courses</strong> such as AP or honors may earn extra points at your school;
        this converter gives the unweighted GPA.
      </li>
      <li>
        <strong>Outside the US,</strong> percentage systems and their conversions to GPA vary.
        Follow the conversion published by the institution you are applying to.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do I convert a percentage to a 4.0 GPA?',
      a: 'Map each class percentage to a letter grade and its points, then average the points. On the College Board’s common scale, 90–100% is 4.0, 80–89% is 3.0, 70–79% is 2.0 and 66–69% is 1.0. Grades of 95, 85 and 75 average 3.0.',
    },
    {
      q: 'What GPA is 85 percent?',
      a: 'On the College Board’s common scale, 85% is a B, which is 3.0. At schools that use plus and minus grades it may be a B or B+, worth 3.0 or 3.3, so check your school’s grading scale.',
    },
    {
      q: 'Can I just divide my percentage by 25?',
      a: 'No. Dividing by 25 maps 100% to 4.0 but treats 80% as 3.2 and 60% as 2.4, which no standard scale does. GPA is based on letter-grade bands, so convert each class to its grade points instead.',
    },
    {
      q: 'Why is my school’s GPA different from this?',
      a: 'Schools set their own grading scales, plus-and-minus rules and weighting for advanced classes, and may round percentages before assigning letters. The College Board says to check with your school for the most accurate conversion.',
    },
  ],
  ogSample: (r, fmt) => `GPA ${fmt.num(o(r), 2)}`,
};
