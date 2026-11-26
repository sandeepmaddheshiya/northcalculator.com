import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-26');
const solve = (inputs: Record<string, unknown>) =>
  compute({ ...base, ...inputs } as never, { today: '2026-11-26', fmt: makeFmt('en') });
type Out = Record<'tau' | 'i0' | 'i' | 'pct' | 'vL' | 'energy' | 'half' | 'five', number>;
const out = (inputs: Record<string, unknown>) => solve(inputs).outputs as unknown as Out;
const sig = (x: number, d: number) => Number(x.toPrecision(d));
const up = (mode: string, t: number) => out({ mode, L: 4, lu: 'H', R: 4, V: 2, t, tu: 's' });

describe('rl-circuit: references (OpenStax College Physics 2e §23.10)', () => {
  it('Ex 23.9: 7.50 mH, 3.00 Ω → τ 2.50 ms; 10.0 A decays to 3.68 A at 2.50 ms, 1.35 A at 5.00 ms', () => {
    const at = (t: number) => out({ mode: 'decay', L: 7.5, lu: 'mH', R: 3, V: 30, t, tu: 'ms' });
    expect(at(0).tau).toBe(0.0025);
    expect([sig(at(2.5).i, 3), sig(at(5).i, 3)]).toEqual([3.68, 1.35]);
  });
});

describe('rl-circuit: references (OpenStax University Physics Vol. 2 §14.4)', () => {
  it('Ex 14.4: 2.0 V, 4.0 Ω, 4.0 H → τ 1.0 s, I(2τ) 0.43 A, I(∞) 0.50 A, |V_L(2τ)| 0.27 V', () => {
    const o = up('rise', 2);
    expect([o.tau, sig(o.i, 2), o.i0, sig(o.vL, 2)]).toEqual([1, 0.43, 0.5, 0.27]);
    expect(up('rise', 0).i).toBe(0);
  });
  it('§14.4: I(τ) = 63% of ε/R; |V_L(τ)| = 37% of ε', () => {
    const o = up('rise', 1);
    expect([sig(o.pct, 2), sig(o.vL / 2, 2)]).toEqual([63, 0.37]);
  });
  it('Ex 14.5: current halves in 0.69 s; energy falls to 1.0% in 2.3 s', () => {
    expect(sig(up('decay', 0).half, 2)).toBe(0.69);
    const t = -0.5 * 1 * Math.log(0.01);
    const ratio = up('decay', t).energy / up('decay', 0).energy;
    expect([sig(t, 2), sig(ratio, 6)]).toEqual([2.3, 0.01]);
  });
});

describe('rl-circuit: behaviour', () => {
  it('stored energy ½LI²; without a voltage only τ is shown', () => {
    expect(up('decay', 0).energy).toBe(0.5);
    const o = solve({ mode: 'rise', L: 10, lu: 'mH', R: 5, V: null, t: null }).outputs;
    expect([o.tau, o.i]).toEqual([0.002, null]);
  });
  it('µH and µs units; bad values explained', () => {
    expect(out({ mode: 'rise', L: 100, lu: 'uH', R: 10, V: 1, t: 10, tu: 'us' }).pct).toBe(
      out({ mode: 'rise', L: 1, lu: 'H', R: 1e5, V: 1, t: 10, tu: 'us' }).pct,
    );
    expect(solve({ mode: 'rise', L: 0, R: 1 }).warnings[0]?.key).toBe('warn.positive');
  });
});

describe('rl-circuit: properties', () => {
  it('rising + decaying currents add to V/R at every time', () =>
    fc.assert(
      fc.property(
        fc.double({ min: 0.001, max: 1000, noNaN: true }),
        fc.double({ min: 0.01, max: 1000, noNaN: true }),
        fc.double({ min: 0, max: 100, noNaN: true }),
        fc.double({ min: 0, max: 1000, noNaN: true }),
        (L, R, V, t) => {
          const i = { L, lu: 'H', R, V, t, tu: 's' };
          const a = out({ ...i, mode: 'rise' }).i;
          const b = out({ ...i, mode: 'decay' }).i;
          return Math.abs(a + b - V / R) <= 1e-9 * (V / R + 1e-12);
        },
      ),
    ));
});

describe('rl-circuit: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const o = solve(e.inputs).outputs;
    for (const [k, v] of Object.entries(e.expect)) expect(o[k]).toBe(v);
  });
});
