import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { fill } from '@/lib/fill';
import { annuityPayment } from '@/engine/finance';
import { compute, simulate } from './compute';
import { content } from './content.en';
import { SAMPLE, definition } from './definition';

const base = defaultValues(definition, '2026-11-24');
const debt = (balance: number, apr: number, minimum: number) => ({ balance, apr, minimum });
const run = (inputs: Record<string, unknown>) =>
  compute({ ...base, ...inputs } as never, {
    today: '2026-11-24',
    fmt: makeFmt('en'),
    t: (k, v) => fill(content.ui[k] ?? k, v ?? {}),
  });

describe('debt-payoff: references', () => {
  it('CFPB orders: avalanche targets the highest APR, snowball the smallest balance', () => {
    expect(run({ debts: SAMPLE, extra: 200, method: 'avalanche' }).outputs.order).toBe(
      'Debt 1 → Debt 3 → Debt 2',
    );
    expect(run({ debts: SAMPLE, extra: 200, method: 'snowball' }).outputs.order).toBe(
      'Debt 2 → Debt 3 → Debt 1',
    );
  });
  it('OpenStax loan formula: a single $5,000 debt at 18% paid off in 32 months is consistent with the annuity payment', () => {
    // n = −ln(1 − rB/P) / ln(1 + r) = 31.57 → 32 payments
    expect(run({ debts: [debt(5000, 18, 200)], extra: 0 }).outputs.months).toBe(32);
    expect(annuityPayment(5000, 0.015, 32)).toBeLessThan(200);
    expect(annuityPayment(5000, 0.015, 31)).toBeGreaterThan(200);
  });
});

describe('debt-payoff: behaviour (Python simulation)', () => {
  it('avalanche: 33 months, $4,304.53; snowball: 35 months, $5,421.48', () => {
    const a = run({ debts: SAMPLE, extra: 200, method: 'avalanche' });
    expect([
      a.outputs.months,
      a.outputs.interest,
      a.outputs.otherMonths,
      a.outputs.otherInterest,
    ]).toEqual([33, 4304.53, 35, 5421.48]);
    expect(a.explain?.key).toBe('explain.better');
  });
  it('single debt: $1,313.97 of interest', () =>
    expect(run({ debts: [debt(5000, 18, 200)], extra: 0 }).outputs.interest).toBe(1313.97));
  it('payments that never cover interest are flagged', () =>
    expect(run({ debts: [debt(10000, 24, 150)], extra: 0 }).warnings[0]?.key).toBe('warn.never'));
  it('zero-interest debts are paid in balance ÷ payment months', () =>
    expect(run({ debts: [debt(1200, 0, 100)], extra: 0 }).outputs.months).toBe(12));
  it('no debts', () => expect(run({ debts: [] }).warnings[0]?.key).toBe('warn.empty'));
});

describe('debt-payoff: properties', () => {
  const d = fc.record({
    balance: fc.integer({ min: 100, max: 20000 }),
    apr: fc.integer({ min: 0, max: 30 }),
    minimum: fc.integer({ min: 50, max: 600 }),
  });
  it('avalanche never pays more interest than snowball', () =>
    fc.assert(
      fc.property(
        fc.array(d, { minLength: 1, maxLength: 5 }),
        fc.integer({ min: 100, max: 1000 }),
        (debts, extra) => {
          const ds = debts.map((x) => ({
            balance: x.balance * 100,
            apr: x.apr,
            minimum: x.minimum * 100,
          }));
          const a = simulate(ds, extra * 100, 'avalanche');
          const s = simulate(ds, extra * 100, 'snowball');
          if (!a || !s) return true;
          return a.interest <= s.interest + ds.length; // allow cent-rounding ties
        },
      ),
    ));
  it('more extra payment never takes longer', () =>
    fc.assert(
      fc.property(
        fc.array(d, { minLength: 1, maxLength: 4 }),
        fc.integer({ min: 100, max: 800 }),
        (debts, extra) => {
          const ds = debts.map((x) => ({
            balance: x.balance * 100,
            apr: x.apr,
            minimum: x.minimum * 100,
          }));
          const a = simulate(ds, extra * 100, 'avalanche');
          const b = simulate(ds, (extra + 100) * 100, 'avalanche');
          if (!a || !b) return true;
          return b.months <= a.months;
        },
      ),
    ));
});

describe('debt-payoff: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const r = run({ ...e.inputs });
    for (const [k, v] of Object.entries(e.expect)) expect(r.outputs[k]).toBe(v);
  });
});
