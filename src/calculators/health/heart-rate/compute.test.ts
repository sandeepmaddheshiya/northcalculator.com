import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-24');
const run = (inputs: Record<string, unknown>) =>
  compute({ ...base, ...inputs } as never, { today: '2026-11-24', fmt: makeFmt('en') });

describe('heart-rate: references', () => {
  it.each([
    [20, '100–170 bpm', 200],
    [30, '95–162 bpm', 190],
    [35, '93–157 bpm', 185],
    [40, '90–153 bpm', 180],
    [45, '88–149 bpm', 175],
    [50, '85–145 bpm', 170],
    [55, '83–140 bpm', 165],
    [60, '80–136 bpm', 160],
    [65, '78–132 bpm', 155],
    [70, '75–128 bpm', 150],
  ])('American Heart Association chart: age %i → %s, max %i', (age, zone, max) => {
    const r = run({ age, formula: 'aha' });
    expect(r.outputs.target).toBe(zone);
    expect(r.outputs.max).toBe(max);
  });
  it('Tanaka 2001: 208 − 0.7 × age (40 → 180, 70 → 159)', () => {
    expect(run({ age: 40, formula: 'tanaka' }).outputs.max).toBe(180);
    expect(run({ age: 70, formula: 'tanaka' }).outputs.max).toBe(159);
  });
});

describe('heart-rate: behaviour', () => {
  it('moderate and vigorous ranges at 40 (AHA)', () => {
    const r = run({ age: 40 });
    expect(r.outputs.moderate).toBe('90–126 bpm');
    expect(r.outputs.vigorous).toBe('126–153 bpm');
  });
  it('Tanaka 65: 162.5 rounds to 163; vigorous 114–138', () => {
    const r = run({ age: 65, formula: 'tanaka' });
    expect(r.outputs.max).toBe(163);
    expect(r.outputs.vigorous).toBe('114–138 bpm');
  });
  it('table runs from 50% to 100%', () => {
    const rows = run({ age: 35 }).table!.rows;
    expect(rows[0]).toEqual([50, 93, 'zone.moderate']);
    expect(rows.at(-1)).toEqual([100, 185, 'zone.above']);
  });
  it('always reminds about medication; flags under-18s', () => {
    expect(run({ age: 35 }).warnings[0]?.key).toBe('warn.medication');
    expect(run({ age: 16 }).warnings.some((w) => w.key === 'warn.young')).toBe(true);
  });
  it('missing age gives no result', () => expect(run({ age: null }).outputs.max).toBeNull());
});

describe('heart-rate: properties', () => {
  it('the two formulas agree at 40 and Tanaka is higher after', () =>
    fc.assert(
      fc.property(
        fc.integer({ min: 41, max: 100 }),
        (age) =>
          (run({ age, formula: 'tanaka' }).outputs.max as number) >=
          (run({ age, formula: 'aha' }).outputs.max as number),
      ),
    ));
  it('zones never overlap out of order', () =>
    fc.assert(
      fc.property(fc.integer({ min: 15, max: 100 }), (age) => {
        const rows = run({ age }).table!.rows.map((r) => r[1] as number);
        return rows.every((v, i) => i === 0 || v >= rows[i - 1]!);
      }),
    ));
});

describe('heart-rate: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const r = run({ ...e.inputs });
    for (const [k, v] of Object.entries(e.expect)) expect(r.outputs[k]).toBe(v);
  });
});
