import type { CalculatorDefinition } from '@/calculators/types';

export const definition: CalculatorDefinition = {
  id: 'arc-sector',
  slug: { en: 'arc-length-sector-area-calculator' },
  category: 'geometry',
  tags: ['arc length', 'sector area', 'segment area', 'radians', 's = rθ', 'circle sector'],
  difficulty: 'basic',
  ymyl: false,
  schemaCategory: 'EducationalApplication',
  roundingKey: 'rounding',
  inputs: [
    {
      id: 'radius',
      param: 'r',
      type: 'number',
      labelKey: 'radius',
      default: 20,
      min: 0,
      max: 1e12,
    },
    {
      id: 'angle',
      param: 'a',
      type: 'number',
      labelKey: 'angle',
      labelBy: 'unit',
      default: 30,
      min: 0,
      max: 1e6,
    },
    {
      id: 'unit',
      param: 'u',
      type: 'segmented',
      labelKey: 'unit',
      default: 'deg',
      options: [
        { value: 'deg', labelKey: 'unit.deg' },
        { value: 'rad', labelKey: 'unit.rad' },
      ],
    },
  ],
  outputs: [
    { id: 'arc', labelKey: 'out.arc', format: 'sig', decimals: 10, primary: true },
    { id: 'sector', labelKey: 'out.sector', format: 'sig', decimals: 10 },
    { id: 'segment', labelKey: 'out.segment', format: 'sig', decimals: 10 },
    { id: 'chord', labelKey: 'out.chord', format: 'sig', decimals: 10 },
    { id: 'radians', labelKey: 'out.radians', format: 'sig', decimals: 10 },
    { id: 'fraction', labelKey: 'out.fraction', format: 'percent', decimals: 4 },
  ],
  sources: [
    {
      title: 'Algebra and Trigonometry 2e, 7.1 Angles',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/algebra-and-trigonometry-2e/pages/7-1-angles',
      accessed: '2026-11-25',
      locator:
        's = rθ and A = ½θr² with θ in radians; Example 9: a sprinkler throwing 20 ft over 30° (π/6) waters ½(π/6)(20)² ≈ 104.72 ft²',
    },
    {
      title: 'Elementary Trigonometry (Corral), 4.2 Arc Length and 4.3 Area of a Sector',
      publisher: 'Michael Corral, Schoolcraft College (LibreTexts)',
      url: 'https://math.libretexts.org/Bookshelves/Precalculus/Elementary_Trigonometry_(Corral)/04%3A_Radian_Measure/4.03%3A_Area_of_a_Sector',
      accessed: '2026-11-25',
      locator:
        's = rθ (Eq. 4.4; Example 4.3: r = 2 cm, θ = 1.2 → 2.4 cm); A = ½r²θ = ½rs; segment ½r²(θ − sin θ); Example 4.9: 117°, r = 3.5 m → 12.51 m²; Example 4.10: s = 6, r = 9 → 27; Example 4.12: r = 2, θ = 1.696 → 1.408',
    },
  ],
  review: { status: 'pending' },
  draftedWith: 'ai-assisted',
  version: '1.0.0',
  changelog: [{ version: '1.0.0', date: '2026-11-25', note: 'First published.' }],
  related: ['circle', 'trigonometry', 'area'],
  examples: [
    {
      id: 'sprinkler',
      inputs: { radius: 20, angle: 30, unit: 'deg' },
      expect: { sector: 104.71975512 },
    },
    {
      id: 'radians',
      inputs: { radius: 2, angle: 1.2, unit: 'rad' },
      expect: { arc: 2.4, sector: 2.4 },
    },
    {
      id: 'sector',
      inputs: { radius: 3.5, angle: 117, unit: 'deg' },
      expect: { sector: 12.5074657521 },
    },
  ],
  locales: ['en'],
  contentUpdated: '2026-11-25',
};
