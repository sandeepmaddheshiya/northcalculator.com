import type { CalculatorDefinition } from '@/calculators/types';

export const definition: CalculatorDefinition = {
  id: 'ph',
  slug: { en: 'ph-calculator' },
  category: 'chemistry',
  tags: [
    'pH',
    'pOH',
    'hydronium concentration',
    'hydroxide concentration',
    'acidic or basic',
    'Kw',
  ],
  difficulty: 'basic',
  ymyl: false,
  schemaCategory: 'EducationalApplication',
  roundingKey: 'rounding',
  inputs: [
    {
      id: 'known',
      param: 'k',
      type: 'select',
      labelKey: 'known',
      default: 'h',
      options: [
        { value: 'h', labelKey: 'known.h' },
        { value: 'oh', labelKey: 'known.oh' },
        { value: 'ph', labelKey: 'known.ph' },
        { value: 'poh', labelKey: 'known.poh' },
      ],
    },
    {
      id: 'value',
      param: 'v',
      type: 'number',
      labelKey: 'value',
      labelBy: 'known',
      default: 0.0012,
      allowNegative: true,
      min: -20,
      max: 1e6,
      helpKey: 'value.help',
    },
  ],
  outputs: [
    { id: 'ph', labelKey: 'out.ph', format: 'number', decimals: 4, primary: true },
    { id: 'poh', labelKey: 'out.poh', format: 'number', decimals: 4 },
    { id: 'h', labelKey: 'out.h', format: 'sig', decimals: 6 },
    { id: 'oh', labelKey: 'out.oh', format: 'sig', decimals: 6 },
    { id: 'nature', labelKey: 'out.nature', format: 'text' },
  ],
  sources: [
    {
      title: 'Chemistry 2e, 14.2 pH and pOH',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/chemistry-2e/pages/14-2-ph-and-poh',
      accessed: '2026-11-24',
      locator:
        'pH = −log[H₃O⁺], pOH = −log[OH⁻], pH + pOH = 14.00 at 25 °C (K_w = 1.0 × 10⁻¹⁴); Example 14.4: 1.2 × 10⁻³ M → 2.92; Example 14.5: pH 7.3 → 5 × 10⁻⁸ M; Example 14.6: 0.0125 M OH⁻ → pOH 1.903, pH 12.10',
    },
    {
      title: 'Introductory Chemistry (LibreTexts), 14.9 The pH and pOH Scales',
      publisher: 'Marisa Alviar-Agnew and Henry Agnew, Sacramento City College (LibreTexts)',
      url: 'https://chem.libretexts.org/Bookshelves/Introductory_Chemistry/Introductory_Chemistry_(LibreTexts)/14%3A_Acids_and_Bases/14.09%3A_The_pH_and_pOH_Scales_-_Ways_to_Express_Acidity_and_Basicity',
      accessed: '2026-11-24',
      locator:
        'Example 14.9.2: 2.5 × 10⁻¹¹ M → pH 10.60; Example 14.9.3: pH 12.6 → 2.5 × 10⁻¹³ M; Example 14.9.4: pH 4.42 → pOH 9.58; below 7 acidic, above 7 basic',
    },
  ],
  review: { status: 'pending' },
  draftedWith: 'ai-assisted',
  version: '1.0.0',
  changelog: [{ version: '1.0.0', date: '2026-11-24', note: 'First published.' }],
  related: ['dilution', 'logarithm', 'molar-mass'],
  examples: [
    { id: 'stomach', inputs: { known: 'h', value: 0.0012 }, expect: { ph: 2.9208 } },
    { id: 'base', inputs: { known: 'oh', value: 0.0125 }, expect: { poh: 1.9031, ph: 12.0969 } },
    { id: 'blood', inputs: { known: 'ph', value: 7.3 }, expect: { h: 5.01187233627e-8 } },
  ],
  locales: ['en'],
  contentUpdated: '2026-11-24',
};
