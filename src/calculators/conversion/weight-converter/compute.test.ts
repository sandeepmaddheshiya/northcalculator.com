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

describe('weight-converter: references (NIST SP 811 App. B.8; NIST Handbook 44 App. C)', () => {
  it('1 lb = 0.45359237 kg (exact definition)', () => expect(run(1, 'lb', 'kg')).toBe(0.45359237));
  it('1 oz = 28.349523125 g (exact definition)', () =>
    expect(run(1, 'oz', 'g')).toBe(28.349523125));
});

describe('weight-converter: behaviour', () => {
  it('offers only mass units', () =>
    expect(
      definition.inputs.find((i) => i.id === 'from') && 'options' in definition.inputs[1]!
        ? definition.inputs[1]!.options.length
        : 0,
    ).toBe(UNITS.mass.length));
  it('converting a unit to itself returns the value', () =>
    expect(run(12.5, 'lb', 'lb')).toBe(12.5));
  it('ignores any quantity in the URL', () =>
    expect(
      compute({ ...base, q: 'temperature', v: 1, from: 'lb', to: 'kg' } as never, {
        today: '2026-11-24',
        fmt: makeFmt('en'),
      }).outputs.result,
    ).toBe(0.45359237));
});

describe('weight-converter: properties', () => {
  const ids = UNITS.mass.map((u) => u.id);
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
        (k) => Math.abs(run(k, 'lb', 'kg') - k * 0.45359237) <= 1e-9 * k,
      ),
    ));
});

describe('weight-converter: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const r = compute({ ...base, ...e.inputs } as never, {
      today: '2026-11-24',
      fmt: makeFmt('en'),
    });
    for (const [k, val] of Object.entries(e.expect)) expect(r.outputs[k]).toBe(val);
  });
});
