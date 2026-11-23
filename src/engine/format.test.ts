import { describe, expect, it } from 'vitest';
import { formatNumber, formatLocaleFor } from './format';

describe('formatNumber', () => {
  it('groups by locale', () => {
    expect(formatNumber(1234567.891, 'en-US', { decimals: 2 })).toBe('1,234,567.89');
    expect(formatNumber(1234567.891, 'en-IN', { decimals: 2 })).toBe('12,34,567.89');
    expect(formatNumber(1234567.891, 'de', { decimals: 2 })).toBe('1.234.567,89');
  });
  it('formats currency', () => {
    expect(formatNumber(1500, 'en-US', { kind: 'currency', currency: 'USD', decimals: 2 })).toBe(
      '$1,500.00',
    );
    expect(formatNumber(150000, 'en-IN', { kind: 'currency', currency: 'INR', decimals: 0 })).toBe(
      '₹1,50,000',
    );
  });
  it('formats percent values given in percent units', () => {
    expect(formatNumber(15, 'en', { kind: 'percent', maxDecimals: 2 })).toBe('15%');
    expect(formatNumber(12.5, 'en', { kind: 'percent', maxDecimals: 2 })).toBe('12.5%');
  });
  it('uses a true minus sign and never prints -0', () => {
    expect(formatNumber(-5, 'en')).toBe('−5');
    expect(formatNumber(-0, 'en')).toBe('0');
  });
  it('defaults to Latin digits, native on request', () => {
    expect(formatNumber(123, 'ar-EG')).toBe('123');
    expect(formatNumber(123, 'ar-EG', { digits: 'native' })).toBe('١٢٣');
  });
  it('handles non-finite', () => {
    expect(formatNumber(Infinity, 'en')).toBe('∞');
    expect(formatNumber(NaN, 'en')).toBe('—');
  });
  it('significant digits', () => {
    expect(formatNumber(0.000123456, 'en', { significant: 3 })).toBe('0.000123');
  });
  it('region-aware english', () => {
    expect(formatLocaleFor('en', 'in')).toBe('en-IN');
    expect(formatLocaleFor('en', null)).toBe('en');
  });
});
