import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-24');
const run = (inputs: Record<string, unknown>, cur = 'USD') =>
  compute({ ...base, cur, ...inputs } as never, { today: '2026-11-24', fmt: makeFmt('en', cur) });
/** A loan with no down payment, so price = loan amount (as in the textbook examples). */
const loan = (amount: number, rate: number, years: number, extra: Record<string, unknown> = {}) =>
  run({ price: amount, down: 0, rate, years, ...extra });

describe('mortgage: OpenStax Contemporary Mathematics §6.12 (verified 2026-11-24)', () => {
  it('Ex 6.110: $132,650 at 4.8% for 30 years → $695.97', () =>
    expect(loan(132650, 4.8, 30).outputs.pi).toBe(695.97));
  it('Ex 6.111: $99,596 at 5.35% for 30 years → $556.16, $200,217.60 over 360 payments', () => {
    const r = loan(99596, 5.35, 30);
    expect(r.outputs.pi).toBe(556.16);
    expect(Math.round((r.outputs.pi as number) * 360 * 100) / 100).toBe(200217.6);
    // The book multiplies the rounded payment by 360. Our ledger rounds each payment to the cent
    // and the last payment clears the residue, so the amount actually paid is $2.06 lower.
    expect(Math.abs((r.outputs.total as number) - 200217.6)).toBeLessThan(5);
  });
  it('Ex 6.113: amortization table for $165,900 at 5.61% (payment, rows 170/175/180)', () => {
    const r = loan(165900, 5.61, 30);
    expect(r.outputs.pi).toBe(953.44);
    const rows = r.csv!.rows;
    // columns: month, payment, principal, interest, extra, balance
    expect(rows[174]![2]).toBeCloseTo(400.44, 1);
    expect(rows[179]![3]).toBeCloseTo(543.56, 1);
    expect(rows[169]![5]).toBeCloseTo(119873.35, -1);
  });
  it('Ex 6.114: $108,405 at 6% plus escrow (5.7% of $75,600 tax, $744 per 6 months insurance)', () => {
    const r = loan(108405, 6, 30, { tax: 0.057 * 75600, ins: 744 * 2 });
    // The book prints $649.95; the exact value is $649.9427… (Python decimal, 40 digits), which
    // rounds to $649.94. The book rounded an intermediate value. Escrow parts match exactly.
    expect(r.outputs.pi).toBe(649.94);
    expect(r.outputs.taxMo).toBe(359.1);
    expect(r.outputs.insMo).toBe(124);
    expect(r.outputs.monthly).toBe(1133.04);
  });
});

describe('mortgage: second independent reference', () => {
  // Payment per $100,000 at 6% over 30 years: $599.55 (standard published annuity tables;
  // also 100000 × 0.005 / (1 − 1.005^−360) computed independently in Python's decimal module).
  it('$100,000 at 6% for 30 years → $599.55', () =>
    expect(loan(100000, 6, 30).outputs.pi).toBe(599.55));
});

describe('mortgage: behaviour', () => {
  it('down payment reduces the loan', () => {
    const r = run({ price: 400000, down: 20 });
    expect(r.outputs.loan).toBe(320000);
    expect(r.outputs.downAmt).toBe(80000);
  });
  it('0% interest divides evenly', () => {
    const r = loan(120000, 0, 10);
    expect(r.outputs.pi).toBe(1000);
    expect(r.outputs.interest).toBe(0);
  });
  it('extra payments shorten the loan and save interest (Python-verified: 281 months, $105,427.85)', () => {
    const r = run({ price: 400000, down: 20, rate: 6.5, years: 30, extra: 200 });
    expect(r.outputs.payoff).toBe(281);
    expect(r.outputs.saved).toBe(105427.85);
  });
  it('Canadian semi-annual compounding uses the equivalent monthly rate', () => {
    const r = run({ price: 625000, down: 20, rate: 5, years: 25, comp: 'semiannual' }, 'CAD');
    expect(r.outputs.pi).toBe(2908.02);
    const monthly = run({ price: 625000, down: 20, rate: 5, years: 25 }, 'CAD');
    expect(monthly.outputs.pi as number).toBeGreaterThan(r.outputs.pi as number);
  });
  it('PMI applies below 20% down and stops at 78% of the original value', () => {
    const r = run({ price: 300000, down: 5, rate: 6, years: 30, pmi: 0.5 });
    expect(r.outputs.pmiMo).toBe(118.75); // 285,000 × 0.5% ÷ 12
    const months = r.outputs.pmiMonths as number;
    const rows = r.csv!.rows;
    expect(rows[months - 1]![5]).toBeLessThanOrEqual(0.78 * 300000);
    expect(rows[months - 2]![5]).toBeGreaterThan(0.78 * 300000);
    expect(run({ price: 300000, down: 25, rate: 6, years: 30, pmi: 0.5 }).outputs.pmiMo).toBeNull();
  });
  it('zero-decimal currencies round to whole units (JPY)', () => {
    const r = run({ price: 50000000, down: 10, rate: 1.5, years: 35 }, 'JPY');
    expect(Number.isInteger(r.outputs.pi)).toBe(true);
  });
  it('100% down payment means no loan', () => {
    const r = run({ price: 300000, down: 100 });
    expect(r.outputs.monthly).toBeNull();
    expect(r.warnings[0]?.key).toBe('warn.noLoan');
  });
  it('missing inputs give no result', () => expect(run({ rate: null }).outputs.monthly).toBeNull());
  it('huge loans stay exact in minor units', () => {
    const r = loan(5e9, 4, 30);
    expect(r.csv!.rows.at(-1)![5]).toBe(0);
  });
});

describe('mortgage: invariants', () => {
  it('the ledger ends at zero and principal paid equals the loan', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1000, max: 5_000_000 }),
        fc.double({ min: 0, max: 15, noNaN: true }),
        fc.integer({ min: 1, max: 40 }),
        fc.integer({ min: 0, max: 2000 }),
        (amount, rate, years, extra) => {
          const r = loan(amount, rate, years, { extra });
          const rows = r.csv!.rows;
          expect(rows.at(-1)![5]).toBe(0);
          const principal = rows.reduce((a, x) => a + (x[2] as number) + (x[4] as number), 0);
          expect(principal).toBeCloseTo(amount, 2);
          expect(rows.length).toBeLessThanOrEqual(years * 12);
        },
      ),
      { numRuns: 60 },
    );
  });
});

describe('mortgage: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const cur = (e.inputs as Record<string, unknown>).cur as string | undefined;
    const r = run({ ...e.inputs }, cur ?? 'USD');
    for (const [k, v] of Object.entries(e.expect)) expect(r.outputs[k]).toBe(v);
  });
});
