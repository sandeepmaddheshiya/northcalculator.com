import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { mifflin, schofield } from '../energy';
import { compute } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-24');
const run = (inputs: Record<string, unknown>) =>
  compute({ ...base, ...inputs } as never, { today: '2026-11-24', fmt: makeFmt('en') });

describe('bmr: references', () => {
  it('Mifflin 1990: the sex-separated form agrees with the combined regression (9.99 W + 6.25 H − 4.92 A + 166 S − 161) within a few kcal', () =>
    fc.assert(
      fc.property(
        fc.integer({ min: 40, max: 150 }),
        fc.integer({ min: 145, max: 200 }),
        fc.integer({ min: 19, max: 78 }),
        fc.boolean(),
        (kg, cm, age, male) => {
          const combined = 9.99 * kg + 6.25 * cm - 4.92 * age + 166 * (male ? 1 : 0) - 161;
          return Math.abs(mifflin({ male, age, kg, cm }) - combined) < 15;
        },
      ),
    ));
  it('FAO/WHO/UNU Table 5.1: women 30–50 y, 55 kg, "mean BMR 1 290 kcal" — Schofield gives 1,292.53', () =>
    expect(schofield({ male: false, age: 40, kg: 55, cm: 160 })).toBeCloseTo(1292.53, 2));
  it('FAO/WHO/UNU Table 5.1: men 20–25 y, 70 kg, "mean BMR 1 745 kcal" — Schofield gives 1,746.19', () =>
    expect(schofield({ male: true, age: 22, kg: 70, cm: 175 })).toBeCloseTo(1746.19, 2));
});

describe('bmr: behaviour', () => {
  it('woman 35 y, 165 cm, 62 kg: 1,315 kcal (Mifflin)', () => {
    const r = run({ sex: 'female', age: 35, cm: 165, kg: 62 });
    expect(r.outputs.bmr).toBe(1315);
    expect(r.outputs.kj).toBe(5503);
    expect(r.outputs.perHour).toBe(54.8);
  });
  it('imperial: man 45 y, 5 ft 10 in, 185 lb → 1,730 kcal', () =>
    expect(
      run({ system: 'imperial', sex: 'male', age: 45, ft: 5, in: 10, lb: 185 }).outputs.bmr,
    ).toBe(1730));
  it('men are 166 kcal above women with the same numbers', () =>
    expect(
      (run({ sex: 'male' }).outputs.bmr as number) - (run({ sex: 'female' }).outputs.bmr as number),
    ).toBe(166));
  it('Schofield age bands switch at 30 and 60', () => {
    expect(run({ equation: 'schofield', sex: 'male', age: 29, kg: 80 }).outputs.bmr).toBe(1897);
    expect(run({ equation: 'schofield', sex: 'male', age: 30, kg: 80 }).outputs.bmr).toBe(1791);
    expect(run({ equation: 'schofield', sex: 'male', age: 60, kg: 80 }).outputs.bmr).toBe(1525);
  });
  it('the other equation is shown for comparison', () =>
    expect(run({ sex: 'female', age: 35, cm: 165, kg: 62 }).outputs.other).toBe(1349));
  it('ages outside Mifflin’s study range are flagged', () =>
    expect(run({ age: 85 }).warnings[0]?.key).toBe('warn.ageRange'));
  it('missing input gives no result', () => expect(run({ kg: null }).outputs.bmr).toBeNull());
});

describe('bmr: properties', () => {
  it('BMR rises with weight and falls with age', () =>
    fc.assert(
      fc.property(
        fc.integer({ min: 40, max: 150 }),
        fc.integer({ min: 20, max: 70 }),
        (kg, age) => {
          const a = run({ kg, age }).outputs.bmr as number;
          return (
            (run({ kg: kg + 1, age }).outputs.bmr as number) > a &&
            (run({ kg, age: age + 1 }).outputs.bmr as number) < a
          );
        },
      ),
    ));
});

describe('bmr: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const r = run({ ...e.inputs });
    for (const [k, v] of Object.entries(e.expect)) expect(r.outputs[k]).toBe(v);
  });
});
