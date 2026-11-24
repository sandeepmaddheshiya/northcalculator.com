import type { CalculatorDefinition } from '@/calculators/types';

/** CBSE nine-point grading scale (CCE Manual 2011): grade → [grade point, marks range]. */
export const CBSE_GRADES: Readonly<Record<string, readonly [number, string]>> = {
  A1: [10, '91–100'],
  A2: [9, '81–90'],
  B1: [8, '71–80'],
  B2: [7, '61–70'],
  C1: [6, '51–60'],
  C2: [5, '41–50'],
  D: [4, '33–40'],
  E1: [3, '21–32'],
  E2: [2, '0–20'],
};
const grade = (g: string) => ({ grade: g });

export const definition: CalculatorDefinition = {
  id: 'cgpa',
  slug: { en: 'cgpa-to-percentage-calculator' },
  category: 'education',
  tags: [
    'CGPA to percentage',
    'CBSE',
    'grade point',
    'class 10 CGPA',
    'indicative percentage',
    'CCE',
  ],
  difficulty: 'basic',
  ymyl: false,
  regions: ['IN'],
  schemaCategory: 'EducationalApplication',
  roundingKey: 'rounding',
  inputs: [
    {
      id: 'mode',
      param: 'm',
      type: 'segmented',
      labelKey: 'mode',
      default: 'cgpa',
      options: [
        { value: 'cgpa', labelKey: 'mode.cgpa' },
        { value: 'grades', labelKey: 'mode.grades' },
      ],
    },
    {
      id: 'cgpa',
      param: 'c',
      type: 'number',
      labelKey: 'cgpa',
      default: 9.6,
      min: 0,
      max: 10,
      showIf: { input: 'mode', in: ['cgpa'] },
    },
    {
      id: 'subjects',
      param: 'g',
      type: 'list',
      labelKey: 'subjects',
      maxRows: 6,
      showIf: { input: 'mode', in: ['grades'] },
      columns: [
        {
          id: 'grade',
          param: 'g',
          type: 'select',
          labelKey: 'col.grade',
          default: 'A1',
          options: Object.keys(CBSE_GRADES).map((g) => ({ value: g, labelKey: `grade.${g}` })),
        },
      ],
      default: [grade('A1'), grade('A1'), grade('A2'), grade('A2'), grade('B1')],
      helpKey: 'subjects.help',
    },
  ],
  outputs: [
    { id: 'percent', labelKey: 'out.percent', format: 'percent', decimals: 1, primary: true },
    { id: 'cgpaOut', labelKey: 'out.cgpa', format: 'number', decimals: 2 },
  ],
  sources: [
    {
      title: 'Frequently Asked Questions (Class X), Q24: How is CGPA calculated?',
      publisher: 'Central Board of Secondary Education (CBSE), 2016',
      url: 'https://www.cbse.gov.in/faq/FAQs_2016.pdf',
      accessed: '2026-11-24',
      locator:
        'CGPA = average of grade points in all subjects excluding the additional 6th subject; subject-wise indicative percentage = 9.5 × GP; overall indicative percentage = 9.5 × CGPA',
    },
    {
      title:
        'Continuous and Comprehensive Evaluation: Manual for Teachers, Classes IX and X (revised 2011)',
      publisher: 'Central Board of Secondary Education (CBSE)',
      url: 'https://cbseacademic.nic.in/web_material/cceresources/3_CCE_Manual_Revised_2011.pdf',
      accessed: '2026-11-24',
      locator:
        'nine-point grading scale: A1 91–100 = 10.0, A2 = 9.0 … D 33–40 = 4.0, E1 = 3.0, E2 = 2.0; 9.5 × CGPA',
    },
  ],
  review: { status: 'pending' },
  draftedWith: 'ai-assisted',
  version: '1.0.0',
  changelog: [{ version: '1.0.0', date: '2026-11-24', note: 'First published.' }],
  related: ['gpa', 'percentage', 'grade'],
  examples: [
    { id: 'direct', inputs: { mode: 'cgpa', cgpa: 9.6 }, expect: { percent: 91.2 } },
    {
      id: 'grades',
      inputs: {
        mode: 'grades',
        subjects: [grade('A1'), grade('A1'), grade('A2'), grade('A2'), grade('B1')],
      },
      expect: { cgpaOut: 9.2, percent: 87.4 },
    },
    { id: 'perfect', inputs: { mode: 'cgpa', cgpa: 10 }, expect: { percent: 95 } },
  ],
  locales: ['en'],
  contentUpdated: '2026-11-24',
};
