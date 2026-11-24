import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute } from './compute';
import { ACTIVITIES, definition } from './definition';

const base = defaultValues(definition, '2026-11-24');
const run = (inputs: Record<string, unknown>) =>
  compute({ ...base, ...inputs } as never, { today: '2026-11-24', fmt: makeFmt('en') });

describe('calories-burned: references (2024 Adult Compendium of Physical Activities)', () => {
  it('1 MET = 1 kcal/kg/hour: sitting quietly (07021) for an hour at 70 kg is 70 kcal', () =>
    expect(run({ activity: '07021', minutes: 60, weight: 70 }).outputs.kcal).toBe(70));
  it('Compendium MET values: 17190 3.8, 12050 9.3, 01030 8.0, 02150 2.3, 12120 14.8', () => {
    const m = Object.fromEntries(ACTIVITIES);
    expect([m['17190'], m['12050'], m['01030'], m['02150'], m['12120']]).toEqual([
      3.8, 9.3, 8.0, 2.3, 14.8,
    ]);
  });
});

describe('calories-burned: behaviour', () => {
  it('30 min brisk walk at 70 kg = 133 kcal (98 net)', () => {
    const r = run({ activity: '17190', minutes: 30, weight: 70 });
    expect([r.outputs.kcal, r.outputs.net]).toEqual([133, 98]);
  });
  it('45 min run at 180 lb = 569 kcal, 759 per hour', () => {
    const r = run({ activity: '12050', minutes: 45, unit: 'lb', weight: 180 });
    expect([r.outputs.kcal, r.outputs.perHour]).toEqual([569, 759]);
  });
  it('FAQ: cycling 90 min at 75 kg = 900 kcal; walking 30 min at 90 kg = 171', () => {
    expect(run({ activity: '01030', minutes: 90, weight: 75 }).outputs.kcal).toBe(900);
    expect(run({ activity: '17190', minutes: 30, weight: 90 }).outputs.kcal).toBe(171);
  });
  it('custom MET', () =>
    expect(run({ activity: 'custom', met: 5, minutes: 60, weight: 80 }).outputs.kcal).toBe(400));
  it('always notes that MET values are estimates', () =>
    expect(run({}).warnings[0]?.key).toBe('warn.estimate'));
  it('missing input gives no result', () => expect(run({ minutes: null }).outputs.kcal).toBeNull());
});

describe('calories-burned: properties', () => {
  it('energy is proportional to weight and to time', () =>
    fc.assert(
      fc.property(
        fc.integer({ min: 40, max: 150 }),
        fc.integer({ min: 10, max: 120 }),
        (kg, min) => {
          const a = run({ activity: 'custom', met: 6, weight: kg, minutes: min }).outputs
            .kcal as number;
          const b = run({ activity: 'custom', met: 6, weight: kg * 2, minutes: min }).outputs
            .kcal as number;
          return Math.abs(b - 2 * a) <= 1;
        },
      ),
    ));
});

describe('calories-burned: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const r = run({ ...e.inputs });
    for (const [k, v] of Object.entries(e.expect)) expect(r.outputs[k]).toBe(v);
  });
});
