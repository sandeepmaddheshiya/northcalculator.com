/**
 * Inline answers for the search box (BRIEF §6: "smart search with inline answers").
 * Recognises "15% of 240", "5 ft to m" / "100 f in c" and plain arithmetic ("2^10 + 5"),
 * and returns the answer plus the calculator (and its URL state) that shows the working.
 * Pure and small: it ships inside the lazily loaded search dialog.
 */
import { evaluate } from '@/engine/expr';
import { convert, UNITS, type Quantity } from '@/engine/units';
import { parseLocaleNumber } from '@/engine/parse';
import { clean } from '@/engine/money';

export interface InlineAnswer {
  /** Text of the question as understood, e.g. "15% of 240". */
  question: string;
  value: number;
  /** Unit symbol or % to show after the value. */
  suffix?: string;
  calculator: 'percentage' | 'unit-converter' | 'scientific-calculator';
  params: Record<string, string>;
}

/** Spoken and written names for units (English). Values are engine unit ids. */
const ALIASES: Record<string, string> = {
  mm: 'mm',
  millimeter: 'mm',
  millimeters: 'mm',
  millimetre: 'mm',
  millimetres: 'mm',
  cm: 'cm',
  centimeter: 'cm',
  centimeters: 'cm',
  centimetre: 'cm',
  centimetres: 'cm',
  m: 'm',
  meter: 'm',
  meters: 'm',
  metre: 'm',
  metres: 'm',
  km: 'km',
  kilometer: 'km',
  kilometers: 'km',
  kilometre: 'km',
  kilometres: 'km',
  in: 'in',
  inch: 'in',
  inches: 'in',
  '"': 'in',
  ft: 'ft',
  foot: 'ft',
  feet: 'ft',
  "'": 'ft',
  yd: 'yd',
  yard: 'yd',
  yards: 'yd',
  mi: 'mi',
  mile: 'mi',
  miles: 'mi',
  mg: 'mg',
  g: 'g',
  gram: 'g',
  grams: 'g',
  kg: 'kg',
  kilo: 'kg',
  kilos: 'kg',
  kilogram: 'kg',
  kilograms: 'kg',
  oz: 'oz',
  ounce: 'oz',
  ounces: 'oz',
  lb: 'lb',
  lbs: 'lb',
  pound: 'lb',
  pounds: 'lb',
  st: 'st',
  stone: 'st',
  ml: 'ml',
  milliliter: 'ml',
  milliliters: 'ml',
  millilitre: 'ml',
  millilitres: 'ml',
  l: 'l',
  liter: 'l',
  liters: 'l',
  litre: 'l',
  litres: 'l',
  gal: 'gal_us',
  gallon: 'gal_us',
  gallons: 'gal_us',
  cup: 'cup_us',
  cups: 'cup_us',
  tsp: 'tsp_us',
  teaspoon: 'tsp_us',
  teaspoons: 'tsp_us',
  tbsp: 'tbsp_us',
  tablespoon: 'tbsp_us',
  tablespoons: 'tbsp_us',
  'fl oz': 'floz_us',
  floz: 'floz_us',
  c: 'c',
  '°c': 'c',
  celsius: 'c',
  centigrade: 'c',
  f: 'f',
  '°f': 'f',
  fahrenheit: 'f',
  k: 'k',
  kelvin: 'k',
  'km/h': 'kmh',
  kmh: 'kmh',
  kph: 'kmh',
  mph: 'mph',
  'm/s': 'mps',
  knot: 'kn',
  knots: 'kn',
  acre: 'acre',
  acres: 'acre',
  ha: 'ha',
  hectare: 'ha',
  hectares: 'ha',
  m2: 'm2',
  'm²': 'm2',
  ft2: 'ft2',
  'ft²': 'ft2',
  'sq ft': 'ft2',
  'square feet': 'ft2',
  psi: 'psi',
  bar: 'bar',
  kpa: 'kpa',
  atm: 'atm',
  kcal: 'kcal',
  calorie: 'kcal',
  calories: 'kcal',
  kj: 'kj',
  j: 'j',
  kwh: 'kwh',
  w: 'w',
  watt: 'w',
  watts: 'w',
  kw: 'kw',
  hp: 'hp',
  horsepower: 'hp',
  kb: 'kb',
  mb: 'mb',
  gb: 'gb',
  tb: 'tb',
  kib: 'kib',
  mib: 'mib',
  gib: 'gib',
  tib: 'tib',
  byte: 'byte',
  bytes: 'byte',
  bit: 'bit',
  bits: 'bit',
  s: 's',
  sec: 's',
  second: 's',
  seconds: 's',
  min: 'min',
  minute: 'min',
  minutes: 'min',
  h: 'h',
  hr: 'h',
  hour: 'h',
  hours: 'h',
  day: 'd',
  days: 'd',
  week: 'wk',
  weeks: 'wk',
  year: 'yr',
  years: 'yr',
  mpg: 'mpg_us',
  'l/100km': 'l100km',
  'l/100 km': 'l100km',
  'km/l': 'kmpl',
  kmpl: 'kmpl',
};

