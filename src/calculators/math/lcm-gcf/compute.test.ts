import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute, factorize, gcd } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-24');
const run = (inputs: Record<string, unknown>) =>
  compute({ ...base, ...inputs } as never, { today: '2026-11-24', fmt: makeFmt('en') });
const lcm = (numbers: string) => run({ find: 'lcm', numbers }).outputs.result;
const gcf = (numbers: string) => run({ find: 'gcf', numbers }).outputs.result;

describe('lcm-gcf: references', () => {
  it('OpenStax Elementary Algebra 2e Ex 7.1: GCF(54, 36) = 18', () =>
    expect(gcf('54, 36')).toBe('18'));
  it('OpenStax Prealgebra 2e Ex 2.52: LCM(15, 20) = 60', () => expect(lcm('15 20')).toBe('60'));
  it('OpenStax Prealgebra 2e Ex 2.53: LCM(15, 18) = 90', () => expect(lcm('15,18')).toBe('90'));
  it('OpenStax Prealgebra 2e Ex 2.54: LCM(50, 100) = 100', () =>
    expect(lcm('50, 100')).toBe('100'));
  it('OpenStax Prealgebra 2e Ex 2.48–2.50: prime factorizations of 48, 84 and 120', () => {
    expect(factorize(48)).toEqual([
      [2, 4],
      [3, 1],
    ]);
    expect(factorize(84)).toEqual([
      [2, 2],
      [3, 1],
      [7, 1],
    ]);
    expect(factorize(120)).toEqual([
      [2, 3],
      [3, 1],
      [5, 1],
    ]);
  });
});

describe('lcm-gcf: behaviour', () => {
  it('three or more numbers', () => {
    expect(lcm('12, 20, 30')).toBe('60');
    expect(gcf('12, 20, 30')).toBe('2');
  });
  it('coprime numbers have GCF 1 and are flagged', () => {
    const r = run({ numbers: '8, 15' });
    expect(r.outputs.gcf).toBe('1');
    expect(r.outputs.lcm).toBe('120');
    expect(r.warnings.some((w) => w.key === 'warn.coprime')).toBe(true);
  });
  it('LCM stays exact beyond 2^53 (BigInt)', () =>
    // Python: math.lcm(999999999989, 999999999959) = 999999999948000000000451
    expect(lcm('999999999989, 999999999959')).toBe('999,999,999,948,000,000,000,451'));
  it('large primes factor by trial division', () =>
    expect(factorize(999999999989)).toEqual([[999999999989, 1]]));
  it('rejects decimals, negatives, zero and words but keeps the rest', () => {
    const r = run({ find: 'lcm', numbers: '4, 6, 2.5, -3, 0, abc' });
    expect(r.outputs.result).toBe('12');
    expect(r.warnings[0]?.values?.n).toBe(4);
  });
  it('needs at least two numbers', () => expect(run({ numbers: '7' }).outputs.result).toBeNull());
  it('the result label follows the mode', () =>
    expect(definition.outputs.find((o) => o.primary)?.labelBy).toBe('find'));
  it('steps show factorizations and the two-number identity', () => {
    const r = run({ numbers: '54, 36' });
    expect(r.steps[0]?.math).toBe('54 = 2 × 3³\n36 = 2² × 3²');
    expect(r.steps.at(-1)?.math).toBe('54 × 36 ÷ 18 = 108');
  });
});

describe('lcm-gcf: properties', () => {
  const pos = fc.integer({ min: 1, max: 1_000_000 });
  it('gcd × lcm = a × b, and both divide/are divided by a and b', () =>
    fc.assert(
      fc.property(pos, pos, (a, b) => {
        const g = Number(
          run({ numbers: `${a} ${b}` })
            .outputs.gcf!.toString()
            .replace(/,/g, ''),
        );
        const l = BigInt(String(run({ numbers: `${a} ${b}` }).outputs.lcm).replace(/,/g, ''));
        return (
          BigInt(g) * l === BigInt(a) * BigInt(b) &&
          a % g === 0 &&
          b % g === 0 &&
          l % BigInt(a) === 0n
        );
      }),
    ));
  it('factorize multiplies back to n', () =>
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 10_000_000 }),
        (n) => factorize(n).reduce((acc, [p, e]) => acc * p ** e, 1) === n,
      ),
    ));
  it('gcd is symmetric', () =>
    fc.assert(
      fc.property(pos, pos, (a, b) => gcd(BigInt(a), BigInt(b)) === gcd(BigInt(b), BigInt(a))),
    ));
});

describe('lcm-gcf: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const r = run({ ...e.inputs });
    for (const [k, v] of Object.entries(e.expect)) expect(r.outputs[k]).toBe(v);
  });
});
