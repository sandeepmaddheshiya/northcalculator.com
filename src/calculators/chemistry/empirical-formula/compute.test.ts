import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { WEIGHTS } from '@/calculators/chemistry/molar-mass/elements';
import { compute, wholeRatio } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-25');
const solve = (amounts: string, molar = 0) =>
  compute({ ...base, amounts, molar } as never, { today: '2026-11-25', fmt: makeFmt('en') });
const out = (amounts: string, molar = 0) => solve(amounts, molar).outputs;

describe('empirical-formula: references (OpenStax Chemistry 2e §3.2)', () => {
  it('Ex 3.11: 34.97 g Fe, 15.03 g O → Fe2O3 (ratio 1 : 1.500, ×2)', () => {
    const r = solve('Fe 34.97, O 15.03');
    expect([r.outputs.empirical, r.outputs.multiplier]).toEqual(['Fe2O3', 2]);
    expect(r.table!.rows.map((x) => Number((x[3] as number).toFixed(3)))).toEqual([1, 1.5]);
  });
  it('Ex 3.12: 27.29% C, 72.71% O → CO2', () =>
    expect(out('C 27.29, O 72.71').empirical).toBe('CO2'));
  it('Ex 3.13: nicotine → C5H7N, 162.3 g/mol → C10H14N2 (n = 2)', () => {
    const o = out('C 74.02, H 8.710, N 17.27', 162.3);
    expect([o.empirical, o.molecular, o.n]).toEqual(['C5H7N', 'C10H14N2', 2]);
    expect(Number((o.efm as number).toFixed(1))).toBe(81.1);
  });
  it('checks: 40.0% C, 6.71% H, 53.28% O → CH2O; 0.130 g N, 0.370 g O → N2O5', () => {
    expect(out('C 40.0, H 6.71, O 53.28').empirical).toBe('CH2O');
    expect(out('N 0.130, O 0.370').empirical).toBe('N2O5');
  });
  it('check: caffeine 49.47% C, 5.201% H, 28.84% N, 16.48% O, 194.2 → C8H10N4O2', () =>
    expect(out('C 49.47, H 5.201, N 28.84, O 16.48', 194.2).molecular).toBe('C8H10N4O2'));
});

describe('empirical-formula: references (LibreTexts Introductory Chemistry §6.8–6.9)', () => {
  it('Ex 6.8.1: 69.94% Fe, 30.06% O → Fe2O3', () =>
    expect(out('Fe 69.94, O 30.06').empirical).toBe('Fe2O3'));
  it('Exercise 6.8.1: 73.9% Hg, 26.1% Cl → HgCl2', () =>
    expect(out('Hg 73.9, Cl 26.1').empirical).toBe('HgCl2'));
  it('Exercise 6.9.1: vitamin C → C3H4O3, 176 amu → C6H8O6', () => {
    const o = out('C 40.92, H 4.58, O 54.50', 176);
    expect([o.empirical, o.molecular]).toEqual(['C3H4O3', 'C6H8O6']);
  });
  it('Ex 6.9.1: BH3 at 27.7 g/mol → B2H6', () => {
    const bh3 = `B ${WEIGHTS.B}, H ${3 * WEIGHTS.H!}`;
    expect(out(bh3, 27.7).molecular).toBe('B2H6');
  });
});

describe('empirical-formula: behaviour', () => {
  it('ratios ending .5, .33 and .25 take ×2, ×3 and ×4', () => {
    expect(wholeRatio([1, 1.5]).k).toBe(2);
    expect(wholeRatio([1, 1.333]).k).toBe(3);
    expect(wholeRatio([1, 1.25]).k).toBe(4);
    expect(wholeRatio([1, 2.01]).k).toBe(1);
  });
  it('warns when no multiplier works or the molar mass is not a multiple', () => {
    expect(solve('C 1, H 1.0471').warnings.map((w) => w.key)).not.toContain('warn.molar');
    expect(solve('C 40.0, H 6.71, O 53.28', 45).warnings.map((w) => w.key)).toContain('warn.molar');
    expect(solve('nothing').warnings.at(-1)?.key).toBe('warn.none');
  });
});

describe('empirical-formula: properties', () => {
  const els = ['C', 'H', 'N', 'O', 'S', 'Cl'];
  it('percent composition of a formula gives that formula’s simplest ratio back', () =>
    fc.assert(
      fc.property(
        fc.uniqueArray(fc.constantFrom(...els), { minLength: 2, maxLength: 4 }),
        fc.array(fc.integer({ min: 1, max: 6 }), { minLength: 4, maxLength: 4 }),
        (symbols, counts) => {
          const c = symbols.map((_, i) => counts[i]!);
          const masses = symbols.map((s, i) => `${s} ${c[i]! * WEIGHTS[s]!}`).join(', ');
          const r = solve(masses);
          const got = r.table!.rows.map((x) => x[4] as number);
          // Same ratio: got ∝ c.
          const ratio = got[0]! / c[0]!;
          return c.every((v, i) => Math.abs(got[i]! - v * ratio) < 1e-9);
        },
      ),
    ));
});

describe('empirical-formula: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const i = e.inputs as { amounts: string; molar: number };
    const o = out(i.amounts, i.molar);
    for (const [k, v] of Object.entries(e.expect)) expect(o[k]).toBe(v);
  });
});
