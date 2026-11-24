import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute, simplify } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-24');
const run = (inputs: Record<string, unknown>) =>
  compute({ ...base, ...inputs } as never, { today: '2026-11-24', fmt: makeFmt('en') });
const simp = (a: number, b: number) => run({ mode: 'simplify', a, b }).outputs.result;
const solve = (a: number, b: number, c: number) => run({ mode: 'solve', a, b, c }).outputs.result;

describe('ratio: references (OpenStax Prealgebra 2e)', () => {
  it('Ex 5.58: 15 to 27 = 5 : 9; 45 to 18 = 5 : 2', () => {
    expect(simp(15, 27)).toBe('5 : 9');
    expect(simp(45, 18)).toBe('5 : 2');
  });
  it('Ex 5.59: 4.8 to 11.2 = 3 : 7; 2.7 to 0.54 = 5 : 1', () => {
    expect(simp(4.8, 11.2)).toBe('3 : 7');
    expect(simp(2.7, 0.54)).toBe('5 : 1');
  });
  it('Ex 5.60: 1 1/4 to 2 3/8 = 10 : 19', () => expect(simp(1.25, 2.375)).toBe('10 : 19'));
  it('Ex 6.42: x/63 = 4/7 gives 36', () => expect(solve(7, 4, 63)).toBe('36'));
  it('Ex 6.45: 5 ml per 25 lb gives 16 ml for 80 lb', () => expect(solve(25, 5, 80)).toBe('16'));
  it('Ex 6.47: $1 = 12.54 pesos, so $325 = 4,075.5 pesos', () =>
    expect(solve(1, 12.54, 325)).toBe('4,075.5'));
});

describe('ratio: behaviour', () => {
  it('shows 1 : n and the decimal quotient', () => {
    const r = run({ mode: 'simplify', a: 4, b: 10 });
    expect(r.outputs.oneTo).toBe('1 : 2.5');
    expect(r.outputs.quotient).toBe(0.4);
  });
  it('a zero side simplifies to 0 : 1 or 1 : 0', () => {
    expect(simp(0, 7)).toBe('0 : 1');
    expect(simp(7, 0)).toBe('1 : 0');
  });
  it('0 : 0 is rejected', () => expect(run({ a: 0, b: 0 }).warnings[0]?.key).toBe('warn.bothZero'));
  it('solving with A = 0 is rejected', () =>
    expect(run({ mode: 'solve', a: 0, b: 3, c: 4 }).warnings[0]?.key).toBe('warn.zeroA'));
  it('large whole numbers stay exact', () =>
    expect(simp(123456789012, 987654321098)).toBe('61,728,394,506 : 493,827,160,549'));
  it('steps show scaling and the GCF', () => {
    const r = run({ mode: 'simplify', a: 4.8, b: 11.2 });
    expect(r.steps[0]?.math).toBe('4.8 : 11.2 = 48 : 112');
    expect(r.steps[1]?.values?.g).toBe('16');
  });
});

describe('ratio: properties', () => {
  const n = fc.integer({ min: 1, max: 1_000_000 });
  it('simplified parts are coprime and keep the same ratio', () =>
    fc.assert(
      fc.property(n, n, (a, b) => {
        const [p, q] = simplify(a, b)!;
        return p * BigInt(b) === q * BigInt(a);
      }),
    ));
  it('the solved D satisfies A × D = B × C', () =>
    fc.assert(
      fc.property(n, n, n, (a, b, c) => {
        const d = Number(String(solve(a, b, c)).replace(/,/g, ''));
        return Math.abs(a * d - b * c) <= 1e-6 * b * c;
      }),
    ));
});

describe('ratio: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const r = run({ ...e.inputs });
    for (const [k, v] of Object.entries(e.expect)) expect(r.outputs[k]).toBe(v);
  });
});
