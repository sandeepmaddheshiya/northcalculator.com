import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute, parsePairs } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-24');
const run = (data: string, x: number | null = null) =>
  compute({ ...base, data, x } as never, { today: '2026-11-24', fmt: makeFmt('en') });
const out = (data: string, x: number | null = null) =>
  run(data, x).outputs as Record<string, number | string>;
const EXAMS =
  '65 175; 67 133; 71 185; 71 163; 66 126; 75 198; 67 153; 70 163; 71 159; 69 151; 69 159';

describe('linear-regression: references', () => {
  it('OpenStax Intro Stats 2e Ex 12.6: a = −173.513363, b = 4.827394209, r = 0.663093591, r² = 0.4396931104, s = 16.41237711', () => {
    const o = out(EXAMS);
    const near = (v: unknown, want: number) =>
      Math.abs((v as number) - want) <= 1e-8 * Math.abs(want);
    expect(near(o.intercept, -173.513363)).toBe(true);
    expect(near(o.slope, 4.827394209)).toBe(true);
    expect(near(o.r, 0.663093591)).toBe(true);
    expect(near(o.r2, 0.4396931104)).toBe(true);
    expect(near(o.se, 16.41237711)).toBe(true);
  });
  it('NIST StRD Norris (36 obs.): certified B0 and B1 to 1e−10 relative', () => {
    const rows = readFileSync(new URL('./norris.fixture.txt', import.meta.url), 'utf8')
      .trim()
      .split('\n')
      .map((l) => l.trim().split(/\s+/).map(Number) as [number, number]);
    // The file lists y then x.
    const o = out(rows.map(([y, x]) => `${x} ${y}`).join('\n'));
    expect(o.n).toBe(36);
    expect(Math.abs((o.intercept as number) / -0.262323073774029 - 1)).toBeLessThan(1e-10);
    expect(Math.abs((o.slope as number) / 1.00211681802045 - 1)).toBeLessThan(1e-10);
    expect(Math.abs((o.r2 as number) - 0.999993745883712)).toBeLessThan(1e-11);
    expect(Math.abs((o.se as number) / 0.884796396144373 - 1)).toBeLessThan(1e-10);
  });
});

describe('linear-regression: behaviour', () => {
  it('exact lines, negative slopes and zero intercepts read cleanly', () => {
    expect(out('1 3; 2 5; 3 7; 4 9').equation).toBe('ŷ = 1 + 2x');
    expect(out('0 5; 1 3; 2 1').equation).toBe('ŷ = 5 − 2x');
    expect(out('1 1; 2 2; 3 3').equation).toBe('ŷ = x');
    expect(out('1 4; 2 4; 3 4').equation).toBe('ŷ = 4');
    expect(out('1 4; 2 4; 3 4').r).toBeNull();
  });
  it('parser: newlines, tabs, commas; bad lines are skipped and counted', () => {
    expect(parsePairs('1\t2\n3,4\n5 6').pairs).toEqual([
      [1, 2],
      [3, 4],
      [5, 6],
    ]);
    const r = run('1 2; 2 4; oops; 3');
    expect(r.outputs.n).toBe(2);
    expect(r.warnings[0]?.values?.n).toBe(2);
  });
  it('too few points or identical x are rejected', () => {
    expect(run('1 2').warnings[0]?.key).toBe('warn.few');
    expect(run('2 1; 2 5; 2 7').warnings[0]?.key).toBe('warn.vertical');
  });
});

describe('linear-regression: properties', () => {
  it('recovers a + bx exactly and the line passes through the means', () =>
    fc.assert(
      fc.property(
        fc.integer({ min: -1000, max: 1000 }),
        fc.integer({ min: -100, max: 100 }).filter((b) => b !== 0),
        fc.uniqueArray(fc.integer({ min: -1000, max: 1000 }), { minLength: 3, maxLength: 30 }),
        (a, b, xs) => {
          const o = out(xs.map((x) => `${x} ${a + b * x}`).join(';'));
          return (
            o.slope === b &&
            Math.abs((o.intercept as number) - a) < 1e-9 * Math.max(1, Math.abs(a)) &&
            Math.abs(Math.abs(o.r as number) - 1) < 1e-12
          );
        },
      ),
    ));
});

describe('linear-regression: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const o = out(String(e.inputs.data), Number(e.inputs.x));
    for (const [k, v] of Object.entries(e.expect)) expect(o[k]).toBe(v);
  });
});
