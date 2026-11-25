import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute, det } from './compute';
import { content } from './content.en';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-25');
const ctx = { today: '2026-11-25', fmt: makeFmt('en'), t: (k: string) => content.ui[k] ?? k };
const sys3 = (rows: number[][]) => {
  const i: Record<string, unknown> = { size: '3' };
  rows.forEach(([a, b, c, d], k) =>
    Object.assign(i, { [`a${k + 1}`]: a, [`b${k + 1}`]: b, [`c${k + 1}`]: c, [`d${k + 1}`]: d }),
  );
  return compute({ ...base, ...i } as never, ctx).outputs as Record<string, number | string>;
};
const sys2 = (rows: number[][]) => {
  const i: Record<string, unknown> = { size: '2' };
  rows.forEach(([a, b, d], k) =>
    Object.assign(i, { [`a${k + 1}`]: a, [`b${k + 1}`]: b, [`d${k + 1}`]: d }),
  );
  return compute({ ...base, ...i } as never, ctx).outputs as Record<string, number | string>;
};

describe('linear-system: references (OpenStax College Algebra 2e §7.8)', () => {
  it('Ex 1: det [5 2; −6 3] = 27; Ex 3: det [0 2 1; 3 −1 1; 4 0 1] = 6', () => {
    expect(
      det([
        [5, 2],
        [-6, 3],
      ]),
    ).toBe(27);
    expect(
      det([
        [0, 2, 1],
        [3, -1, 1],
        [4, 0, 1],
      ]),
    ).toBe(6);
  });
  it('Ex 2: 12x + 3y = 15, 2x − 3y = 13 → (2, −3), D = −42', () => {
    const o = sys2([
      [12, 3, 15],
      [2, -3, 13],
    ]);
    expect([o.solution, o.det]).toEqual(['x = 2, y = −3', -42]);
  });
  it('Ex 4: → (1, 3, −2), D = −3', () =>
    expect(
      sys3([
        [1, 1, -1, 6],
        [3, -2, 1, -5],
        [1, 3, -2, 14],
      ]).solution,
    ).toBe('x = 1, y = 3, z = −2'));
  it('Ex 5: 3x − 2y = 4, 6x − 4y = 0 → no solution', () =>
    expect(
      sys2([
        [3, -2, 4],
        [6, -4, 0],
      ]).solution,
    ).toBe('No solution'));
  it('Ex 6: x − 2y + 3z = 0, 3x + y − 2z = 0, 2x − 4y + 6z = 0 → infinitely many', () =>
    expect(
      sys3([
        [1, -2, 3, 0],
        [3, 1, -2, 0],
        [2, -4, 6, 0],
      ]).solution,
    ).toBe('Infinitely many solutions'));
  it('Ex 8: identical columns, contradiction 0 = −6 → no solution', () =>
    expect(
      sys3([
        [2, 4, 4, 2],
        [3, 7, 7, -5],
        [1, 2, 2, 4],
      ]).solution,
    ).toBe('No solution'));
});

describe('linear-system: references (OpenStax College Algebra 2e §7.2)', () => {
  it('Ex 2: → (1, −1, 2)', () =>
    expect(
      sys3([
        [1, -2, 3, 9],
        [-1, 3, -1, -6],
        [2, -5, 5, 17],
      ]).solution,
    ).toBe('x = 1, y = −1, z = 2'));
  it('Ex 3: $12,000 at 3%, 4%, 7% earning $670 → 2,000, 3,000, 7,000', () => {
    const o = sys3([
      [1, 1, 1, 12000],
      [0, -1, 1, 4000],
      [0.03, 0.04, 0.07, 670],
    ]);
    expect([o.x, o.y, o.z]).toEqual([2000, 3000, 7000]);
  });
  it('Ex 4: inconsistent; Ex 5: dependent', () => {
    expect(
      sys3([
        [1, -3, 1, 4],
        [-1, 2, -5, 3],
        [5, -13, 13, 8],
      ]).solution,
    ).toBe('No solution');
    expect(
      sys3([
        [2, 1, -3, 0],
        [4, 2, -6, 0],
        [1, -1, 1, 0],
      ]).solution,
    ).toBe('Infinitely many solutions');
  });
});

describe('linear-system: behaviour', () => {
  it('fractions for whole numbers: 2x + 3y = 1, x − y = 1 → x = 4/5, y = −1/5', () =>
    expect(
      sys2([
        [2, 3, 1],
        [1, -1, 1],
      ]).solution,
    ).toBe('x = 4/5, y = −1/5'));
  it('FAQ: x + y = 5, x − y = 1 → (3, 2)', () =>
    expect(
      sys2([
        [1, 1, 5],
        [1, -1, 1],
      ]).solution,
    ).toBe('x = 3, y = 2'));
});

describe('linear-system: properties', () => {
  it('a system built from a known integer solution returns it', () =>
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: -9, max: 9 }), { minLength: 9, maxLength: 9 }),
        fc.tuple(
          fc.integer({ min: -50, max: 50 }),
          fc.integer({ min: -50, max: 50 }),
          fc.integer({ min: -50, max: 50 }),
        ),
        (m, [x, y, z]) => {
          const A = [m.slice(0, 3), m.slice(3, 6), m.slice(6, 9)];
          fc.pre(det(A) !== 0);
          const o = sys3(A.map((r) => [...r, r[0]! * x + r[1]! * y + r[2]! * z]));
          return o.x === x && o.y === y && o.z === z;
        },
      ),
    ));
});

describe('linear-system: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const o = compute({ ...base, ...e.inputs } as never, ctx).outputs;
    for (const [k, v] of Object.entries(e.expect)) expect(o[k]).toBe(v);
  });
});
