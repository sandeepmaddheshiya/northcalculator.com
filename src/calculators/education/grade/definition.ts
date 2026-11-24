import type { CalculatorDefinition } from '@/calculators/types';

const row = (score: number, max: number, weight: number) => ({ score, max, weight });

export const definition: CalculatorDefinition = {
  id: 'grade',
  slug: { en: 'grade-calculator' },
  category: 'education',
  tags: [
    'grade',
    'weighted grade',
    'course grade',
    'class grade',
    'weighted average',
    'final grade',
    'grade percentage',
  ],
  difficulty: 'basic',
  ymyl: false,
  schemaCategory: 'EducationalApplication',
  roundingKey: 'rounding',
  inputs: [
    {
      id: 'items',
      param: 'g',
      type: 'list',
      labelKey: 'items',
      maxRows: 30,
      columns: [
        {
          id: 'score',
          param: 's',
          type: 'number',
          labelKey: 'col.score',
          default: 90,
          min: 0,
          max: 1e6,
        },
        {
          id: 'max',
          param: 'm',
          type: 'number',
          labelKey: 'col.max',
          default: 100,
          min: 0,
          max: 1e6,
        },
        {
          id: 'weight',
          param: 'w',
          type: 'number',
          labelKey: 'col.weight',
          default: 10,
          min: 0,
          max: 100,
        },
      ],
      default: [
        row(100, 100, 15),
        row(81.7, 100, 15),
        row(95, 100, 5),
        row(79, 100, 15),
        row(81, 100, 20),
        row(83, 100, 30),
      ],
    },
  ],
  outputs: [
    { id: 'grade', labelKey: 'out.grade', format: 'percent', decimals: 2, primary: true },
    { id: 'letter', labelKey: 'out.letter', format: 'text' },
    { id: 'weight', labelKey: 'out.weight', format: 'percent', decimals: 2 },
    { id: 'points', labelKey: 'out.points', format: 'number', decimals: 2 },
  ],
  sources: [
    {
      title: 'Calculating Final Grades: An Example of “Weighted Components” in 3 Steps',
      publisher:
        'Center for Innovation in Teaching & Learning, University of Illinois Urbana-Champaign',
      url: 'https://blogs.illinois.edu/files/1499/114301/4394.pdf',
      accessed: '2026-11-24',
      locator:
        'worked example: 100 × .15 + 81.7 × .15 + 95 × .05 + 79 × .15 + 81 × .20 + 83 × .30 = 84.955, a B',
    },
    {
      title: 'Explain Weighted Grades in Canvas',
      publisher: 'IT Support Services, California State University, Chico',
      url: 'https://support.csuchico.edu/TDClient/1984/Portal/KB/ArticleDet?ID=115237',
      accessed: '2026-11-24',
      locator:
        'homework 50 of 60 points = 83.3%; (83.3 × 0.40) + (90 × 0.30) + (80 × 0.30) = 84.32%',
    },
  ],
  review: { status: 'pending' },
  draftedWith: 'ai-assisted',
  version: '1.0.0',
  changelog: [{ version: '1.0.0', date: '2026-11-24', note: 'First published.' }],
  related: ['final-grade', 'gpa', 'average'],
  examples: [
    {
      id: 'illinois',
      inputs: {
        items: [
          row(100, 100, 15),
          row(81.7, 100, 15),
          row(95, 100, 5),
          row(79, 100, 15),
          row(81, 100, 20),
          row(83, 100, 30),
        ],
      },
      expect: { grade: 84.955, letter: 'B' },
    },
    {
      id: 'points',
      inputs: { items: [row(50, 60, 40), row(90, 100, 30), row(80, 100, 30)] },
      expect: { grade: 84.3333 },
    },
    {
      id: 'partial',
      inputs: { items: [row(92, 100, 20), row(78, 100, 30)] },
      expect: { grade: 83.6, weight: 50 },
    },
  ],
  locales: ['en'],
  contentUpdated: '2026-11-24',
};
