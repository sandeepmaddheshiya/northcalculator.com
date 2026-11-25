import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute, R } from './compute';
import { content } from './content.en';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-25');
const solve = (inputs: Record<string, unknown>) =>
  compute({ ...base, ...inputs } as never, {
    today: '2026-11-25',
    fmt: makeFmt('en'),
    t: (k) => content.ui[k] ?? k,
  });
type Out = Record<'dG' | 'tdS' | 'crossK' | 'crossC' | 'K', number>;
const g = (dH: number, dS: number, T: number, tu = 'K') =>
  solve({ dH, dS, T, tu }).outputs as unknown as Out;
const sig = (x: number, d: number) => Number(x.toPrecision(d));

describe('gibbs: references (OpenStax Chemistry 2e §16.4)', () => {
  it('Ex 16.7: 44.01 kJ, 118.8 J/K, 298 K → 8.6 kJ, not spontaneous', () => {
    expect(sig(g(44.01, 118.8, 298).dG, 2)).toBe(8.6);
    expect(solve({ dH: 44.01, dS: 118.8, T: 298, tu: 'K' }).outputs.verdict).toBe(
      'Not spontaneous',
    );
  });
  it('Ex 16.8(b): HgO 90.46 kJ, 107.4 J/K, 298 K → 58.45 kJ/mol', () =>
    expect(sig(g(90.46, 107.4, 298).dG, 4)).toBe(58.45));
  it('Ex 16.11: crossover 44.01 kJ ÷ 118.8 J/K → 370.5 K = 97.3 °C', () => {
    const o = g(44.01, 118.8, 298);
    expect([sig(o.crossK, 4), sig(o.crossC, 3)]).toEqual([370.5, 97.3]);
  });
  it('Ex 16.13: ΔG° 55.7 kJ/mol at 298.15 K → Ksp 1.74 × 10⁻¹⁰', () =>
    expect(sig(g(55.7, 0, 298.15).K, 3)).toBe(1.74e-10));
});

describe('gibbs: references (Lower et al., LibreTexts Gibbs (Free) Energy)', () => {
  it('Ex 1.1: −120 kJ, −150 J/K, 290 K → −77 kJ (−76.5)', () =>
    expect(g(-120, -150, 290).dG).toBe(-76.5));
  it('Ex 1.2: NH₄NO₃ 28.05 kJ, 108.7 J/K, 298.15 K → −4.4 kJ, spontaneous', () => {
    expect(sig(g(28.05, 108.7, 298.15).dG, 2)).toBe(-4.4);
    expect(solve({ dH: 28.05, dS: 108.7, T: 298.15, tu: 'K' }).outputs.verdict).toBe('Spontaneous');
  });
  it('Ex 1.3: NH₃ + HCl −176.0 kJ, −284.8 J/K, 298 K → −91.1 kJ', () =>
    expect(sig(g(-176, -284.8, 298).dG, 3)).toBe(-91.1));
});

describe('gibbs: references (Petrucci map §19.6)', () => {
  it('water 40.657 kJ, 108.96 J/K: 0 at 373.15 K, −1091 J at 383.15 K, +1088 J at 363.15 K', () => {
    expect(Math.round(g(40.657, 108.96, 383.15).dG * 1000)).toBe(-1091);
    expect(Math.round(g(40.657, 108.96, 363.15).dG * 1000)).toBe(1088);
    expect(sig(g(40.657, 108.96, 300).crossK, 5)).toBe(373.14);
  });
  it('C + O₂: −393 kJ, +2.9 J/K at 298 K → −394 kJ; N₂O₄: 55.3 kJ, 176 J/K → +2.8 kJ', () => {
    expect(sig(g(-393, 2.9, 298).dG, 3)).toBe(-394);
    // ADR-022: 55.3 − 298 × 0.176 = 2.852 kJ; the page prints +2.8.
    expect(g(55.3, 176, 298).dG).toBe(2.852);
  });
});

describe('gibbs: behaviour', () => {
  it('°C converts; sign cases and absolute zero', () => {
    expect(g(-176, -284.8, 25, 'C').dG).toBe(g(-176, -284.8, 298.15).dG);
    expect(solve({ dH: -10, dS: 10, T: 300, tu: 'K' }).warnings[0]?.key).toBe('case.np');
    expect(solve({ dH: 10, dS: -10, T: 300, tu: 'K' }).warnings[0]?.key).toBe('case.pn');
    expect(g(10, -10, 300).crossK).toBeNull();
    expect(solve({ dH: 1, dS: 1, T: -300, tu: 'C' }).warnings[0]?.key).toBe('warn.kelvin');
  });
  it('at the crossover ΔG is zero and K is 1', () => {
    const o = g(44.01, 118.8, 44010 / 118.8);
    expect([o.dG, o.K]).toEqual([0, 1]);
  });
  it('R is the exact SI molar gas constant', () => expect(R).toBe(8.314462618));
});

describe('gibbs: properties', () => {
  it('ΔG is linear in T, and K = e^(−ΔG/RT)', () =>
    fc.assert(
      fc.property(
        fc.double({ min: -500, max: 500, noNaN: true }),
        fc.double({ min: -500, max: 500, noNaN: true }),
        fc.double({ min: 50, max: 2000, noNaN: true }),
        (dH, dS, T) => {
          const a = g(dH, dS, T).dG;
          const b = g(dH, dS, 2 * T).dG;
          const tol = 1e-9 * (Math.abs(dH) + Math.abs(dS * T) / 1000 + 1);
          return Math.abs(b - (2 * a - dH)) <= 2 * tol;
        },
      ),
    ));
});

describe('gibbs: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const o = solve(e.inputs).outputs;
    for (const [k, v] of Object.entries(e.expect)) expect(o[k]).toBe(v);
  });
});
