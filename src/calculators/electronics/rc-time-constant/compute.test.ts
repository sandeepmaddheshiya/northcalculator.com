import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-25');
const solve = (inputs: Record<string, unknown>) =>
  compute({ ...base, target: 0, ...inputs } as never, { today: '2026-11-25', fmt: makeFmt('en') });
const out = (inputs: Record<string, unknown>) => solve(inputs).outputs as Record<string, number>;
const sig = (x: number, d: number) => Number(x.toPrecision(d));

describe('rc-time-constant: references', () => {
  it('College Physics 2e Ex 21.7: 1.00 kΩ × 8.00 µF = 8.00 ms; 10.0 kV → 3,680, 1,353 (book 1,354 via 0.368²), 498 V at 8, 16, 24 ms', () => {
    const at = (t: number) =>
      out({ mode: 'discharging', r: 1000, c: 8, cu: 'uF', v: 10000, t }).vAt!;
    expect(out({ r: 1000, c: 8, cu: 'uF' }).tau).toBe(0.008);
    expect([sig(at(0.008), 3), sig(at(0.016), 4), sig(at(0.024), 3)]).toEqual([3680, 1353, 498]);
  });
  it('§21.6: 63.2% after one τ charging, 36.8% left discharging', () => {
    expect(sig(out({ mode: 'charging', r: 1, c: 1, cu: 'F', v: 1, t: 1 }).percent!, 3)).toBe(63.2);
    expect(sig(out({ mode: 'discharging', r: 1, c: 1, cu: 'F', v: 1, t: 1 }).percent!, 3)).toBe(
      36.8,
    );
  });
  it('Ex 21.6: 16 µF through 10.0 Ω gives τ = 1.6 × 10⁻⁴ s', () =>
    expect(out({ r: 10, c: 16, cu: 'uF' }).tau).toBe(0.00016));
  it('University Physics Ex 10.8: (100 + 1) Ω × 50 mF = 5.05 s; 80 of 100 V at 8.13 s', () => {
    const o = out({ mode: 'charging', r: 101, c: 50, cu: 'mF', v: 100, target: 80 });
    expect([o.tau, sig(o.tTarget!, 3)]).toEqual([5.05, 8.13]);
  });
  it('Ex 10.9: 10.00 kΩ, 10.00 mF, 10 of 12 V → 179.18 s; 558.11 Ω gives 10.00 s', () => {
    expect(
      Math.round(
        out({ mode: 'charging', r: 10000, c: 10, cu: 'mF', v: 12, target: 10 }).tTarget! * 100,
      ) / 100,
    ).toBe(179.18);
    expect(
      sig(out({ mode: 'charging', r: 558.11, c: 10, cu: 'mF', v: 12, target: 10 }).tTarget!, 4),
    ).toBe(10);
  });
});

describe('rc-time-constant: behaviour', () => {
  it('FAQ: 10 kΩ × 100 µF = 1 s, 5τ = 5 s; half charge at ln 2 τ', () => {
    const o = out({ mode: 'charging', r: 10000, c: 100, cu: 'uF', v: 10, target: 5 });
    expect([o.tau, o.fiveTau, sig(o.tTarget!, 9)]).toEqual([1, 5, sig(Math.LN2, 9)]);
  });
  it('current: V/R at t = 0, decaying with τ', () => {
    expect(out({ mode: 'charging', r: 100, c: 1, cu: 'F', v: 10, t: 0 }).current).toBe(0.1);
    expect(
      sig(out({ mode: 'discharging', r: 100, c: 1, cu: 'F', v: 10, t: 100 }).current!, 6),
    ).toBe(sig(0.1 / Math.E, 6));
  });
  it('unreachable targets and zero R or C are rejected', () => {
    expect(
      solve({ mode: 'charging', r: 1, c: 1, cu: 'F', v: 10, target: 10 }).warnings[0]?.key,
    ).toBe('warn.never');
    expect(
      solve({ mode: 'discharging', r: 1, c: 1, cu: 'F', v: 10, target: 12 }).warnings[0]?.key,
    ).toBe('warn.above');
    expect(solve({ r: 0, c: 1 }).warnings[0]?.key).toBe('warn.zero');
  });
});

describe('rc-time-constant: properties', () => {
  it('voltage at the target time equals the target', () =>
    fc.assert(
      fc.property(
        fc.double({ min: 1, max: 1e6, noNaN: true }),
        fc.double({ min: 0.001, max: 1000, noNaN: true }),
        fc.double({ min: 0.001, max: 0.999, noNaN: true }),
        fc.boolean(),
        (r, cu, f, charging) => {
          const mode = charging ? 'charging' : 'discharging';
          const tt = out({ mode, r, c: cu, cu: 'uF', v: 10, target: 10 * f }).tTarget!;
          const v = out({ mode, r, c: cu, cu: 'uF', v: 10, t: tt }).vAt!;
          return Math.abs(v - 10 * f) <= 1e-8 * 10;
        },
      ),
    ));
});

describe('rc-time-constant: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const o = out(e.inputs);
    for (const [k, v] of Object.entries(e.expect)) expect(o[k]).toBe(v);
  });
});
