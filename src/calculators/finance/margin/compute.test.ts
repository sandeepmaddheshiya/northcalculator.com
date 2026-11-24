import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-24');
const run = (inputs: Record<string, unknown>, cur = 'USD') =>
  compute({ ...base, ...inputs } as never, { today: '2026-11-24', fmt: makeFmt('en', cur) });

describe('margin: references (OpenStax Contemporary Mathematics §6.2)', () => {
  it('Ex 6.16: $62 cost with a 15% markup sells for $71.30', () =>
    expect(run({ calc: 'costMarkup', cost: 62, markupPct: 15 }).outputs.result).toBe(71.3));
  it('Ex 6.16: $750 cost with a 45% markup sells for $1,087.50', () =>
    expect(run({ calc: 'costMarkup', cost: 750, markupPct: 45 }).outputs.result).toBe(1087.5));
  it('Ex 6.17: $90 → $103.50 is a 15% markup; $5.20 → $9.90 is 90.38%', () => {
    expect(run({ cost: 90, price: 103.5 }).outputs.markup).toBe(15);
    expect(run({ cost: 5.2, price: 9.9 }).outputs.markup).toBe(90.3846);
  });
  it('Ex 6.18: a 20% markup to $10.62 means a cost of $8.85; 125% to $26.55 means $11.80', () => {
    expect(run({ calc: 'priceMarkup', price: 10.62, markupPct: 20 }).outputs.result).toBe(8.85);
    expect(run({ calc: 'priceMarkup', price: 26.55, markupPct: 125 }).outputs.result).toBe(11.8);
  });
  it('Ex 6.19: a $1.30 protein bar with a 60% markup sells for $2.08', () =>
    expect(run({ calc: 'costMarkup', cost: 1.3, markupPct: 60 }).outputs.result).toBe(2.08));
});

describe('margin: references (OpenStax Principles of Accounting §6.6)', () => {
  it('CBS: ($293,500 − $180,000) ÷ $293,500 = 0.39 (book rounds 0.38671 to the hundredth)', () => {
    const r = run({ cost: 180000, price: 293500 });
    expect(r.outputs.result).toBe(38.6712);
    expect(r.outputs.profit).toBe(113500);
  });
});

describe('margin: behaviour', () => {
  it('price from a target margin: $60 cost at 40% margin is $100', () => {
    const r = run({ calc: 'costMargin', cost: 60, marginPct: 40 });
    expect(r.outputs.result).toBe(100);
    expect(r.outputs.markup).toBe(66.6667);
  });
  it('cost from price and margin', () =>
    expect(run({ calc: 'priceMargin', price: 100, marginPct: 25 }).outputs.result).toBe(75));
  it('a 100% margin is impossible', () =>
    expect(run({ calc: 'costMargin', cost: 10, marginPct: 100 }).warnings[0]?.key).toBe(
      'warn.margin100',
    ));
  it('selling below cost is flagged with negative percentages', () => {
    const r = run({ cost: 120, price: 100 });
    expect(r.outputs.result).toBe(-20);
    expect(r.warnings[0]?.key).toBe('warn.loss');
  });
  it('zero-decimal currencies round to whole units (JPY)', () =>
    expect(run({ calc: 'costMargin', cost: 1000, marginPct: 30 }, 'JPY').outputs.result).toBe(
      1429,
    ));
  it('the headline figure is not repeated in the list', () => {
    const r = run({ calc: 'costMarkup', cost: 62, markupPct: 15 });
    expect(r.outputs.price).toBeNull();
    expect(r.outputs.cost).toBe(62);
  });
  it('missing input gives no result', () => expect(run({ cost: null }).outputs.result).toBeNull());
});

describe('margin: properties', () => {
  it('margin = markup ÷ (1 + markup) for any profitable sale', () =>
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 1e7 }), fc.integer({ min: 1, max: 1e7 }), (a, b) => {
        const r = run({ cost: Math.min(a, b) / 100, price: Math.max(a, b) / 100 });
        const mu = (r.outputs.markup as number) / 100;
        return Math.abs((r.outputs.result as number) / 100 - mu / (1 + mu)) < 1e-5;
      }),
    ));
  it('pricing from a margin and reading the margin back agree to rounding', () =>
    fc.assert(
      fc.property(fc.integer({ min: 100, max: 1e7 }), fc.integer({ min: 1, max: 95 }), (c, g) => {
        const p = run({ calc: 'costMargin', cost: c, marginPct: g }).outputs.result as number;
        const back = run({ cost: c, price: p }).outputs.result as number;
        return Math.abs(back - g) < 0.01;
      }),
    ));
});

describe('margin: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const r = run({ ...e.inputs });
    for (const [k, v] of Object.entries(e.expect)) expect(r.outputs[k]).toBe(v);
  });
});
