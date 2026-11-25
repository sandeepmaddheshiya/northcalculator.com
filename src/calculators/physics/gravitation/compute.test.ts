import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute, G } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-25');
const out = (m1: number, m2: number, r: number, ru = 'm') =>
  compute({ ...base, m1, m2, r, ru } as never, { today: '2026-11-25', fmt: makeFmt('en') })
    .outputs as Record<string, number>;
const sig = (x: number, d: number) => Number(x.toPrecision(d));

describe('gravitation: references', () => {
  it('NIST CODATA 2022: G = 6.67430 × 10⁻¹¹', () => expect(G).toBe(6.6743e-11));
  it('College Physics 2e §6.5: 1.000 kg, 1.000 kg, 1.000 m → 6.674 × 10⁻¹¹ N', () =>
    expect(sig(out(1, 1, 1).force!, 4)).toBe(6.674e-11));
  it('§6.5: Earth surface g = 9.80 m/s² with G = 6.67 × 10⁻¹¹ (9.81 with CODATA G)', () => {
    expect(sig(out(5.98e24, 1, 6.38e6).force!, 3)).toBe(9.81);
    expect(sig((6.67e-11 * 5.98e24) / 6.38e6 ** 2, 3)).toBe(9.8);
  });
  it('Example 6.6: at 3.84 × 10⁸ m, g = 2.71 × 10⁻³ m/s² (book 2.70 × 10⁻³ with G = 6.67 × 10⁻¹¹)', () => {
    expect(sig(out(5.98e24, 1, 3.84e8).force!, 3)).toBe(0.00271);
    expect(sig((6.67e-11 * 5.98e24) / 3.84e8 ** 2, 3)).toBe(0.0027);
  });
  it('University Physics Ex 13.1: 9000 kg each, 10.0 m → 5.4 × 10⁻⁵ N, a = 6.0 × 10⁻⁹ m/s²', () => {
    const o = out(9000, 9000, 10);
    expect([sig(o.force!, 2), sig(o.a1!, 2)]).toEqual([5.4e-5, 6e-9]);
  });
  it('Ex 13.2: two 1.6 × 10⁴² kg galaxies 2.375 × 10²² m apart → 3.0 × 10²⁹ N, 1.9 × 10⁻¹³ m/s²', () => {
    const o = out(1.6e42, 1.6e42, 2.5e6 * 9.5e15);
    expect([sig(o.force!, 2), sig(o.a1!, 2)]).toEqual([3e29, 1.9e-13]);
  });
});

describe('gravitation: behaviour', () => {
  it('FAQ: two 70 kg people 1 m apart ≈ 3.3 × 10⁻⁷ N', () =>
    expect(sig(out(70, 70, 1).force!, 2)).toBe(3.3e-7));
  it('km input equals metres × 1000', () =>
    expect(out(5.98e24, 1, 6380, 'km').force).toBe(out(5.98e24, 1, 6.38e6).force));
  it('zero distance is rejected', () =>
    expect(
      compute({ ...base, m1: 1, m2: 1, r: 0 } as never, { today: '', fmt: makeFmt('en') })
        .warnings[0]?.key,
    ).toBe('warn.r'));
});

describe('gravitation: properties', () => {
  it('inverse square and symmetric in the masses', () =>
    fc.assert(
      fc.property(
        fc.double({ min: 1, max: 1e30, noNaN: true }),
        fc.double({ min: 1, max: 1e30, noNaN: true }),
        fc.double({ min: 1, max: 1e12, noNaN: true }),
        (a, b, r) => {
          const f = out(a, b, r).force!;
          return (
            Math.abs(out(b, a, r).force! - f) <= 1e-11 * f &&
            Math.abs(out(a, b, 2 * r).force! * 4 - f) <= 1e-9 * f
          );
        },
      ),
    ));
});

describe('gravitation: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const i = e.inputs as Record<string, number>;
    const o = out(i.m1!, i.m2!, i.r!, String(e.inputs.ru));
    for (const [k, v] of Object.entries(e.expect)) expect(o[k]).toBe(v);
  });
});
