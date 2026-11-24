import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute } from './compute';
import { content } from './content.en';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-24');
const run = (inputs: Record<string, unknown>) =>
  compute({ ...base, ...inputs } as never, {
    today: '2026-11-24',
    fmt: makeFmt('en'),
    t: (k) => content.ui[k] ?? k,
  }).outputs as Record<string, number | string>;
const rho = (mass: number, massUnit: string, volume: number, volumeUnit: string) =>
  run({ find: 'density', mass, massUnit, volume, volumeUnit, densityUnit: 'gcm3' }).gcm3 as number;
const r = (x: number, d: number) => Math.round(x * 10 ** d) / 10 ** d;

describe('density: references', () => {
  it('OpenStax Chemistry 2e Ex 1.1: 90.7 g in 8.00 cm³ → 11.3 g/cm³ (exact 11.3375)', () => {
    expect(rho(90.7, 'g', 8, 'cm3')).toBe(11.3375);
    expect(r(rho(90.7, 'g', 8, 'cm3'), 1)).toBe(11.3);
  });
  it('Ex 1.1 check: 5.34 g in 0.599 cm³ → 8.91 g/cm³', () =>
    expect(r(rho(5.34, 'g', 0.599, 'cm3'), 2)).toBe(8.91));
  it('Ex 1.2: iron 31.48 g / 4.0 mL → 7.9; wood 1.95 g / 3.0 mL → 0.65', () => {
    expect(r(rho(31.48, 'g', 4, 'cm3'), 1)).toBe(7.9);
    expect(rho(1.95, 'g', 3, 'cm3')).toBe(0.65);
  });
  it('OpenStax College Physics 2e Ex 11.1: 1.000 × 10³ kg/m³ × 2.00 × 10⁹ m³ = 2.00 × 10¹² kg', () =>
    expect(
      run({ find: 'mass', density: 1000, densityUnit: 'kgm3', volume: 2e9, volumeUnit: 'm3' }).kg,
    ).toBe(2e12));
  it('Table 11.1 water: 1.000 × 10³ kg/m³ = 1 g/cm³ = 62.43 lb/ft³ (NIST factors)', () => {
    const o = run({
      find: 'density',
      mass: 1000,
      massUnit: 'kg',
      volume: 1,
      volumeUnit: 'm3',
      densityUnit: 'lbft3',
    });
    expect(o.gcm3).toBe(1);
    expect(o.result).toBe('62.427961 lb/ft³');
  });
});

describe('density: behaviour', () => {
  it('volume from mass: 1 kg of gold (19.32 g/cm³) is 51.76 cm³', () =>
    expect(
      run({
        find: 'volume',
        density: 19.32,
        densityUnit: 'gcm3',
        mass: 1,
        massUnit: 'kg',
        volumeUnit: 'cm3',
      }).result,
    ).toBe('51.759834 cm³'));
  it('FAQ: 2 L of olive oil at 0.92 kg/L ≈ 1.84 kg', () =>
    expect(
      run({
        find: 'mass',
        density: 0.92,
        densityUnit: 'gcm3',
        volume: 2,
        volumeUnit: 'L',
        massUnit: 'kg',
      }).kg,
    ).toBe(1.84));
  it('zero volume or density is rejected', () => {
    const w = (i: Record<string, unknown>) =>
      compute({ ...base, ...i } as never, { today: '', fmt: makeFmt('en') }).warnings[0]?.key;
    expect(w({ find: 'density', mass: 1, volume: 0 })).toBe('warn.volume');
    expect(w({ find: 'volume', density: 0, mass: 1 })).toBe('warn.density');
  });
});

describe('density: properties', () => {
  it('density → mass → volume round-trips across units', () =>
    fc.assert(
      fc.property(
        fc.double({ min: 0.001, max: 1e6, noNaN: true }),
        fc.double({ min: 0.001, max: 1e6, noNaN: true }),
        fc.constantFrom('g', 'kg', 'lb'),
        fc.constantFrom('cm3', 'L', 'm3', 'ft3', 'galUS'),
        (mass, volume, mu, vu) => {
          const d = run({
            find: 'density',
            mass,
            massUnit: mu,
            volume,
            volumeUnit: vu,
            densityUnit: 'kgm3',
          }).kgm3 as number;
          const kg = run({ find: 'mass', density: d, densityUnit: 'kgm3', volume, volumeUnit: vu })
            .kg as number;
          const L = run({ find: 'volume', density: d, densityUnit: 'kgm3', mass, massUnit: mu })
            .L as number;
          const wantKg = mass * { g: 0.001, kg: 1, lb: 0.45359237 }[mu];
          return Math.abs(kg - wantKg) <= 1e-9 * wantKg && L > 0;
        },
      ),
    ));
});

describe('density: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const o = run(e.inputs);
    for (const [k, v] of Object.entries(e.expect)) expect(o[k]).toBe(v);
  });
});
