import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'grade') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Grade Calculator',
  promise: 'Your weighted course grade from each category’s score and its share of the grade.',
  title: 'Grade Calculator: Weighted Course Grade From Your Scores',
  description:
    'Calculate your current class grade from assignments, quizzes and exams with different weights. Enter scores as points or percentages and see the letter grade.',
  summary:
    'A weighted grade multiplies each category’s score by its weight, adds the results and divides by the total weight. If homework is 40% of the grade and you scored 85% on it, it contributes 34 points. When some categories have no grades yet, dividing by the weights you have entered gives your grade so far.',
  synonyms: [
    'weighted grade calculator',
    'class grade calculator',
    'course grade calculator',
    'weighted average grade',
    'grade percentage calculator',
    'how to calculate my grade',
  ],
  ui: {
    items: 'Graded work',
    'items.row': 'item {n}',
    'items.add': 'Add a category',
    'items.remove': 'Remove item {n}',
    'col.score': 'Score',
    'col.max': 'Out of',
    'col.weight': 'Weight (%)',
    'out.grade': 'Weighted grade',
    'out.letter': 'Letter grade (90/80/70/60 scale)',
    'out.weight': 'Weight counted',
    'out.points': 'Weighted points earned',
    explain: 'Your weighted grade is {g}, a {l} on the common 10-point scale.',
    'explain.partial':
      'On the {w} of the course graded so far, your weighted grade is {g}, a {l} on the common 10-point scale.',
    'step.each': 'Turn each score into a percentage and multiply by its weight.',
    'step.sum': 'Add the weighted points and divide by the total weight.',
    'table.caption': 'How each item counts',
    'table.n': 'Item',
    'table.pct': 'Score (%)',
    'table.weight': 'Weight (%)',
    'table.points': 'Weighted points',
    'warn.empty': 'Enter at least one score with an “out of” value and a weight above zero.',
    'warn.skipped': '{n} row(s) with a missing score, “out of” value or weight were left out.',
    'warn.partial':
      'The weights add up to {w}, so this is your grade on the work graded so far, not the final grade.',
    'warn.over':
      'The weights add up to {w}, more than 100%. The grade is divided by the total, but check the weights in your syllabus.',
    'warn.extra': 'The grade is above 100%, which happens with extra credit.',
    rounding:
      'Scores are not rounded between steps. The grade is rounded half-up to 4 decimal places and shown to 2. Your school may round the final grade differently.',
  },
  HowItWorks: () => (
    <>
      <p>
        A syllabus usually lists categories with weights that add up to 100%, for example homework
        40%, quizzes 30% and the final exam 30%. Each category’s score is a percentage: the points
        you earned divided by the points possible.
      </p>
      <Formula
        label="Weighted grade"
        where={[
          { symbol: 'sᵢ', meaning: 'points earned in item i' },
          { symbol: 'mᵢ', meaning: 'points possible in item i' },
          { symbol: 'wᵢ', meaning: 'weight of item i, in %' },
        ]}
      >
        {'grade = Σ(sᵢ ÷ mᵢ × wᵢ) ÷ Σwᵢ × 100'}
      </Formula>
      <p>
        When the weights add up to 100, dividing by Σwᵢ changes nothing. When they don’t, because
        the final exam hasn’t happened yet, the division rescales the result to the work graded so
        far. This is how most learning management systems show a running grade.
      </p>
      <p>
        <strong>Points inside a category.</strong> Within one category, add up all the points you
        earned and all the points possible before dividing. Homework scores of 8/10, 18/20 and 24/30
        make 50/60, or 83.3%. Averaging the three percentages (80%, 90%, 80%) would give 83.3% here
        by coincidence, but in general larger assignments should count for more.
      </p>
    </>
  ),
  examples: [
    {
      id: 'illinois',
      title: 'Six weighted components, from the University of Illinois guide',
      body: (r, fmt) => (
        <p>
          Attendance 100 (15%), group projects 81.7 (15%), clicker participation 95 (5%), an
          extended response 79 (15%), the midterm 81 (20%) and the final exam 83 (30%). The weighted
          points are 15 + 12.255 + 4.75 + 11.85 + 16.2 + 24.9 = <strong>{fmt.num(o(r), 3)}</strong>,
          which the guide converts to a {String(r.outputs.letter)}.
        </p>
      ),
    },
    {
      id: 'points',
      title: 'Homework in points, quizzes and the final in percentages',
      body: (r, fmt) => (
        <p>
          CSU Chico’s example: homework of 50 out of 60 points is worth 40%, quizzes average 90%
          (30%) and the final is 80% (30%). The weighted grade is{' '}
          <strong>{fmt.pct(o(r), 2)}</strong>. The guide prints 84.32% because it rounds homework to
          83.3% before weighting. Keeping 50/60 exact gives 33.33 points for homework, not 33.32.
        </p>
      ),
    },
    {
      id: 'partial',
      title: 'Halfway through the course',
      body: (r, fmt) => (
        <p>
          Homework so far is 92% (20% of the grade) and the midterm was 78% (30%). Only{' '}
          {fmt.pct(o(r, 'weight'), 0)} of the grade exists yet, so the calculator divides 18.4 +
          23.4 = 41.8 points by 50: your grade so far is <strong>{fmt.pct(o(r), 2)}</strong>. To see
          what the rest of the course needs, use the final grade calculator.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Copy the weights from your syllabus.</strong> Weights are set by your instructor,
        and a category worth 30% matters three times as much as one worth 10%, however many
        assignments it holds.
      </li>
      <li>
        <strong>Letter cut-offs vary.</strong> The letter shown uses A = 90 and above, B = 80, C =
        70 and D = 60. Many courses add plus and minus grades or use different cut-offs, so check
        your syllabus near a boundary.
      </li>
      <li>
        <strong>Dropped scores and extra credit.</strong> If your course drops the lowest quiz,
        leave it out of the points. Enter extra credit as points above the maximum, or as its own
        item if the syllabus gives it a weight.
      </li>
      <li>
        <strong>Your gradebook is the official figure.</strong> Use this to check the arithmetic or
        plan ahead. If the two disagree, ask your instructor how categories and rounding are set up.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do I calculate my weighted grade?',
      a: 'Multiply each category’s percentage by its weight, add the results, and divide by the total of the weights. With homework 85% at 40%, quizzes 90% at 30% and the final 80% at 30%: 34 + 27 + 24 = 85, out of a total weight of 100, so the grade is 85%.',
    },
    {
      q: 'What if my weights don’t add up to 100%?',
      a: 'If some work hasn’t been graded yet, the weights you can enter will add up to less than 100%. Dividing by their total gives the grade on the work done so far. If your syllabus weights add up to more than 100%, there may be extra credit, so ask your instructor how it is counted.',
    },
    {
      q: 'Is a weighted grade different from an average of my scores?',
      a: 'Yes, unless every category has the same weight. A 60% on a final worth 40% pulls the grade down much more than a 60% on a quiz worth 5%. A plain average treats them equally, so it can be several points away from your actual grade.',
    },
    {
      q: 'How do I enter scores that are in points?',
      a: 'Put the points earned in the Score column and the points possible in Out of. The calculator turns them into a percentage before weighting, so 42 out of 50 counts as 84%. For percentages, leave Out of at 100.',
    },
    {
      q: 'What grade is an 89.5?',
      a: 'It depends on your course’s rounding policy. Some instructors round 89.5 up to 90 and give an A−, while others require a full 90.0. This calculator does not round before choosing the letter, so it shows a B. Check your syllabus or ask your instructor.',
    },
  ],
  ogSample: (r, fmt) => `Grade ${fmt.pct(o(r), 2)}`,
};
