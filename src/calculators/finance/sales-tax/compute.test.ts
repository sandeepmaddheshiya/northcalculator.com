import { describe, expect, it } from 'vitest';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-24');
const run = (inputs: Record<string, unknown>, cur = 'USD') =>
  compute({ ...base, ...inputs } as never, { today: '2026-11-24', fmt: makeFmt('en', cur) });

describe('sales tax: OpenStax Contemporary Mathematics §6.2 (verified 2026-11-24)', () => {
  it('Ex 6.22a: 8.25% on $428.99 → $35.39 tax', () => {
    const r = run({ amount: 428.99, rate: 8.25 });
    expect(r.outputs.tax).toBe(35.39);
    expect(r.outputs.total).toBe(464.38);
  });
  it('Ex 6.22b: 8.25% on $34.88 → $2.88 tax, $37.76', () => {
    const r = run({ amount: 34.88, rate: 8.25 });
    expect(r.outputs.tax).toBe(2.88);
    expect(r.outputs.total).toBe(37.76);
  });
  it('Ex 6.23a: $329.50 → $354.21 is a 7.5% rate', () =>
    expect(
      run({ mode: 'rate', amount: 329.5, gross: 354.21 }).outputs.result as number,
    ).toBeCloseTo(7.4992, 3));
  it('Ex 6.24a: 5.75% included in $36.56 → $34.57 before tax', () =>
    expect(run({ mode: 'remove', amount: 36.56, rate: 5.75 }).outputs.net).toBe(34.57));
  it('Ex 6.25: Denver 8.81% on $499 → $43.96 tax, $542.96', () => {
    const r = run({ amount: 499, rate: 8.81 });
    expect(r.outputs.tax).toBe(43.96);
    expect(r.outputs.total).toBe(542.96);
  });
  it('Ex 6.26: $467.64 including 8.25% → $432.00 before tax, $35.64 tax', () => {
    const r = run({ mode: 'remove', amount: 467.64, rate: 8.25 });
    expect(r.outputs.net).toBe(432);
    expect(r.outputs.tax).toBe(35.64);
  });
});

describe('sales tax: VAT and GST (HMRC VAT Notice 700: VAT fraction 1/6 at 20%)', () => {
  it('£120 including 20% VAT → £100 net, £20 VAT (VAT fraction 1/6 of the gross)', () => {
    const r = run({ mode: 'remove', amount: 120, rate: 20 }, 'GBP');
    expect(r.outputs.net).toBe(100);
    expect(r.outputs.tax).toBe(20);
  });
  it('₹1,180 including 18% GST → ₹1,000', () =>
    expect(run({ mode: 'remove', amount: 1180, rate: 18 }, 'INR').outputs.net).toBe(1000));
  it('adding then removing the same rate round-trips to the cent', () => {
    for (const [a, r] of [
      [19.99, 7.25],
      [1234.56, 20],
      [0.99, 18],
      [87.1, 8.875],
    ] as const) {
      const gross = run({ amount: a, rate: r }).outputs.total as number;
      expect(
        Math.abs((run({ mode: 'remove', amount: gross, rate: r }).outputs.net as number) - a),
      ).toBeLessThanOrEqual(0.01);
    }
  });
  it('0% rate adds nothing', () => expect(run({ amount: 50, rate: 0 }).outputs.tax).toBe(0));
  it('a gross below the net price is flagged', () =>
    expect(run({ mode: 'rate', amount: 100, gross: 90 }).warnings[0]?.key).toBe('warn.grossLower'));
});

describe('sales tax: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const cur = (e.inputs as Record<string, unknown>).cur as string | undefined;
    const r = run({ ...e.inputs }, cur ?? 'USD');
    for (const [k, v] of Object.entries(e.expect)) expect(r.outputs[k]).toBe(v);
  });
});
