import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-24');
const run = (inputs: Record<string, unknown>) =>
  compute({ ...base, ...inputs } as never, { today: '2026-11-24', fmt: makeFmt('en') });

describe('break-even: references (OpenStax Principles of Managerial Accounting §3.2)', () => {
  it('Hicks: $18,000 ÷ $80 = 225 units, $22,500', () => {
    const r = run({ fixed: 18000, price: 100, variable: 20 });
    expect([r.outputs.units, r.outputs.sales, r.outputs.cm, r.outputs.cmRatio]).toEqual([
      225, 22500, 80, 80,
    ]);
  });
  it('Hicks with a $40,000 target profit: 725 units, $72,500', () => {
    const r = run({ fixed: 18000, price: 100, variable: 20, profit: 40000 });
    expect([r.outputs.units, r.outputs.sales]).toEqual([725, 72500]);
  });
  it('tax returns: $14,000 ÷ $250 = 56; ÷ 0.625 = $22,400', () => {
    const r = run({ fixed: 14000, price: 400, variable: 150 });
    expect([r.outputs.units, r.outputs.sales, r.outputs.cmRatio]).toEqual([56, 22400, 62.5]);
  });
});

describe('break-even: behaviour', () => {
  it('FAQ: $12,000, $50, $30 → 600 units, $30,000; with $10,000 target → 1,100', () => {
    expect(run({ fixed: 12000, price: 50, variable: 30 }).outputs.units).toBe(600);
    expect(run({ fixed: 12000, price: 50, variable: 30 }).outputs.sales).toBe(30000);
    expect(run({ fixed: 12000, price: 50, variable: 30, profit: 10000 }).outputs.units).toBe(1100);
  });
  it('fractional units round up and are flagged', () => {
    const r = run({ fixed: 11250, price: 50, variable: 30 });
    expect([r.outputs.exact, r.outputs.units]).toEqual([562.5, 563]);
    expect(r.warnings[0]?.key).toBe('warn.roundUp');
  });
  it('no margin, no break-even', () =>
    expect(run({ price: 20, variable: 20 }).warnings[0]?.key).toBe('warn.noMargin'));
  it('zero fixed costs break even at zero units', () =>
    expect(run({ fixed: 0 }).outputs.units).toBe(0));
});

describe('break-even: properties', () => {
  it('selling the break-even units covers all costs, one fewer does not', () =>
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1e6 }),
        fc.integer({ min: 2, max: 10000 }),
        fc.integer({ min: 1, max: 10000 }),
        (fixed, price, vc) => {
          fc.pre(vc < price);
          const u = run({ fixed, price, variable: vc }).outputs.units as number;
          return u * (price - vc) >= fixed && (u - 1) * (price - vc) < fixed;
        },
      ),
    ));
});

describe('break-even: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const r = run({ ...e.inputs });
    for (const [k, v] of Object.entries(e.expect)) expect(r.outputs[k]).toBe(v);
  });
});
