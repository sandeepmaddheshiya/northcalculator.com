import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-25');
const out = (mass: number, speed: number, radius: number, su = 'ms') =>
  compute({ ...base, mass, speed, radius, su } as never, {
    today: '2026-11-25',
    fmt: makeFmt('en'),
  }).outputs as Record<string, number>;
const sig = (x: number, d: number) => Number(x.toPrecision(d));

describe('centripetal: references', () => {
  it('College Physics 2e Ex 6.2: 25.0 m/s, 500 m → 1.25 m/s², 0.128 g', () => {
    const o = out(1, 25, 500);
    expect([o.accel, sig(o.friction!, 3)]).toEqual([1.25, 0.127]); // a ÷ g, the same ratio as μ_s
    expect(sig(1.25 / 9.8, 3)).toBe(0.128); // the book divides by 9.80
  });
  it('Ex 6.4: 900 kg → 1125 N; μ_s = 0.13', () => {
    const o = out(900, 25, 500);
    expect([o.force, sig(o.friction!, 2)]).toEqual([1125, 0.13]);
  });
  it('Ex 6.5: a 65.0° bank on a 100 m curve suits 45.8 m/s', () => {
    expect(sig(out(1, 45.8, 100).bank!, 2)).toBe(65);
    expect(sig(Math.sqrt(100 * 9.8 * Math.tan((65 * Math.PI) / 180)), 3)).toBe(45.8);
  });
  it('Ex 6.3: ultracentrifuge 7.50 cm at 7.5 × 10⁴ rpm → 4.63 × 10⁶ m/s²', () => {
    const v = (0.075 * 2 * Math.PI * 75000) / 60;
    expect(sig(out(1, v, 0.075).accel!, 3)).toBe(4.63e6);
  });
  it('University Physics Ex 4.10: 134.1 m/s at 1835 m → 9.8 m/s²', () =>
    expect(sig(out(1, 134.1, 1835).accel!, 2)).toBe(9.8));
});

describe('centripetal: behaviour', () => {
  it('FAQ: 1000 kg, 20 m/s, 100 m → 4,000 N; three times the speed needs μ ≈ 1.15', () => {
    expect(out(1000, 20, 100).force).toBe(4000);
    expect(sig(out(1, 75, 500).friction!, 3)).toBe(1.15);
  });
  it('km/h input: 90 km/h = 25 m/s; lap time 2πr/v', () => {
    expect(out(900, 90, 500, 'kmh').force).toBe(1125);
    expect(sig(out(1, 25, 500).period!, 6)).toBe(sig((2 * Math.PI * 500) / 25, 6));
  });
  it('zero radius rejected', () =>
    expect(
      compute({ ...base, mass: 1, speed: 1, radius: 0 } as never, { today: '', fmt: makeFmt('en') })
        .warnings[0]?.key,
    ).toBe('warn.radius'));
});

describe('centripetal: properties', () => {
  it('doubling speed quadruples force; doubling radius halves it', () =>
    fc.assert(
      fc.property(
        fc.double({ min: 0.001, max: 1e5, noNaN: true }),
        fc.double({ min: 0.01, max: 1e4, noNaN: true }),
        fc.double({ min: 0.01, max: 1e6, noNaN: true }),
        (m, v, r) => {
          const f = out(m, v, r).force!;
          return (
            Math.abs(out(m, 2 * v, r).force! - 4 * f) <= 1e-9 * f &&
            Math.abs(out(m, v, 2 * r).force! * 2 - f) <= 1e-9 * f
          );
        },
      ),
    ));
});

describe('centripetal: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const i = e.inputs as Record<string, number>;
    const o = out(i.mass!, i.speed!, i.radius!, String(e.inputs.su));
    for (const [k, v] of Object.entries(e.expect)) expect(o[k]).toBe(v);
  });
});
