import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-24');
const run = (inputs: Record<string, unknown>) =>
  compute({ ...base, ...inputs } as never, { today: '2026-11-24', fmt: makeFmt('en') });

describe('final-grade: references (published weighted grades run backwards)', () => {
  it('Illinois CITL: 60.055 points over 70% and a target of 84.955 need an 83 on a 30% final', () =>
    expect(run({ current: (60.055 / 70) * 100, target: 84.955, weight: 30 }).outputs.needed).toBe(
      83,
    ));
  it('CSU Chico: homework 50/60 at 40% and quizzes 90 at 30%, target 84.3333, need 80 on a 30% final', () => {
    const current = ((50 / 60) * 100 * 0.4 + 90 * 0.3) / 0.7;
    expect(
      run({ current, target: (50 / 60) * 100 * 0.4 + 27 + 24, weight: 30 }).outputs.needed,
    ).toBe(80);
  });
});

describe('final-grade: behaviour', () => {
  it('86% → A on a 30% final needs 99.33%', () =>
    expect(run({ current: 86, target: 90, weight: 30 }).outputs.needed).toBe(99.3333));
  it('FAQ: 85% so far, 25% final, target 80% → 65%', () =>
    expect(run({ current: 85, target: 80, weight: 25 }).outputs.needed).toBe(65));
  it('a zero on the final: 88% with a 20% final leaves 70.4%', () =>
    expect(run({ current: 88, weight: 20 }).outputs.ifZero).toBe(70.4));
  it('out of reach: needs over 100% and shows the best possible grade', () => {
    const r = run({ current: 72, target: 90, weight: 20 });
    expect(r.outputs.needed).toBe(162);
    expect(r.outputs.ifPerfect).toBe(77.6);
    expect(r.warnings[0]?.key).toBe('warn.over100');
  });
  it('already secured: needed ≤ 0', () => {
    const r = run({ current: 95, target: 70, weight: 20 });
    expect(r.outputs.needed).toBeLessThan(0);
    expect(r.explain?.key).toBe('explain.secured');
  });
  it('a 100% final makes the exam everything', () =>
    expect(run({ current: 50, target: 75, weight: 100 }).outputs.needed).toBe(75));
  it('the letter table covers A to D', () =>
    expect(run({ current: 86, weight: 30 }).table?.rows.map((r) => r[2])).toEqual([
      99.3333, 66, 32.6667, -0.6667,
    ]));
  it('missing or zero weight gives no result', () => {
    expect(run({ weight: 0 }).outputs.needed).toBeNull();
    expect(run({ current: null }).outputs.needed).toBeNull();
  });
});

describe('final-grade: properties', () => {
  it('scoring exactly the needed mark reaches the target', () =>
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 100, noNaN: true }),
        fc.double({ min: 0, max: 100, noNaN: true }),
        fc.double({ min: 1, max: 100, noNaN: true }),
        (current, target, weight) => {
          const e = run({ current, target, weight }).outputs.needed as number;
          const w = weight / 100;
          return Math.abs(current * (1 - w) + e * w - target) < 1e-3;
        },
      ),
    ));
  it('a higher target never needs a lower score', () =>
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 100 }), fc.integer({ min: 0, max: 100 }), (a, b) => {
        const lo = run({ target: Math.min(a, b) }).outputs.needed as number;
        const hi = run({ target: Math.max(a, b) }).outputs.needed as number;
        return hi >= lo;
      }),
    ));
});

describe('final-grade: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const r = run({ ...e.inputs });
    for (const [k, v] of Object.entries(e.expect)) expect(r.outputs[k]).toBe(v);
  });
});