const SYMBOL: Record<string, string> = {
  c: '°C',
  f: '°F',
  gal_us: 'gal',
  cup_us: 'cup',
  tsp_us: 'tsp',
  tbsp_us: 'tbsp',
  floz_us: 'fl oz',
  mpg_us: 'mpg',
  l100km: 'L/100 km',
  kmpl: 'km/L',
  l: 'L',
  ml: 'mL',
  kmh: 'km/h',
  mps: 'm/s',
  m2: 'm²',
  ft2: 'ft²',
  d: 'days',
  wk: 'weeks',
  yr: 'years',
};

function quantityOf(id: string): Quantity | undefined {
  return (Object.keys(UNITS) as Quantity[]).find((q) => UNITS[q].some((u) => u.id === id));
}

function num(s: string, locale: string): number | null {
  const r = parseLocaleNumber(s, locale);
  return r.ok ? r.value : null;
}

export function inlineAnswer(raw: string, locale = 'en'): InlineAnswer | null {
  const q = raw
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[?=]+$/, '')
    .trim();
  if (q.length < 3 || q.length > 120) return null;

  // "15% of 240", "what is 15 percent of 240"
  const pct = q.match(
    /^(?:what(?:'s| is) )?([-−]?[\d.,\s]*\d)\s?(?:%|percent|per cent) of ([-−]?[\d.,\s]*\d)$/i,
  );
  if (pct) {
    const a = num(pct[1]!, locale);
    const b = num(pct[2]!, locale);
    if (a !== null && b !== null)
      return {
        question: `${a}% of ${b}`,
        value: clean((a / 100) * b),
        calculator: 'percentage',
        params: { q: 'of', a: String(a), b: String(b) },
      };
  }

  // "5 ft to m", "100 f in c", "3.5 kilograms into pounds"
  const conv = q.match(/^([-−]?[\d.,]*\d)\s?([a-z°'"/²\s]+?) (?:to|in|into|as) ([a-z°'"/²\s]+)$/i);
  if (conv) {
    const v = num(conv[1]!, locale);
    const from = ALIASES[conv[2]!.toLowerCase().trim()];
    const to = ALIASES[conv[3]!.toLowerCase().trim()];
    const qf = from && quantityOf(from);
    if (v !== null && from && to && qf && qf === quantityOf(to) && from !== to) {
      const value = clean(convert(v, qf, from, to));
      if (Number.isFinite(value))
        return {
          question: `${v} ${SYMBOL[from] ?? from} → ${SYMBOL[to] ?? to}`,
          value,
          suffix: SYMBOL[to] ?? to,
          calculator: 'unit-converter',
          params: { q: qf, v: String(v), from, to },
        };
    }
  }

  // Arithmetic: needs a digit and an operator or function, and must parse.
  if (
    /\d/.test(q) &&
    /[-+*/×÷^!%√−()]|\b(sin|cos|tan|ln|log|sqrt)\b/i.test(q) &&
    !/^[-−]?[\d.,]+%?$/.test(q)
  ) {
    // Locale-formatted numbers ("1,250" or "1.234,5") become plain numbers the parser reads.
    let bad = false;
    const expr = q.replace(/\d[\d.,]*\d|\d/g, (t) => {
      const n = num(t, locale);
      if (n === null) bad = true;
      return n === null ? t : String(n);
    });
    const r = bad ? null : evaluate(expr, { mode: 'deg' });
    if (r?.ok && Number.isFinite(r.value))
      return {
        question: q,
        value: clean(r.value),
        calculator: 'scientific-calculator',
        params: { e: expr },
      };
  }
  return null;
}
