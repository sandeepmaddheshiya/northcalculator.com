import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute, normalize } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-24');
const run = (value: string, sig = 0) =>
  compute({ ...base, value, sig } as never, { today: '2026-11-24', fmt: makeFmt('en') });

describe('scientific-notation: references (OpenStax Prealgebra 2e §10.5)', () => {
  it('Ex 10.74: 37,000 = 3.7 × 10⁴', () =>
    expect(run('37,000').outputs.scientific).toBe('3.7 × 10⁴'));
  it('Ex 10.75: 0.0052 = 5.2 × 10⁻³', () =>
    expect(run('0.0052').outputs.scientific).toBe('5.2 × 10⁻³'));
  it('Ex 10.76: 6.2 × 10³ = 6200', () => expect(run('6.2 × 10^3').outputs.decimal).toBe('6200'));
  it('Ex 10.77: 8.9 × 10⁻² = 0.089', () => expect(run('8.9 × 10⁻²').outputs.decimal).toBe('0.089'));
  it('Ex 10.78: (4 × 10⁵)(2 × 10⁻⁷) = 0.08 = 8 × 10⁻²', () =>
    expect(run('0.08').outputs.scientific).toBe('8 × 10⁻²'));
});

describe('scientific-notation: behaviour', () => {
  it('e notation and engineering', () => {
    const r = run('0.0052');
    expect(r.outputs.eNotation).toBe('5.2e-3');
    expect(r.outputs.engineering).toBe('5.2 × 10⁻³');
    expect(run('47000').outputs.engineering).toBe('47 × 10³');
    expect(run('602000').outputs.engineering).toBe('602 × 10³');
  });
  it('accepts e notation and ×10^ forms', () => {
    expect(run('6.02e23').outputs.scientific).toBe('6.02 × 10²³');
    expect(normalize('6.2x10^-3')).toBe('6.2e-3');
  });
  it('significant figures round half up and pad', () => {
    expect(run('602214076000000000000000', 3).outputs.scientific).toBe('6.02 × 10²³');
    expect(run('2500', 3).outputs.scientific).toBe('2.50 × 10³');
    expect(run('9.99', 2).outputs.scientific).toBe('1.0 × 10¹');
  });
  it('negative numbers', () => expect(run('-0.00031').outputs.scientific).toBe('−3.1 × 10⁻⁴'));
  it('zero', () => expect(run('0').outputs.scientific).toBe('0'));
  it('rejects text', () => expect(run('hello').warnings[0]?.key).toBe('warn.parse'));
  it('exact on long decimals', () =>
    expect(run('0.1234567890123456789').outputs.scientific).toBe('1.234567890123456789 × 10⁻¹'));
});

describe('scientific-notation: properties', () => {
  it('converting to e notation and back gives the same decimal', () =>
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 1e9 }), fc.integer({ min: -12, max: 12 }), (m, e) => {
        const s = `${m}e${e}`;
        const r = run(s).outputs;
        return Number(run(String(r.eNotation)).outputs.decimal) === Number(r.decimal);
      }),
    ));
  it('the mantissa is between 1 and 10', () =>
    fc.assert(
      fc.property(fc.double({ min: 1e-20, max: 1e20, noNaN: true }), (x) => {
        const m = Number(String(run(String(x)).outputs.eNotation).split('e')[0]);
        return m >= 1 && m < 10;
      }),
    ));
});

describe('scientific-notation: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const r = run(String(e.inputs.value));
    for (const [k, v] of Object.entries(e.expect)) expect(r.outputs[k]).toBe(v);
  });
});
