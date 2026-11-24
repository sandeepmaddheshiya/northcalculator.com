import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute, pointsFor } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-24');
const c = (percent: unknown, credits: unknown = 1) => ({ percent, credits });
const run = (classes: unknown[]) =>
  compute({ ...base, classes } as never, { today: '2026-11-24', fmt: makeFmt('en') });

describe('percent-gpa: references', () => {
  it('College Board: A 90–100 = 4.0, B 80–89 = 3.0, C 70–79 = 2.0, D 66–69 = 1.0, below 65 = 0', () => {
    expect([100, 90, 89.99, 80, 79, 70, 69, 66, 64].map((p) => pointsFor(p)[1])).toEqual([
      4, 4, 3, 3, 2, 2, 1, 1, 0,
    ]);
  });
  it('College Board worked example: (4 + 4 + 4 + 3 + 2) ÷ 5 = 3.4', () =>
    expect(run([c(95), c(92), c(91), c(84), c(76)]).outputs.gpa).toBe(3.4));
  it('UC Berkeley: GPA weights grade points by units', () =>
    expect(run([c(88, 4), c(93, 3), c(71, 3)]).outputs.gpa).toBe(3));
});

describe('percent-gpa: behaviour', () => {
  it('no rounding before the letter: 89.5 is a B', () =>
    expect(run([c(89.5), c(90)]).outputs.gpa).toBe(3.5));
  it('65 is counted as F and flagged', () => {
    const r = run([c(65)]);
    expect(r.outputs.gpa).toBe(0);
    expect(r.warnings.some((w) => w.key === 'warn.65')).toBe(true);
  });
  it('FAQ: 95, 85, 75 → 3.0', () => expect(run([c(95), c(85), c(75)]).outputs.gpa).toBe(3));
  it('credit-weighted average percentage', () =>
    expect(run([c(80, 3), c(100, 1)]).outputs.average).toBe(85));
  it('incomplete rows are skipped', () =>
    expect(run([c(90), c('', 1), c(80, 0)]).warnings.some((w) => w.key === 'warn.skipped')).toBe(
      true,
    ));
  it('nothing usable', () => expect(run([]).outputs.gpa).toBeNull());
});

describe('percent-gpa: properties', () => {
  it('GPA stays between 0 and 4 and rises with any single grade', () =>
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 0, max: 100 }), { minLength: 1, maxLength: 10 }),
        (ps) => {
          const g = run(ps.map((p) => c(p))).outputs.gpa as number;
          const up = run(ps.map((p, i) => c(i === 0 ? 100 : p))).outputs.gpa as number;
          return g >= 0 && g <= 4 && up >= g;
        },
      ),
    ));
});

describe('percent-gpa: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const r = compute({ ...base, ...e.inputs } as never, {
      today: '2026-11-24',
      fmt: makeFmt('en'),
    });
    for (const [k, v] of Object.entries(e.expect)) expect(r.outputs[k]).toBe(v);
  });
});
