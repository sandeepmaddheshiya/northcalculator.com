import type { CalculatorDefinition } from '@/calculators/types';

const c = (percent: number, credits = 1) => ({ percent, credits });

export const definition: CalculatorDefinition = {
  id: 'percent-gpa',
  slug: { en: 'percentage-to-gpa-calculator' },
  category: 'education',
  tags: [
    'percentage to GPA',
    'percent to 4.0 scale',
    'grade percentage to GPA',
    'GPA conversion',
    'high school GPA',
  ],
  difficulty: 'basic',
  ymyl: false,
  schemaCategory: 'EducationalApplication',
  roundingKey: 'rounding',
  inputs: [
    {
      id: 'classes',
      param: 'c',
      type: 'list',
      labelKey: 'classes',
      maxRows: 30,
      columns: [
        {
          id: 'percent',
          param: 'p',
          type: 'number',
          labelKey: 'col.percent',
          default: 90,
          min: 0,
          max: 100,
        },
        {
          id: 'credits',
          param: 'n',
          type: 'number',
          labelKey: 'col.credits',
          default: 1,
          min: 0,
          max: 30,
        },
      ],
      default: [c(95), c(92), c(91), c(84), c(76)],
      helpKey: 'classes.help',
    },
  ],
  outputs: [
    { id: 'gpa', labelKey: 'out.gpa', format: 'number', decimals: 2, primary: true },
    { id: 'average', labelKey: 'out.average', format: 'percent', decimals: 1 },
    { id: 'credits', labelKey: 'out.credits', format: 'number', decimals: 2 },
  ],
  sources: [
    {
      title: 'How to Calculate Your GPA on a 4.0 Scale',
      publisher: 'College Board (BigFuture)',
      url: 'https://bigfuture.collegeboard.org/plan-for-college/get-started/how-to-convert-gpa-4.0-scale',
      accessed: '2026-11-24',
      locator:
        'one commonly used system: A 90–100 = 4.0, B 80–89 = 3.0, C 70–79 = 2.0, D 66–69 = 1.0, E/F below 65 = 0.0; (4.0 + 4.0 + 4.0 + 3.0 + 2.0) ÷ 5 = 3.4; schools differ',
    },
    {
      title: 'Grades: UC Berkeley grade definitions',
      publisher: 'Office of the Registrar, University of California, Berkeley',
      url: 'https://registrar.berkeley.edu/academic-policies-procedures/grades/',
      accessed: '2026-11-24',
      locator: 'GPA as grade points weighted by units: A 4.0, B 3.0, C 2.0, D 1.0, F 0.0',
    },
  ],
  review: { status: 'pending' },
  draftedWith: 'ai-assisted',
  version: '1.0.0',
  changelog: [{ version: '1.0.0', date: '2026-11-24', note: 'First published.' }],
  related: ['gpa', 'grade', 'test-score'],
  examples: [
    {
      id: 'collegeBoard',
      inputs: { classes: [c(95), c(92), c(91), c(84), c(76)] },
      expect: { gpa: 3.4 },
    },
    { id: 'credits', inputs: { classes: [c(88, 4), c(93, 3), c(71, 3)] }, expect: { gpa: 3 } },
    { id: 'boundary', inputs: { classes: [c(89.5), c(90)] }, expect: { gpa: 3.5 } },
  ],
  locales: ['en'],
  contentUpdated: '2026-11-24',
};
