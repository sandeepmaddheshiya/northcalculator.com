import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute } from './compute';
import { definition, FIRST, LAST } from './definition';
import cpi from './cpi.json';

const A = cpi.annual as Record<string, number>;
const base = defaultValues(definition, '2026-11-24');
const run = (amount: number, from: number, to: number) =>
  compute({ ...base, amount, from, to } as never, { today: '2026-11-24', fmt: makeFmt('en') });

describe('inflation: references (BLS CPI-U annual averages)', () => {
  it('published annual averages: 1913 9.9, 1982 96.5, 1983 99.6, 1984 103.9, 2000 172.2, 2024 313.689, 2025 321.943', () =>
    expect([A['1913'], A['1982'], A['1983'], A['1984'], A['2000'], A['2024'], A['2025']]).toEqual([
      9.9, 96.5, 99.6, 103.9, 172.2, 313.689, 321.943,
    ]));
  it('base period 1982–84 averages 100', () =>
    expect(Math.abs((A['1982']! + A['1983']! + A['1984']!) / 3 - 100)).toBeLessThan(0.05));
  it('OpenStax Macroeconomics 9.1 method: index 69.71 → 89.90 is a 28.96% rise (same ratio rule)', () =>
    expect(Math.round((89.9 / 69.71 - 1) * 100 * 100) / 100).toBe(28.96));
  it('the data covers every year from the first to the last', () => {
    for (let y = FIRST; y <= LAST; y++) expect(A[String(y)], String(y)).toBeGreaterThan(0);
  });
});

describe('inflation: behaviour', () => {
  it('$100 in 2000 = $182.17 in 2024 (+82.17%)', () => {
    const r = run(100, 2000, 2024);
    expect([r.outputs.value, r.outputs.change]).toEqual([182.17, 82.1655]);
  });
  it('$1 in 1913 = $32.52 in 2025', () => expect(run(1, 1913, 2025).outputs.value).toBe(32.52));
  it('backwards: $50,000 in 2024 = $20,832.74 in 1990', () =>
    expect(run(50000, 2024, 1990).outputs.value).toBe(20832.74));
  it('FAQ: $100 in 1950 ≈ $1,335.86 in 2025', () =>
    expect(run(100, 1950, 2025).outputs.value).toBe(1335.86));
  it('same year is unchanged and has no annual rate', () => {
    const r = run(100, 2010, 2010);
    expect([r.outputs.value, r.outputs.annual]).toEqual([100, null]);
  });
  it('years outside the data are rejected', () =>
    expect(run(100, 1900, 2000).warnings[0]?.key).toBe('warn.range'));
});

describe('inflation: properties', () => {
  const year = fc.integer({ min: FIRST, max: LAST });
  it('converting forward and back returns the amount (within a cent per conversion)', () =>
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 1_000_000 }), year, year, (amt, a, b) => {
        const there = run(amt, a, b).outputs.value as number;
        const back = run(there, b, a).outputs.value as number;
        return Math.abs(back - amt) <= 0.01 + 0.006 * (A[String(a)]! / A[String(b)]!);
      }),
    ));
});

describe('inflation: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const r = compute({ ...base, ...e.inputs } as never, {
      today: '2026-11-24',
      fmt: makeFmt('en'),
    });
    for (const [k, v] of Object.entries(e.expect)) expect(r.outputs[k]).toBe(v);
  });
});
