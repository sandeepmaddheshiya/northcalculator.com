/**
 * Unit conversion with exact defined factors (NIST SP 811 App. B; NIST HB 44 App. C;
 * BIPM SI Brochure 9th ed.; 1959 international yard and pound). Each unit maps to the
 * SI base of its quantity. Affine (temperature) and reciprocal (fuel economy) units use functions.
 */
export type Quantity =
  | 'length'
  | 'mass'
  | 'volume'
  | 'temperature'
  | 'area'
  | 'speed'
  | 'pressure'
  | 'energy'
  | 'power'
  | 'data'
  | 'time'
  | 'fuel';

export interface UnitDef {
  id: string;
  /** Multiply by this to get the SI base unit. */
  factor?: number;
  toBase?: (v: number) => number;
  fromBase?: (v: number) => number;
  /** Whether `factor` is exact by definition (shown on the page). */
  exact: boolean;
}

const f = (id: string, factor: number, exact = true): UnitDef => ({ id, factor, exact });

const IN = 0.0254;
const LB = 0.45359237;
const US_GAL = 231 * IN ** 3; // 3.785411784 L exactly
const IMP_GAL = 0.00454609;
const G0 = 9.80665;

export const UNITS: Record<Quantity, readonly UnitDef[]> = {
  length: [
    f('mm', 1e-3),
    f('cm', 1e-2),
    f('m', 1),
    f('km', 1e3),
    f('um', 1e-6),
    f('in', IN),
    f('ft', 12 * IN),
    f('yd', 36 * IN),
    f('mi', 63360 * IN),
    f('nmi', 1852),
  ],
  mass: [
    f('mg', 1e-6),
    f('g', 1e-3),
    f('kg', 1),
    f('t', 1e3),
    f('oz', LB / 16),
    f('lb', LB),
    f('st', 14 * LB),
    f('ton_us', 2000 * LB),
    f('ton_uk', 2240 * LB),
  ],
  volume: [
    f('ml', 1e-6),
    f('l', 1e-3),
    f('m3', 1),
    f('cm3', 1e-6),
    f('tsp_us', US_GAL / 768),
    f('tbsp_us', US_GAL / 256),
    f('floz_us', US_GAL / 128),
    f('cup_us', US_GAL / 16),
    f('pt_us', US_GAL / 8),
    f('qt_us', US_GAL / 4),
    f('gal_us', US_GAL),
    f('floz_uk', IMP_GAL / 160),
    f('pt_uk', IMP_GAL / 8),
    f('gal_uk', IMP_GAL),
    f('in3', IN ** 3),
    f('ft3', (12 * IN) ** 3),
  ],
  temperature: [
    { id: 'c', toBase: (v) => v + 273.15, fromBase: (k) => k - 273.15, exact: true },
    {
      id: 'f',
      toBase: (v) => ((v - 32) * 5) / 9 + 273.15,
      fromBase: (k) => ((k - 273.15) * 9) / 5 + 32,
      exact: true,
    },
    { id: 'k', factor: 1, exact: true },
    { id: 'r', factor: 5 / 9, exact: true },
  ],
  area: [
    f('mm2', 1e-6),
    f('cm2', 1e-4),
    f('m2', 1),
    f('ha', 1e4),
    f('km2', 1e6),
    f('in2', IN ** 2),
    f('ft2', (12 * IN) ** 2),
    f('yd2', (36 * IN) ** 2),
    f('acre', 4840 * (36 * IN) ** 2),
    f('mi2', (63360 * IN) ** 2),
  ],
  speed: [
    f('mps', 1),
    f('kmh', 1000 / 3600),
    f('mph', (63360 * IN) / 3600),
    f('kn', 1852 / 3600),
    f('fps', 12 * IN),
  ],
  pressure: [
    f('pa', 1),
    f('kpa', 1e3),
    f('mpa', 1e6),
    f('bar', 1e5),
    f('mbar', 100),
    f('atm', 101325),
    f('psi', (LB * G0) / IN ** 2),
    f('torr', 101325 / 760),
    f('mmhg', 133.322387415), // conventional millimetre of mercury (NIST SP 811 B.8)
    f('inhg', 3386.389, false), // conventional, 0 °C (NIST SP 811 B.8, rounded)
  ],
  energy: [
    f('j', 1),
    f('kj', 1e3),
    f('mj', 1e6),
    f('cal', 4.184),
    f('kcal', 4184),
    f('wh', 3600),
    f('kwh', 3.6e6),
    f('btu', 1055.05585262),
    f('ev', 1.602176634e-19),
  ],
  power: [
    f('w', 1),
    f('kw', 1e3),
    f('mw', 1e6),
    f('hp', 550 * 12 * IN * LB * G0),
    f('ps', 75 * G0),
    f('btuh', 1055.05585262 / 3600),
  ],
  data: [
    f('bit', 1),
    f('byte', 8),
    f('kb', 8e3),
    f('mb', 8e6),
    f('gb', 8e9),
    f('tb', 8e12),
    f('pb', 8e15),
    f('kib', 8 * 1024),
    f('mib', 8 * 1024 ** 2),
    f('gib', 8 * 1024 ** 3),
    f('tib', 8 * 1024 ** 4),
    f('kbit', 1e3),
    f('mbit', 1e6),
    f('gbit', 1e9),
  ],
  time: [
    f('ms', 1e-3),
    f('s', 1),
    f('min', 60),
    f('h', 3600),
    f('d', 86400),
    f('wk', 604800),
    f('yr', 365.25 * 86400),
  ],
  // Base: kilometres per litre. Reciprocal units cannot be expressed by a factor.
  fuel: [
    { id: 'kmpl', factor: 1, exact: true },
    { id: 'l100km', toBase: (v) => 100 / v, fromBase: (b) => 100 / b, exact: true },
    { id: 'mpg_us', factor: (63360 * IN) / 1000 / (US_GAL * 1000), exact: true },
    { id: 'mpg_uk', factor: (63360 * IN) / 1000 / (IMP_GAL * 1000), exact: true },
  ],
};

export function findUnit(q: Quantity, id: string): UnitDef | undefined {
  return UNITS[q].find((u) => u.id === id);
}

export function convert(value: number, q: Quantity, from: string, to: string): number {
  const a = findUnit(q, from);
  const b = findUnit(q, to);
  if (!a || !b) throw new RangeError(`Unknown unit ${from} or ${to} for ${q}`);
  if (from === to) return value;
  const base = a.toBase ? a.toBase(value) : value * a.factor!;
  return b.fromBase ? b.fromBase(base) : base / b.factor!;
}
