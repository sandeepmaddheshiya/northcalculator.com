import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute } from './compute';
import { content } from './content.en';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-25');
const solve = (n: number) =>
  compute({ ...base, n } as never, {
    today: '2026-11-25',
    fmt: makeFmt('en'),
    t: (k) => content.ui[k] ?? k,
  });
const out = (n: number) => solve(n).outputs as Record<string, number | string>;

describe('prime-factorization: references (OpenStax Prealgebra 2e §2.5)', () => {
  it('Ex 2.48/2.51: 48 = 2⁴ × 3; Ex 2.49: 84 = 2² × 3 × 7; Ex 2.50: 120 = 2³ × 3 × 5; 36 = 2² × 3²', () => {
    expect([out(48).factors, out(84).factors, out(120).factors, out(36).factors]).toEqual([
      '2⁴ × 3',
      '2² × 3 × 7',
      '2³ × 3 × 5',
      '2² × 3²',
    ]);
    expect(out(120).expanded).toBe('2 × 2 × 2 × 3 × 5');
  });
});

describe('prime-factorization: references (OpenStax Contemporary Mathematics §3.1)', () => {
  it('Ex 3.7: 2,117 = 29 × 73; Ex 3.8: 423 = 3² × 47; Ex 3.10: 2,917 is prime', () => {
    expect(out(2117).factors).toBe('29 × 73');
    expect(out(423).factors).toBe('3² × 47');
    expect([out(2917).kind, out(2917).divisorCount]).toEqual(['Prime', 2]);
  });
  it('Ex 3.11–3.14: 140, 66, 135, 10,241', () =>
    expect([out(140).factors, out(66).factors, out(135).factors, out(10241).factors]).toEqual([
      '2² × 5 × 7',
      '2 × 3 × 11',
      '3³ × 5',
      '7² × 11 × 19',
    ]));
  it('Ex 3.16–3.18: 1,400 = 2³ × 5² × 7, 600 = 2³ × 3 × 5², 784 = 2⁴ × 7², 570 = 2 × 3 × 5 × 19', () =>
    expect([out(1400).factors, out(600).factors, out(784).factors, out(570).factors]).toEqual([
      '2³ × 5² × 7',
      '2³ × 3 × 5²',
      '2⁴ × 7²',
      '2 × 3 × 5 × 19',
    ]));
});

describe('prime-factorization: behaviour', () => {
  it('divisors of 84 and 1,400 has 24 divisors', () => {
    expect(out(84).divisors).toBe('1, 2, 3, 4, 6, 7, 12, 14, 21, 28, 42, 84');
    expect(out(1400).divisorCount).toBe(24);
  });
  it('1 is neither; a large prime near 10¹² is found', () => {
    expect(out(1).kind).toBe('Neither prime nor composite');
    expect(out(999999999989).kind).toBe('Prime');
  });
});

describe('prime-factorization: properties', () => {
  it('the factors multiply back to n and every divisor divides n', () =>
    fc.assert(
      fc.property(fc.integer({ min: 2, max: 10_000_000 }), (n) => {
        const o = out(n);
        const product = String(o.expanded)
          .split(' × ')
          .reduce((a, s) => a * Number(s.replace(/,/g, '')), 1);
        const f = String(o.factors);
        const divs = String(o.divisors).includes(',')
          ? String(o.divisors)
              .split(', ')
              .map((d) => Number(d.replace(/,/g, '')))
          : [];
        return (
          product === n &&
          f.length > 0 &&
          divs.every((d) => n % d === 0) &&
          (divs.length === 0 || divs.length === o.divisorCount)
        );
      }),
    ));
});

describe('prime-factorization: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const o = out(Number(e.inputs.n));
    for (const [k, v] of Object.entries(e.expect)) expect(o[k]).toBe(v);
  });
});
