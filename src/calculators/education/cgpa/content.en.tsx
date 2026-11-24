import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';
import { CBSE_GRADES } from './definition';

const o = (r: { outputs: Record<string, unknown> }, k = 'percent') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'CGPA to Percentage Calculator',
  promise: 'Convert a CBSE CGPA or subject grades into the indicative percentage.',
  title: 'CGPA to Percentage Calculator: CBSE Formula 9.5 × CGPA',
  description:
    'Convert a CBSE Class X CGPA to an indicative percentage with the board’s official formula, 9.5 × CGPA, or work out the CGPA first from your subject grades.',
  summary:
    'Under its CGPA grading scheme, the Central Board of Secondary Education (CBSE) gives an official way to turn grades into marks: the overall indicative percentage is 9.5 times the CGPA. The CGPA is the average grade point of the main subjects, leaving out any additional sixth subject. A CGPA of 9.6 is therefore 91.2%, and a perfect 10 is 95%.',
  synonyms: [
    'CBSE CGPA calculator',
    'convert CGPA to percentage',
    'CGPA into percentage',
    'class 10 CGPA calculator',
    'grade point to percentage',
    'indicative percentage CBSE',
  ],
  ui: {
    mode: 'I have',
    'mode.cgpa': 'My CGPA',
    'mode.grades': 'Subject grades',
    cgpa: 'CGPA (out of 10)',
    subjects: 'Grades in the main subjects',
    'subjects.help':
      'Enter the five main subjects. Leave out the additional sixth subject, as CBSE does.',
    'subjects.row': 'subject {n}',
    'subjects.add': 'Add a subject',
    'subjects.remove': 'Remove subject {n}',
    'col.grade': 'Grade',
    ...Object.fromEntries(
      Object.entries(CBSE_GRADES).map(([g, [gp, range]]) => [
        `grade.${g}`,
        `${g} (${gp}, marks ${range})`,
      ]),
    ),
    'out.percent': 'Indicative percentage',
    'out.cgpa': 'CGPA',
    explain: 'A CGPA of {c} corresponds to an indicative {p} under the CBSE formula.',
    'step.average': 'CGPA = average of the subject grade points.',
    'step.multiply': 'Indicative percentage = 9.5 × CGPA.',
    'table.caption': 'Indicative percentage for each subject (9.5 × grade point)',
    'table.n': 'Subject',
    'table.grade': 'Grade',
    'table.gp': 'Grade point',
    'table.pct': 'Indicative %',
    'warn.empty': 'Add at least one subject grade.',
    'warn.range': 'A CBSE CGPA is between 0 and 10.',
    'warn.sixth':
      'CBSE leaves the additional sixth subject out of the CGPA. Remove it here if it is included.',
    rounding:
      'CGPA is averaged exactly and the percentage is 9.5 × CGPA, shown to one decimal place.',
  },
  HowItWorks: () => (
    <>
      <p>CBSE’s Class X FAQ and its CCE teachers’ manual give the same two formulas:</p>
      <Formula label="CBSE indicative percentage">
        {
          'subject-wise indicative % = 9.5 × grade point of the subject\noverall indicative % = 9.5 × CGPA'
        }
      </Formula>
      <p>
        The CGPA (cumulative grade point average) is the average of the grade points in all
        subjects, excluding the additional sixth subject. Grade points come from the nine-point
        scale in the CCE manual:
      </p>
      <Formula label="Nine-point scale">
        {
          'A1 91–100 → 10    A2 81–90 → 9    B1 71–80 → 8\nB2 61–70 → 7     C1 51–60 → 6    C2 41–50 → 5\nD 33–40 → 4      E1 21–32 → 3    E2 0–20 → 2'
        }
      </Formula>
      <p>
        CBSE calls the result indicative: it is an equivalence, not the actual marks scored. Because
        each grade covers a ten-mark band, two students with the same CGPA can have different raw
        marks.
      </p>
    </>
  ),
  examples: [
    {
      id: 'direct',
      title: 'A CGPA of 9.6',
      body: (r, fmt) => (
        <p>
          9.5 × 9.6 = <strong>{fmt.pct(o(r), 1)}</strong>. If an application asks for a percentage,
          this is CBSE’s own conversion; check whether the institution specifies another.
        </p>
      ),
    },
    {
      id: 'grades',
      title: 'From five subject grades',
      body: (r, fmt) => (
        <p>
          Grades A1, A1, A2, A2 and B1 have grade points 10, 10, 9, 9 and 8. Their average is{' '}
          {fmt.num(o(r, 'cgpaOut'), 1)}, so the indicative percentage is 9.5 × 9.2 ={' '}
          <strong>{fmt.pct(o(r), 1)}</strong>.
        </p>
      ),
    },
    {
      id: 'perfect',
      title: 'Why a 10 CGPA is 95%, not 100%',
      body: (r, fmt) => (
        <p>
          9.5 × 10 = <strong>{fmt.pct(o(r), 0)}</strong>. An A1 covers marks from 91 to 100, so a
          CGPA cannot say where in that band a score fell, and the CBSE formula never reaches 100%.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Use your marksheet if it shows marks.</strong> The formula applies to certificates
        that report grades and CGPA. If your marksheet gives marks, use those directly.
      </li>
      <li>
        <strong>Leave out the sixth subject.</strong> CBSE’s CGPA excludes the additional subject.
        Including it changes the average.
      </li>
      <li>
        <strong>Other boards and universities differ.</strong> State boards and colleges using a
        10-point scale may publish their own conversion rules. Use the rule printed on your own
        marksheet or in the admission notice.
      </li>
      <li>
        <strong>It is indicative.</strong> Where an exact percentage matters, such as a cut-off, ask
        the institution how it will treat a CGPA.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do I convert CBSE CGPA to percentage?',
      a: 'Multiply the CGPA by 9.5. A CGPA of 8.4 is 9.5 × 8.4 = 79.8%, and 9.2 is 87.4%. This is the formula the Central Board of Secondary Education publishes for an indicative overall percentage.',
    },
    {
      q: 'How is CGPA calculated in CBSE?',
      a: 'Convert each subject grade to its grade point (A1 = 10, A2 = 9, B1 = 8, down to E2 = 2) and average the grade points of the main subjects, leaving out the additional sixth subject. Five subjects with 10, 9, 9, 8 and 8 give a CGPA of 8.8.',
    },
    {
      q: 'Why does CBSE multiply by 9.5?',
      a: 'CBSE publishes 9.5 as the factor for an indicative equivalence between grade points and marks; its FAQ and CCE manual give the formula without the derivation. The result is an estimate: actual marks for a given grade can lie anywhere in that grade’s ten-mark band.',
    },
    {
      q: 'Can I use this for my university’s CGPA?',
      a: 'Only if your university uses the same rule. Many universities publish their own CGPA-to-percentage conversion, sometimes with a different factor or a subtraction. Follow the formula printed on your grade card or in the university’s regulations.',
    },
  ],
  ogSample: (r, fmt) => `CGPA 9.6 = ${fmt.pct(o(r), 1)}`,
};
