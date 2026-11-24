import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-24');
const run = (inputs: Record<string, unknown>, cur = 'USD') =>
  compute({ ...base, ...inputs, cur } as never, { today: '2026-11-24', fmt: makeFmt('en', cur) });
const year = (power: number, rate: number) => run({ power, hours: 3, days: 365, rate }).outputs;

describe('electricity-cost: references', () => {
  it('OpenStax University Physics Vol. 2 Ex 9.10: 100 W → 109.5 kWh, $10.95; 20 W → 21.90 kWh, $2.19', () => {
    expect([year(100, 0.1).kwh, year(100, 0.1).cost]).toEqual([109.5, 10.95]);
    expect([year(20, 0.1).kwh, year(20, 0.1).cost]).toEqual([21.9, 2.19]);
    expect(
      Math.round(((year(100, 0.1).cost as number) - (year(20, 0.1).cost as number)) * 100) / 100,
    ).toBe(8.76);
  });
  it('OpenStax College Physics 2e Ex 20.8: 60 W × 1000 h = 60.0 kWh, $7.20 at $0.12; 15 W → $1.80', () => {
    const r = run({ power: 60, hours: 10, days: 100, rate: 0.12 }).outputs;
    expect([r.kwh, r.cost]).toEqual([60, 7.2]);
    expect(run({ power: 15, hours: 10, days: 100, rate: 0.12 }).outputs.cost).toBe(1.8);
  });
});

describe('electricity-cost: behaviour', () => {
  it('FAQ: 2,000 W heater for 4 h at $0.20 = 8 kWh, $1.60; 5 W standby all year = 43.8 kWh, $8.76', () => {
    expect(run({ power: 2, powerUnit: 'kW', hours: 4, days: 1, rate: 0.2 }).outputs.cost).toBe(1.6);
    const s = run({ power: 5, hours: 24, days: 365, rate: 0.2 }).outputs;
    expect([s.kwh, s.cost]).toEqual([43.8, 8.76]);
  });
  it('sub-cent rates are not pre-rounded: 1 kWh at 16.5¢ = $0.17 (half-up), per hour 0.165', () => {
    const r = run({ power: 1000, hours: 1, days: 1, rate: 0.165 }).outputs;
    expect([r.cost, r.perHour]).toEqual([0.17, 0.165]);
  });
  it('zero-decimal currencies round to whole units (JPY)', () =>
    expect(run({ power: 100, hours: 3, days: 365, rate: 31 }, 'JPY').outputs.cost).toBe(3395));
  it('per-year cost appears only for periods other than a year', () => {
    expect(year(100, 0.1).perYear).toBeNull();
    expect(run({ power: 100, hours: 3, days: 30, rate: 0.1 }).outputs.perYear).toBe(10.95);
  });
  it('more than 24 hours a day is rejected', () =>
    expect(run({ hours: 25 }).warnings[0]?.key).toBe('warn.hours'));
});

describe('electricity-cost: properties', () => {
  it('cost is within half a cent of kWh × rate and scales with days', () =>
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 5000 }),
        fc.integer({ min: 0, max: 24 }),
        fc.integer({ min: 1, max: 1000 }),
        fc.integer({ min: 1, max: 100 }),
        (w, h, days, cents) => {
          const rate = cents / 100;
          const r = run({ power: w, hours: h, days, rate }).outputs;
          return Math.abs((r.cost as number) - (w / 1000) * h * days * rate) <= 0.005 + 1e-9;
        },
      ),
    ));
});

describe('electricity-cost: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const r = run(e.inputs, String(e.inputs.cur ?? 'USD'));
    for (const [k, v] of Object.entries(e.expect)) expect(r.outputs[k]).toBe(v);
  });
});
