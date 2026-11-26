import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-26');
const solve = (inputs: Record<string, unknown>) =>
  compute({ ...base, given: 'none', ...inputs } as never, {
    today: '2026-11-26',
    fmt: makeFmt('en'),
  });
type Out = Record<'eff' | 'kP' | 'kR' | 'qh' | 'w' | 'qc', number>;
const out = (inputs: Record<string, unknown>) => solve(inputs).outputs as unknown as Out;
const sig = (x: number, d: number) => Number(x.toPrecision(d));

describe('carnot: references (OpenStax College Physics 2e §15.3–15.4)', () => {
  it('Ex 15.4: 300 °C and 27.0 °C → 47.6%', () =>
    expect(sig(out({ th: 300, tc: 27, tu: 'C' }).eff, 3)).toBe(47.6));
  it('Ex 15.4 with the book’s 573 K and 300 K → 0.476', () =>
    expect(sig(out({ th: 573, tc: 300, tu: 'K' }).eff / 100, 3)).toBe(0.476));
  it('Ex 15.3: actual efficiency W/Q_h = 1.02 × 10¹⁴ / 2.50 × 10¹⁴ = 40.8%, below Carnot', () => {
    expect(sig((2.5e14 - 1.48e14) / 2.5e14, 3)).toBe(0.408);
  });
});

describe('carnot: references (OpenStax University Physics Vol. 2 §4.5)', () => {
  it('Ex 4.2: e 0.60 at T_c 300 K ↔ T_h 750 K; W 300 J → Q_h 500 J, Q_c 200 J', () => {
    const o = out({ th: 750, tc: 300, tu: 'K', given: 'work', amount: 300 });
    expect([o.eff, o.qh, o.qc]).toEqual([60, 500, 200]);
    expect(300 / (1 - 0.6)).toBe(750);
  });
  it('Ex 4.3: heat pump 0 °C → 20 °C delivering 30.0 kJ → W ≈ 2 kJ (2.05 with 273.15)', () => {
    const o = out({ th: 20, tc: 0, tu: 'C', given: 'heat', amount: 30 });
    expect(sig(o.w, 1)).toBe(2);
    expect(sig((30 * (293 - 273)) / 293, 3)).toBe(2.05);
  });
  it('COP formulas: K_R = T_c/(T_h − T_c), K_P = T_h/(T_h − T_c), K_P = K_R + 1', () => {
    const o = out({ th: 25, tc: 0, tu: 'C' });
    expect(sig(o.kR, 6)).toBe(sig(273.15 / 25, 6));
    expect(sig(o.kP - o.kR, 12)).toBe(1);
  });
});

describe('carnot: behaviour', () => {
  it('rejects reversed or sub-zero temperatures', () => {
    expect(solve({ th: 10, tc: 20, tu: 'C' }).warnings[0]?.key).toBe('warn.order');
    expect(solve({ th: 10, tc: -300, tu: 'C' }).warnings[0]?.key).toBe('warn.kelvin');
  });
});

describe('carnot: properties', () => {
  it('0 < e < 1, e = 1/K_P, and W + Q_c = Q_h', () =>
    fc.assert(
      fc.property(
        fc.double({ min: 1, max: 5000, noNaN: true }),
        fc.double({ min: 0.001, max: 4999, noNaN: true }),
        fc.double({ min: 0.01, max: 1e6, noNaN: true }),
        (th, frac, q) => {
          fc.pre(frac < th);
          const o = out({ th, tc: frac, tu: 'K', given: 'heat', amount: q });
          const e = o.eff / 100;
          return (
            e > 0 &&
            e < 1 &&
            Math.abs(e * o.kP - 1) <= 1e-9 &&
            Math.abs(o.w + o.qc - o.qh) <= 1e-9 * q
          );
        },
      ),
    ));
});

describe('carnot: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const o = solve(e.inputs).outputs;
    for (const [k, v] of Object.entries(e.expect)) expect(o[k]).toBe(v);
  });
});
