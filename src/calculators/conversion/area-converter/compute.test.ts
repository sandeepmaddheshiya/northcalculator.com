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

describe('area-converter: references (NIST SP 811 App. B.8; NIST Handbook 44; BIPM SI Brochure)', () => {
  it('1 acre = 4,046.8564224 m² (4,840 yd²)', () =>
    expect(run(1, 'acre', 'm2')).toBe(4046.8564224));
  it('1 mi² = 2.58998811034 km²', () => expect(run(1, 'mi2', 'km2')).toBe(2.58998811034));
});

describe('area-converter: behaviour', () => {
  it('offers exactly the area units', () => {
    const from = definition.inputs.find((i) => i.id === 'from');
    expect(from && 'options' in from ? from.options.map((o) => o.value) : []).toEqual(
      UNITS.area.map((u) => u.id),
    );
  });
  it('a unit converted to itself is unchanged', () => expect(run(12.5, 'ft2', 'ft2')).toBe(12.5));
  it('ignores any other quantity in the URL', () =>
    expect(
      compute({ ...base, q: 'length', v: 1, from: 'ft2', to: 'm2' } as never, {
        today: '2026-11-24',
        fmt: makeFmt('en'),
      }).outputs.result,
    ).toBe(run(1, 'ft2', 'm2')));
});

describe('area-converter: properties', () => {
  const ids = UNITS.area.map((u) => u.id);
  it('round trips return the value (to 10 significant digits)', () =>
    fc.assert(
      fc.property(
        fc.double({ min: 1e-3, max: 1e9, noNaN: true }),
        fc.constantFrom(...ids),
        fc.constantFrom(...ids),
        (x, p, r) => {
          const back = run(run(x, p, r), r, p);
          return Math.abs(back - x) <= 1e-9 * x;
        },
      ),
    ));
});

describe('area-converter: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const res = compute({ ...base, ...e.inputs } as never, {
      today: '2026-11-24',
      fmt: makeFmt('en'),
    });
    for (const [k, val] of Object.entries(e.expect)) expect(res.outputs[k]).toBe(val);
  });
});
