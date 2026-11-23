import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { parseLocaleNumber } from './parse';

const ok = (s: string, locale = 'en') => {
  const r = parseLocaleNumber(s, locale);
  if (!r.ok) throw new Error(`expected ${s} to parse, got ${r.reason}`);
  return r;
};

describe('parseLocaleNumber', () => {
  it.each([
    ['1000', 1000],
    ['1,000', 1000],
    ['1 000', 1000],
    ['1 000', 1000],
    ["1'000", 1000],
    ['1,234.56', 1234.56],
    ['1.234,56', 1234.56],
    ['12,34,567', 1234567],
    ['12,34,567.89', 1234567.89],
    ['0.5', 0.5],
    ['.5', 0.5],
    ['1,5', 1.5],
    ['$10', 10],
    ['10 USD', 10],
    ['₹ 1,00,000', 100000],
    ['-5', -5],
    ['−5', -5],
    ['-$5.25', -5.25],
    ['(1,234)', -1234],
    ['1e3', 1000],
    ['1.5e-3', 0.0015],
    ['+42', 42],
    ['007', 7],
    ['٣٤٥', 345],
    ['१२३४.५', 1234.5],
  ])('en: %s → %s', (input, expected) => {
    expect(ok(input).value).toBeCloseTo(expected, 12);
  });

  it.each([
    ['1.000', 1000],
    ['1.234,5', 1234.5],
    ['1,5', 1.5],
    ['1.5', 1.5],
    ['1 234,56', 1234.56],
  ])('de: %s → %s', (input, expected) => {
    expect(ok(input, 'de').value).toBeCloseTo(expected, 12);
  });

  it('detects percent', () => {
    expect(ok('10%').percent).toBe(true);
    expect(ok('10 %').value).toBe(10);
    expect(ok('10').percent).toBe(false);
  });

  it('keeps an exact decimal string for money maths', () => {
    expect(ok('0.1').normalized).toBe('0.1');
    expect(ok('1,000.10').normalized).toBe('1000.1');
    expect(ok('-0.30').normalized).toBe('-0.3');
  });

  it.each(['', '   '])('empty: %j', (s) => {
    expect(parseLocaleNumber(s)).toEqual({ ok: false, reason: 'empty' });
  });

  it.each(['abc', '1.2.3,4', '1,2,3', '--5', '1,234.5.6', '12a', '.', ',', '$', '1e999'])(
    'invalid: %j',
    (s) => {
      expect(parseLocaleNumber(s).ok).toBe(false);
    },
  );

  it('round-trips Intl-formatted numbers in many locales (property)', () => {
    const locales = [
      'en',
      'en-IN',
      'de',
      'fr',
      'es',
      'pt-BR',
      'it',
      'ru',
      'pl',
      'hi',
      'ja',
      'de-CH',
    ];
    fc.assert(
      fc.property(
        fc.integer({ min: -1e12, max: 1e12 }),
        fc.integer({ min: 0, max: 99 }),
        fc.constantFrom(...locales),
        (int, cents, locale) => {
          const n = int + (Math.sign(int || 1) * cents) / 100;
          const text = new Intl.NumberFormat(locale, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(n);
          const r = parseLocaleNumber(text, locale);
          return r.ok && Math.abs(r.value - n) < 1e-6;
        },
      ),
      { numRuns: 500 },
    );
  });
});
