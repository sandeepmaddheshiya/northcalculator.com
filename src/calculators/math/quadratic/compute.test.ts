import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { fill } from '@/lib/fill';
import { compute, exactRoots, simplifyRoot } from './compute';
import { content } from './content.en';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-24');
const solve = (a: number, b: number, c: number) =>
  compute({ ...base, a, b, c } as never, {
    today: '2026-11-24',
    fmt: makeFmt('en'),
    t: (k, v) => fill(content.ui[k] ?? k, v ?? {}),
  });
const out = (a: number, b: number, c: number) => solve(a, b, c).outputs;

describe('quadratic: references (OpenStax Intermediate Algebra 2e §9.3)', () => {
  it('Ex 9.21: 2x² + 9x − 5 = 0 → 1/2, −5', () => expect(out(2, 9, -5).exact).toBe('1/2 or −5'));
  it('Ex 9.22: x² − 6x + 5 = 0 → 5, 1', () => expect(out(1, -6, 5).exact).toBe('5 or 1'));
  it('Ex 9.23: 2x² + 10x + 11 = 0 → (−5 ± √3)/2', () =>
    expect(out(2, 10, 11).exact).toBe('(−5 ± √3)/2'));
  it('Ex 9.24: 3p² + 2p + 9 = 0 → −1/3 ± (√26/3)i', () =>
    expect(out(3, 2, 9).exact).toBe('(−1 ± i√26)/3'));
  it('Ex 9.25: x² + 6x + 4 = 0 → −3 ± √5', () => expect(out(1, 6, 4).exact).toBe('−3 ± √5'));
  it('Ex 9.26: 3u² + 4u − 2 = 0 → (−2 ± √10)/3', () =>
    expect(out(3, 4, -2).exact).toBe('(−2 ± √10)/3'));
  it('Ex 9.27: 4x² − 20x + 25 = 0 → 5/2, one solution', () => {
    expect(out(4, -20, 25).exact).toBe('5/2');
    expect(out(4, -20, 25).kind).toBe('One real (double) solution');
  });
  it('Ex 9.28: discriminants 157, −79, 0', () =>
    expect([
      out(3, 7, -9).discriminant,
      out(5, 1, 4).discriminant,
      out(9, -6, 1).discriminant,
    ]).toEqual([157, -79, 0]));
});

describe('quadratic: references (OpenStax College Algebra 2e §2.5)', () => {
  it('Ex 9: x² + 5x + 1 = 0 → (−5 ± √21)/2', () => expect(out(1, 5, 1).exact).toBe('(−5 ± √21)/2'));
  it('Ex 10: x² + x + 2 = 0 → (−1 ± i√7)/2', () => expect(out(1, 1, 2).exact).toBe('(−1 ± i√7)/2'));
  it('Ex 11: discriminants 0, 100, 49, −80', () =>
    expect(
      [out(1, 4, 4), out(8, 14, 3), out(3, -5, -2), out(3, -10, 15)].map((r) => r.discriminant),
    ).toEqual([0, 100, 49, -80]));
});

describe('quadratic: behaviour', () => {
  it('decimals: (−5 ± √3)/2 ≈ −1.633974596, −3.366025404 (Python)', () =>
    expect(out(2, 10, 11).roots).toBe('−1.633974596 or −3.366025404'));
  it('complex decimals: x² + x + 2 → −0.5 ± 1.322875656i', () =>
    expect(out(1, 1, 2).roots).toBe('−0.5 ± 1.322875656i'));
  it('pure imaginary and pure radical forms', () => {
    expect(out(1, 0, 4).exact).toBe('±2i');
    expect(out(1, 0, -2).exact).toBe('±√2');
    expect(out(2, 0, -3).exact).toBe('±√6/2');
  });
  it('negative a keeps the larger root first', () => expect(out(-1, 0, 4).exact).toBe('2 or −2'));
  it('simplifyRoot: √72 = 6√2, √104 = 2√26', () => {
    expect(simplifyRoot(72)).toEqual([6, 2]);
    expect(simplifyRoot(104)).toEqual([2, 26]);
  });
  it('a = 0 falls back to the linear solution; a = b = 0 is rejected', () => {
    const r = solve(0, 2, -6);
    expect(r.outputs.roots).toBe('3');
    expect(r.warnings[0]?.key).toBe('warn.linear');
    expect(solve(0, 0, 5).warnings[0]?.key).toBe('warn.degenerate');
  });
  it('no exact form for decimal coefficients', () => expect(exactRoots(0.5, 1, 1)).toBeNull());
  it('stable for b² ≫ 4ac: x² + 10⁸x + 1 → −1 × 10⁻⁸ to 10 digits (the textbook form gives −7.45 × 10⁻⁹)', () =>
    expect(out(1, 1e8, 1).roots).toBe('−1E-8 or −100,000,000'));
});

describe('quadratic: properties', () => {
  it('real roots satisfy the equation', () =>
    fc.assert(
      fc.property(
        fc.integer({ min: -1000, max: 1000 }).filter((a) => a !== 0),
        fc.integer({ min: -1000, max: 1000 }),
        fc.integer({ min: -1000, max: 1000 }),
        (a, b, c) => {
          const d = b * b - 4 * a * c;
          if (d < 0) return true;
          const q = -(b + Math.sign(b || 1) * Math.sqrt(d)) / 2;
          const xs = q === 0 ? [-b / a] : [q / a, c / q];
          return xs.every(
            (x) =>
              Math.abs(a * x * x + b * x + c) <=
              1e-9 * (Math.abs(a * x * x) + Math.abs(b * x) + Math.abs(c) + 1),
          );
        },
      ),
    ));
  it('factored (x − p)(x − q) gives back p and q exactly', () =>
    fc.assert(
      fc.property(
        fc.integer({ min: -500, max: 500 }),
        fc.integer({ min: -500, max: 500 }),
        (p, q) => {
          const e = out(1, -(p + q), p * q).exact;
          const [hi, lo] = p >= q ? [p, q] : [q, p];
          const f = (n: number) => String(n).replace('-', '−');
          return e === (p === q ? f(p) : `${f(hi)} or ${f(lo)}`);
        },
      ),
    ));
});

describe('quadratic: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const r = solve(Number(e.inputs.a), Number(e.inputs.b), Number(e.inputs.c));
    for (const [k, v] of Object.entries(e.expect)) expect(r.outputs[k]).toBe(v);
  });
});
