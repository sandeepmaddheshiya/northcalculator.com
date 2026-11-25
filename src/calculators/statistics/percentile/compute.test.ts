import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { averaged, compute, r6 } from './compute';
import { content } from './content.en';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-25');
const solve = (inputs: Record<string, unknown>) =>
  compute({ ...base, ...inputs } as never, {
    today: '2026-11-25',
    fmt: makeFmt('en'),
    t: (k) => content.ui[k] ?? k,
  });
const out = (inputs: Record<string, unknown>) =>
  solve(inputs).outputs as Record<string, number | string>;
const HOUSES =
  '114950, 158000, 230500, 387000, 389950, 479000, 488800, 529000, 575000, 639000, 659000, 1095000, 5500000';

describe('percentile: references', () => {
  it('NIST 7.2.6.2: 12 resistivity values → 90th percentile 95.1981 (R6)', () =>
    expect(Math.round((out({ p: 90 }).value as number) * 1e4) / 1e4).toBe(95.1981));
  it('OpenStax Ex 2.13: Q1 308,750, median 488,800, Q3 649,000, IQR 340,250; 5,500,000 is an outlier', () => {
    const o = out({ data: HOUSES, p: 50 });
    expect([o.q1, o.median, o.q3, o.iqr, o.outliers]).toEqual([
      308750,
      488800,
      649000,
      340250,
      '5,500,000',
    ]);
  });
  it('OpenStax §2.3 averaging: position 24.9 averages the 24th and 25th values; 21 picks the 21st', () => {
    const s = Array.from({ length: 29 }, (_, i) => i + 1);
    expect(averaged(s, 83)).toBe(24.5);
    expect(averaged(s, 70)).toBe(21);
  });
  it('OpenStax Ex 2.18: percentile rank (18 + 0.5)/29 × 100 = 63.79 (book prints 63.80; either way the 64th)', () => {
    const data = [...Array(18).fill(1), 58, ...Array(10).fill(99)].join(' ');
    expect(Math.round((out({ data, x: 58, p: 50 }).rank as number) * 100) / 100).toBe(63.79);
  });
});

describe('percentile: behaviour', () => {
  it('the median of 2, 4, 6, 8 is 5; extremes clamp to the min and max', () => {
    expect(out({ data: '2 4 6 8', p: 50 }).value).toBe(5);
    expect(out({ data: '2 4 6 8', p: 1 }).value).toBe(2);
    expect(out({ data: '2 4 6 8', p: 99 }).value).toBe(8);
  });
  it('non-numbers are skipped and counted; too little data is rejected', () => {
    expect(solve({ data: '1, 2, x, 3', p: 50 }).warnings[0]?.values?.n).toBe(1);
    expect(solve({ data: '5', p: 50 }).warnings[0]?.key).toBe('warn.few');
  });
});

describe('percentile: properties', () => {
  it('percentiles are monotone in p and lie within the data', () =>
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: -1000, max: 1000 }), { minLength: 2, maxLength: 60 }),
        fc.double({ min: 0, max: 100, noNaN: true }),
        (xs, p) => {
          const s = [...xs].sort((a, b) => a - b);
          const v = r6(s, p);
          return v >= s[0]! && v <= s[s.length - 1]! && r6(s, Math.min(100, p + 5)) >= v;
        },
      ),
    ));
});

describe('percentile: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const o = out(e.inputs);
    for (const [k, v] of Object.entries(e.expect)) expect(o[k]).toBe(v);
  });
});
