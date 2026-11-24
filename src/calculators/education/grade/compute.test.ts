import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute, letterFor } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-24');
const run = (items: { score: unknown; max: unknown; weight: unknown }[]) =>
  compute({ ...base, items } as never, { today: '2026-11-24', fmt: makeFmt('en') });
const row = (score: unknown, max: unknown, weight: unknown) => ({ score, max, weight });

describe('grade: references', () => {
  it('Illinois CITL: six components give 84.955, a B', () => {
    const r = run([
      row(100, 100, 15),
      row(81.7, 100, 15),
      row(95, 100, 5),
      row(79, 100, 15),
      row(81, 100, 20),
      row(83, 100, 30),
    ]);
    expect(r.outputs.grade).toBe(84.955);
    expect(r.outputs.letter).toBe('B');
  });
  it('CSU Chico: homework 8/10 + 18/20 + 24/30 = 50/60 = 83.3%', () =>
    expect(run([row(8 + 18 + 24, 10 + 20 + 30, 40)]).outputs.grade).toBe(83.3333));
  it('CSU Chico: (83.3 × 0.40) + (90 × 0.30) + (80 × 0.30) = 84.32 as printed', () =>
    expect(run([row(83.3, 100, 40), row(90, 100, 30), row(80, 100, 30)]).outputs.grade).toBe(
      84.32,
    ));
  it('CSU Chico with homework kept exact (50/60): 84.3333, not 84.32 (ADR-022)', () =>
    expect(run([row(50, 60, 40), row(90, 100, 30), row(80, 100, 30)]).outputs.grade).toBe(84.3333));
});

describe('grade: behaviour', () => {
  it('partial weights give the grade so far and say so', () => {
    const r = run([row(92, 100, 20), row(78, 100, 30)]);
    expect(r.outputs.grade).toBe(83.6);
    expect(r.outputs.weight).toBe(50);
    expect(r.warnings[0]?.key).toBe('warn.partial');
    expect(r.explain?.key).toBe('explain.partial');
  });
  it('weights above 100% are normalised and flagged', () => {
    const r = run([row(80, 100, 60), row(90, 100, 60)]);
    expect(r.outputs.grade).toBe(85);
    expect(r.warnings[0]?.key).toBe('warn.over');
  });
  it('incomplete rows are skipped', () => {
    const r = run([row(80, 100, 50), row('', 100, 50), row(70, 0, 10)]);
    expect(r.outputs.grade).toBe(80);
    expect(r.warnings[0]?.values?.n).toBe(2);
  });
  it('no usable rows gives no result', () => expect(run([]).outputs.grade).toBeNull());
  it('extra credit above 100% is noted', () =>
    expect(run([row(105, 100, 100)]).warnings.some((w) => w.key === 'warn.extra')).toBe(true));
  it('letter cut-offs on the 10-point scale', () => {
    expect([90, 89.999, 80, 79.5, 70, 60, 59.99].map(letterFor)).toEqual([
      'A',
      'B',
      'B',
      'C',
      'C',
      'D',
      'F',
    ]);
  });
  it('shows a per-item table', () =>
    expect(run([row(42, 50, 100)]).table?.rows[0]).toEqual([1, 84, 100, 84]));
});

describe('grade: properties', () => {
  const item = fc.record({
    score: fc.integer({ min: 0, max: 100 }),
    max: fc.constant(100),
    weight: fc.integer({ min: 1, max: 50 }),
  });
  it('the grade lies between the lowest and highest score', () =>
    fc.assert(
      fc.property(fc.array(item, { minLength: 1, maxLength: 10 }), (items) => {
        const g = run(items).outputs.grade as number;
        const s = items.map((i) => i.score);
        return g >= Math.min(...s) - 1e-6 && g <= Math.max(...s) + 1e-6;
      }),
    ));
  it('scaling every weight by the same factor changes nothing', () =>
    fc.assert(
      fc.property(fc.array(item, { minLength: 1, maxLength: 10 }), (items) => {
        const a = run(items).outputs.grade as number;
        const b = run(items.map((i) => ({ ...i, weight: i.weight * 2 }))).outputs.grade as number;
        return Math.abs(a - b) < 1e-6;
      }),
    ));
});

describe('grade: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const r = compute({ ...base, ...e.inputs } as never, {
      today: '2026-11-24',
      fmt: makeFmt('en'),
    });
    for (const [k, v] of Object.entries(e.expect)) expect(r.outputs[k]).toBe(v);
  });
});
