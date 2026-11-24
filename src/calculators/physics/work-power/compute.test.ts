import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute, HP } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-25');
const solve = (force: number, distance: number, angle = 0, time = 0) =>
  compute({ ...base, force, distance, angle, time } as never, {
    today: '2026-11-25',
    fmt: makeFmt('en'),
  });
const out = (f: number, d: number, a = 0, t = 0) =>
  solve(f, d, a, t).outputs as Record<string, number>;
const sig = (x: number, d: number) => Number(x.toPrecision(d));

describe('work-power: references', () => {
  it('College Physics 2e Ex 7.1: 75.0 N at 35.0° over 25.0 m → 1.54 × 10³ J', () =>
    expect(sig(out(75, 25, 35).work!, 3)).toBe(1540));
  it('Ex 7.11: (120 + 1764) J in 3.50 s → 538 W; 1764 J = 60.0 × 9.80 × 3.00', () => {
    expect(out(60 * 9.8, 3).work).toBe(1764);
    expect(sig((120 + out(60 * 9.8, 3).work!) / 3.5, 3)).toBe(538);
  });
  it('University Physics Ex 7.11: 0.9 × 80 × 9.8 N up 0.60 m in 0.8 s → 529 W', () =>
    expect(sig(out(0.9 * 80 * 9.8, 0.6, 0, 0.8).power!, 3)).toBe(529));
  it('NIST SP 811: 1 hp (550 ft·lbf/s) = 745.6999 W; OpenStax rounds to 746', () => {
    expect(sig(HP, 7)).toBe(745.6999);
    expect(Math.round(HP)).toBe(746);
  });
});

describe('work-power: behaviour', () => {
  it('FAQ: 50 N × 10 m → 500 J straight, 250 J at 60°', () => {
    expect(out(50, 10).work).toBe(500);
    expect(out(50, 10, 60).work).toBe(250);
  });
  it('90° does no work; 180° does negative work and is flagged', () => {
    expect(out(50, 10, 90).work).toBe(0);
    expect(out(50, 10, 180).work).toBe(-500);
    expect(solve(50, 10, 120).warnings[0]?.key).toBe('warn.negative');
  });
  it('3,600 J = 1 Wh; no time, no power', () => {
    expect(out(360, 10).wh).toBe(1);
    expect(out(360, 10).power).toBeNull();
  });
});

describe('work-power: properties', () => {
  it('power × time = work, and work never exceeds F × d', () =>
    fc.assert(
      fc.property(
        fc.double({ min: 0.01, max: 1e5, noNaN: true }),
        fc.double({ min: 0.01, max: 1e5, noNaN: true }),
        fc.double({ min: 0, max: 180, noNaN: true }),
        fc.double({ min: 0.01, max: 1e4, noNaN: true }),
        (f, d, a, t) => {
          const o = out(f, d, a, t);
          return (
            Math.abs(o.power! * t - o.work!) <= 1e-9 * f * d &&
            Math.abs(o.work!) <= f * d * (1 + 1e-11)
          );
        },
      ),
    ));
});

describe('work-power: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const i = e.inputs as Record<string, number>;
    const o = out(i.force!, i.distance!, i.angle, i.time);
    for (const [k, v] of Object.entries(e.expect)) expect(o[k]).toBe(v);
  });
});
