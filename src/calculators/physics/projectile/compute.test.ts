import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-24');
const run = (speed: number, angle: number, height = 0, g = 9.8, su = 'ms') =>
  compute({ ...base, speed, angle, height, g, su } as never, {
    today: '2026-11-24',
    fmt: makeFmt('en'),
  }).outputs as Record<string, number>;
const sig = (x: number, d: number) => Number(x.toPrecision(d));

describe('projectile: references', () => {
  it('University Physics Fig. 4.15 / College Physics Fig. 3.38: 30, 40, 50 m/s at 45° → 91.8, 163, 255 m', () =>
    expect([30, 40, 50].map((v) => sig(run(v, 45).range!, 3))).toEqual([91.8, 163, 255]));
  it('Fig. 4.15(b): 50 m/s at 15° and 75° → 128 m', () =>
    expect([sig(run(50, 15).range!, 3), sig(run(50, 75).range!, 3)]).toEqual([128, 128]));
  it('Example 4.7 / 3.4: 70.0 m/s at 75.0° → 233 m at 6.90 s, 125 m downrange at the top', () => {
    const o = run(70, 75);
    expect([sig(o.maxHeight!, 3), sig(o.apexTime!, 3)]).toEqual([233, 6.9]);
    expect(sig(o.range! / 2, 3)).toBe(125);
  });
  it('College Physics Example 3.5: 25.0 m/s at 35.0°, 20.0 m drop → 3.96 s, 31.9 m/s, 50.1° below', () => {
    const o = run(25, 35, 20);
    expect([sig(o.time!, 3), sig(o.impactSpeed!, 3)]).toEqual([3.96, 31.9]);
    // ADR-022: the exact angle is 50.05°; the book gets 50.1° from its rounded components
    // tan⁻¹(24.5 ÷ 20.5) = 50.08°.
    expect(sig(o.impactAngle!, 4)).toBe(50.05);
    expect(sig((Math.atan(24.5 / 20.5) * 180) / Math.PI, 3)).toBe(50.1);
  });
});

describe('projectile: behaviour', () => {
  it('FAQ: 20 m/s at 30° (g 9.81) → 2.04 s; straight up 20 m/s → 20.4 m', () => {
    expect(sig(run(20, 30, 0, 9.81).time!, 3)).toBe(2.04);
    expect(sig(run(20, 90, 0, 9.81).maxHeight!, 3)).toBe(20.4);
    expect(run(20, 90, 0, 9.81).range).toBe(0);
  });
  it('horizontal launch from a cliff equals a free fall in time', () =>
    expect(sig(run(15, 0, 100).time!, 10)).toBe(sig(Math.sqrt((2 * 100) / 9.8), 10)));
  it('downward launch uses the stable root', () =>
    expect(run(1000, -10, 0.001).time).toBeGreaterThan(0));
  it('a level launch from the ground lands at once', () => {
    const o = run(1, 0, 0);
    expect([o.time, o.range, o.impactSpeed]).toEqual([0, 0, 1]);
  });
  it('km/h input: 180 km/h = 50 m/s', () =>
    expect(run(180, 45, 0, 9.8, 'kmh').range).toBe(run(50, 45).range));
});

describe('projectile: properties', () => {
  it('level ground matches R = v² sin 2θ ÷ g and complementary angles share a range', () =>
    fc.assert(
      fc.property(
        fc.double({ min: 1, max: 1000, noNaN: true }),
        fc.double({ min: 1, max: 89, noNaN: true }),
        (v, a) => {
          const R = run(v, a).range!;
          const want = (v * v * Math.sin((2 * a * Math.PI) / 180)) / 9.8;
          return (
            Math.abs(R - want) <= 1e-9 * want && Math.abs(run(v, 90 - a).range! - R) <= 1e-9 * R
          );
        },
      ),
    ));
  it('landing speed² = v₀² + 2gh (energy)', () =>
    fc.assert(
      fc.property(
        fc.double({ min: 1, max: 500, noNaN: true }),
        fc.double({ min: -80, max: 89, noNaN: true }),
        fc.double({ min: 0, max: 1000, noNaN: true }),
        (v, a, h) => {
          const s = run(v, a, h).impactSpeed!;
          return Math.abs(s * s - (v * v + 2 * 9.8 * h)) <= 1e-8 * (v * v + 2 * 9.8 * h);
        },
      ),
    ));
});

describe('projectile: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const i = e.inputs as Record<string, number>;
    const o = run(i.speed!, i.angle!, i.height, i.g);
    for (const [k, v] of Object.entries(e.expect)) expect(o[k]).toBe(v);
  });
});
