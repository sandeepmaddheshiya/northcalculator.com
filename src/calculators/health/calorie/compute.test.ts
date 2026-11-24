import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-24');
const run = (inputs: Record<string, unknown>) =>
  compute({ ...base, ...inputs } as never, { today: '2026-11-24', fmt: makeFmt('en') });

describe('calorie: references (FAO/WHO/UNU 2004 §5)', () => {
  it('worked example: PAL 1.75 × BMR 1,697 kcal = 2,970 kcal (custom PAL; 71.82 kg man, 40 y, Schofield ≈ 1,697)', () => {
    // Schofield men 30–59: 11.472 × 71.82 + 873.1 = 1,697.0
    const r = run({
      sex: 'male',
      age: 40,
      kg: 71.82,
      equation: 'schofield',
      activity: 'custom',
      pal: 1.75,
    });
    expect(r.outputs.bmr).toBe(1697);
    expect(r.outputs.tdee).toBe(2970);
  });
  it('Table 5.1 vigorous: men 20–25 y, 70 kg, PAL 2.25 → 3,925 kcal printed (BMR rounded to 1,745); exact 3,929', () =>
    expect(
      run({ sex: 'male', age: 22, kg: 70, activity: 'vigorous', equation: 'schofield' }).outputs
        .tdee,
    ).toBe(3929));
  it('Table 5.1 sedentary: women 30–50 y, 55 kg, PAL 1.53 → 1,975 kcal printed (BMR 1,290); exact 1,978', () =>
    expect(
      run({ sex: 'female', age: 40, kg: 55, activity: 'sedentary', equation: 'schofield' }).outputs
        .tdee,
    ).toBe(1978));
  it('Table 5.3 class bounds give the range', () =>
    expect(run({ sex: 'female', age: 35, cm: 165, kg: 62 }).outputs.range).toBe(
      '1,841–2,223 kcal',
    ));
});

describe('calorie: behaviour', () => {
  it('office worker: 1,315.25 × 1.53 = 2,012 kcal', () =>
    expect(
      run({ sex: 'female', age: 35, cm: 165, kg: 62, activity: 'sedentary' }).outputs.tdee,
    ).toBe(2012));
  it('active man (imperial): 3,045 kcal', () =>
    expect(
      run({ system: 'imperial', sex: 'male', age: 45, ft: 5, in: 10, lb: 185, activity: 'active' })
        .outputs.tdee,
    ).toBe(3045));
  it('custom PAL has no class range', () =>
    expect(run({ activity: 'custom', pal: 1.6 }).outputs.range).toBeNull());
  it('PAL outside 1.40–2.40 is flagged', () => {
    expect(run({ activity: 'custom', pal: 2.5 }).warnings[0]?.key).toBe('warn.highPal');
    expect(run({ activity: 'custom', pal: 1.3 }).warnings[0]?.key).toBe('warn.lowPal');
  });
  it('kJ uses 4.184 kJ per kcal', () =>
    expect(run({ sex: 'female', age: 35, cm: 165, kg: 62 }).outputs.kj).toBe(8420));
  it('missing input gives no result', () => expect(run({ age: null }).outputs.tdee).toBeNull());
});

describe('calorie: properties', () => {
  it('needs increase with activity class', () =>
    fc.assert(
      fc.property(
        fc.integer({ min: 45, max: 140 }),
        fc.integer({ min: 18, max: 90 }),
        (kg, age) => {
          const t = (activity: string) => run({ kg, age, activity }).outputs.tdee as number;
          return t('sedentary') < t('active') && t('active') < t('vigorous');
        },
      ),
    ));
  it('TDEE ÷ BMR equals the PAL used', () =>
    fc.assert(
      fc.property(
        fc.integer({ min: 140, max: 240 }).map((x) => x / 100),
        (pal) => {
          const r = run({ activity: 'custom', pal }).outputs;
          return Math.abs((r.tdee as number) / (r.bmr as number) - pal) < 0.002;
        },
      ),
    ));
});

describe('calorie: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const r = run({ ...e.inputs });
    for (const [k, v] of Object.entries(e.expect)) expect(r.outputs[k]).toBe(v);
  });
});
