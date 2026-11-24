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

describe('speed-converter: references (NIST SP 811 App. B.8; NIST Handbook 44; BIPM SI Brochure)', () => {
  it('1 mph = 1.609344 km/h (international mile)', () =>
    expect(run(1, 'mph', 'kmh')).toBe(1.609344));
  it('1 knot = 1.852 km/h (nautical mile per hour)', () => expect(run(1, 'kn', 'kmh')).toBe(1.852));
});

describe('speed-converter: behaviour', () => {
  it('offers exactly the speed units', () => {
    const from = definition.inputs.find((i) => i.id === 'from');
    expect(from && 'options' in from ? from.options.map((o) => o.value) : []).toEqual(
      UNITS.speed.map((u) => u.id),
    );
  });
  it('a unit converted to itself is unchanged', () => expect(run(12.5, 'mph', 'mph')).toBe(12.5));
  it('ignores any other quantity in the URL', () =>
    expect(
      compute({ ...base, q: 'length', v: 1, from: 'mph', to: 'kmh' } as never, {
        today: '2026-11-24',
        fmt: makeFmt('en'),
      }).outputs.result,
    ).toBe(run(1, 'mph', 'kmh')));
});

describe('speed-converter: properties', () => {
  const ids = UNITS.speed.map((u) => u.id);
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

describe('speed-converter: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const res = compute({ ...base, ...e.inputs } as never, {
      today: '2026-11-24',
      fmt: makeFmt('en'),
    });
    for (const [k, val] of Object.entries(e.expect)) expect(res.outputs[k]).toBe(val);
  });
});
