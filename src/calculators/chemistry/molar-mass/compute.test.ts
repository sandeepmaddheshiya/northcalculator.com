import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute } from './compute';
import { definition } from './definition';
import { WEIGHTS } from './elements';
import { parseFormula } from './parse';

const base = defaultValues(definition, '2026-11-24');
const run = (formula: string, mass?: number) =>
  compute({ ...base, formula, mass: mass ?? null } as never, {
    today: '2026-11-24',
    fmt: makeFmt('en'),
  });
const M = (f: string) => run(f).outputs.molarMass as number;
const counts = (f: string) => Object.fromEntries(parseFormula(f) as Map<string, number>);

describe('molar-mass: CIAAW 2024 abridged table', () => {
  it('has all 118 elements, 84 with a standard atomic weight', () => {
    expect(Object.keys(WEIGHTS)).toHaveLength(118);
    expect(Object.values(WEIGHTS).filter((w) => w !== null)).toHaveLength(84);
  });
  it('spot values as printed: H 1.0080, C 12.011, Cl 35.45, Pb 207.2, Gd 157.25, Zr 91.222', () =>
    expect([WEIGHTS.H, WEIGHTS.C, WEIGHTS.Cl, WEIGHTS.Pb, WEIGHTS.Gd, WEIGHTS.Zr]).toEqual([
      1.008, 12.011, 35.45, 207.2, 157.25, 91.222,
    ]));
});

describe('molar-mass: references', () => {
  // OpenStax Chemistry 2e §3.1 uses C 12.01, O 16.00, Al 26.98; with CIAAW values the answers
  // move by at most a few hundredths, so they are compared at 0.05 g/mol.
  it.each([
    ['CHCl3', 119.37],
    ['C9H8O4', 180.15],
    ['C13H18O2', 206.27],
    ['Al2(SO4)3', 342.14],
    ['NaCl', 58.44],
    ['C8H9NO2', 151.16],
    ['Ca3(PO4)2', 310.18],
  ])('OpenStax §3.1: %s ≈ %s', (f, v) => expect(Math.abs(M(f) - v)).toBeLessThan(0.05));
  // PubChem computes with its own atomic weight table and prints 2 decimals.
  it.each([
    ['C9H8O4', 180.16],
    ['CHCl3', 119.37],
    ['C6H12O6', 180.16],
    ['C8H10N4O2', 194.19],
    ['H2O', 18.015],
    ['C12H22O11', 342.3],
    ['CuSO4·5H2O', 249.69],
  ])('PubChem: %s ≈ %s', (f, v) => expect(Math.abs(M(f) - v)).toBeLessThanOrEqual(0.02));
  it('exact sums with CIAAW weights (Python): aspirin 180.159, chloroform 119.369, water 18.015', () =>
    expect([M('C9H8O4'), M('CHCl3'), M('H2O')]).toEqual([180.159, 119.369, 18.015]));
  it('Example 3.3: 4.7 g K → 0.12 mol; Example 3.6: 28.35 g glycine → 0.3777 mol (book 0.3776 with 75.07)', () => {
    expect(Math.round((run('K', 4.7).outputs.moles as number) * 100) / 100).toBe(0.12);
    expect(Math.round((run('C2H5O2N', 28.35).outputs.moles as number) * 1e4) / 1e4).toBe(0.3777);
    expect(Math.round((28.35 / 75.07) * 1e4) / 1e4).toBe(0.3776);
  });
  it('Example 3.5: 5.00 g Cu → 4.74 × 10²² atoms', () =>
    expect(Number((run('Cu', 5).outputs.particles as number).toPrecision(3))).toBe(4.74e22));
});

describe('molar-mass: parser', () => {
  it('nested groups, square brackets, hydrates and whitespace', () => {
    expect(counts('Ca3(PO4)2')).toEqual({ Ca: 3, P: 2, O: 8 });
    expect(counts('K4[Fe(CN)6]')).toEqual({ K: 4, Fe: 1, C: 6, N: 6 });
    expect(counts('CuSO4 · 5H2O')).toEqual({ Cu: 1, S: 1, O: 9, H: 10 });
    expect(counts('CuSO4*5H2O')).toEqual(counts('CuSO4.5H2O'));
  });
  it('case matters: Co vs CO', () => {
    expect(counts('Co')).toEqual({ Co: 1 });
    expect(counts('CO')).toEqual({ C: 1, O: 1 });
  });
  it('errors: unknown symbols, unmatched brackets, stray characters, unstable elements', () => {
    expect(run('Xx2').warnings[0]?.key).toBe('warn.element');
    expect(run('Ca3(PO4').warnings[0]?.key).toBe('warn.paren');
    expect(run('H2O]').warnings[0]?.key).toBe('warn.paren');
    expect(run('h2o').warnings[0]?.key).toBe('warn.syntax');
    expect(run('TcO4').warnings[0]?.key).toBe('warn.unstable');
  });
});

describe('molar-mass: properties', () => {
  const symbols = Object.keys(WEIGHTS).filter((s) => WEIGHTS[s] !== null);
  it('mass is additive: M(AB) = M(A) + M(B) and M((A)n) = n·M(A)', () =>
    fc.assert(
      fc.property(
        fc.array(fc.tuple(fc.constantFrom(...symbols), fc.integer({ min: 1, max: 20 })), {
          minLength: 1,
          maxLength: 5,
        }),
        fc.array(fc.tuple(fc.constantFrom(...symbols), fc.integer({ min: 1, max: 20 })), {
          minLength: 1,
          maxLength: 5,
        }),
        fc.integer({ min: 2, max: 9 }),
        (a, b, n) => {
          const A = a.map(([s, k]) => s + k).join('');
          const B = b.map(([s, k]) => s + k).join('');
          return (
            Math.abs(M(A + B) - M(A) - M(B)) < 1e-6 && Math.abs(M(`(${A})${n}`) - n * M(A)) < 1e-5
          );
        },
      ),
    ));
});

describe('molar-mass: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const r = run(String(e.inputs.formula), Number(e.inputs.mass));
    for (const [k, v] of Object.entries(e.expect)) expect(r.outputs[k]).toBe(v);
  });
});
