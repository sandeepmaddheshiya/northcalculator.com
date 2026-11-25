import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute, SOLVENTS } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-25');
const solve = (inputs: Record<string, unknown>) =>
  compute({ ...base, ...inputs } as never, { today: '2026-11-25', fmt: makeFmt('en') });
type Out = Record<'result' | 'bp' | 'dTf' | 'dTb' | 'molality' | 'particles', number>;
const out = (inputs: Record<string, unknown>) => solve(inputs).outputs as unknown as Out;
const sig = (x: number, d: number) => Number(x.toPrecision(d));
const byM = (solvent: string, molality: number, i = 1) =>
  out({ mode: 'molality', solvent, molality, i });

describe('colligative: references (OpenStax Chemistry 2e §11.4)', () => {
  it('Table 11.2 constants', () => {
    expect(SOLVENTS.water).toEqual({ bp: 100, kb: 0.512, fp: 0, kf: 1.86 });
    expect(SOLVENTS.benzene).toEqual({ bp: 80.1, kb: 2.53, fp: 5.5, kf: 5.12 });
  });
  it('Ex 11.7 and 11.9: 0.33 m in benzene → boils at 80.9 °C, freezes at 3.8 °C', () => {
    const o = byM('benzene', 0.33);
    expect([sig(o.dTb, 2), sig(o.bp, 3), sig(o.dTf, 2), sig(o.result, 2)]).toEqual([
      0.83, 80.9, 1.7, 3.8,
    ]);
  });
  it('Ex 11.8: 92.1 g I₂ (253.8) in 800.0 g chloroform → 0.454 m, ΔT_b 1.65 °C, 62.91 °C', () => {
    const o = out({
      mode: 'mass',
      solvent: 'chloroform',
      solute: 92.1,
      mm: 253.8,
      solventG: 800,
      i: 1,
    });
    expect([sig(o.molality, 3), sig(o.dTb, 3), sig(o.bp, 4)]).toEqual([0.454, 1.65, 62.91]);
  });
  it('Check: 1.85 m in nitrobenzene → −9.3 °C; antifreeze 17.9 m in water → 109.2 °C', () => {
    expect(sig(byM('nitrobenzene', 1.85).result, 2)).toBe(-9.3);
    expect(sig(byM('water', 17.9).bp, 4)).toBe(109.2);
  });
  it('Ex 11.11: 4.00 g in 55.0 g benzene freezing at 2.32 °C → 1.1 × 10² g/mol (117 exact)', () => {
    const o = out({
      mode: 'molarMass',
      solvent: 'benzene',
      solute: 4,
      solventG: 55,
      observed: 2.32,
      i: 1,
    });
    expect([sig(o.result, 2), sig(o.result, 3)]).toEqual([120, 117]);
    // ADR-022: the book rounds to 0.63 m and 0.035 mol: 4.00 ÷ 0.035 = 114 → 1.1 × 10².
    expect(sig(4 / 0.035, 2)).toBe(110);
  });
  it('Ex 11.13: 4.2 g NaCl in 125 g water, i = 2 → −2.1 °C; check: 0.724 g CaCl₂ in 175 g, i = 3 → −0.208 °C', () => {
    expect(
      sig(
        out({ mode: 'mass', solvent: 'water', solute: 4.2, mm: 58.44, solventG: 125, i: 2 }).result,
        2,
      ),
    ).toBe(-2.1);
    expect(
      sig(
        out({ mode: 'mass', solvent: 'water', solute: 0.724, mm: 110.98, solventG: 175, i: 3 })
          .result,
        3,
      ),
    ).toBe(-0.208);
  });
});

describe('colligative: references (LibreTexts Introductory Chemistry §13.9)', () => {
  it('antifreeze: ΔT_f 2.64 °C with K_f 1.86 → 1.42 m (by molality → depression)', () =>
    expect(sig(byM('water', 1.42).dTf, 3)).toBe(2.64));
  it('10.0 g NaCl (58.45) in 100.0 g water, k_b 0.52, i = 2 → 1.71 m, 1.78 °C, 101.78 °C', () => {
    const o = out({
      mode: 'mass',
      solvent: 'custom',
      kb: 0.52,
      kf: 1.86,
      bp: 100,
      fp: 0,
      solute: 10,
      mm: 58.45,
      solventG: 100,
      i: 2,
    });
    expect([sig(o.molality, 3), sig(o.dTb, 3), sig(o.bp, 5)]).toEqual([1.71, 1.78, 101.78]);
  });
});

describe('colligative: behaviour', () => {
  it('i doubles the effect; non-depressed measurements are rejected', () => {
    expect(byM('water', 1, 2).dTf).toBe(2 * byM('water', 1, 1).dTf);
    expect(
      solve({ mode: 'molarMass', solvent: 'water', solute: 1, solventG: 100, observed: 1, i: 1 })
        .warnings[0]?.key,
    ).toBe('warn.noDepression');
  });
});

describe('colligative: properties', () => {
  it('molar mass mode inverts the mass mode', () =>
    fc.assert(
      fc.property(
        fc.double({ min: 0.1, max: 100, noNaN: true }),
        fc.double({ min: 10, max: 1000, noNaN: true }),
        fc.double({ min: 50, max: 1000, noNaN: true }),
        fc.constantFrom('water', 'benzene', 'nitrobenzene'),
        (g, mm, solventG, solvent) => {
          const fp = out({ mode: 'mass', solvent, solute: g, mm, solventG, i: 1 }).result;
          const back = out({
            mode: 'molarMass',
            solvent,
            solute: g,
            solventG,
            observed: fp,
            i: 1,
          }).result;
          return Math.abs(back - mm) <= 1e-6 * mm;
        },
      ),
    ));
});

describe('colligative: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const o = solve(e.inputs).outputs;
    for (const [k, v] of Object.entries(e.expect)) expect(o[k]).toBe(v);
  });
});
