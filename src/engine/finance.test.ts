import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import {
  amortize,
  annuityPayment,
  effectiveAnnualRate,
  growth,
  monthlyEffectiveRate,
} from './finance';
import { roundTo } from './money';

describe('annuityPayment (reference values; same as spreadsheet PMT)', () => {
  it.each([
    [200_000, 0.06, 30, 1199.1],
    [100_000, 0.05, 30, 536.82],
    [320_000, 0.065, 30, 2022.62],
    [250_000, 0.07, 15, 2247.07],
    [1_000_000, 0.1, 20, 9650.22], // ₹10 lakh at 10% for 20 years (widely published EMI example)
    [500_000, 0.09, 5, 10379.18],
  ])('%s at %s for %s years → %s', (p, rate, years, expected) => {
    expect(roundTo(annuityPayment(p, rate / 12, years * 12), 2)).toBe(expected);
  });
  it('zero rate divides evenly', () => {
    expect(annuityPayment(12_000, 0, 12)).toBe(1000);
  });
  it('rejects zero periods', () => {
    expect(() => annuityPayment(1, 0.01, 0)).toThrow();
  });
});

describe('amortize', () => {
  it('ends at exactly zero and sums correctly ($200k, 6%, 30y)', () => {
    const a = amortize(20_000_000, 0.005, 360);
    expect(a.payment).toBe(119_910);
    expect(a.rows).toHaveLength(360);
    expect(a.rows.at(-1)!.balance).toBe(0);
    expect(a.rows[0]).toMatchObject({ interest: 100_000, principal: 19_910, balance: 19_980_090 });
    const principalSum = a.rows.reduce((s, r) => s + r.principal + r.extra, 0);
    expect(principalSum).toBe(20_000_000);
    expect(a.totalPaid - a.totalInterest).toBe(20_000_000);
  });
  it('extra payments shorten the loan and cut interest', () => {
    const base = amortize(20_000_000, 0.005, 360);
    const extra = amortize(20_000_000, 0.005, 360, { extraMinor: 20_000 });
    expect(extra.rows.length).toBeLessThan(base.rows.length);
    // Closed form: n = −ln(1 − P·r/A) / ln(1 + r) with A = 1,399.10 → 251.5 → 252 payments (21 years).
    expect(extra.rows.length).toBe(252);
    expect(extra.totalInterest).toBeLessThan(base.totalInterest);
    expect(extra.rows.at(-1)!.balance).toBe(0);
  });
  it('zero-rate loan', () => {
    const a = amortize(1_200_00, 0, 12);
    expect(a.totalInterest).toBe(0);
    expect(a.rows.every((r) => r.payment === 10_000)).toBe(true);
  });
  it('balance always reaches 0 and principal is conserved (property)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 100_00, max: 5_000_000_00 }),
        fc.double({ min: 0, max: 0.3, noNaN: true }),
        fc.integer({ min: 1, max: 480 }),
        fc.integer({ min: 0, max: 500_000 }),
        (p, rate, n, extra) => {
          const a = amortize(p, rate / 12, n, { extraMinor: extra });
          const paidPrincipal = a.rows.reduce((s, r) => s + r.principal + r.extra, 0);
          return (
            a.rows.at(-1)!.balance === 0 &&
            paidPrincipal === p &&
            a.rows.length <= n &&
            a.rows.every((r) => Number.isInteger(r.interest))
          );
        },
      ),
      { numRuns: 400 },
    );
  });
});

describe('compound growth (reference values)', () => {
  const fv = (
    p: number,
    r: number,
    years: number,
    c: Parameters<typeof growth>[3]['compounding'],
    monthly = 0,
    timing: 'end' | 'start' = 'end',
  ) => roundTo(growth(p, r, years * 12, { compounding: c, monthly, timing }).at(-1)!.balance, 2);
  it.each([
    [1000, 0.05, 10, 'annual', 1628.89],
    [10_000, 0.06, 10, 'monthly', 18193.97],
    [5000, 0.08, 5, 'quarterly', 7429.74],
    [1000, 0.05, 10, 'continuous', 1648.72],
    [1000, 0.04, 3, 'semiannual', 1126.16],
  ] as const)('%s at %s for %s years, %s → %s', (p, r, y, c, expected) => {
    expect(fv(p, r, y, c)).toBe(expected);
  });
  it('monthly contributions: FV of an ordinary annuity and an annuity due', () => {
    // $100/month at 6% compounded monthly for 10 years: 100 × ((1.005^120 − 1)/0.005) = 16,387.93
    expect(fv(0, 0.06, 10, 'monthly', 100)).toBe(16387.93);
    expect(fv(0, 0.06, 10, 'monthly', 100, 'start')).toBe(16469.87);
  });
  it('APY', () => {
    expect(roundTo(effectiveAnnualRate(0.12, 'monthly') * 100, 4)).toBe(12.6825);
    expect(roundTo(effectiveAnnualRate(0.05, 'continuous') * 100, 4)).toBe(5.1271);
    expect(monthlyEffectiveRate(0.12, 'monthly')).toBeCloseTo(0.01, 12);
  });
  it('zero rate just sums contributions', () => {
    expect(fv(1000, 0, 2, 'monthly', 50)).toBe(2200);
  });
});
