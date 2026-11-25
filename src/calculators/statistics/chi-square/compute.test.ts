import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { chiSqInv, chiSqSf, gammaQ } from '@/engine/chi';
import { compute, parseTable } from './compute';
import { content } from './content.en';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-25');
const solve = (inputs: Record<string, unknown>) =>
  compute({ ...base, ...inputs } as never, {
    today: '2026-11-25',
    fmt: makeFmt('en'),
    t: (k) => content.ui[k] ?? k,
  });
type Out = Record<'p' | 'chi2' | 'df' | 'critical' | 'minE', number>;
const out = (inputs: Record<string, unknown>) => solve(inputs).outputs as unknown as Out;
const sig = (x: number, d: number) => Number(x.toPrecision(d));
const gof = (observed: string, expected = 'equal', exp = '') =>
  out({ mode: 'gof', observed, expected, exp });

describe('chi-square: references (OpenStax Introductory Statistics 2e §11.2)', () => {
  it('Ex 11.2: 15, 12, 9, 9, 15 vs equal → χ² 3, df 4, p 0.5578', () => {
    const o = gof('15, 12, 9, 9, 15');
    expect([o.chi2, o.df, sig(o.p, 4)]).toEqual([3, 4, 0.5578]);
  });
  it('Ex 11.3: 66, 119, 340, 60, 15 vs 10, 16, 55, 11, 8 % → χ² 29.65, p 5.77 × 10⁻⁶', () => {
    const o = gof('66 119 340 60 15', 'percent', '10 16 55 11 8');
    // ADR-022: exact χ² is 29.6464 → p 5.78 × 10⁻⁶; the book's 5.77 × 10⁻⁶ uses χ² rounded to 29.65.
    expect([sig(o.chi2, 4), sig(o.p, 3)]).toEqual([29.65, 5.78e-6]);
    expect(sig(chiSqSf(29.65, 4), 3)).toBe(5.77e-6);
    expect(
      solve({
        mode: 'gof',
        observed: '66 119 340 60 15',
        expected: 'percent',
        exp: '10 16 55 11 8',
        alpha: '0.01',
      }).outputs.decision,
    ).toBe('Reject H₀');
  });
  it('Ex 11.4: coins 20, 57, 23 vs 25, 50, 25 → χ² 2.14, p 0.3430', () => {
    const o = gof('20 57 23', 'counts', '25 50 25');
    expect([sig(o.chi2, 3), sig(o.p, 3)]).toEqual([2.14, 0.343]);
  });
});

describe('chi-square: references (OpenStax §11.3 test of independence)', () => {
  it('Ex 11.6: volunteer table → expected 90.57, χ² 12.99, df 4, p 0.0113', () => {
    const r = solve({ mode: 'independence', table: '111 96 48; 96 133 61; 91 150 53' });
    const o = r.outputs as unknown as Out;
    expect([sig(o.chi2, 6), o.df, sig(o.p, 3)]).toEqual([12.9909, 4, 0.0113]);
    expect(sig(r.table!.rows[0]![2] as number, 4)).toBe(90.57);
  });
  it('Ex 11.5: expected count (70)(305)/755 = 28.3', () => {
    const r = solve({ mode: 'independence', table: '70 0; 235 450' });
    expect(sig(r.table!.rows[0]![2] as number, 3)).toBe(28.3);
  });
});

describe('chi-square: references (NIST/SEMATECH chi-square critical values)', () => {
  it.each([
    [1, 3.841, 6.635],
    [2, 5.991, 9.21],
    [4, 9.488, 13.277],
    [7, 14.067, 18.475],
    [10, 18.307, 23.209],
    [29, 42.557, null],
  ])('df %i → %f (α 0.05), %s (α 0.01)', (df, c05, c01) => {
    expect(Number(chiSqInv(0.05, df).toFixed(3))).toBe(c05);
    if (c01 !== null) expect(Number(chiSqInv(0.01, df).toFixed(3))).toBe(c01);
  });
});

describe('chi-square: behaviour', () => {
  it('small expected counts warn; mismatched or invalid input is explained', () => {
    expect(solve({ mode: 'gof', observed: '1 2 3', expected: 'equal' }).warnings[0]?.key).toBe(
      'warn.small',
    );
    expect(
      solve({ mode: 'gof', observed: '10 20', expected: 'counts', exp: '15' }).warnings[0]?.key,
    ).toBe('warn.expLength');
    expect(solve({ mode: 'independence', table: '1 2; 3' }).warnings[0]?.key).toBe('warn.table');
    expect(parseTable('1, 2\n3, 4')).toEqual([
      [1, 2],
      [3, 4],
    ]);
  });
  it('the incomplete gamma matches known closed forms', () => {
    // Q(1, x) = e^(−x); χ² with 2 df has P(X > x) = e^(−x/2).
    expect(sig(gammaQ(1, 3), 12)).toBe(sig(Math.exp(-3), 12));
    expect(sig(chiSqSf(10, 2), 12)).toBe(sig(Math.exp(-5), 12));
  });
});

describe('chi-square: properties', () => {
  it('perfect fit gives χ² 0 and p 1; the quantile inverts the tail', () =>
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 1, max: 500 }), { minLength: 2, maxLength: 8 }),
        fc.integer({ min: 1, max: 60 }),
        fc.double({ min: 0.001, max: 0.5, noNaN: true }),
        (counts, df, a) => {
          const o = gof(counts.join(' '), 'counts', counts.join(' '));
          const x = chiSqInv(a, df);
          return o.chi2 <= 1e-20 && o.p >= 1 - 1e-12 && Math.abs(chiSqSf(x, df) - a) <= 1e-9;
        },
      ),
    ));
});

describe('chi-square: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const o = solve(e.inputs).outputs;
    for (const [k, v] of Object.entries(e.expect)) expect(o[k]).toBe(v);
  });
});
