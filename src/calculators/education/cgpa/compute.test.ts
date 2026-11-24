import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute } from './compute';
import { CBSE_GRADES, definition } from './definition';

const base = defaultValues(definition, '2026-11-24');
const run = (inputs: Record<string, unknown>) =>
  compute({ ...base, ...inputs } as never, { today: '2026-11-24', fmt: makeFmt('en') });
const g = (...gs: string[]) => gs.map((grade) => ({ grade }));

describe('cgpa: references (CBSE FAQ 2016 Q24; CCE Manual 2011)', () => {
  it('overall indicative % = 9.5 × CGPA', () => {
    expect(run({ cgpa: 9.6 }).outputs.percent).toBe(91.2);
    expect(run({ cgpa: 10 }).outputs.percent).toBe(95);
    expect(run({ cgpa: 8.4 }).outputs.percent).toBe(79.8);
  });
  it('nine-point scale: A1 = 10 … E2 = 2', () =>
    expect(Object.values(CBSE_GRADES).map(([gp]) => gp)).toEqual([10, 9, 8, 7, 6, 5, 4, 3, 2]));
  it('subject-wise % = 9.5 × grade point', () =>
    expect(run({ mode: 'grades', subjects: g('A1', 'B2') }).table?.rows.map((r) => r[3])).toEqual([
      95, 66.5,
    ]));
});

describe('cgpa: behaviour', () => {
  it('CGPA from five grades: A1 A1 A2 A2 B1 → 9.2 → 87.4%', () => {
    const r = run({ mode: 'grades', subjects: g('A1', 'A1', 'A2', 'A2', 'B1') });
    expect(r.outputs.cgpaOut).toBe(9.2);
    expect(r.outputs.percent).toBe(87.4);
  });
  it('FAQ: grade points 10, 9, 9, 8, 8 → CGPA 8.8', () =>
    expect(run({ mode: 'grades', subjects: g('A1', 'A2', 'A2', 'B1', 'B1') }).outputs.cgpaOut).toBe(
      8.8,
    ));
  it('a sixth subject triggers a reminder', () =>
    expect(
      run({ mode: 'grades', subjects: g('A1', 'A1', 'A1', 'A1', 'A1', 'C1') }).warnings[0]?.key,
    ).toBe('warn.sixth'));
  it('out-of-range CGPA is rejected', () =>
    expect(run({ cgpa: 11 }).warnings[0]?.key).toBe('warn.range'));
  it('no grades gives no result', () =>
    expect(run({ mode: 'grades', subjects: [] }).warnings[0]?.key).toBe('warn.empty'));
});

describe('cgpa: properties', () => {
  it('percentage is 9.5 × CGPA and never above 95', () =>
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 1000 }).map((x) => x / 100),
        (c) => {
          const p = run({ cgpa: c }).outputs.percent as number;
          return Math.abs(p - 9.5 * c) < 1e-6 && p <= 95;
        },
      ),
    ));
});

describe('cgpa: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const r = run({ ...e.inputs });
    for (const [k, v] of Object.entries(e.expect)) expect(r.outputs[k]).toBe(v);
  });
});
