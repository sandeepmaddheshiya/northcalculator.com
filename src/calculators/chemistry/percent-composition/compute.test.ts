import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute, parseMasses } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-25');
const solve = (inputs: Record<string, unknown>) =>
  compute({ ...base, ...inputs } as never, { today: '2026-11-25', fmt: makeFmt('en') });
/** Mass percent by element, from the table. */
const pct = (inputs: Record<string, unknown>) => {
  const t = solve(inputs).table!;
  const col = t.columns.findIndex((c) => c.key === 'table.pct');
  return Object.fromEntries(t.rows.map((r) => [r[0], r[col] as number])) as Record<string, number>;
};
const f = (formula: string) => pct({ mode: 'formula', formula });
const sig = (x: number | undefined, d: number) => Number(x!.toPrecision(d));

describe('percent-composition: references (OpenStax Chemistry 2e §3.2)', () => {
  it('Ex 3.10: aspirin C9H8O4 → 60.00% C, 4.476% H, 35.52% O (180.159 g/mol)', () => {
    const p = f('C9H8O4');
    expect([sig(p.C, 4), sig(p.H, 4), sig(p.O, 4)]).toEqual([60, 4.476, 35.52]);
    expect(solve({ mode: 'formula', formula: 'C9H8O4' }).outputs.molarMass).toBe(180.159);
  });
  it('Ex 3.9: 7.34 g C, 1.85 g H, 2.85 g N → 61.0%, 15.4%, 23.7%', () => {
    const p = pct({ mode: 'masses', masses: 'C 7.34, H 1.85, N 2.85' });
    expect([sig(p.C, 3), sig(p.H, 3), sig(p.N, 3)]).toEqual([61, 15.4, 23.7]);
  });
  it('Check Your Learning: Fe2O3 → 69.9% Fe', () => expect(sig(f('Fe2O3').Fe, 3)).toBe(69.9));
  it('NH3 → 82.24% N with IUPAC weights; the book’s 82.27% uses N 14.01 and 17.03 (ADR-022)', () => {
    expect(sig(f('NH3').N, 4)).toBe(82.24);
    expect(sig((14.01 / 17.03) * 100, 4)).toBe(82.27);
    expect(sig((3.024 / 17.03) * 100, 4)).toBe(17.76);
  });
  it('the 10.0 g gas with 2.5 g H and 7.5 g C → 25% H, 75% C', () =>
    expect(pct({ mode: 'masses', masses: 'H 2.5, C 7.5' })).toEqual({ H: 25, C: 75 }));
});

describe('percent-composition: references (LibreTexts Introductory Chemistry §6.7)', () => {
  it('Ex 6.7.1: Cl2O7 → 38.77% Cl with O 15.999; the printed 38.76% uses O 16.00 (ADR-022)', () => {
    const p = f('Cl2O7');
    expect([sig(p.Cl, 4), sig(p.O, 4)]).toEqual([38.77, 61.23]);
    expect(sig((70.9 / 182.9) * 100, 4)).toBe(38.76);
  });
  it('12.50 g of Cl2O7 holds about 4.845 g Cl and 7.655 g O', () => {
    const r = solve({ mode: 'formula', formula: 'Cl2O7', sample: 12.5 }).table!;
    const g = r.rows.map((x) => sig(x.at(-1) as number, 3));
    expect(g).toEqual([4.85, 7.65]);
  });
});

describe('percent-composition: behaviour', () => {
  it('hydrates and groups parse', () => {
    expect(sig(f('CuSO4·5H2O').Cu, 4)).toBe(25.45);
    expect(Object.keys(f('Ca(OH)2'))).toEqual(['Ca', 'O', 'H']);
  });
  it('masses accept "7.34 g C" and "C: 7.34", and add repeats', () => {
    expect(parseMasses('7.34 g C; C: 1; H=2').masses).toEqual(
      new Map([
        ['C', 8.34],
        ['H', 2],
      ]),
    );
    expect(parseMasses('Xx 3, hello').bad).toBe(2);
  });
  it('formula errors are explained', () => {
    expect(solve({ mode: 'formula', formula: 'Qz2' }).warnings[0]?.key).toBe('warn.element');
    expect(solve({ mode: 'formula', formula: 'H2(O' }).warnings[0]?.key).toBe('warn.paren');
    expect(solve({ mode: 'masses', masses: 'oops' }).warnings.at(-1)?.key).toBe('warn.noMasses');
  });
});

describe('percent-composition: properties', () => {
  const els = ['H', 'C', 'N', 'O', 'S', 'Cl', 'Fe', 'Na'];
  it('percentages add to 100 for any formula', () =>
    fc.assert(
      fc.property(
        fc.uniqueArray(fc.constantFrom(...els), { minLength: 1, maxLength: 5 }),
        fc.array(fc.integer({ min: 1, max: 30 }), { minLength: 5, maxLength: 5 }),
        (symbols, counts) => {
          const formula = symbols.map((s, i) => `${s}${counts[i]}`).join('');
          const total = Object.values(f(formula)).reduce((a, b) => a + b, 0);
          return Math.abs(total - 100) < 1e-8;
        },
      ),
    ));
  it('scaling every measured mass leaves the percentages unchanged', () =>
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 1, max: 100000 }), { minLength: 3, maxLength: 3 }),
        fc.integer({ min: 2, max: 50 }),
        (m, k) => {
          const a = pct({ mode: 'masses', masses: `C ${m[0]}, H ${m[1]}, O ${m[2]}` });
          const b = pct({
            mode: 'masses',
            masses: `C ${m[0]! * k}, H ${m[1]! * k}, O ${m[2]! * k}`,
          });
          return ['C', 'H', 'O'].every((e) => Math.abs(a[e]! - b[e]!) < 1e-9);
        },
      ),
    ));
});

describe('percent-composition: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const o = solve(e.inputs).outputs;
    for (const [k, v] of Object.entries(e.expect)) expect(o[k]).toBe(v);
  });
});
