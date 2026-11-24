import type { CalculatorDefinition } from '@/calculators/types';

export const definition: CalculatorDefinition = {
  id: 'scientific-notation',
  slug: { en: 'scientific-notation-calculator' },
  category: 'math',
  tags: [
    'scientific notation',
    'standard form',
    'e notation',
    'engineering notation',
    'powers of ten',
    'convert to decimal',
  ],
  difficulty: 'basic',
  ymyl: false,
  schemaCategory: 'EducationalApplication',
  roundingKey: 'rounding',
  inputs: [
    {
      id: 'value',
      param: 'v',
      type: 'text',
      labelKey: 'value',
      default: '0.0052',
      maxLength: 120,
      helpKey: 'value.help',
    },
    {
      id: 'sig',
      param: 's',
      type: 'number',
      labelKey: 'sig',
      default: 0,
      min: 0,
      max: 40,
      integer: true,
      advanced: true,
      helpKey: 'sig.help',
    },
  ],
  outputs: [
    { id: 'scientific', labelKey: 'out.scientific', format: 'text', primary: true },
    { id: 'eNotation', labelKey: 'out.eNotation', format: 'text' },
    { id: 'engineering', labelKey: 'out.engineering', format: 'text' },
    { id: 'decimal', labelKey: 'out.decimal', format: 'text' },
  ],
  sources: [
    {
      title: 'Prealgebra 2e, 10.5 Integer Exponents and Scientific Notation',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/prealgebra-2e/pages/10-5-integer-exponents-and-scientific-notation',
      accessed: '2026-11-24',
      locator:
        'a × 10ⁿ with 1 ≤ a < 10; Example 10.74: 37,000 = 3.7 × 10⁴; Example 10.75: 0.0052 = 5.2 × 10⁻³; Examples 10.76–10.77: 6.2 × 10³ = 6,200, 8.9 × 10⁻² = 0.089',
    },
    {
      title: 'Guide for the Use of the International System of Units (SI), NIST SP 811',
      publisher: 'National Institute of Standards and Technology',
      url: 'https://www.nist.gov/pml/special-publication-811',
      accessed: '2026-11-24',
      locator:
        'SI prefixes in steps of 10³ (kilo, mega, milli, micro …), the basis of engineering notation',
    },
  ],
  review: { status: 'pending' },
  draftedWith: 'ai-assisted',
  version: '1.0.0',
  changelog: [{ version: '1.0.0', date: '2026-11-24', note: 'First published.' }],
  related: ['rounding', 'exponent', 'scientific-calculator'],
  examples: [
    { id: 'small', inputs: { value: '0.0052' }, expect: { scientific: '5.2 × 10⁻³' } },
    {
      id: 'large',
      inputs: { value: '37,000' },
      expect: { scientific: '3.7 × 10⁴', engineering: '37 × 10³' },
    },
    { id: 'back', inputs: { value: '8.9 × 10^-2' }, expect: { decimal: '0.089' } },
  ],
  locales: ['en'],
  contentUpdated: '2026-11-24',
};
