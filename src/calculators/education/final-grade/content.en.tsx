import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'needed') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Final Grade Calculator',
  promise: 'The score you need on your final exam to reach the course grade you want.',
  title: 'Final Grade Calculator: What Do I Need on My Final Exam?',
  description:
    'Find the score you need on a final exam to reach a target course grade, from your current grade and the final’s weight. Shows the best and worst outcomes too.',
  summary:
    'Your course grade after the final is your current grade times the share of the course already graded, plus your exam score times the exam’s weight. Solving for the exam score gives the grade you need: subtract the points you already have from the target, then divide by the final’s weight. Above 100% means the target is out of reach without extra credit.',
  synonyms: [
    'final exam calculator',
    'what do I need on my final',
    'final exam grade calculator',
    'grade needed calculator',
    'exam score needed',
    'required final grade',
  ],
  ui: {
    current: 'Current grade',
    'current.help': 'Your grade on everything before the final, as your gradebook shows it.',
    target: 'Course grade you want',
    weight: 'Weight of the final exam',
    'weight.help': 'The final’s share of the course grade, from your syllabus.',
    'out.needed': 'Score needed on the final',
    'out.ifPerfect': 'Course grade with 100% on the final',
    'out.ifZero': 'Course grade if you miss the final',
    explain: 'To finish with {t}, you need at least {n} on a final worth {w} of the grade.',
    'explain.over':
      'Reaching {t} would take {n} on the final, more than a perfect score, so it is out of reach without extra credit.',
    'explain.secured':
      'You already have {t}: even a score of 0 on the final keeps you at or above it.',
    'step.kept': 'Points already earned: current grade × the share of the course before the final.',
    'step.gap': 'Points still needed: target − points already earned.',
    'step.divide': 'Divide by the final’s weight to get the exam score needed.',
    'table.caption': 'Score needed on the final for each letter grade (90/80/70/60 scale)',
    'table.letter': 'Letter',
    'table.target': 'Course grade',
    'table.needed': 'Final exam score needed',
    'warn.over100':
      'Even 100% on the final gives {best}. Ask whether extra credit or a curve is available.',
    'warn.secured':
      'You have already secured this grade, as long as the final is the only work left.',
    rounding:
      'Computed exactly and rounded half-up to 4 decimal places, shown to 2. Round the needed score up, not to the nearest whole number, to be safe.',
  },
  HowItWorks: () => (
    <>
      <p>
        If the final exam is worth w of the course, everything else is worth 1 − w. Your course
        grade is a weighted average of the two parts:
      </p>
      <Formula
        label="Course grade after the final"
        where={[
          { symbol: 'C', meaning: 'current grade on the work before the final' },
          { symbol: 'E', meaning: 'final exam score' },
          { symbol: 'w', meaning: 'weight of the final, as a decimal' },
        ]}
      >
        {'grade = C × (1 − w) + E × w'}
      </Formula>
      <p>Setting the grade equal to your target T and solving for E:</p>
      <Formula label="Score needed on the final">{'E = (T − C × (1 − w)) ÷ w'}</Formula>
      <p>
        This is the same weighted-grade arithmetic universities publish for computing a final grade,
        run backwards. In the University of Illinois example, the work before the final adds up to
        60.055 of 70 possible weighted points (85.79%). With a 30% final, an 83 on the exam gives
        exactly the 84.955 the guide reports.
      </p>
      <p>
        The formula assumes your current grade already reflects the weights of the other categories.
        If your gradebook shows a running total on graded work only, that is the number to enter.
      </p>
    </>
  ),
  examples: [
    {
      id: 'a',
      title: 'From 86% to an A with a 30% final',
      body: (r, fmt) => (
        <p>
          The 70% of the course already done gives 86 × 0.7 = 60.2 points. An A needs 90, so the
          final must supply 29.8 points out of its 30: 29.8 ÷ 0.3 ={' '}
          <strong>{fmt.pct(o(r), 2)}</strong>. Possible, but it leaves almost no room for error.
        </p>
      ),
    },
    {
      id: 'b',
      title: 'Keeping a B with the same grades',
      body: (r, fmt) => (
        <p>
          With the same 86% and a 30% final, holding on to a B (80%) needs only (80 − 60.2) ÷ 0.3 ={' '}
          <strong>{fmt.pct(o(r), 0)}</strong>. Knowing that number can make revision less stressful
          and help you decide how to split your time between courses.
        </p>
      ),
    },
    {
      id: 'reach',
      title: 'When the target is out of reach',
      body: (r, fmt) => (
        <p>
          At 72% with a final worth 20%, an A would need (90 − 57.6) ÷ 0.2 ={' '}
          <strong>{fmt.pct(o(r), 0)}</strong>, which is impossible. A perfect final would lift the
          course grade to {fmt.pct(o(r, 'ifPerfect'), 1)}, so a B is the highest realistic goal.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Use the weighted current grade.</strong> A plain average of your scores ignores
        category weights. Use the running grade from your gradebook, or work it out with the grade
        calculator first.
      </li>
      <li>
        <strong>Check for other work after the final.</strong> If a project or participation grade
        is still to come, the formula overstates what the final needs to do, or understates it if
        those are likely to be lower.
      </li>
      <li>
        <strong>Ask about replacement policies.</strong> Some courses let a final exam score replace
        a lower midterm, or drop the lowest quiz. That changes your current grade, so recompute with
        the policy applied.
      </li>
      <li>
        <strong>A small weight limits what the final can change.</strong> A final worth 10% can move
        your grade by at most 10 points. When the needed score is above 100, putting effort into
        remaining assignments may help more.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do I calculate what I need on my final?',
      a: 'Multiply your current grade by the share of the course that is already graded, subtract that from the grade you want, and divide by the final’s weight. With 85% so far, a 25% final and a target of 80%: 85 × 0.75 = 63.75, then (80 − 63.75) ÷ 0.25 = 65%.',
    },
    {
      q: 'What happens if I get a zero on the final?',
      a: 'Your course grade becomes your current grade times the share of the course outside the final. With 88% and a 20% final, a zero leaves you at 70.4%. That is why missing a heavily weighted final can drop a strong grade by more than a full letter.',
    },
    {
      q: 'What if I need more than 100% on the final?',
      a: 'Then the target cannot be reached with the exam alone. The calculator shows your best possible grade, with a perfect final. Extra credit, a curve or a grade replacement policy could still change the outcome, so ask your instructor what options exist.',
    },
    {
      q: 'Does the final exam weight include the rest of the semester?',
      a: 'No. The weight is the final’s own share of the course grade, as listed in the syllabus, for example 30%. Everything else together makes up the remaining 70%. If your syllabus splits the final into parts, add their weights.',
    },
    {
      q: 'Why does my teacher’s grade differ from this result?',
      a: 'Gradebooks may round each category, drop low scores, or weight categories differently from the way you assumed. Some instructors also round the final grade, for example 89.5 up to 90. Use the needed score as a guide, and aim a little above it.',
    },
  ],
  ogSample: (r, fmt) => `Need ${fmt.pct(o(r), 2)} on the final`,
};
