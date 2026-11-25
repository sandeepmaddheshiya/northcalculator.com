import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-25');
const solve = (inputs: Record<string, unknown>) =>
  compute({ ...base, ...inputs } as never, { today: '2026-11-25', fmt: makeFmt('en') });
const out = (values: string | number[], kind = 'sample') =>
  solve({ kind, values: Array.isArray(values) ? values.join(', ') : values }).outputs as Record<
    string,
    number
  >;
const sig = (x: number, d: number) => Number(x.toPrecision(d));

const ages = [
  9, 9.5, 9.5, 10, 10, 10, 10, 10.5, 10.5, 10.5, 10.5, 11, 11, 11, 11, 11, 11, 11.5, 11.5, 11.5,
];
const exam = [
  33, 42, 49, 49, 53, 55, 55, 61, 63, 67, 68, 68, 69, 69, 72, 73, 74, 78, 80, 83, 88, 88, 88, 90,
  92, 94, 94, 94, 94, 96, 100,
];

describe('standard-deviation: references (OpenStax Introductory Statistics 2e §2.7)', () => {
  it('Ex 2.32: ages → x̄ 10.525, Σ(x − x̄)² 9.7375, s² 0.5125, s 0.715891', () => {
    const o = out(ages);
    expect([o.mean, o.ss, o.variance]).toEqual([10.525, 9.7375, 0.5125]);
    expect(sig(o.sd!, 6)).toBe(0.715891);
  });
  it('Ex 2.33: 31 exam scores → mean 73.5, s 17.9', () => {
    const o = out(exam);
    expect(o.count).toBe(31);
    expect([sig(o.mean!, 3), sig(o.sd!, 3)]).toEqual([73.5, 17.9]);
  });
});

describe('standard-deviation: references (NIST StRD univariate)', () => {
  it('NumAcc1: 10000001, 10000003, 10000002 → mean 10000002, s 1 (exact)', () => {
    const o = out([10000001, 10000003, 10000002]);
    expect([o.mean, o.sd]).toEqual([10000002, 1]);
  });
  it('NumAcc1 shifted by 10⁸ still gives s = 1', () =>
    expect(out([100000001, 100000003, 100000002]).sd).toBe(1));
});

describe('standard-deviation: behaviour', () => {
  it('population: 2, 4, 4, 4, 5, 5, 7, 9 → σ 2, σ² 4, sample s √(32/7)', () => {
    const o = out('2 4 4 4 5 5 7 9', 'population');
    expect([o.sd, o.variance, o.ss]).toEqual([2, 4, 32]);
    expect(sig(o.other!, 12)).toBe(sig(Math.sqrt(32 / 7), 12));
  });
  it('standard error and coefficient of variation', () => {
    const o = out(ages);
    expect(sig(o.se!, 6)).toBe(sig(0.715891053164 / Math.sqrt(20), 6));
    expect(sig(o.cv!, 6)).toBe(6.80182);
  });
  it('a sample needs two values; a population needs one', () => {
    expect(solve({ kind: 'sample', values: '5' }).warnings.at(-1)?.key).toBe('warn.one');
    expect(out('5', 'population').sd).toBe(0);
  });
  it('non-numbers are skipped with a note', () => {
    const r = solve({ kind: 'sample', values: '1, 2, x, 3' });
    expect(r.outputs.sd).toBe(1);
    expect(r.warnings[0]?.key).toBe('warn.ignored');
  });
});

describe('standard-deviation: properties', () => {
  const list = fc.array(fc.double({ min: -1e6, max: 1e6, noNaN: true }), {
    minLength: 2,
    maxLength: 40,
  });
  it('shifting all values leaves the SD unchanged; scaling scales it', () =>
    fc.assert(
      fc.property(list, fc.integer({ min: -1000, max: 1000 }), (xs, k) => {
        const s = out(xs).sd!;
        const shifted = out(xs.map((x) => x + k)).sd!;
        const scaled = out(xs.map((x) => x * 3)).sd!;
        const tol = 1e-9 * (s + 1);
        return Math.abs(shifted - s) <= tol + 1e-9 * 1000 && Math.abs(scaled - 3 * s) <= 3 * tol;
      }),
    ));
  it('s² × (n − 1) = σ² × n and s ≥ σ', () =>
    fc.assert(
      fc.property(list, (xs) => {
        const o = out(xs);
        const n = xs.length;
        const sp = o.other!;
        return (
          o.sd! >= sp - 1e-12 * (o.sd! + 1) &&
          Math.abs(o.sd! ** 2 * (n - 1) - sp ** 2 * n) <= 1e-9 * (o.sd! ** 2 * n + 1)
        );
      }),
    ));
});

describe('standard-deviation: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const o = solve(e.inputs).outputs;
    for (const [k, v] of Object.entries(e.expect)) expect(o[k]).toBe(v);
  });
});
