import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute, litresPerKm } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-24');
const run = (inputs: Record<string, unknown>, cur = 'USD') =>
  compute({ ...base, cur, ...inputs } as never, {
    today: '2026-11-24',
    fmt: makeFmt('en', String(inputs.cur ?? cur)),
  });
const gallons = (miles: number, mpg: number) =>
  run({ distance: miles, distUnit: 'mi', efficiency: mpg, effUnit: 'mpgUS', priceUnit: 'galUS' })
    .outputs.fuel as number;

describe('fuel-cost: references', () => {
  it('fueleconomy.gov: over 1,000 miles, 10 vs 15 MPG is about 33 gallons', () =>
    expect(gallons(1000, 10) - gallons(1000, 15)).toBeCloseTo(33.333333, 5));
  it('fueleconomy.gov: 30 vs 35 MPG is only about 5 gallons', () =>
    expect(gallons(1000, 30) - gallons(1000, 35)).toBeCloseTo(4.761905, 5));
  it('NIST SP 811 factors: 1 US MPG = 235.2145833 L/100 km; 1 UK MPG = 282.4809363 L/100 km', () => {
    expect(litresPerKm(1, 'mpgUS')! * 100).toBeCloseTo(235.2145833, 6);
    expect(litresPerKm(1, 'mpgUK')! * 100).toBeCloseTo(282.4809363, 6);
  });
});

describe('fuel-cost: behaviour', () => {
  it('300 mi at 30 MPG and $3.50/gal = $35', () => {
    const r = run({});
    expect(r.outputs.cost).toBe(35);
    expect(r.outputs.perDistance).toBe(0.116667);
  });
  it('FAQ: 420 mi at 28 MPG and $3.20 = $48', () =>
    expect(run({ distance: 420, efficiency: 28, price: 3.2 }).outputs.cost).toBe(48));
  it('metric return trip split three ways', () => {
    const r = run({
      distance: 450,
      distUnit: 'km',
      efficiency: 6.5,
      effUnit: 'l100',
      price: 1.85,
      priceUnit: 'L',
      roundTrip: true,
      people: 3,
      cur: 'EUR',
    });
    expect(r.outputs.fuel).toBe(58.5);
    expect(r.outputs.cost).toBe(108.23);
    expect(r.outputs.each).toBe(36.08);
  });
  it('km/L', () =>
    expect(
      run({
        distance: 120,
        distUnit: 'km',
        efficiency: 15,
        effUnit: 'kml',
        price: 100,
        priceUnit: 'L',
        cur: 'JPY',
      }).outputs.cost,
    ).toBe(800));
  it('mixed units: 100 km at 40 UK MPG priced per litre', () =>
    // 100 / 1.609344 mi ÷ 40 × 4.54609 L = 7.0620 L (Python)
    expect(
      run({ distance: 100, distUnit: 'km', efficiency: 40, effUnit: 'mpgUK', priceUnit: 'L' })
        .outputs.fuel,
    ).toBe(7.062023));
  it('shows the L/100 km equivalent of MPG', () => expect(run({}).outputs.l100).toBe(7.8405));
  it('zero economy is rejected', () =>
    expect(run({ efficiency: 0 }).warnings[0]?.key).toBe('warn.efficiency'));
  it('one person has no split', () => expect(run({}).outputs.each).toBeNull());
});

describe('fuel-cost: properties', () => {
  it('cost scales with distance (to the cent)', () =>
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 5000 }), fc.integer({ min: 2, max: 5 }), (d, k) => {
        const a = run({ distance: d }).outputs.cost as number;
        const b = run({ distance: d * k }).outputs.cost as number;
        return Math.abs(b - a * k) <= 0.01 * k;
      }),
    ));
  it('MPG and its L/100 km equivalent give the same fuel', () =>
    fc.assert(
      fc.property(
        fc.integer({ min: 5, max: 100 }),
        fc.integer({ min: 1, max: 2000 }),
        (mpg, km) => {
          const a = run({
            distance: km,
            distUnit: 'km',
            efficiency: mpg,
            effUnit: 'mpgUS',
            priceUnit: 'L',
          }).outputs.fuel as number;
          const b = run({
            distance: km,
            distUnit: 'km',
            efficiency: litresPerKm(mpg, 'mpgUS')! * 100,
            effUnit: 'l100',
            priceUnit: 'L',
          }).outputs.fuel as number;
          return Math.abs(a - b) < 1e-5;
        },
      ),
    ));
});

describe('fuel-cost: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const r = run({ ...e.inputs });
    for (const [k, v] of Object.entries(e.expect)) expect(r.outputs[k]).toBe(v);
  });
});
