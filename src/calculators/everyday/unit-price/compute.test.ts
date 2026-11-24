import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { fill } from '@/lib/fill';
import { compute } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-24');
const ui: Record<string, string> = { 'fmt.item': 'Item {n}', 'fmt.tie': 'Tie: items {list}' };
const item = (price: unknown, qty: unknown) => ({ price, qty });
const run = (items: unknown[], cur = 'USD') =>
  compute({ ...base, items, cur } as never, {
    today: '2026-11-24',
    fmt: makeFmt('en', cur),
    t: (k, v) => fill(ui[k] ?? k, v ?? {}),
  });

describe('unit-price: references', () => {
  it('OpenStax Prealgebra 2e Ex 5.66: $3.99 for 24 bottles = $0.16625 (≈ $0.17)', () =>
    expect(run([item(3.99, 24)]).outputs.unit).toBe(0.1663));
  it('OpenStax Prealgebra 2e Ex 5.67: powder ($15.99 / 80) beats liquid ($14.99 / 64)', () => {
    const r = run([item(14.99, 64), item(15.99, 80)]);
    expect(r.outputs.best).toBe('Item 2');
    expect(r.outputs.unit).toBe(0.1999);
    expect(r.outputs.worst).toBe(0.2342);
  });
  it('NIST: 38 oz at $2.29 (6¢/oz) beats 64 oz at $4.49 (7¢/oz)', () => {
    const r = run([item(4.49, 64), item(2.29, 38)]);
    expect(r.outputs.best).toBe('Item 2');
    expect(r.outputs.unit).toBe(0.0603);
    expect(r.outputs.worst).toBe(0.0702);
  });
});

describe('unit-price: behaviour', () => {
  it('three sizes: the middle one wins, 18.53% cheaper than the dearest', () => {
    const r = run([item(4.29, 16), item(6.99, 32), item(12.49, 48)]);
    expect(r.outputs.best).toBe('Item 2');
    expect(r.outputs.saving).toBe(18.5315);
  });
  it('ties are reported', () =>
    expect(run([item(2, 4), item(3, 6)]).outputs.best).toBe('Tie: items 1, 2'));
  it('incomplete rows are skipped and counted', () => {
    const r = run([item(5, 10), item('', 3), item(4, 0)]);
    expect(r.outputs.unit).toBe(0.5);
    expect(r.warnings[0]?.values?.n).toBe(2);
  });
  it('near-identical prices are flagged', () =>
    expect(
      run([item(10, 100), item(10.05, 100)]).warnings.some((w) => w.key === 'warn.close'),
    ).toBe(true));
  it('a single product has no comparison', () => {
    const r = run([item(3, 12)]);
    expect(r.outputs.saving).toBeNull();
    expect(r.explain?.key).toBe('explain.one');
  });
  it('nothing usable gives no result', () => expect(run([]).outputs.best).toBeNull());
  it('the table shows each premium over the best', () =>
    expect(run([item(2, 1), item(3, 1)]).table?.rows[1]).toEqual([2, 3, 50]));
});

describe('unit-price: properties', () => {
  const row = fc.record({
    price: fc.integer({ min: 1, max: 100000 }).map((c) => c / 100),
    qty: fc.integer({ min: 1, max: 1000 }),
  });
  it('the reported lowest unit price is no higher than any item', () =>
    fc.assert(
      fc.property(fc.array(row, { minLength: 1, maxLength: 10 }), (rows) => {
        const u = run(rows).outputs.unit as number;
        return rows.every((r) => u <= r.price / r.qty + 5e-5 + 1e-12); // rounded half-up to 4 dp
      }),
    ));
  it('scaling a package (price and quantity together) keeps its unit price', () =>
    fc.assert(
      fc.property(
        row,
        fc.integer({ min: 2, max: 10 }),
        (r, k) =>
          Math.abs(
            (run([item(r.price, r.qty)]).outputs.unit as number) -
              (run([item(r.price * k, r.qty * k)]).outputs.unit as number),
          ) <= 1e-4,
      ),
    ));
});

describe('unit-price: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const r = compute({ ...base, ...e.inputs } as never, {
      today: '2026-11-24',
      fmt: makeFmt('en'),
      t: (k, v) => fill(ui[k] ?? k, v ?? {}),
    });
    for (const [k, v] of Object.entries(e.expect)) expect(r.outputs[k]).toBe(v);
  });
});
