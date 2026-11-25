import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-25');
const solve = (force: number, distance: number, angle = 90) =>
  compute({ ...base, force, distance, angle } as never, {
    today: '2026-11-25',
    fmt: makeFmt('en'),
  });
const out = (force: number, distance: number, angle = 90) =>
  solve(force, distance, angle).outputs as Record<string, number>;
const sig = (x: number, d: number) => Number(x.toPrecision(d));

describe('torque: references', () => {
  it('College Physics 2e §9.2: 40 N at 0.800 m → 32 N·m; 20 N → 16 N·m', () => {
    expect(out(40, 0.8).torque).toBe(32);
    expect(out(20, 0.8).torque).toBe(16);
  });
  it('Ex 9.1: 26.0 kg × 9.80 at 1.60 m balances 32.0 kg × 9.80 at 1.30 m', () =>
    expect(out(26 * 9.8, 1.6).torque).toBe(out(32 * 9.8, 1.3).torque));
  it('University Physics Ex 10.14: 160, 60, 120, 10 N·m; net 230', () => {
    const t = [
      out(40, 4).torque!,
      out(20, 3).torque!,
      out(30, 5, 53).torque!,
      out(20, 1, 30).torque!,
    ];
    expect([t[0], t[1], sig(t[2]!, 2), t[3]]).toEqual([160, 60, 120, 10]);
    expect(Math.round(t[0]! - t[1]! + t[2]! + t[3]!)).toBe(230);
  });
  it('Ex 10.15: 0.5 m × 20 N at 150° → 5.0 N·m; 30 N at 90° → 15 N·m', () => {
    expect(out(20, 0.5, 150).torque).toBe(5);
    expect(out(30, 0.5).torque).toBe(15);
  });
});

describe('torque: behaviour', () => {
  it('FAQ: 50 N on 0.3 m → 15 N·m; 30° halves it; 100 N·m ≈ 73.76 lbf·ft', () => {
    expect(out(50, 0.3).torque).toBe(15);
    expect(out(50, 0.3, 30).torque).toBe(7.5);
    expect(Math.round(out(100, 1).lbft! * 100) / 100).toBe(73.76);
  });
  it('a force along the lever gives no torque', () => {
    expect(out(100, 2, 0).torque).toBe(0);
    expect(solve(100, 2, 180).warnings[0]?.key).toBe('warn.parallel');
  });
});

describe('torque: properties', () => {
  it('θ and 180° − θ give the same torque; torque never exceeds rF', () =>
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 1e4, noNaN: true }),
        fc.double({ min: 0, max: 100, noNaN: true }),
        fc.double({ min: 0, max: 180, noNaN: true }),
        (f, r, a) => {
          const t = out(f, r, a).torque!;
          return (
            Math.abs(t - out(f, r, 180 - a).torque!) <= 1e-9 * (f * r + 1e-12) &&
            t <= f * r * (1 + 1e-11) + 1e-12
          );
        },
      ),
    ));
});

describe('torque: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const i = e.inputs as Record<string, number>;
    const o = out(i.force!, i.distance!, i.angle);
    for (const [k, v] of Object.entries(e.expect)) expect(o[k]).toBe(v);
  });
});
