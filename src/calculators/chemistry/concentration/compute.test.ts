import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-26');
const solve = (inputs: Record<string, unknown>) =>
  compute({ ...base, mm: 0, density: 0, mmSolvent: 18.015, ...inputs } as never, {
    today: '2026-11-26',
    fmt: makeFmt('en'),
  });
type Out = Record<
  'pct' | 'ppm' | 'ppb' | 'molality' | 'x' | 'molarity' | 'solution' | 'solvent',
  number
>;
const out = (inputs: Record<string, unknown>) => solve(inputs).outputs as unknown as Out;
const sig = (x: number, d: number) => Number(x.toPrecision(d));
const inSolution = (solute: number, other: number, extra: Record<string, unknown> = {}) =>
  out({ solute, other, basis: 'solution', ...extra });
const inSolvent = (solute: number, other: number, extra: Record<string, unknown> = {}) =>
  out({ solute, other, basis: 'solvent', ...extra });

describe('concentration: references (OpenStax Chemistry 2e §3.4)', () => {
  it('Ex 3.22: 3.75 mg glucose in 5.0 g → 0.075%', () =>
    expect(sig(inSolution(0.00375, 5).pct, 2)).toBe(0.075));
  it('check: 135 g HCl in 775 g water → 14.8%', () =>
    expect(sig(inSolvent(135, 775).pct, 3)).toBe(14.8));
  it('check: 0.48 mg Hg in 50.0 g → 9.6 ppm, 9600 ppb', () => {
    const o = inSolution(0.00048, 50);
    expect([o.ppm, o.ppb]).toEqual([9.6, 9600]);
  });
});

describe('concentration: references (OpenStax Chemistry 2e §11.4)', () => {
  it('Ex 11.3: 2.22 kg ethylene glycol (62.07) in 2.00 kg water → X 0.244, 17.9 m', () => {
    const o = inSolvent(2220, 2000, { mm: 62.07 });
    expect([sig(o.x, 3), sig(o.molality, 3)]).toEqual([0.244, 17.9]);
  });
  it('check: 0.850 g NH₃ (17.03) in 125 g water → 7.14 × 10⁻³, 0.399 m', () => {
    const o = inSolvent(0.85, 125, { mm: 17.03 });
    expect([sig(o.x, 3), sig(o.molality, 3)]).toEqual([7.14e-3, 0.399]);
  });
  it('Ex 11.5: 0.556 mol glucose (180.2) per 1.04 kg of solution at 1.04 g/mL → 0.556 M, 0.59 m', () => {
    const o = inSolution(0.556 * 180.2, 1040, { mm: 180.2, density: 1.04 });
    expect([sig(o.molarity, 3), sig(o.molality, 2)]).toEqual([0.556, 0.59]);
  });
});

describe('concentration: references (LibreTexts Introductory Chemistry §13.5)', () => {
  it('25.0 g sugar in 100.0 g water → 20.0%; 36.5 g NaCl in 355 g solution → 10.3%; 15.8 g in 200 g → 7.90%', () => {
    expect(inSolvent(25, 100).pct).toBe(20);
    expect(sig(inSolution(36.5, 355).pct, 3)).toBe(10.3);
    expect(sig(inSolution(15.8, 200).pct, 3)).toBe(7.9);
  });
  it('3000.0 g of 5.00% NaCl contains 150.0 g', () => expect(inSolution(150, 3000).pct).toBe(5));
});

describe('concentration: behaviour', () => {
  it('molar quantities are hidden without a molar mass; solution must hold the solute', () => {
    const o = solve({ solute: 10, other: 100, basis: 'solvent' }).outputs;
    expect([o.molality, o.x, o.molarity]).toEqual([null, null, null]);
    expect(solve({ solute: 10, other: 5, basis: 'solution' }).warnings[0]?.key).toBe('warn.order');
  });
});

describe('concentration: properties', () => {
  it('solvent and solution bases agree; ppm = 10⁴ × percent', () =>
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 1e4, noNaN: true }),
        fc.double({ min: 0.01, max: 1e5, noNaN: true }),
        fc.double({ min: 1, max: 500, noNaN: true }),
        (g, w, mm) => {
          const a = inSolvent(g, w, { mm });
          const b = inSolution(g, g + w, { mm });
          const tol = 1e-9 * (a.pct + 1e-12);
          return (
            Math.abs(a.pct - b.pct) <= tol &&
            Math.abs(a.ppm - a.pct * 1e4) <= 1e-9 * (a.ppm + 1e-12) &&
            Math.abs(a.molality - b.molality) <= 1e-8 * (a.molality + 1e-12)
          );
        },
      ),
    ));
});

describe('concentration: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const o = solve(e.inputs).outputs;
    for (const [k, v] of Object.entries(e.expect)) expect(o[k]).toBe(v);
  });
});
