import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute, G } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-25');
const solve = (inputs: Record<string, unknown>) =>
  compute({ ...base, ...inputs } as never, { today: '2026-11-25', fmt: makeFmt('en') });
type Out = Record<
  'seconds' | 'hours' | 'days' | 'radiusKm' | 'altitudeKm' | 'speed' | 'kmh',
  number
>;
const out = (inputs: Record<string, unknown>) => solve(inputs).outputs as unknown as Out;
const sig = (x: number | undefined, d: number) => Number(x!.toPrecision(d));
const around = (mass: number, distanceKm: number) =>
  out({ find: 'period', body: 'custom', mass, measure: 'centre', distance: distanceKm, lu: 'km' });

describe('orbit: references (OpenStax University Physics Vol. 1 §13.4–13.5)', () => {
  it('CODATA 2022 G', () => expect(G).toBe(6.6743e-11));
  it('Ex 13.9: ISS, M 5.96 × 10²⁴ kg, r 6.36 × 10⁶ + 4.00 × 10⁵ m → 7.67 × 10³ m/s', () =>
    expect(sig(around(5.96e24, 6760).speed, 3)).toBe(7670));
  it('Ex 13.9: with r 6.37 × 10⁶ + 4.00 × 10⁵ m → T 5.55 × 10³ s', () =>
    expect(sig(around(5.96e24, 6770).seconds, 3)).toBe(5550));
  it('Ex 13.13: Halley 75.3 × 365 days, M_Sun 2.00 × 10³⁰ kg → a 2.67 × 10¹² m, 17.8 AU (1.50 × 10¹¹ m)', () => {
    const o = out({ find: 'radius', body: 'sun', measure: 'centre', period: 75.3 * 365, tu: 'd' });
    expect(sig(o.radiusKm * 1e3, 3)).toBe(2.67e12);
    expect(sig((o.radiusKm * 1e3) / 1.5e11, 3)).toBe(17.8);
    expect(sig((2 * o.radiusKm * 1e3) / 1.5e11 - 0.586, 3)).toBe(35);
  });
});

describe('orbit: references (OpenStax College Physics 2e §6.6)', () => {
  it('Ex 6.7: 1500 km above Earth (6380 km) → 1.93 h', () =>
    expect(
      sig(
        out({ find: 'period', body: 'earth', measure: 'altitude', distance: 1500, lu: 'km' }).hours,
        3,
      ),
    ).toBe(1.93));
  it('Ex 6.7 by ratio with the Moon: 27.3 d × (7880 ÷ 3.84 × 10⁵)^1.5 → 1.93 h', () =>
    expect(sig(27.3 * 24 * (7880 / 3.84e5) ** 1.5, 3)).toBe(1.93));
  it('Table 6.2: Earth at 1.496 × 10⁸ km around 2.00 × 10³⁰ kg → about 1.00 year', () =>
    expect(sig(around(2e30, 1.496e8).days / 365.25, 2)).toBe(1));
});

describe('orbit: behaviour', () => {
  it('radius from period inverts period from radius', () => {
    const t = out({ find: 'period', body: 'earth', measure: 'altitude', distance: 400, lu: 'km' });
    const back = out({
      find: 'radius',
      body: 'earth',
      measure: 'altitude',
      period: t.seconds / 60,
      tu: 'min',
      lu: 'km',
    });
    expect(sig(back.altitudeKm, 9)).toBe(400);
  });
  it('geostationary: 23.93 h → about 35,800 km up', () =>
    expect(
      sig(
        out({
          find: 'radius',
          body: 'earth',
          measure: 'altitude',
          period: 23.93,
          tu: 'h',
          lu: 'km',
        }).altitudeKm,
        3,
      ),
    ).toBe(35800));
  it('the Sun has no surface preset; low Earth altitudes warn', () => {
    expect(
      solve({ find: 'period', body: 'sun', measure: 'altitude', distance: 1 }).warnings[0]?.key,
    ).toBe('warn.noRadius');
    expect(
      solve({ find: 'period', body: 'earth', measure: 'altitude', distance: 50, lu: 'km' })
        .warnings[0]?.key,
    ).toBe('warn.air');
  });
});

describe('orbit: properties', () => {
  it('T² ∝ r³ and v × T = 2πr', () =>
    fc.assert(
      fc.property(
        fc.double({ min: 1e20, max: 1e31, noNaN: true }),
        fc.double({ min: 100, max: 1e9, noNaN: true }),
        (m, r) => {
          const a = around(m, r);
          const b = around(m, 2 * r);
          const ratio = (b.seconds / a.seconds) ** 2;
          return (
            Math.abs(ratio - 8) <= 1e-9 &&
            Math.abs((a.speed * a.seconds) / (2 * Math.PI * r * 1e3) - 1) <= 1e-9
          );
        },
      ),
    ));
});

describe('orbit: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const o = solve(e.inputs).outputs;
    for (const [k, v] of Object.entries(e.expect)) expect(o[k]).toBe(v);
  });
});
