import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-25');
const out = (mass: number, v1: number, v2: number, time = 0) =>
  compute({ ...base, mass, v1, v2, time } as never, { today: '2026-11-25', fmt: makeFmt('en') })
    .outputs as Record<string, number>;
const sig = (x: number, d: number) => Number(x.toPrecision(d));

describe('momentum: references', () => {
  it('College Physics 2e Ex 8.1: 110 kg × 8.00 = 880; 0.410 × 25.0 = 10.3; ratio 85.9 unrounded', () => {
    const a = out(110, 0, 8).p2!;
    const b = out(0.41, 0, 25).p2!;
    expect([a, sig(b, 3), sig(a / b, 3)]).toEqual([880, 10.3, 85.9]);
  });
  it('Ex 8.2: 0.057 kg to 58 m/s in 5.0 ms → 3.3 kg·m/s, 660 N', () => {
    const o = out(0.057, 0, 58, 0.005);
    expect([sig(o.impulse!, 2), sig(o.force!, 2)]).toEqual([3.3, 660]);
  });
  it('University Physics §9.1: 1400 kg at 15 m/s → 21,000 kg·m/s', () =>
    expect(out(1400, 0, 15).p2).toBe(21000));
  it('Ex 9.2: 87.8 kg from 27 m/s in 2.5 s → 948 N; in 0.20 s → 11,853 N', () => {
    expect(sig(-out(87.8, 27, 0, 2.5).force!, 3)).toBe(948);
    expect(Math.round(-out(87.8, 27, 0, 0.2).force!)).toBe(11853);
  });
  it('Ex 9.3: 2 × 10⁹ kg to 7.5 × 10⁷ m/s in 60 s → 2.5 × 10¹⁵ N', () =>
    expect(out(2e9, 0, 7.5e7, 60).force).toBe(2.5e15));
});

describe('momentum: behaviour', () => {
  it('a bounce: 0.5 kg, 10 → −10 m/s changes momentum by −10', () =>
    expect(out(0.5, 10, -10).impulse).toBe(-10));
  it('FAQ: 0.5 kg stopping from 10 m/s in 0.01 s → 500 N', () =>
    expect(out(0.5, 10, 0, 0.01).force).toBe(-500));
  it('no time, no force; zero mass rejected', () => {
    expect(out(1, 0, 1).force).toBeNull();
    expect(
      compute({ ...base, mass: 0, v2: 1 } as never, { today: '', fmt: makeFmt('en') }).warnings[0]
        ?.key,
    ).toBe('warn.mass');
  });
});

describe('momentum: properties', () => {
  it('impulse = p₂ − p₁ and force × time = impulse', () =>
    fc.assert(
      fc.property(
        fc.double({ min: 0.001, max: 1e5, noNaN: true }),
        fc.double({ min: -1e4, max: 1e4, noNaN: true }),
        fc.double({ min: -1e4, max: 1e4, noNaN: true }),
        fc.double({ min: 1e-4, max: 100, noNaN: true }),
        (m, a, b, t) => {
          const o = out(m, a, b, t);
          const scale = m * (Math.abs(a) + Math.abs(b)) + 1e-9;
          return (
            Math.abs(o.impulse! - (o.p2! - o.p1!)) <= 1e-9 * scale &&
            Math.abs(o.force! * t - o.impulse!) <= 1e-9 * scale
          );
        },
      ),
    ));
});

describe('momentum: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const i = e.inputs as Record<string, number>;
    const o = out(i.mass!, i.v1!, i.v2!, i.time);
    for (const [k, v] of Object.entries(e.expect)) expect(o[k]).toBe(v);
  });
});
