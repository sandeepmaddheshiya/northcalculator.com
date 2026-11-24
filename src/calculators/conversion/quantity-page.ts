import type { CalculatorDefinition, ComputeFn, WorkedExample } from '@/calculators/types';
import { UNITS, type Quantity } from '@/engine/units';
import { compute as unitCompute } from './unit-converter/compute';
import { UNIT_SOURCES } from './unit-converter/definition';

/**
 * Single-quantity converter pages (length, weight, temperature …) built on the unit converter's
 * engine and compute. Each page fixes the quantity, offers only that quantity's units and has its
 * own content; the conversion logic and its tests are shared.
 */
export function quantityDefinition(opts: {
  id: string;
  slug: string;
  q: Quantity;
  pair: readonly [string, string];
  value: number;
  tags: readonly string[];
  related: readonly string[];
  examples: readonly WorkedExample[];
}): CalculatorDefinition {
  const options = UNITS[opts.q].map((u) => ({ value: u.id, labelKey: `u.${u.id}` }));
  return {
    id: opts.id,
    slug: { en: opts.slug },
    category: 'conversion',
    tags: opts.tags,
    difficulty: 'basic',
    ymyl: false,
    schemaCategory: 'UtilitiesApplication',
    roundingKey: 'rounding',
    inputs: [
      {
        id: 'v',
        param: 'v',
        type: 'number',
        labelKey: 'v',
        default: opts.value,
        allowNegative: opts.q === 'temperature',
        min: -1e300,
        max: 1e300,
      },
      {
        id: 'from',
        param: 'from',
        type: 'select',
        labelKey: 'from',
        default: opts.pair[0],
        options,
        swapWith: 'to',
      },
      { id: 'to', param: 'to', type: 'select', labelKey: 'to', default: opts.pair[1], options },
    ],
    outputs: [
      { id: 'result', labelKey: 'out.result', format: 'sig', decimals: 10, primary: true },
      { id: 'relation', labelKey: 'out.relation', format: 'text' },
      { id: 'exact', labelKey: 'out.exact', format: 'text' },
    ],
    sources: UNIT_SOURCES,
    review: { status: 'pending' },
    draftedWith: 'ai-assisted',
    version: '1.0.0',
    changelog: [{ version: '1.0.0', date: '2026-11-24', note: 'First published.' }],
    related: opts.related,
    examples: opts.examples,
    locales: ['en'],
    contentUpdated: '2026-11-24',
  };
}

export const quantityCompute =
  (q: Quantity): ComputeFn =>
  (inputs, ctx) =>
    unitCompute({ ...inputs, q }, ctx);
