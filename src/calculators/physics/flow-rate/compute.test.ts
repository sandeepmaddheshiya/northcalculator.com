import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { area, compute, Q_UNITS } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-25');
const solve = (inputs: Record<string, unknown>) =>
  compute({ ...base, ...inputs } as never, { today: '2026-11-25', fmt: makeFmt('en') });
type Out = Record<'result' | 'v1' | 'v2' | 'ls' | 'lmin' | 'gpm' | 'm3s' | 'a1', number>;
const out = (inputs: Record<string, unknown>) => solve(inputs).outputs as unknown as Out;
const sig = (x: number, d: number) => Number(x.toPrecision(d));

describe('flow-rate: references (OpenStax College Physics 2e §12.1)', () => {
  it('Ex 12.2: 0.500 L/s, 0.900 cm-radius hose → 1.96 m/s; 0.250 cm-radius nozzle → 25.5 m/s', () => {
    const o = out({ find: 'speed', q: 0.5, qu: 'ls', d1: 1.8, d2: 0.5, n2: 1 });
    expect([sig(o.v1, 3), sig(o.v2, 3)]).toEqual([1.96, 25.5]);
  });
  it('Ex 12.3(a): 5.0 L/min through a 10 mm-radius aorta → 0.27 m/s', () =>
    expect(sig(out({ find: 'speed', q: 5, qu: 'lmin', d1: 2, d2: 0, n2: 1 }).v1, 2)).toBe(0.27));
  it('Ex 12.3(b): capillaries 8.0 µm across at 0.33 mm/s → 5.0 × 10⁹ of them', () => {
    const Q = 5 * Q_UNITS.lmin;
    expect(sig(Q / (area(8e-4) * 0.33e-3), 2)).toBe(5e9);
  });
  it('Ex 12.1: 5.00 L/min for 75 years (5.26 × 10⁵ min/y) → 2.0 × 10⁵ m³', () =>
    expect(sig(out({ find: 'speed', q: 5, qu: 'lmin', d1: 1 }).m3s * 60 * 5.26e5 * 75, 2)).toBe(
      2e5,
    ));
});

describe('flow-rate: references (OpenStax University Physics Vol. 1 §14.5)', () => {
  it('Ex 14.5: hose 0.900 cm radius, 0.500 cm-diameter nozzle → 1.96 and 25.5 m/s', () => {
    const o = out({ find: 'speed', q: 0.5, qu: 'ls', d1: 1.8, d2: 0.5 });
    expect([sig(o.v1, 3), sig(o.v2, 3)]).toEqual([1.96, 25.5]);
  });
});

describe('flow-rate: behaviour', () => {
  it('units: 1 L/s = 60 L/min = 15.85 US gal/min', () => {
    const o = out({ find: 'speed', q: 1, qu: 'ls', d1: 5 });
    expect([o.lmin, sig(o.gpm, 4)]).toEqual([60, 15.85]);
  });
  it('flow from speed; branches share the flow', () => {
    expect(sig(out({ find: 'flow', v1: 2, qu: 'ls', d1: 2 }).result, 6)).toBe(
      sig(Math.PI * 0.01 ** 2 * 2 * 1000, 6),
    );
    const one = out({ find: 'speed', q: 1, qu: 'ls', d1: 2, d2: 1, n2: 1 }).v2;
    const four = out({ find: 'speed', q: 1, qu: 'ls', d1: 2, d2: 1, n2: 4 }).v2;
    expect(sig(one / four, 10)).toBe(4);
  });
  it('bad inputs are explained', () => {
    expect(solve({ find: 'speed', q: 1, d1: 0 }).warnings[0]?.key).toBe('warn.d');
    expect(solve({ find: 'speed', q: 1, d1: 1, n2: 1.5 }).warnings[0]?.key).toBe('warn.n');
  });
});

describe('flow-rate: properties', () => {
  it('A₁v₁ = A₂v₂ and halving the diameter quadruples the speed', () =>
    fc.assert(
      fc.property(
        fc.double({ min: 0.001, max: 100, noNaN: true }),
        fc.double({ min: 0.1, max: 100, noNaN: true }),
        fc.double({ min: 0.1, max: 100, noNaN: true }),
        (q, d1, d2) => {
          const o = out({ find: 'speed', q, qu: 'ls', d1, d2, n2: 1 });
          const half = out({ find: 'speed', q, qu: 'ls', d1: d1 / 2 }).v1;
          return (
            Math.abs(area(d1) * o.v1 - area(d2) * o.v2) <= 1e-9 * area(d1) * o.v1 &&
            Math.abs(half - 4 * o.v1) <= 1e-9 * half
          );
        },
      ),
    ));
});

describe('flow-rate: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const o = solve(e.inputs).outputs;
    for (const [k, v] of Object.entries(e.expect)) expect(o[k]).toBe(v);
  });
});
