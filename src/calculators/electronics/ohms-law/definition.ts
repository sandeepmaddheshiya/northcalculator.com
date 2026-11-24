import type { CalculatorDefinition, NumberInput } from '@/calculators/types';

const field = (id: string, param: string, def: number, pairs: string[]): NumberInput => ({
  id,
  param,
  type: 'number',
  labelKey: id,
  default: def,
  min: 0,
  max: 1e15,
  showIf: { input: 'known', in: pairs },
});

export const definition: CalculatorDefinition = {
  id: 'ohms-law',
  slug: { en: 'ohms-law-calculator' },
  category: 'electronics',
  tags: ['Ohm’s law', 'V = IR', 'voltage', 'current', 'resistance', 'power', 'watts', 'amps'],
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
      default: 'vi',
      options: [
        { value: 'vi', labelKey: 'known.vi' },
        { value: 'vr', labelKey: 'known.vr' },
        { value: 'ir', labelKey: 'known.ir' },
        { value: 'pv', labelKey: 'known.pv' },
        { value: 'pi', labelKey: 'known.pi' },
        { value: 'pr', labelKey: 'known.pr' },
      ],
    },
    field('v', 'v', 12, ['vi', 'vr', 'pv']),
    field('i', 'i', 2.5, ['vi', 'ir', 'pi']),
    field('r', 'r', 4.8, ['vr', 'ir', 'pr']),
    field('p', 'p', 30, ['pv', 'pi', 'pr']),
  ],
  outputs: [
    {
      id: 'result',
      labelKey: 'out.result',
      labelBy: 'known',
      format: 'sig',
      decimals: 8,
      primary: true,
    },
    { id: 'v', labelKey: 'out.v', format: 'sig', decimals: 8 },
    { id: 'i', labelKey: 'out.i', format: 'sig', decimals: 8 },
    { id: 'r', labelKey: 'out.r', format: 'sig', decimals: 8 },
    { id: 'p', labelKey: 'out.p', format: 'sig', decimals: 8 },
  ],
  sources: [
    {
      title:
        'College Physics 2e, 20.2 Ohm’s Law: Resistance and Simple Circuits; 20.4 Electric Power and Energy',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/college-physics-2e/pages/20-4-electric-power-and-energy',
      accessed: '2026-11-24',
      locator:
        'I = V/R, V = IR (§20.2, Eq. 20.14, 20.17); P = IV = V²/R = I²R (Eq. 20.28–20.30); Example 20.4: 12.0 V, 2.50 A → 4.80 Ω; Example 20.7: 30.0 W hot, 12.0 V on 0.350 Ω → 411 W and 34.3 A; 20 A × 12 V = 240 W',
    },
    {
      title: 'University Physics Volume 2, 9.4 Ohm’s Law and 9.5 Electrical Energy and Power',
      publisher: 'OpenStax, Rice University',
      url: 'https://openstax.org/books/university-physics-volume-2/pages/9-5-electrical-energy-and-power',
      accessed: '2026-11-24',
      locator:
        'V = IR (§9.4, Eq. 9.11), Example 9.8: 9.00 V at 3.00 mA → 3.00 kΩ; P = IV = I²R = V²/R (Eq. 9.12–9.13), Example 9.9: 20.00 A × 115 V = 2300 W, 666.67 W at 20.00 A → 1.67 Ω',
    },
  ],
  review: { status: 'pending' },
  draftedWith: 'ai-assisted',
  version: '1.0.0',
  changelog: [{ version: '1.0.0', date: '2026-11-24', note: 'First published.' }],
  related: ['electricity-cost', 'power-converter', 'kinetic-energy'],
  examples: [
    { id: 'headlight', inputs: { known: 'vi', v: 12, i: 2.5 }, expect: { result: 4.8, p: 30 } },
    {
      id: 'cold',
      inputs: { known: 'vr', v: 12, r: 0.35 },
      expect: { result: 34.2857142857, p: 411.428571429 },
    },
    { id: 'resistor', inputs: { known: 'vi', v: 9, i: 0.003 }, expect: { result: 3000 } },
  ],
  locales: ['en'],
  contentUpdated: '2026-11-24',
};
