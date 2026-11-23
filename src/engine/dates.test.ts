import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import {
  addDays,
  addMonths,
  anniversary,
  diffYMD,
  fromDayNumber,
  isLeapYear,
  isoWeek,
  isoWeekday,
  parseISODate,
  toDayNumber,
  formatISODate,
} from './dates';

const D = (s: string) => parseISODate(s)!;

describe('dates', () => {
  it('leap years follow the Gregorian rule', () => {
    expect([1900, 2000, 2024, 2023, 2100].map(isLeapYear)).toEqual([
      false,
      true,
      true,
      false,
      false,
    ]);
  });
  it('day numbers match the Unix epoch', () => {
    expect(toDayNumber(D('1970-01-01'))).toBe(0);
    expect(toDayNumber(D('2000-03-01'))).toBe(11017);
    expect(toDayNumber(D('1969-12-31'))).toBe(-1);
    // Cross-check against JS Date in UTC for a modern date.
    expect(toDayNumber(D('2026-11-23'))).toBe(Date.UTC(2026, 10, 23) / 86400000);
  });
  it('day numbers round-trip (property)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -1_000_000, max: 1_000_000 }),
        (n) => toDayNumber(fromDayNumber(n)) === n,
      ),
    );
  });
  it('agrees with Date.UTC across 1600–2400 (property)', () => {
    fc.assert(
      fc.property(fc.integer({ min: -135000, max: 157000 }), (n) => {
        const c = fromDayNumber(n);
        const dt = new Date(n * 86400000);
        return (
          dt.getUTCFullYear() === c.y && dt.getUTCMonth() + 1 === c.m && dt.getUTCDate() === c.d
        );
      }),
    );
  });
  it('rejects invalid dates', () => {
    expect(parseISODate('2023-02-29')).toBeNull();
    expect(parseISODate('2024-02-29')).not.toBeNull();
    expect(parseISODate('2024-13-01')).toBeNull();
    expect(parseISODate('nope')).toBeNull();
  });
  it('adds days and months', () => {
    expect(formatISODate(addDays(D('2024-02-28'), 1))).toBe('2024-02-29');
    expect(formatISODate(addDays(D('2023-12-31'), 1))).toBe('2024-01-01');
    expect(formatISODate(addMonths(D('2024-01-31'), 1))).toBe('2024-02-29');
    expect(formatISODate(addMonths(D('2023-01-31'), 1))).toBe('2023-02-28');
    expect(formatISODate(addMonths(D('2024-11-15'), -12))).toBe('2023-11-15');
  });
  it('ISO weekday and week numbers (ISO 8601 reference cases)', () => {
    expect(isoWeekday(D('2026-11-23'))).toBe(0); // Monday
    expect(isoWeek(D('2005-01-01'))).toEqual({ year: 2004, week: 53 });
    expect(isoWeek(D('2008-12-29'))).toEqual({ year: 2009, week: 1 });
    expect(isoWeek(D('2010-01-03'))).toEqual({ year: 2009, week: 53 });
    expect(isoWeek(D('2026-11-23'))).toEqual({ year: 2026, week: 48 });
  });
  it('leap-day anniversaries follow the chosen rule', () => {
    expect(anniversary(D('2000-02-29'), 2023, 'feb28')).toEqual(D('2023-02-28'));
    expect(anniversary(D('2000-02-29'), 2023, 'mar1')).toEqual(D('2023-03-01'));
    expect(anniversary(D('2000-02-29'), 2024)).toEqual(D('2024-02-29'));
  });
  it('diffYMD counts whole years, months, then days', () => {
    expect(diffYMD(D('1990-05-15'), D('2026-11-23'))).toEqual({ years: 36, months: 6, days: 8 });
    // Month steps clamp to month end: 31 Jan + 1 month = 29 Feb (same convention as date-fns).
    expect(diffYMD(D('2000-01-31'), D('2000-02-29'))).toEqual({ years: 0, months: 1, days: 0 });
    expect(diffYMD(D('2000-01-31'), D('2000-02-28'))).toEqual({ years: 0, months: 0, days: 28 });
    expect(diffYMD(D('2000-01-31'), D('2000-03-01'))).toEqual({ years: 0, months: 1, days: 1 });
    expect(diffYMD(D('2024-03-10'), D('2024-03-10'))).toEqual({ years: 0, months: 0, days: 0 });
    expect(diffYMD(D('2000-02-29'), D('2023-02-28'), 'feb28').years).toBe(23);
    expect(diffYMD(D('2000-02-29'), D('2023-02-28'), 'mar1').years).toBe(22);
    expect(() => diffYMD(D('2024-01-02'), D('2024-01-01'))).toThrow();
  });
  it('diffYMD reconstructs the end date (property)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 40000 }),
        fc.integer({ min: 0, max: 40000 }),
        (a, len) => {
          const s = fromDayNumber(a),
            e = fromDayNumber(a + len);
          const { years, months, days } = diffYMD(s, e);
          const base = addMonths(s, years * 12 + months);
          return (
            months < 12 && days >= 0 && days < 31 && toDayNumber(base) + days === toDayNumber(e)
          );
        },
      ),
      { numRuns: 2000 },
    );
  });
});

describe('diffYMD regression: 29 February with the 1 March rule', () => {
  it('never reports 12 months', () => {
    expect(diffYMD(D('2000-02-29'), D('2025-02-28'), 'mar1')).toEqual({
      years: 24,
      months: 11,
      days: 30,
    });
    expect(diffYMD(D('2000-02-29'), D('2025-03-01'), 'mar1')).toEqual({
      years: 25,
      months: 0,
      days: 0,
    });
  });
});
