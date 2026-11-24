import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { fill } from '@/lib/fill';
import { compute } from './compute';
import { content } from './content.en';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-24');
const solve = (x1: number, y1: number, x2: number, y2: number) =>
  compute({ ...base, x1, y1, x2, y2 } as never, {
    today: '2026-11-24',
    fmt: makeFmt('en'),
    t: (k, v) => fill(content.ui[k] ?? k, v ?? {}),
  });
const out = (x1: number, y1: number, x2: number, y2: number) =>
  solve(x1, y1, x2, y2).outputs as Record<string, string | number>;

describe('slope: references (OpenStax Intermediate Algebra 2e)', () => {
  it('Ex 3.14: (−2, −3), (−7, 4) → −7/5', () =>
    expect(out(-2, -3, -7, 4).slope).toBe('−7/5 = −1.4'));
  it('Ex 3.12: (0, 5), (3, 3) → −2/3', () =>
    expect(out(0, 5, 3, 3).slope).toBe('−2/3 = −0.66666667'));
  it('§3.2: vertical x = 3 is undefined; horizontal y = 4 is 0', () => {
    expect(out(3, 0, 3, 2).slope).toBe('Undefined (vertical line)');
    expect(out(3, 0, 3, 2).equation).toBe('x = 3');
    expect(out(0, 4, 3, 4).slope).toBe('0');
    expect(out(0, 4, 3, 4).equation).toBe('y = 4');
  });
  it('Ex 11.1: (6, 4), (2, 1) → 5; Ex 11.2: (−5, −3), (7, 2) → 13', () => {
    expect(out(6, 4, 2, 1).distance).toBe('5');
    expect(out(-5, -3, 7, 2).distance).toBe('13');
  });
  it('Ex 11.3: (10, −4), (−1, 5) → √202 ≈ 14.2', () =>
    expect(out(10, -4, -1, 5).distance).toBe('√202 ≈ 14.2126704'));
  it('Ex 11.4: midpoint of (−5, −4), (7, 2) = (1, −1)', () =>
    expect(out(-5, -4, 7, 2).midpoint).toBe('(1, −1)'));
});

describe('slope: references (OpenStax College Algebra 2e §2.1)', () => {
  it('Ex 5: (−3, −1), (2, 3) → √41', () =>
    expect(out(-3, -1, 2, 3).distance).toBe('√41 ≈ 6.40312424'));
  it('Ex 6: (0, 0), (8, 7) → √113 ≈ 10.63', () =>
    expect(out(0, 0, 8, 7).distance).toBe('√113 ≈ 10.6301458'));
  it('Ex 7: midpoint of (7, −2), (9, 5) = (8, 3/2)', () =>
    expect(out(7, -2, 9, 5).midpoint).toBe('(8, 1.5)'));
});

describe('slope: behaviour', () => {
  it('line equations: y = −1.4x − 5.8, y = 2x, y = x + 1, y = −x', () => {
    expect(out(-2, -3, -7, 4).equation).toBe('y = −1.4x − 5.8');
    expect(out(1, 2, 4, 8).equation).toBe('y = 2x');
    expect(out(0, 1, 1, 2).equation).toBe('y = x + 1');
    expect(out(0, 0, 1, -1).equation).toBe('y = −x');
  });
  it('simplified radicals: (0, 0) to (6, 6) is 6√2', () =>
    expect(out(0, 0, 6, 6).distance).toBe('6√2 ≈ 8.48528137'));
  it('angle of inclination: slope 1 → 45°, vertical → 90°', () => {
    expect(out(0, 0, 1, 1).angle).toBe(45);
    expect(out(0, 0, 0, 1).angle).toBe(90);
  });
  it('decimal coordinates give a decimal slope only', () =>
    expect(out(0.5, 1, 1.5, 3).slope).toBe('2'));
  it('identical points are rejected', () =>
    expect(solve(1, 1, 1, 1).warnings[0]?.key).toBe('warn.same'));
});

describe('slope: properties', () => {
  it('swapping the points changes nothing; the midpoint is equidistant', () =>
    fc.assert(
      fc.property(
        fc.integer({ min: -1000, max: 1000 }),
        fc.integer({ min: -1000, max: 1000 }),
        fc.integer({ min: -1000, max: 1000 }),
        fc.integer({ min: -1000, max: 1000 }),
        (a, b, c, d) => {
          fc.pre(a !== c || b !== d);
          const p = out(a, b, c, d);
          const q = out(c, d, a, b);
          const half = Math.hypot((c - a) / 2, (d - b) / 2);
          const full = Math.hypot(c - a, d - b);
          return (
            p.slope === q.slope &&
            p.distance === q.distance &&
            p.midpoint === q.midpoint &&
            Math.abs(2 * half - full) < 1e-9 * full
          );
        },
      ),
    ));
});

describe('slope: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const i = e.inputs as Record<string, number>;
    const r = out(i.x1!, i.y1!, i.x2!, i.y2!);
    for (const [k, v] of Object.entries(e.expect)) expect(r[k]).toBe(v);
  });
});
