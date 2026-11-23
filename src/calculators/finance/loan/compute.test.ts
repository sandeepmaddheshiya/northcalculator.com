import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-24');
const run = (inputs: Record<string, unknown>, cur = 'USD') =>
  compute({ ...base, cur, ...inputs } as never, { today: '2026-11-24', fmt: makeFmt('en', cur) });

describe('loan: OpenStax Contemporary Mathematics §6.8 and §6.11 (verified 2026-11-24)', () => {
  it('Ex 6.100a: $31,885 at 2.9% for 5 years → $571.52', () =>
    expect(run({ amount: 31885, rate: 2.9, term: 5 }).outputs.payment).toBe(571.52));
  it('Ex 6.100b: $22,778 at 4.5% for 6 years → $361.58', () =>
    expect(run({ amount: 22778, rate: 4.5, term: 6 }).outputs.payment).toBe(361.58));
  it('Ex 6.101: $16,990 at 7.5% for 3 years (book: $528.50; exact $528.4946…)', () => {
    // The book's working contains typos (0.04775, 0.00375) and rounds an intermediate value.
    // Exact: 16990 × 0.00625 ÷ (1 − 1.00625^−36) = 528.4946… (Python decimal), so $528.49.
    expect(run({ amount: 16990, rate: 7.5, term: 36, unit: 'm' }).outputs.payment).toBe(528.49);
  });
  it('Ex 6.77: first month interest on $13,450 at 6.75% → $75.66', () => {
    expect(run({ amount: 13450, rate: 6.75, term: 3 }).csv!.rows[0]![4]).toBe(75.66);
  });
});

describe('loan: APR with fees (Regulation Z App. J (b)(1); EU APRC as the effective rate)', () => {
  it('no fee: APR equals the note rate', () => {
    // 36 payments of $166.07 on $5,000 at 12% (1% a month): the textbook annuity case.
    const r = run({ amount: 5000, rate: 12, term: 36, unit: 'm', fee: 0.01 });
    expect(r.outputs.payment).toBe(166.07);
    expect(r.outputs.apr as number).toBeCloseTo(12, 1);
  });
  it('₹5,00,000 at 11% for 36 months with a ₹10,000 fee → APR 12.40%, effective 13.13% (Python decimal reference)', () => {
    const r = run({ amount: 500000, rate: 11, term: 36, unit: 'm', fee: 10000 }, 'INR');
    expect(r.outputs.payment).toBe(16369.36);
    expect(r.outputs.apr as number).toBeCloseTo(12.4024, 3);
    expect(r.outputs.ear as number).toBeCloseTo(13.1323, 3);
    expect(r.outputs.received).toBe(490000);
    expect(r.csv!.rows.at(-1)![1]).toBe(16369.3); // final payment clears the residue (Python: 16369.30)
  });
  it('APR is hidden without fees', () => expect(run({}).outputs.apr).toBeNull());
  it('a fee as large as the loan is rejected', () =>
    expect(run({ amount: 1000, fee: 1000 }).warnings[0]?.key).toBe('warn.feeTooBig'));
});

describe('loan: behaviour', () => {
  it('years and months give the same result', () => {
    expect(run({ term: 5, unit: 'y' }).outputs.payment).toBe(
      run({ term: 60, unit: 'm' }).outputs.payment,
    );
  });
  it('0% loans divide evenly', () =>
    expect(run({ amount: 1200, rate: 0, term: 12, unit: 'm' }).outputs.payment).toBe(100));
  it('extra payments shorten the term', () => {
    const r = run({ amount: 25000, rate: 9, term: 5, extra: 100 });
    expect(r.outputs.payoff as number).toBeLessThan(60);
    expect(r.outputs.saved as number).toBeGreaterThan(0);
  });
  it('short loans get a monthly table, long ones a yearly table', () => {
    expect(run({ term: 12, unit: 'm' }).table!.rows).toHaveLength(12);
    expect(run({ term: 5, unit: 'y' }).table!.rows).toHaveLength(5);
  });
  it('very high rates are flagged', () =>
    expect(run({ rate: 60 }).warnings.some((w) => w.key === 'warn.highRate')).toBe(true));
  it('more than 50 years is rejected', () =>
    expect(run({ term: 700, unit: 'm' }).outputs.payment).toBeNull());
  it('zero amount gives no result', () => expect(run({ amount: 0 }).outputs.payment).toBeNull());
});

describe('loan: invariants', () => {
  it('the ledger always ends at zero and APR ≥ note rate when fees are charged', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 500, max: 1_000_000 }),
        fc.double({ min: 0.5, max: 30, noNaN: true }),
        fc.integer({ min: 3, max: 360 }),
        fc.double({ min: 0.001, max: 0.05, noNaN: true }),
        (amount, rate, n, feeShare) => {
          const r = run({ amount, rate, term: n, unit: 'm', fee: Math.round(amount * feeShare) });
          expect(r.csv!.rows.at(-1)![5]).toBe(0);
          if ((r.outputs.received as number) < amount)
            expect(r.outputs.apr as number).toBeGreaterThan(rate - 1e-9);
        },
      ),
      { numRuns: 60 },
    );
  });
});

describe('loan: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const cur = (e.inputs as Record<string, unknown>).cur as string | undefined;
    const r = run({ ...e.inputs }, cur ?? 'USD');
    for (const [k, v] of Object.entries(e.expect)) expect(r.outputs[k]).toBe(v);
  });
});
