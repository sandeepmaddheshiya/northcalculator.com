import type { CalculatorDefinition, NumberInput } from '@/calculators/types';

const side = (id: string, def: number): NumberInput => ({
  id,
  param: id,
  type: 'number',
  labelKey: id,
  default: def,
  min: 0,
  max: 1e12,
});

export const definition: CalculatorDefinition = {
  id: 'triangle',
  slug: { en: 'triangle-calculator' },
  category: 'geometry',
  tags: [
    'triangle',
    'Heron’s formula',
    'law of cosines',
    'triangle angles',
    'area from three sides',
    'SSS',
  ],
  difficulty: 'basic',
  ymyl: false,
  schemaCategory: 'EducationalApplication',
  roundingKey: 'rounding',
  inputs: [side('a', 10), side('b', 15), side('c', 7)],
  outputs: [
    { id: 'area', labelKey: 'out.area', format: 'sig', decimals: 10, primary: true },
    { id: 'perimeter', labelKey: 'out.perimeter', format: 'sig', decimals: 10 },
    { id: 'angleA', labelKey: 'out.angleA', format: 'sig', decimals: 8 },
    { id: 'angleB', labelKey: 'out.angleB', format: 'sig', decimals: 8 },
    { id: 'angleC', labelKey: 'out.angleC', format: 'sig', decimals: 8 },
    { id: 'kind', labelKey: 'out.kind', format: 'text' },
  ],
  sources: [
    {
      title: 'Algebra and Trigonometry 2e, 10.2 Non-right Triangles: Law of Cosines',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/algebra-and-trigonometry-2e/pages/10-2-non-right-triangles-law-of-cosines',
      accessed: '2026-11-24',
      locator:
        'cos α = (b² + c² − a²) ÷ 2bc; Heron: √(s(s − a)(s − b)(s − c)), s = half the perimeter; Example 2: 20, 25, 18 → α ≈ 52.4°; Example 5: 10, 15, 7 → 29.4; Example 6: 62.4, 43.5, 34.1 m → 711.4 m²',
    },
    {
      title: 'Elementary Trigonometry (Corral), 2.4 The Area of a Triangle',
      publisher: 'Michael Corral, Schoolcraft College (LibreTexts)',
      url: 'https://math.libretexts.org/Bookshelves/Precalculus/Book%3A_Elementary_Trigonometry_(Corral)/02%3A_General_Triangles/2.04%3A_The_Area_of_a_Triangle',
      accessed: '2026-11-24',
      locator:
        'Heron’s formula; Example 2.15: 5, 4, 7 → 4√6 ≈ 9.8; Example 2.16: the rearranged form ¼√((a + (b + c))(c − (a − b))(c + (a − b))(a + (b − c))) for a ≥ b ≥ c avoids rounding error in thin triangles',
    },
  ],
  review: { status: 'pending' },
  draftedWith: 'ai-assisted',
  version: '1.0.0',
  changelog: [{ version: '1.0.0', date: '2026-11-24', note: 'First published.' }],
  related: ['pythagorean', 'area', 'circle'],
  examples: [
    { id: 'heron', inputs: { a: 10, b: 15, c: 7 }, expect: { area: 29.3938769134, perimeter: 32 } },
    { id: 'corral', inputs: { a: 5, b: 4, c: 7 }, expect: { area: 9.79795897113 } },
    { id: 'angle', inputs: { a: 20, b: 25, c: 18 }, expect: { angleA: 52.4104970351 } },
  ],
  locales: ['en'],
  contentUpdated: '2026-11-24',
};
