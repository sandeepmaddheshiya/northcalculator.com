import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { comb, compute, perm } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-24');
const run = (n: number, r: number) =>
  compute({ ...base, n, r } as never, { today: '2026-11-24', fmt: makeFmt('en') });

describe('combinations: references (OpenStax Contemporary Mathematics §7.2–7.3)', () => {
  it('Ex 7.4: 8P3 = 336, 8! = 40,320', () => {
    expect(run(8, 3).outputs.nPr).toBe('336');
    expect(run(8, 3).outputs.nFact).toBe('40,320');
  });
  it('Ex 7.6: 12P3 = 1,320, 8P5 = 6,720', () => {
    expect(run(12, 3).outputs.nPr).toBe('1,320');
    expect(run(8, 5).outputs.nPr).toBe('6,720');
  });
  it('Ex 7.7: 312P2 = 97,032', () => expect(run(312, 2).outputs.nPr).toBe('97,032'));
  it('Ex 7.9: 8C3 = 56, 12C5 = 792, 15C9 = 5,005', () => {
    expect(run(8, 3).outputs.nCr).toBe('56');
    expect(run(12, 5).outputs.nCr).toBe('792');
    expect(run(15, 9).outputs.nCr).toBe('5,005');
  });
  it('Ex 7.10: 52C2 = 1,326; 38C5 = 501,942 (the book misprints 501,492; Python math.comb agrees)', () => {
    expect(run(52, 2).outputs.nCr).toBe('1,326');
    expect(run(38, 5).outputs.nCr).toBe('501,942');
  });
  it('Python math.comb: 52C5 = 2,598,960 five-card poker hands', () =>
    expect(run(52, 5).outputs.nCr).toBe('2,598,960'));
});

describe('combinations: behaviour', () => {
  it('repetition: 10⁴ PINs and 7C3 = 35 scoop choices', () => {
    expect(run(10, 4).outputs.repPerm).toBe('10,000');
    expect(run(5, 3).outputs.repComb).toBe('35');
    expect(run(10, 4).outputs.nPr).toBe('5,040');
  });
  it('edge cases: nC0 = nCn = 1, 0! = 1', () => {
    expect(run(7, 0).outputs.nCr).toBe('1');
    expect(run(7, 7).outputs.nCr).toBe('1');
    expect(run(0, 0).outputs.nFact).toBe('1');
  });
  it('long results switch to scientific notation (Python: 100C50, 30!)', () => {
    expect(run(100, 50).outputs.nCr).toBe('1.008913 × 10²⁹');
    expect(run(30, 1).outputs.nFact).toBe('2.652528 × 10³²');
  });
  it('r larger than n is rejected', () => expect(run(3, 5).warnings[0]?.key).toBe('warn.rn'));
});

describe('combinations: properties', () => {
  it('nCr × r! = nPr, nCr = nC(n−r), Pascal’s rule', () =>
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 200 }), fc.integer({ min: 0, max: 200 }), (n, r0) => {
        const N = BigInt(n);
        const R = BigInt(r0 % (n + 1));
        return (
          comb(N, R) * perm(R, R) === perm(N, R) &&
          comb(N, R) === comb(N, N - R) &&
          (R === 0n || comb(N, R) === comb(N - 1n, R - 1n) + comb(N - 1n, R))
        );
      }),
    ));
});

describe('combinations: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const r = run(Number(e.inputs.n), Number(e.inputs.r));
    for (const [k, v] of Object.entries(e.expect)) expect(r.outputs[k]).toBe(v);
  });
});
