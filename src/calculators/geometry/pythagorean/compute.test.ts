import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-24');
const run = (find: string, a: number, b: number) =>
  compute({ ...base, find, a, b } as never, { today: '2026-11-24', fmt: makeFmt('en') });

describe('pythagorean: references (OpenStax Prealgebra 2e §9.3)', () => {
  it('Ex 9.22: 3, 4 → 5', () => expect(run('c', 3, 4).outputs.result).toBe(5));
  it('Ex 9.23: 5, 13 → 12', () => expect(run('leg', 5, 13).outputs.result).toBe(12));
  it('Ex 9.24: x² + x² = 10² → x = √50 ≈ 7.1', () =>
    expect(Math.round((run('leg', Math.sqrt(50), 10).outputs.result as number) * 10) / 10).toBe(
      7.1,
    ));
});

describe('pythagorean: behaviour', () => {
  it('FAQ: 6, 8 → 10; 17 and 8 → 15; ladder √17', () => {
    expect(run('c', 6, 8).outputs.result).toBe(10);
    expect(run('leg', 8, 17).outputs.result).toBe(15);
    expect(run('c', 4, 1).outputs.result).toBe(4.12310562562);
  });
  it('area, perimeter and angle of a 3–4–5 triangle', () => {
    const r = run('c', 3, 4).outputs;
    expect([r.area, r.perimeter, r.angleA]).toEqual([6, 12, 36.869898]);
  });
  it('a hypotenuse shorter than the leg is rejected', () =>
    expect(run('leg', 10, 6).warnings[0]?.key).toBe('warn.hyp'));
});

describe('pythagorean: properties', () => {
  it('finding c then the leg returns the other leg', () =>
    fc.assert(
      fc.property(
        fc.double({ min: 0.01, max: 1e6, noNaN: true }),
        fc.double({ min: 0.01, max: 1e6, noNaN: true }),
        (a, b) => {
          fc.pre(b / a > 1e-4 && a / b > 1e-4); // tinier legs vanish below double precision
          const c = run('c', a, b).outputs.result as number;
          const back = run('leg', a, c).outputs.result as number;
          return Math.abs(back - b) <= 1e-6 * Math.max(a, b);
        },
      ),
    ));
});

describe('pythagorean: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const r = run(String(e.inputs.find), Number(e.inputs.a), Number(e.inputs.b));
    for (const [k, v] of Object.entries(e.expect)) expect(r.outputs[k]).toBe(v);
  });
});
