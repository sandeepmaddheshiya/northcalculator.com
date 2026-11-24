import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { UNITS } from '@/engine/units';
import { compute } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-24');
const run = (v: number, from: string, to: string) =>
  compute({ ...base, v, from, to } as never, { today: '2026-11-24', fmt: makeFmt('en') }).outputs
    .result as number;

describe('volume-converter: references (NIST SP 811 App. B.8; NIST Handbook 44 App. C)', () => {
  it('1 gal_us = 3.785411784 l (exact definition)', () =>
    expect(run(1, 'gal_us', 'l')).toBe(3.785411784));
  it('1 gal_uk = 4.54609 l (exact definition)', () => expect(run(1, 'gal_uk', 'l')).toBe(4.54609));
});

describe('volume-converter: behaviour', () => {
  it('offers only volume units', () =>
    expect(
      definition.inputs.find((i) => i.id === 'from') && 'options' in definition.inputs[1]!
        ? definition.inputs[1]!.options.length
        : 0,
    ).toBe(UNITS.volume.length));
  it('converting a unit to itself returns the value', () =>
    expect(run(12.5, 'gal_us', 'gal_us')).toBe(12.5));
  it('ignores any quantity in the URL', () =>
    expect(
      compute({ ...base, q: 'temperature', v: 1, from: 'gal_us', to: 'l' } as never, {
        today: '2026-11-24',
        fmt: makeFmt('en'),
      }).outputs.result,
    ).toBe(3.785411784));
});

describe('volume-converter: properties', () => {
  const ids = UNITS.volume.map((u) => u.id);
  it('round trips are the identity (to 10 significant digits)', () =>
    fc.assert(
      fc.property(
        fc.double({ min: 1e-6, max: 1e9, noNaN: true }),
        fc.constantFrom(...ids),
        fc.constantFrom(...ids),
        (x, a, b) => {
          const back = run(run(x, a, b), b, a);
          return Math.abs(back - x) <= 1e-9 * x;
        },
      ),
    ));
  it('scaling is linear', () =>
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1000 }),
        (k) => Math.abs(run(k, 'gal_us', 'l') - k * 3.785411784) <= 1e-9 * k,
      ),
    ));
});

describe('volume-converter: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const r = compute({ ...base, ...e.inputs } as never, {
      today: '2026-11-24',
      fmt: makeFmt('en'),
    });
    for (const [k, val] of Object.entries(e.expect)) expect(r.outputs[k]).toBe(val);
  });
});
