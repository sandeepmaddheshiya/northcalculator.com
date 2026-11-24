import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute, shareOut } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-24');
const p = (amount: unknown) => ({ amount });
const run = (inputs: Record<string, unknown>) =>
  compute({ ...base, ...inputs } as never, { today: '2026-11-24', fmt: makeFmt('en') });

describe('bill-split: references', () => {
  it('OpenStax Prealgebra 2e Ex 6.20: 18% tip on $68.50 = $12.33', () => {
    const r = run({ people: [p(68.5)], taxRate: 0, tipRate: 18 });
    expect(r.outputs.tip).toBe(12.33);
    expect(r.outputs.total).toBe(80.83);
  });
  it('OpenStax Contemporary Mathematics Ex 6.22: 8.25% on $34.88 = $2.88, $37.76', () => {
    const r = run({ people: [p(34.88)], taxRate: 8.25, tipRate: 0 });
    expect(r.outputs.tax).toBe(2.88);
    expect(r.outputs.total).toBe(37.76);
  });
});

describe('bill-split: behaviour (Python decimal check)', () => {
  it('three orders: $74.25 + $6.59 tax + $14.85 tip = $95.69, paid as $30.93, $40.60, $24.16', () => {
    const r = run({ people: [p(24), p(31.5), p(18.75)], taxRate: 8.875, tipRate: 20 });
    expect([r.outputs.subtotal, r.outputs.tax, r.outputs.tip, r.outputs.total]).toEqual([
      74.25, 6.59, 14.85, 95.69,
    ]);
    expect(r.table?.rows.map((x) => x[2])).toEqual([30.93, 40.6, 24.16]);
  });
  it('tip on the total includes tax', () =>
    expect(run({ people: [p(100)], taxRate: 10, tipRate: 20, tipOn: 'total' }).outputs.tip).toBe(
      22,
    ));
  it('FAQ: factor 1.2 means $35 pays $42', () => {
    const r = run({ people: [p(35), p(65)], taxRate: 0, tipRate: 20 });
    expect(r.outputs.factor).toBe(1.2);
    expect(r.table?.rows[0]?.[2]).toBe(42);
  });
  it('nothing ordered gives no result', () =>
    expect(run({ people: [p(0)] }).warnings[0]?.key).toBe('warn.empty'));
  it('largest-remainder rounding: $10 split three ways is 3.34, 3.33, 3.33', () =>
    expect(shareOut([1, 1, 1], 1000)).toEqual([334, 333, 333]));
});

describe('bill-split: properties', () => {
  it('shares always add up to the total and stay within a cent of exact', () =>
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 0, max: 100000 }), { minLength: 1, maxLength: 20 }),
        fc.integer({ min: 1, max: 10_000_000 }),
        (parts, total) => {
          fc.pre(parts.some((x) => x > 0));
          const s = shareOut(parts, total);
          const sum = parts.reduce((a, b) => a + b, 0);
          return (
            s.reduce((a, b) => a + b, 0) === total &&
            s.every((x, i) => Math.abs(x - (parts[i]! * total) / sum) < 1)
          );
        },
      ),
    ));
});

describe('bill-split: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const r = run({ ...e.inputs });
    for (const [k, v] of Object.entries(e.expect)) expect(r.outputs[k]).toBe(v);
  });
});
