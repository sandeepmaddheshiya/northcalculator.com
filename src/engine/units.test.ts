import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { UNITS, convert, type Quantity } from './units';

const close = (a: number, b: number, rel = 1e-12) =>
  expect(Math.abs(a - b)).toBeLessThanOrEqual(Math.abs(b) * rel + 1e-15);

describe('units (NIST SP 811 / HB 44 reference values)', () => {
  it('length', () => {
    close(convert(1, 'length', 'in', 'cm'), 2.54);
    close(convert(1, 'length', 'mi', 'km'), 1.609344);
    close(convert(1, 'length', 'ft', 'm'), 0.3048);
    close(convert(1, 'length', 'nmi', 'm'), 1852);
  });
  it('mass', () => {
    close(convert(1, 'mass', 'lb', 'kg'), 0.45359237);
    close(convert(1, 'mass', 'oz', 'g'), 28.349523125);
    close(convert(1, 'mass', 'st', 'lb'), 14);
  });
  it('volume', () => {
    close(convert(1, 'volume', 'gal_us', 'l'), 3.785411784);
    close(convert(1, 'volume', 'gal_uk', 'l'), 4.54609);
    close(convert(1, 'volume', 'cup_us', 'ml'), 236.5882365);
    close(convert(1, 'volume', 'floz_us', 'ml'), 29.5735295625);
    close(convert(1, 'volume', 'tbsp_us', 'tsp_us'), 3);
  });
  it('temperature (affine)', () => {
    close(convert(100, 'temperature', 'c', 'f'), 212);
    close(convert(-40, 'temperature', 'f', 'c'), -40);
    close(convert(0, 'temperature', 'k', 'c'), -273.15);
    expect(Math.abs(convert(491.67, 'temperature', 'r', 'c'))).toBeLessThan(1e-9);
    close(convert(98.6, 'temperature', 'f', 'c'), 37);
  });
  it('area, speed, pressure, energy, power, data, time, fuel', () => {
    close(convert(1, 'area', 'acre', 'm2'), 4046.8564224);
    close(convert(1, 'area', 'ha', 'acre'), 2.4710538146716534);
    close(convert(100, 'speed', 'kmh', 'mph'), 62.13711922373339);
    close(convert(1, 'pressure', 'psi', 'pa'), 6894.757293168361);
    close(convert(1, 'pressure', 'atm', 'torr'), 760); // exact by definition
    close(convert(1, 'pressure', 'mmhg', 'pa'), 133.322387415); // conventional mmHg ≠ torr (NIST SP 811)
    close(convert(1, 'energy', 'kcal', 'kj'), 4.184);
    close(convert(1, 'energy', 'kwh', 'j'), 3.6e6);
    close(convert(1, 'power', 'hp', 'w'), 745.6998715822702);
    close(convert(1, 'power', 'ps', 'w'), 735.49875);
    close(convert(1, 'data', 'gib', 'gb'), 1.073741824);
    close(convert(1, 'data', 'byte', 'bit'), 8);
    close(convert(1, 'time', 'd', 'h'), 24);
    close(convert(1, 'time', 'yr', 'd'), 365.25);
    close(convert(30, 'fuel', 'mpg_us', 'l100km'), 235.2145833333333 / 30, 1e-11); // L/100 km = 235.2145833… ÷ mpg(US)
    close(convert(5, 'fuel', 'l100km', 'kmpl'), 20);
  });
  it('throws on unknown units', () => {
    expect(() => convert(1, 'length', 'm', 'lb')).toThrow();
  });
  it('every conversion round-trips (property)', () => {
    const qs = Object.keys(UNITS) as Quantity[];
    fc.assert(
      fc.property(
        fc.constantFrom(...qs),
        fc.double({ min: 0.001, max: 1e9, noNaN: true }),
        fc.nat(),
        fc.nat(),
        (q, v, i, j) => {
          const us = UNITS[q];
          const a = us[i % us.length]!.id,
            b = us[j % us.length]!.id;
          const back = convert(convert(v, q, a, b), q, b, a);
          return Math.abs(back - v) <= Math.abs(v) * 1e-9;
        },
      ),
      { numRuns: 3000 },
    );
  });
});
