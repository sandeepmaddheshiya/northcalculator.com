import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute } from './compute';
import { definition } from './definition';
import table from './nhlbi-bmi-table.fixture.json';

const base = defaultValues(definition, '2026-11-24');
const run = (inputs: Record<string, unknown>) =>
  compute({ ...base, ...inputs } as never, { today: '2026-11-24', fmt: makeFmt('en') });
const bmiOf = (inputs: Record<string, unknown>) => run(inputs).outputs.bmi as number;

describe('BMI: NHLBI BMI table (every cell, verified 2026-11-24)', () => {
  // Heights 4'10"–6'4", BMI columns 19–54; weights in the table are rounded to the pound,
  // so each cell is within 0.25 of its column. One cell (4'11", BMI 48) repeats the
  // previous column's 232 lb in the source: a typo in the table, skipped here.
  const cells = Object.entries(table as Record<string, number[]>).flatMap(([h, ws]) =>
    ws
      .map((lb, k) => ({ inches: Number(h), lb, column: 19 + k }))
      .filter((c) => !(c.inches === 59 && c.column === 48)),
  );
  it(`${cells.length} cells agree within 0.3`, () => {
    for (const c of cells) {
      const v = bmiOf({
        system: 'imperial',
        ft: Math.floor(c.inches / 12),
        in: c.inches % 12,
        lb: c.lb,
      });
      expect(Math.abs(v - c.column), `${c.inches} in, ${c.lb} lb`).toBeLessThanOrEqual(0.3);
    }
  });
});

describe('BMI: formula and categories', () => {
  it('metric: 68 kg at 1.65 m → 24.98 → 25.0 shown (hand arithmetic 68 ÷ 2.7225)', () =>
    expect(bmiOf({ cm: 165, kg: 68 })).toBe(25));
  it('the category follows the displayed value (25.0 is overweight)', () =>
    expect(run({ cm: 165, kg: 68 }).outputs.category).toBe('cat.overweight'));
  it('WHO boundaries: 18.5 is healthy, 30.0 is obesity class I, 40 is class III', () => {
    const at = (b: number) => run({ cm: 100, kg: b }).outputs.category; // 1 m tall: BMI = kg
    expect(at(18.4)).toBe('cat.under');
    expect(at(18.5)).toBe('cat.normal');
    expect(at(24.9)).toBe('cat.normal');
    expect(at(30)).toBe('cat.obese1');
    expect(at(35)).toBe('cat.obese2');
    expect(at(40)).toBe('cat.obese3');
  });
  it('Asian action points 23.0, 27.5, 32.5, 37.5 (WHO expert consultation, Lancet 2004)', () => {
    const at = (b: number) => run({ cm: 100, kg: b, cutoffs: 'asian' }).outputs.category;
    expect(at(22.9)).toBe('cat.asianLow');
    expect(at(23)).toBe('cat.asian23');
    expect(at(27.5)).toBe('cat.asian275');
    expect(at(32.5)).toBe('cat.asian325');
    expect(at(37.5)).toBe('cat.asian375');
  });
  it('imperial uses exact factors; the 703 shortcut is within 0.01%', () => {
    const exact = bmiOf({ system: 'imperial', ft: 5, in: 10, lb: 180 });
    expect(exact).toBe(25.8);
    expect(Math.abs((703 * 180) / 70 ** 2 - (180 * 0.45359237) / (70 * 0.0254) ** 2)).toBeLessThan(
      0.01,
    );
  });
  it('healthy weight range for 1.75 m is 56.7–76.4 kg', () =>
    expect(run({ cm: 175, kg: 70 }).outputs.range).toBe('56.7–76.4 kg'));
  it('weight change to reach the healthy range', () => {
    expect(run({ cm: 175, kg: 82 }).outputs.change).toBe('−5.6 kg');
    expect(run({ cm: 175, kg: 50 }).outputs.change).toBe('+6.7 kg');
    expect(run({ cm: 175, kg: 70 }).outputs.change).toBeNull();
  });
  it('BMI Prime is BMI ÷ 25', () => expect(run({ cm: 175, kg: 82 }).outputs.prime).toBe(1.07));
  it('children and teens get a warning', () =>
    expect(run({ age: 15 }).warnings.some((w) => w.key === 'warn.child')).toBe(true));
  it('extreme values are flagged but still computed', () => {
    const r = run({ cm: 180, kg: 45 });
    expect(r.outputs.bmi).toBe(13.9);
    expect(r.warnings.some((w) => w.key === 'warn.extreme')).toBe(true);
  });
  it('missing weight gives no result', () => expect(run({ kg: null }).outputs.bmi).toBeNull());
  it('the category table has a row per category', () =>
    expect(run({}).table!.rows).toHaveLength(6));
});

describe('BMI: invariants', () => {
  it('metric and imperial agree for the same body', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 50, max: 90 }),
        fc.integer({ min: 60, max: 400 }),
        (inches, lb) => {
          const imp = bmiOf({
            system: 'imperial',
            ft: Math.floor(inches / 12),
            in: inches % 12,
            lb,
          });
          const met = bmiOf({ cm: inches * 2.54, kg: lb * 0.45359237 });
          expect(Math.abs(imp - met)).toBeLessThanOrEqual(0.1);
        },
      ),
    );
  });
});

describe('BMI: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const r = run({ ...e.inputs });
    for (const [k, v] of Object.entries(e.expect)) expect(r.outputs[k]).toBe(v);
  });
});
