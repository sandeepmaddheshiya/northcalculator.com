import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';
import { GRADES } from './definition';

const o = (r: { outputs: Record<string, unknown> }, k: string) => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'GPA Calculator',
  promise: 'Unweighted and weighted GPA on the 4.0 scale, plus your cumulative GPA.',
  title: 'GPA Calculator: Weighted, Unweighted and Cumulative GPA',
  description:
    'Calculate your grade point average on the US 4.0 scale from letter grades and credits, with weighted GPA for honors and AP courses and a cumulative GPA.',
  summary:
    'Grade point average (GPA) converts each letter grade to points on a 4.0 scale (A = 4.0, B = 3.0, C = 2.0, D = 1.0, F = 0), multiplies by the course credits, and divides the total by the total credits. A weighted GPA adds a bonus for honors and AP or IB courses, which schools set themselves. Cumulative GPA folds this term into the credits you already have.',
  synonyms: [
    'grade point average calculator',
    'weighted GPA calculator',
    'unweighted GPA',
    'cumulative GPA calculator',
    'college GPA calculator',
    'high school GPA calculator',
    'semester GPA',
  ],
  ui: {
    courses: 'Courses',
    'courses.row': 'course {n}',
    'courses.add': 'Add a course',
    'courses.remove': 'Remove course {n}',
    'col.grade': 'Grade',
    'col.credits': 'Credits',
    'col.type': 'Level',
    ...Object.fromEntries(GRADES.map((g) => [`grade.${g}`, g.replace('-', '−')])),
    'type.regular': 'Regular',
    'type.honors': 'Honors',
    'type.ap': 'AP / IB',
    aplus: 'An A+ counts as',
    'aplus.40': '4.0',
    'aplus.43': '4.3',
    'aplus.help': 'Most US colleges cap A+ at 4.0. Some schools give it 4.3.',
    honors: 'Honors bonus (points added)',
    apBonus: 'AP / IB bonus (points added)',
    'bonus.help':
      'Used for the weighted GPA only. Set these to your school’s policy. 0.5 and 1.0 are common.',
    priorGpa: 'Current cumulative GPA',
    'prior.help':
      'Your unweighted GPA so far, with the credits it covers. Leave credits at 0 to skip.',
    priorCredits: 'Credits completed so far',
    'out.gpa': 'GPA (unweighted)',
    'out.weighted': 'Weighted GPA',
    'out.cumulative': 'New cumulative GPA',
    'out.credits': 'Credits counted',
    'out.points': 'Quality points',
    explain: '{n} courses and {credits} credits give a GPA of {gpa} on the 4.0 scale.',
    'step.points': 'Quality points: each course’s grade points times its credits, added up.',
    'step.credits': 'Total credits.',
    'step.gpa': 'GPA: quality points divided by credits.',
    'step.weighted':
      'Weighted GPA: the same, with the honors and AP bonuses added to each passing grade.',
    'step.cumulative':
      'Cumulative GPA: earlier quality points plus this term’s, divided by all credits.',
    'table.caption': 'How each course counts',
    'table.n': 'Course',
    'table.grade': 'Grade',
    'table.credits': 'Credits',
    'table.gp': 'Grade points',
    'table.qp': 'Quality points',
    'table.type': 'Level',
    'warn.empty': 'Add at least one course.',
    'warn.noCredits': 'Enter credits above zero for at least one course.',
    'warn.skipped': '{n} row(s) without a valid grade or credits were left out.',
    'warn.priorWeighted':
      'A current GPA above 4.0 looks weighted. The cumulative figure combines it with this term’s unweighted GPA, so use your unweighted GPA there.',
    rounding:
      'GPA is computed exactly, rounded half-up to four decimal places and shown to two. Transcripts may truncate rather than round. Check your school’s rule if a cut-off is close.',
  },
  HowItWorks: () => (
    <>
      <p>
        Each letter grade has a fixed number of grade points. This calculator uses the standard US
        scale published by UC Berkeley’s registrar:
      </p>
      <Formula label="4.0 scale">
        {
          'A+ 4.0   A 4.0   A− 3.7\nB+ 3.3   B 3.0   B− 2.7\nC+ 2.3   C 2.0   C− 1.7\nD+ 1.3   D 1.0   D− 0.7\nF  0.0'
        }
      </Formula>
      <p>
        A course’s quality points are its grade points times its credits (or units, or hours). GPA
        is the credit-weighted average:
      </p>
      <Formula
        label="Grade point average"
        where={[
          { symbol: 'gᵢ', meaning: 'grade points for course i' },
          { symbol: 'cᵢ', meaning: 'credits for course i' },
        ]}
      >
        {'GPA = Σ(gᵢ × cᵢ) ÷ Σcᵢ'}
      </Formula>
      <p>
        When every course has the same credits, this is a plain average. The College Board’s own
        example: three A’s, a B and a C give (4 + 4 + 4 + 3 + 2) ÷ 5 = 3.4.
      </p>
      <h3>Weighted GPA</h3>
      <p>
        Many high schools add points for harder courses, so an A in an AP class counts as 5.0
        instead of 4.0. There is no national rule. Common policies add 0.5 for honors and 1.0 for AP
        or IB, but your school may differ, so both bonuses are editable under “More options”. No
        bonus is added to an F. Colleges often recalculate applicants’ GPAs with their own weighting
        or without any, which is why the unweighted GPA is the primary result here.
      </p>
      <h3>Cumulative GPA</h3>
      <p>
        To update an overall GPA, multiply your current GPA by the credits it covers to get your
        quality points so far. Add this term’s quality points, then divide by all credits.
      </p>
    </>
  ),
  examples: [
    {
      id: 'collegeBoard',
      title: 'Five equal-credit classes: three A’s, a B and a C',
      body: (r, fmt) => (
        <p>
          With equal credits, GPA is a simple average of the grade points: (4.0 + 4.0 + 4.0 + 3.0 +
          2.0) ÷ 5 = <strong>{fmt.num(o(r, 'gpa'), 2)}</strong>. This is the College Board’s worked
          example.
        </p>
      ),
    },
    {
      id: 'credits',
      title: 'A semester where credits differ',
      body: (r, fmt) => (
        <p>
          An A in a 4-credit course, a B− in a 3-credit course and a C+ in a 1-credit lab give 4.0 ×
          4 + 2.7 × 3 + 2.3 × 1 = {fmt.num(o(r, 'points'), 1)} quality points over 8 credits. GPA =
          26.4 ÷ 8 = <strong>{fmt.num(o(r, 'gpa'), 2)}</strong>. A plain average of the three grades
          would give 3.0. The heavier A pulls the true GPA up.
        </p>
      ),
    },
    {
      id: 'cumulative',
      title: 'Weighted and cumulative GPA after a strong term',
      body: (r, fmt) => (
        <p>
          Four 3-credit courses (A, A−, B+ in honors, A in AP) give an unweighted term GPA of{' '}
          <strong>{fmt.num(o(r, 'gpa'), 2)}</strong>. With +0.5 for honors and +1.0 for AP, the
          weighted GPA is {fmt.num(o(r, 'weighted'), 3)}. A student who had a 3.20 GPA over 45
          credits had 144 quality points. Adding this term’s 45 gives 189 over 57 credits, a new
          cumulative GPA of {fmt.num(o(r, 'cumulative'), 2)}.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Leave out pass/fail courses.</strong> Grades such as P, NP, S, U and incompletes
        usually carry credits but no grade points and are excluded from GPA. Retaken courses are
        handled differently by each school.
      </li>
      <li>
        <strong>Raising a cumulative GPA gets harder with every term.</strong> After 90 credits at
        3.0, a perfect 15-credit semester only lifts the cumulative GPA to 3.14. Earlier terms carry
        the weight of their credits.
      </li>
      <li>
        <strong>Outside the US, scales differ.</strong> UK degree classifications, Indian CGPA on a
        10-point scale and the ECTS grades don’t convert one-to-one to a 4.0 GPA. Use the conversion
        your target university publishes rather than a formula.
      </li>
      <li>
        <strong>Report the GPA your transcript shows.</strong> Applications usually ask for your
        school’s official GPA, weighted or not as stated. Use this calculator to plan and check, and
        copy the official figure onto forms.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do I calculate my GPA?',
      a: 'Convert each grade to points (A = 4.0, A− = 3.7, B+ = 3.3, B = 3.0 and so on), multiply each by the course credits, add the results and divide by the total credits. An A in a 4-credit course, a B− in 3 credits and a C+ in 1 credit give 26.4 ÷ 8 = 3.30.',
    },
    {
      q: 'What is the difference between weighted and unweighted GPA?',
      a: 'Unweighted GPA uses the 4.0 scale for every course. Weighted GPA adds extra points for advanced courses, commonly 0.5 for honors and 1.0 for AP or IB, so it can exceed 4.0. Schools set their own weighting, and many colleges recalculate GPAs on their own scale.',
    },
    {
      q: 'Is an A+ worth 4.0 or 4.3?',
      a: 'At most US colleges, including UC Berkeley, an A+ earns 4.0, the same as an A. Some schools award 4.3 for an A+. Choose the rule your school uses under “More options”. It only matters if you have A+ grades.',
    },
    {
      q: 'How do I calculate my cumulative GPA?',
      a: 'Multiply your current cumulative GPA by the credits it covers to get your total quality points, add this term’s quality points, and divide by the combined credits. With 3.20 over 45 credits and a term of 45 points over 12 credits: (144 + 45) ÷ 57 = 3.32.',
    },
    {
      q: 'Do pass/fail classes count toward GPA?',
      a: 'Usually not. Pass/no pass and satisfactory/unsatisfactory grades carry no grade points, so they are left out of both the points and the credits used for GPA, though the credits may still count toward graduation. Leave those courses out of this calculator.',
    },
  ],
  ogSample: (r, fmt) => `GPA ${fmt.num(o(r, 'gpa'), 2)}`,
};
