import type { CalculatorDefinition } from '@/calculators/types';
import { MAX_LENGTH } from '@/engine/expr';

export const definition: CalculatorDefinition = {
  id: 'scientific-calculator',
  slug: { en: 'scientific-calculator' },
  category: 'math',
  tags: [
    'scientific calculator',
    'online calculator',
    'trigonometry',
    'sin cos tan',
    'logarithm',
    'exponent',
    'square root',
    'factorial',
    'order of operations',
  ],
  difficulty: 'basic',
  ymyl: false,
  schemaCategory: 'UtilitiesApplication',
  roundingKey: 'rounding',
  inputs: [
    {
      id: 'expr',
      param: 'e',
      type: 'text',
      labelKey: 'expr',
      default: '2^10 + √(144) − sin(30)',
      maxLength: MAX_LENGTH,
    },
    {
      id: 'angle',
      param: 'a',
      type: 'segmented',
      labelKey: 'angle',
      default: 'deg',
      options: [
        { value: 'deg', labelKey: 'angle.deg' },
        { value: 'rad', labelKey: 'angle.rad' },
      ],
    },
  ],
  outputs: [{ id: 'result', labelKey: 'out.result', format: 'sig', decimals: 12, primary: true }],
  sources: [
    {
      title: 'Prealgebra 2e, 2.1 Use the Language of Algebra',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/prealgebra-2e/pages/2-1-use-the-language-of-algebra',
      accessed: '2026-11-24',
      locator: 'order of operations; Examples 2.7–2.12',
    },
    {
      title: 'NIST Digital Library of Mathematical Functions, Chapter 4: Elementary Functions',
      publisher: 'National Institute of Standards and Technology',
      url: 'https://dlmf.nist.gov/4',
      accessed: '2026-11-24',
      locator: 'logarithms, exponentials, trigonometric and inverse trigonometric functions',
    },
    {
      title: 'IEEE Standard for Floating-Point Arithmetic (IEEE 754-2019)',
      publisher: 'IEEE',
      url: 'https://standards.ieee.org/ieee/754/6210/',
      accessed: '2026-11-24',
      locator: 'binary64 (double precision): about 15–17 significant decimal digits',
    },
  ],
  review: { status: 'pending' },
  draftedWith: 'ai-assisted',
  version: '1.0.0',
  changelog: [{ version: '1.0.0', date: '2026-11-24', note: 'First published.' }],
  related: ['percentage', 'unit-converter'],
  examples: [
    { id: 'order', inputs: { expr: '18 ÷ 6 + 4(5 − 2)' }, expect: { result: 15 } },
    {
      id: 'ramp',
      inputs: { expr: '3.2 × sin(15)', angle: 'deg' },
      expect: { result: 0.828220944328 },
    },
    { id: 'combos', inputs: { expr: '52! ÷ (5! × 47!)' }, expect: { result: 2598960 } },
  ],
  locales: ['en'],
  contentUpdated: '2026-11-24',
};
