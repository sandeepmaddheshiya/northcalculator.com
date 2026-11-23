import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { decodeState, encodeState } from '@/calculators/url-state';
import { compute } from './compute';
import { definition, GRADE_POINTS } from './definition';

const base = defaultValues(definition, '2026-11-24');
const run = (inputs: Record<string, unknown>) =>
  compute({ ...base, ...inputs } as never, { today: '2026-11-24', fmt: makeFmt('en') });
const course = (grade: string, credits: number | string, type = 'regular') => ({
  grade,
  credits,
  type,
});

describe('GPA: College Board and UC Berkeley references (verified 2026-11-24)', () => {
  it('College Board example: three A, one B, one C → 3.4', () =>
    expect(
      run({
        courses: [course('A', 1), course('A', 1), course('A', 1), course('B', 1), course('C', 1)],
      }).outputs.gpa,
    ).toBe(3.4));
  it.each(Object.entries(GRADE_POINTS))('Berkeley scale: a single %s course → %s', (g, p) =>
    expect(run({ courses: [course(g, 3)] }).outputs.gpa).toBe(p),
  );
});

describe('GPA: behaviour', () => {
  it('weights by credits', () => {
    const r = run({ courses: [course('A', 4), course('B-', 3), course('C+', 1)] });
    expect(r.outputs.gpa).toBe(3.3);
    expect(r.outputs.points).toBe(26.4);
    expect(r.outputs.credits).toBe(8);
  });
  it('weighted GPA adds the honors and AP bonuses, not to an F', () => {
    const r = run({
      courses: [course('A', 3, 'ap'), course('B', 3, 'honors'), course('F', 3, 'ap')],
    });
    expect(r.outputs.gpa).toBe(2.3333);
    expect(r.outputs.weighted).toBe(2.8333); // (5 + 3.5 + 0) × 3 ÷ 9
  });
  it('custom bonuses', () =>
    expect(run({ courses: [course('B', 3, 'ap')], apBonus: 0.5 }).outputs.weighted).toBe(3.5));
  it('no weighted GPA without weighted courses', () =>
    expect(run({ courses: [course('A', 3)] }).outputs.weighted).toBeNull());
  it('A+ as 4.3 when the school uses it', () =>
    expect(run({ courses: [course('A+', 3), course('A', 3)], aplus: '4.3' }).outputs.gpa).toBe(
      4.15,
    ));
  it('cumulative GPA combines earlier credits', () => {
    const r = run({
      courses: [course('A', 3), course('A-', 3), course('B+', 3, 'honors'), course('A', 3, 'ap')],
      priorGpa: 3.2,
      priorCredits: 45,
    });
    expect(r.outputs.cumulative).toBe(3.3158);
  });
  it('rows from the URL arrive as strings and still count', () =>
    expect(run({ courses: [course('B', '3'), course('A', '1.5')] }).outputs.gpa).toBe(3.3333));
  it('invalid rows are skipped with a note', () => {
    const r = run({ courses: [course('A', 3), course('A', 0), course('Z', 3)] });
    expect(r.outputs.gpa).toBe(4);
    expect(r.warnings[0]).toMatchObject({ key: 'warn.skipped', values: { n: 2 } });
  });
  it('no valid courses gives no result', () => expect(run({ courses: [] }).outputs.gpa).toBeNull());
  it('course lists survive the URL round trip', () => {
    const courses = [course('B+', 3, 'honors'), course('A-', 4)];
    const q = encodeState(definition, { ...base, courses }, base);
    const back = decodeState(definition, `?${q}`);
    expect(run({ courses: back.courses }).outputs.gpa).toBe(run({ courses }).outputs.gpa);
  });
});

describe('GPA: invariants', () => {
  it('unweighted GPA stays within 0–4 on the 4.0 scale', () => {
    const grades = Object.keys(GRADE_POINTS);
    fc.assert(
      fc.property(
        fc.array(fc.record({ g: fc.constantFrom(...grades), c: fc.integer({ min: 1, max: 6 }) }), {
          minLength: 1,
          maxLength: 20,
        }),
        (cs) => {
          const v = run({ courses: cs.map((x) => course(x.g, x.c)) }).outputs.gpa as number;
          expect(v).toBeGreaterThanOrEqual(0);
          expect(v).toBeLessThanOrEqual(4);
        },
      ),
    );
  });
});

describe('GPA: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const r = run({ ...e.inputs });
    for (const [k, v] of Object.entries(e.expect)) expect(r.outputs[k]).toBe(v);
  });
});
