import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import {
  clean,
  fromMinor,
  minorDigits,
  roundHalfEven,
  roundHalfUp,
  roundTo,
  toMinor,
} from './money';

describe('money', () => {
  it('knows minor digits per currency (ISO 4217)', () => {
    expect(minorDigits('USD')).toBe(2);
    expect(minorDigits('INR')).toBe(2);
    expect(minorDigits('JPY')).toBe(0);
    expect(minorDigits('KRW')).toBe(0);
    expect(minorDigits('BHD')).toBe(3);
    expect(minorDigits('XXX-invalid')).toBe(2);
  });
  it('rounds half up despite binary representation', () => {
    expect(roundTo(1.005, 2)).toBe(1.01);
    expect(roundTo(2.675, 2)).toBe(2.68);
    expect(roundTo(-1.005, 2)).toBe(-1.01);
    expect(roundHalfUp(0.5)).toBe(1);
    expect(roundHalfUp(-0.5)).toBe(-1);
    expect(roundHalfUp(1.4999999)).toBe(1);
  });
  it('rounds half to even', () => {
    expect(roundHalfEven(0.5)).toBe(0);
    expect(roundHalfEven(1.5)).toBe(2);
    expect(roundHalfEven(2.5)).toBe(2);
    expect(roundHalfEven(2.51)).toBe(3);
  });
  it('converts to and from minor units exactly', () => {
    expect(toMinor(0.1 + 0.2, 2)).toBe(30);
    expect(toMinor(1234.565, 2)).toBe(123457);
    expect(fromMinor(123457, 2)).toBe(1234.57);
    expect(toMinor(1500, 0)).toBe(1500);
  });
  it('clean() removes float noise', () => {
    expect(clean(0.1 + 0.2)).toBe(0.3);
    expect(clean(1.1 * 3)).toBe(3.3);
  });
  it('minor-unit sums are exact (property)', () => {
    fc.assert(
      fc.property(fc.array(fc.integer({ min: 0, max: 1e9 }), { maxLength: 400 }), (cents) => {
        const total = cents.reduce((a, b) => a + b, 0);
        return Number.isSafeInteger(total) && toMinor(fromMinor(total, 2), 2) === total;
      }),
    );
  });
});
