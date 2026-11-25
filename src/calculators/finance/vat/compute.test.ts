import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute, vatFraction } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-25');
const run = (mode: string, amount: number, rate: number, cur = 'GBP') =>
  compute({ ...base, mode, amount, rate, cur } as never, {
    today: '2026-11-25',
    fmt: makeFmt('en', cur),
  }).outputs as Record<string, number | string>;

describe('vat: references', () => {
  it('GOV.UK: £60 × 1.2 = £72; £200 at 5% → £210', () => {
    expect([run('add', 60, 20).gross, run('add', 60, 20).vat]).toEqual([72, 12]);
    expect(run('add', 200, 5).gross).toBe(210);
  });
  it('GOV.UK: £180 ÷ 1.2 = £150 + £30; £483 at 5% → £460 + £23', () => {
    expect([run('remove', 180, 20).net, run('remove', 180, 20).vat]).toEqual([150, 30]);
    expect([run('remove', 483, 5).net, run('remove', 483, 5).vat]).toEqual([460, 23]);
  });
  it('VAT Notice 700 §7.3.1: £2.40 at 20% contains 40p; fractions 1/21, 2/27, 1/11, 1/9, 3/23, 7/47, 1/6, 1/5', () => {
    expect(run('remove', 2.4, 20).vat).toBe(0.4);
    expect([5, 8, 10, 12.5, 15, 17.5, 20, 25].map(vatFraction)).toEqual([
      '1/21',
      '2/27',
      '1/11',
      '1/9',
      '3/23',
      '7/47',
      '1/6',
      '1/5',
    ]);
  });
  it('Notice 700 §16.7 invoice lines at 20%: £151.20 → £30.24, £94.40 → £18.88, £93.30 → £18.66, £10.00 → £2.00', () =>
    expect([151.2, 94.4, 93.3, 10].map((n) => run('add', n, 20).vat)).toEqual([
      30.24, 18.88, 18.66, 2,
    ]));
});

describe('vat: behaviour', () => {
  it('FAQ: £250 → £300; £96 gross → £80 + £16; 20% off £120 is not the net', () => {
    expect(run('add', 250, 20).gross).toBe(300);
    expect([run('remove', 96, 20).net, run('remove', 96, 20).vat]).toEqual([80, 16]);
    expect(run('remove', 120, 20).net).toBe(100);
  });
  it('pennies round half-up: £0.99 gross at 20% → 16.5p → 17p VAT', () =>
    expect(run('remove', 0.99, 20).vat).toBe(0.17));
  it('zero rate and zero-decimal currencies', () => {
    expect([run('add', 50, 0).vat, vatFraction(0)]).toEqual([0, '0']);
    expect(run('add', 1001, 10, 'JPY').vat).toBe(100);
  });
});

describe('vat: properties', () => {
  it('net + VAT = gross exactly, and add then remove round-trips', () =>
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 10_000_000 }),
        fc.constantFrom(0, 5, 10, 12.5, 17.5, 20, 21, 23, 25, 27),
        (pence, rate) => {
          const net = pence / 100;
          const a = run('add', net, rate);
          const r = run('remove', a.gross as number, rate);
          return (
            Math.round(((a.net as number) + (a.vat as number)) * 100) ===
              Math.round((a.gross as number) * 100) &&
            Math.abs((r.net as number) - net) <= 0.01 + 1e-9
          );
        },
      ),
    ));
});

describe('vat: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const o = run(String(e.inputs.mode), Number(e.inputs.amount), Number(e.inputs.rate));
    for (const [k, v] of Object.entries(e.expect)) expect(o[k]).toBe(v);
  });
});
