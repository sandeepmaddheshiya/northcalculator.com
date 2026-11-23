import { describe, expect, it } from 'vitest';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-24');
const run = (inputs: Record<string, unknown>) =>
  compute({ ...base, ...inputs } as never, { today: '2026-11-24', fmt: makeFmt('en', 'USD') });

describe('discount: OpenStax Contemporary Mathematics §6.2 (verified 2026-11-24)', () => {
  it('Ex 6.10a: $75.80 at 25% off → $18.95 off, $56.85', () => {
    const r = run({ price: 75.8, off: 25 });
    expect(r.outputs.saved).toBe(18.95);
    expect(r.outputs.result).toBe(56.85);
  });
  it('Ex 6.10b: $168.90 at 30% off → $50.67 off, $118.23', () => {
    const r = run({ price: 168.9, off: 30 });
    expect(r.outputs.saved).toBe(50.67);
    expect(r.outputs.result).toBe(118.23);
  });
  it('Ex 6.11a: $1,200 → $900 is 25% off', () =>
    expect(run({ mode: 'percent', price: 1200, sale: 900 }).outputs.result).toBe(25));
  // Ex 6.11b is an erratum in the book ($36.70 − $29.52 is printed as $7.38 and the percentage
  // divides the wrong numbers); the correct answer is 19.56%. Ex 6.14 is used instead.
  it('Ex 6.11b corrected: $36.70 → $29.52 is 19.56% off', () =>
    expect(run({ mode: 'percent', price: 36.7, sale: 29.52 }).outputs.result as number).toBeCloseTo(
      19.564,
      3,
    ));
  it('Ex 6.14: a $240 bus pass for $168 is 30% off', () =>
    expect(run({ mode: 'percent', price: 240, sale: 168 }).outputs.result).toBe(30));
  it('Ex 6.12: 10% off to $450 was $500; 75% off to $90 was $360', () => {
    expect(run({ mode: 'original', price: 450, off: 10 }).outputs.result).toBe(500);
    expect(run({ mode: 'original', price: 90, off: 75 }).outputs.result).toBe(360);
  });
  it('Ex 6.13: $80 shirt at 30% off → $56', () =>
    expect(run({ price: 80, off: 30 }).outputs.result).toBe(56));
  it('Ex 6.15: tires at 10% off for $189 were $210', () =>
    expect(run({ mode: 'original', price: 189, off: 10 }).outputs.result).toBe(210));
});

describe('discount: behaviour', () => {
  it('stacked discounts multiply: 25% then 20% = 40%', () => {
    const r = run({ price: 120, off: 25, extra: 20 });
    expect(r.outputs.result).toBe(72);
    expect(r.outputs.combined).toBeCloseTo(40, 10);
  });
  it('100% off is free; the original of a 100% discount is undefined', () => {
    expect(run({ price: 50, off: 100 }).outputs.result).toBe(0);
    expect(run({ mode: 'original', price: 50, off: 100 }).warnings[0]?.key).toBe('warn.full');
  });
  it('a sale price above the original is a markup, reported as such', () => {
    const r = run({ mode: 'percent', price: 100, sale: 120 });
    expect(r.outputs.result).toBe(-20);
    expect(r.explain?.key).toBe('explain.markup');
  });
  it('zero original price cannot give a percentage', () =>
    expect(run({ mode: 'percent', price: 0, sale: 0 }).warnings[0]?.key).toBe('warn.zeroPrice'));
});

describe('discount: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const r = run({ ...e.inputs });
    for (const [k, v] of Object.entries(e.expect)) expect(r.outputs[k]).toBe(v);
  });
});
