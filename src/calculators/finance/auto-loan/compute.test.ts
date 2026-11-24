import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-24');
const run = (inputs: Record<string, unknown>) =>
  compute({ ...base, ...inputs } as never, { today: '2026-11-24', fmt: makeFmt('en') });

describe('auto-loan: references (OpenStax Contemporary Mathematics §6.11)', () => {
  it('Ex 6.98: $21,800 + 6.75% tax ($1,471.50) + $1,206 fees = $24,477.50', () => {
    const r = run({ price: 21800, taxRate: 6.75, fees: 1206, rate: 0 });
    expect(r.outputs.tax).toBe(1471.5);
    expect(r.outputs.financed).toBe(24477.5);
  });
  it('Ex 6.99: $19,800 + 9.5% ($1,881) + $1,721.50 fees − $5,000 down = $18,402.50', () => {
    const r = run({ price: 19800, taxRate: 9.5, fees: 1721.5, down: 5000, rate: 0 });
    expect(r.outputs.tax).toBe(1881);
    expect(r.outputs.financed).toBe(18402.5);
  });
  it('Ex 6.100: $31,885 at 2.9% for 5 years = $571.52; $22,778 at 4.5% for 6 years = $361.58', () => {
    expect(run({ price: 31885, rate: 2.9, term: '60' }).outputs.payment).toBe(571.52);
    expect(run({ price: 22778, rate: 4.5, term: '72' }).outputs.payment).toBe(361.58);
  });
  it('Ex 6.101: $16,990 at 7.5% for 3 years = 528.4946…; book rounds up to $528.50, half-up gives $528.49 (ADR-022)', () =>
    expect(run({ price: 16990, rate: 7.5, term: '36' }).outputs.payment).toBe(528.49));
});

describe('auto-loan: behaviour (ledger values checked with a Python decimal ledger)', () => {
  it('$25,000 at 7%: 60 months $495.03 / $4,701.82 interest; 84 months $377.32 / $6,694.46', () => {
    const a = run({ price: 25000, rate: 7, term: '60' });
    expect([a.outputs.payment, a.outputs.interest]).toEqual([495.03, 4701.82]);
    const b = run({ price: 25000, rate: 7, term: '84' });
    expect([b.outputs.payment, b.outputs.interest]).toEqual([377.32, 6694.46]);
  });
  it('total cost adds the down payment and trade-in to the payments', () => {
    const r = run({ price: 19800, taxRate: 9.5, fees: 1721.5, down: 5000, rate: 4.5, term: '72' });
    expect(r.outputs.payment).toBe(292.12);
    expect(r.outputs.totalCost).toBe(26032.78);
  });
  it('tax on the price minus the trade-in', () => {
    expect(
      run({ price: 30000, tradeIn: 10000, taxRate: 5, taxOn: 'price', rate: 0 }).outputs.tax,
    ).toBe(1500);
    expect(
      run({ price: 30000, tradeIn: 10000, taxRate: 5, taxOn: 'net', rate: 0 }).outputs.tax,
    ).toBe(1000);
  });
  it('0% financing divides evenly', () =>
    expect(run({ price: 24000, rate: 0, term: '48' }).outputs.payment).toBe(500));
  it('nothing to finance', () => {
    const r = run({ price: 10000, down: 10000 });
    expect(r.outputs.payment).toBe(0);
    expect(r.warnings[0]?.key).toBe('warn.noLoan');
  });
});

describe('auto-loan: properties', () => {
  it('a longer term never raises the payment, and never lowers total interest', () =>
    fc.assert(
      fc.property(
        fc.integer({ min: 1000, max: 100000 }),
        fc.integer({ min: 1, max: 20 }),
        (price, rate) => {
          const a = run({ price, rate, term: '36' }).outputs;
          const b = run({ price, rate, term: '72' }).outputs;
          return (
            (b.payment as number) <= (a.payment as number) &&
            (b.interest as number) >= (a.interest as number)
          );
        },
      ),
    ));
});

describe('auto-loan: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const r = run({ ...e.inputs });
    for (const [k, v] of Object.entries(e.expect)) expect(r.outputs[k]).toBe(v);
  });
});
