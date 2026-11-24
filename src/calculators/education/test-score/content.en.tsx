import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'percent') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Test Score Calculator',
  promise: 'A test or quiz score as a percentage, from the number wrong or points earned.',
  title: 'Test Score Calculator: Percentage Score From Wrong Answers',
  description:
    'Turn a test or quiz result into a percentage from the number of questions missed or the points earned, with the letter grade and the value of each question.',
  summary:
    'A test score as a percentage is the points earned divided by the points possible, multiplied by 100. If a 40-question test has 3 answers wrong, 37 are right, and 37 ÷ 40 = 92.5%. Each question on that test is worth 2.5 percentage points. Teachers use the same formula to grade quickly, and students use it to check a mark.',
  synonyms: [
    'test grade calculator',
    'quiz score calculator',
    'exam percentage calculator',
    'grade calculator for teachers',
    'percentage score calculator',
    'easy grader',
  ],
  ui: {
    total: 'Total questions or points',
    'total.help':
      'The number of questions, or the maximum points if questions carry different marks.',
    mode: 'I know the number',
    'mode.wrong': 'Wrong',
    'mode.right': 'Right (points earned)',
    'n.wrong': 'Questions wrong (or points lost)',
    'n.right': 'Questions right (or points earned)',
    'out.percent': 'Score',
    'out.letter': 'Letter grade (90/80/70/60 scale)',
    'out.right': 'Right (points earned)',
    'out.wrong': 'Wrong (points lost)',
    'out.perItem': 'Percentage points per question',
    explain: '{right} out of {total} is {p}, a {l} on the common 10-point scale.',
    'step.right': 'Points earned = total − wrong.',
    'step.percent': 'Score = points earned ÷ total × 100.',
    'warn.total': 'Enter a total above zero.',
    'warn.tooManyWrong': 'The number wrong is larger than the total.',
    'warn.extra': 'The score is above 100%, which happens with bonus points.',
    rounding:
      'Scores are rounded half-up to 4 decimal places and shown to 2. Many teachers round to whole percentages.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Percentage score">{'score = points earned ÷ points possible × 100'}</Formula>
      <p>
        This is the percent proportion from OpenStax <em>Prealgebra</em>: amount ÷ base = percent ÷
        100. Its Example 6.54 asks what percent of 72 is 9: 9 ÷ 72 = 12.5%. A test score is the same
        calculation with the points earned as the amount and the points possible as the base.
      </p>
      <p>
        If every question is worth one point, the points earned are the total minus the number
        wrong, and each question is worth 100 ÷ total percentage points. On a 25-question quiz each
        miss costs 4 points; on a 40-question test, 2.5.
      </p>
      <p>
        When questions carry different marks, enter points instead of questions: CSU Chico’s example
        adds homework scores of 8/10, 18/20 and 24/30 to get 50/60 = 83.3%.
      </p>
    </>
  ),
  examples: [
    {
      id: 'wrong',
      title: '3 wrong on a 40-question test',
      body: (r, fmt) => (
        <p>
          40 − 3 = 37 right, and 37 ÷ 40 = <strong>{fmt.pct(o(r), 1)}</strong>, an{' '}
          {String(r.outputs.letter)}. Each question was worth 2.5 percentage points.
        </p>
      ),
    },
    {
      id: 'points',
      title: '50 points out of 60',
      body: (r, fmt) => (
        <p>
          Choose Right and enter 50 out of 60. 50 ÷ 60 = <strong>{fmt.pct(o(r), 2)}</strong>, a{' '}
          {String(r.outputs.letter)} on the 10-point scale.
        </p>
      ),
    },
    {
      id: 'per',
      title: 'One mistake on a 25-question quiz',
      body: (r, fmt) => (
        <p>
          Each question is worth {fmt.num(o(r, 'perItem'), 2)} points, so one wrong answer gives{' '}
          <strong>{fmt.pct(o(r), 0)}</strong>.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Check the grading scale.</strong> The letter uses A = 90 and above, B = 80, C = 70
        and D = 60. Your teacher or school may use other cut-offs or plus and minus grades.
      </li>
      <li>
        <strong>Partial credit counts.</strong> If a question can earn part of its marks, use points
        rather than question counts so half marks are included.
      </li>
      <li>
        <strong>One test is part of the grade.</strong> To see how a score affects your course
        grade, use the weighted grade calculator with the test’s weight.
      </li>
      <li>
        <strong>Teachers: make a chart.</strong> With a fixed number of questions, each wrong answer
        lowers the score by the same amount, so the per-question value builds a quick grading table.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do I calculate my test score percentage?',
      a: 'Divide the number of points or questions you got right by the total possible and multiply by 100. 18 right out of 20 is 18 ÷ 20 = 0.9, or 90%. If you know the number wrong, subtract it from the total first.',
    },
    {
      q: 'What percentage is 7 wrong out of 50?',
      a: 'You got 50 − 7 = 43 right, and 43 ÷ 50 = 86%. Each question on a 50-question test is worth 2 percentage points, so every wrong answer costs 2 points of the score.',
    },
    {
      q: 'How many questions can I miss and still get an A?',
      a: 'With A at 90%, you can miss up to 10% of the questions. On a 30-question test that is 3 questions; on a 25-question quiz, 2 questions (92%), since a third miss gives 88%.',
    },
    {
      q: 'What if questions are worth different points?',
      a: 'Add up the points you earned and the points possible, and divide. A test with 8 questions worth 5 points and 2 essays worth 10 points has 60 points possible; earning 51 of them is 85%.',
    },
  ],
  ogSample: (r, fmt) => `Score ${fmt.pct(o(r), 1)}`,
};
