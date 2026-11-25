import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-25');
const solve = (inputs: Record<string, unknown>) =>
  compute({ ...base, ...inputs } as never, { today: '2026-11-25', fmt: makeFmt('en') });
const out = (inputs: Record<string, unknown>) => solve(inputs).outputs as Record<string, number>;
const sig = (x: number | undefined, d: number) => Number(x!.toPrecision(d));
const accel = (v0: number, v: number, t: number, su = 'ms') =>
  out({ find: 'a', v0, v, t, su }).accel;

describe('acceleration: references (OpenStax College Physics 2e §2.4–2.5)', () => {
  it('Ex 2.1: racehorse 0 → −15.0 m/s in 1.80 s → −8.33 m/s²', () =>
    expect(sig(accel(0, -15, 1.8), 3)).toBe(-8.33));
  it('Ex 2.4: subway 0 → 30.0 km/h in 20.0 s → 0.417 m/s²', () =>
    expect(sig(accel(0, 30, 20, 'kmh'), 3)).toBe(0.417));
  it('Ex 2.5: 30.0 km/h → 0 in 8.00 s → −1.04 m/s²', () =>
    expect(sig(accel(30, 0, 8, 'kmh'), 3)).toBe(-1.04));
  it('Ex 2.7: −20.0 km/h → 0 in 10.0 s → +0.556 m/s²', () =>
    expect(sig(accel(-20, 0, 10, 'kmh'), 3)).toBe(0.556));
  it('Ex 2.9: 70.0 m/s at −1.50 m/s² for 40.0 s → 10.0 m/s', () =>
    expect(out({ find: 'v', v0: 70, a: -1.5, t: 40, su: 'ms' }).vf).toBe(10));
  it('Ex 2.10: 26.0 m/s² from rest for 5.56 s → 402 m', () =>
    expect(sig(out({ find: 'v', v0: 0, a: 26, t: 5.56, su: 'ms' }).distance, 3)).toBe(402));
  it('Check Your Understanding: 0 → 400 m/s at 20 m/s² → 20 s', () =>
    expect(out({ find: 't', v0: 0, v: 400, a: 20, su: 'ms' }).time).toBe(20));
});

describe('acceleration: references (OpenStax University Physics Vol. 1 §3.3)', () => {
  it('Ex 3.5: racehorse → −8.33 m/s², i.e. 8.33 m/s² west', () => {
    const r = solve({ find: 'a', v0: 0, v: -15, t: 1.8, su: 'ms' });
    expect(r.outputs.result).toBe('−8.3333333 m/s²');
    expect(r.explain?.key).toBe('explain.down');
  });
});

describe('acceleration: behaviour', () => {
  it('0–60 mph in 6 s ≈ 4.4704 m/s² ≈ 0.456 g', () => {
    const o = out({ find: 'a', v0: 0, v: 60, t: 6, su: 'mph' });
    expect(o.accel).toBe(4.4704);
    expect(sig(o.gs, 3)).toBe(0.456);
  });
  it('final speed is shown in the chosen unit', () =>
    expect(solve({ find: 'v', v0: 0, a: 1, t: 10, su: 'kmh' }).outputs.result).toBe('36 km/h'));
  it('impossible times are explained', () => {
    const w = (i: Record<string, unknown>) => solve(i).warnings[0]?.key;
    expect(w({ find: 'a', v0: 0, v: 10, t: 0 })).toBe('warn.time');
    expect(w({ find: 't', v0: 0, v: 10, a: 0 })).toBe('warn.zero');
    expect(w({ find: 't', v0: 0, v: 10, a: -1, su: 'ms' })).toBe('warn.never');
  });
  it('a reversal is flagged', () =>
    expect(solve({ find: 'a', v0: 10, v: -10, t: 4, su: 'ms' }).warnings[0]?.key).toBe(
      'warn.reverse',
    ));
});

describe('acceleration: properties', () => {
  const speed = fc.double({ min: -1000, max: 1000, noNaN: true });
  it('a → v → t round-trips', () =>
    fc.assert(
      fc.property(speed, speed, fc.double({ min: 0.01, max: 1000, noNaN: true }), (v0, v, t) => {
        fc.pre(Math.abs(v - v0) > 1e-3);
        const a = accel(v0, v, t)!;
        const vb = out({ find: 'v', v0, a, t, su: 'ms' }).vf!;
        const tb = out({ find: 't', v0, v, a, su: 'ms' }).time!;
        return (
          Math.abs(vb - v) <= 1e-9 * (Math.abs(v) + Math.abs(v0) + 1) &&
          Math.abs(tb - t) <= 1e-8 * t
        );
      }),
    ));
  it('distance agrees with x = v₀t + ½at²', () =>
    fc.assert(
      fc.property(
        speed,
        fc.double({ min: -50, max: 50, noNaN: true }),
        fc.double({ min: 0, max: 100, noNaN: true }),
        (v0, a, t) => {
          const x = out({ find: 'v', v0, a, t, su: 'ms' }).distance!;
          const want = v0 * t + 0.5 * a * t * t;
          return Math.abs(x - want) <= 1e-9 * (Math.abs(v0 * t) + Math.abs(a * t * t) + 1);
        },
      ),
    ));
});

describe('acceleration: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const o = solve(e.inputs).outputs;
    for (const [k, v] of Object.entries(e.expect)) expect(o[k]).toBe(v);
  });
});
