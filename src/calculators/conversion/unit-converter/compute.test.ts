import { describe, expect, it } from 'vitest';
import { makeFmt } from '@/calculators/fmt';
import { fill } from '@/lib/fill';
import { UNITS } from '@/engine/units';
import { compute } from './compute';
import { definition, QUANTITIES } from './definition';
import { content } from './content.en';

const ctx = {
  today: '2026-11-24',
  fmt: makeFmt('en'),
  t: (k: string, v?: Record<string, string | number>) => fill(content.ui[k] ?? k, v ?? {}),
};
const run = (q: string, v: number | null, from: string, to: string) =>
  compute({ q, v, from, to }, ctx);
const res = (q: string, v: number, from: string, to: string) =>
  run(q, v, from, to).outputs.result as number;
const rel = (a: number, b: number, tol = 5e-7) =>
  expect(Math.abs(a - b) / Math.abs(b)).toBeLessThanOrEqual(tol);

describe('unit converter: NIST SP 811 Appendix B.8 factors (7 significant digits, verified 2026-11-24)', () => {
  it.each([
    ['foot → metre', 'length', 'ft', 'm', 3.048e-1],
    ['mile → metre', 'length', 'mi', 'm', 1.609344e3],
    ['nautical mile → metre', 'length', 'nmi', 'm', 1.852e3],
    ['pound → kilogram', 'mass', 'lb', 'kg', 4.535924e-1],
    ['ounce → kilogram', 'mass', 'oz', 'kg', 2.834952e-2],
    ['short ton → kilogram', 'mass', 'ton_us', 'kg', 9.071847e2],
    ['long ton → kilogram', 'mass', 'ton_uk', 'kg', 1.016047e3],
    ['US gallon → litre', 'volume', 'gal_us', 'l', 3.785412],
    ['imperial gallon → litre', 'volume', 'gal_uk', 'l', 4.54609],
    ['US cup → millilitre', 'volume', 'cup_us', 'ml', 2.365882e2],
    ['US fluid ounce → millilitre', 'volume', 'floz_us', 'ml', 2.957353e1],
    ['square mile → square kilometre', 'area', 'mi2', 'km2', 2.589988],
    ['hectare → square metre', 'area', 'ha', 'm2', 1e4],
    ['knot → m/s', 'speed', 'kn', 'mps', 5.144444e-1],
    ['psi → pascal', 'pressure', 'psi', 'pa', 6.894757e3],
    ['standard atmosphere → pascal', 'pressure', 'atm', 'pa', 1.01325e5],
    ['torr → pascal', 'pressure', 'torr', 'pa', 1.333224e2],
    ['mmHg (conventional) → pascal', 'pressure', 'mmhg', 'pa', 1.333224e2],
    ['inHg (conventional) → pascal', 'pressure', 'inhg', 'pa', 3.386389e3],
    ['bar → pascal', 'pressure', 'bar', 'pa', 1e5],
    ['thermochemical calorie → joule', 'energy', 'cal', 'j', 4.184],
    ['IT Btu → joule', 'energy', 'btu', 'j', 1.055056e3],
    ['kilowatt hour → joule', 'energy', 'kwh', 'j', 3.6e6],
    ['electronvolt → joule', 'energy', 'ev', 'j', 1.602177e-19],
    ['horsepower (550 ft·lbf/s) → watt', 'power', 'hp', 'w', 7.456999e2],
    ['metric horsepower → watt', 'power', 'ps', 'w', 7.354988e2],
    ['hour → second', 'time', 'h', 's', 3.6e3],
  ] as const)('%s', (_n, q, from, to, nist) => rel(res(q, 1, from, to), nist));

  it('mpg (US) → NIST 4.251437E+05 m/m³ = 0.4251437 km/L', () =>
    rel(res('fuel', 1, 'mpg_us', 'kmpl'), 0.4251437));
  it('international acre vs NIST’s US-survey acre (4.046873E+03 m²) differ by about 4 ppm', () => {
    const acre = res('area', 1, 'acre', 'm2');
    expect(acre).toBe(4046.8564224); // 4840 × 0.9144², exact by definition
    rel(acre, 4046.873, 5e-6);
  });
});

describe('unit converter: behaviour', () => {
  it('temperature: −40 is the same in °C and °F; absolute zero', () => {
    expect(res('temperature', -40, 'c', 'f')).toBe(-40);
    expect(res('temperature', 0, 'k', 'c')).toBe(-273.15);
    expect(res('temperature', 0, 'k', 'f')).toBe(-459.67);
  });
  it('temperatures below absolute zero are flagged', () =>
    expect(run('temperature', -300, 'c', 'f').warnings[0]?.key).toBe('warn.belowZero'));
  it('decimal vs binary data units', () => {
    expect(res('data', 1, 'gb', 'mb')).toBe(1000);
    expect(res('data', 1, 'gib', 'mib')).toBe(1024);
    expect(res('data', 1, 'byte', 'bit')).toBe(8);
  });
  it('fuel economy is reciprocal: 100 ÷ km/L = L/100 km', () =>
    expect(res('fuel', 20, 'kmpl', 'l100km')).toBe(5));
  it('units from another quantity fall back to that quantity’s defaults', () =>
    expect(run('mass', 1, 'mi', 'km').outputs.relation).toContain('lb'));
  it('every unit pair round-trips', () => {
    for (const q of QUANTITIES)
      for (const a of UNITS[q])
        for (const b of UNITS[q]) {
          const there = res(q, 7.25, a.id, b.id);
          rel(res(q, there, b.id, a.id), 7.25, 1e-10);
        }
  });
  it('unit ids are unique across quantities (URL params need it)', () => {
    const ids = QUANTITIES.flatMap((q) => UNITS[q].map((u) => u.id));
    expect(new Set(ids).size).toBe(ids.length);
  });
  it('every unit has a name and a symbol in the content', () => {
    for (const q of QUANTITIES)
      for (const u of UNITS[q])
        expect(content.ui[`u.${u.id}`] && content.ui[`s.${u.id}`], u.id).toBeTruthy();
  });
  it('the table lists every other unit of the quantity', () =>
    expect(run('length', 1, 'm', 'ft').table!.rows).toHaveLength(UNITS.length.length - 1));
  it('empty value gives no result', () =>
    expect(run('length', null, 'm', 'ft').outputs.result).toBeNull());
});

describe('unit converter: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const r = compute({ ...e.inputs } as never, ctx);
    for (const [k, v] of Object.entries(e.expect)) expect(r.outputs[k]).toBe(v);
  });
});
