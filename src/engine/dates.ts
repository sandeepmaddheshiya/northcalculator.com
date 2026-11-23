/**
 * Calendar-date arithmetic on the proleptic Gregorian calendar (ADR-005).
 * Dates are plain {y, m, d} values; no time zones or DST can shift results.
 * Day numbers use Howard Hinnant's days-from-civil algorithm (exact for any year).
 */
export interface CivilDate {
  y: number;
  m: number; // 1–12
  d: number; // 1–31
}

export function isLeapYear(y: number): boolean {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}

export function daysInMonth(y: number, m: number): number {
  return [31, isLeapYear(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1]!;
}

export function isValidDate(c: CivilDate): boolean {
  return (
    Number.isInteger(c.y) &&
    Number.isInteger(c.m) &&
    Number.isInteger(c.d) &&
    c.m >= 1 &&
    c.m <= 12 &&
    c.d >= 1 &&
    c.d <= daysInMonth(c.y, c.m)
  );
}

export function parseISODate(s: string): CivilDate | null {
  const m = /^(-?\d{1,6})-(\d{2})-(\d{2})$/.exec(s.trim());
  if (!m) return null;
  const c = { y: Number(m[1]), m: Number(m[2]), d: Number(m[3]) };
  return isValidDate(c) ? c : null;
}

export function formatISODate(c: CivilDate): string {
  const y = c.y < 0 ? `-${String(-c.y).padStart(4, '0')}` : String(c.y).padStart(4, '0');
  return `${y}-${String(c.m).padStart(2, '0')}-${String(c.d).padStart(2, '0')}`;
}

/** Days since 1970-01-01 (may be negative). */
export function toDayNumber({ y, m, d }: CivilDate): number {
  const yy = m <= 2 ? y - 1 : y;
  const era = Math.floor(yy / 400);
  const yoe = yy - era * 400;
  const doy = Math.floor((153 * (m + (m > 2 ? -3 : 9)) + 2) / 5) + d - 1;
  const doe = yoe * 365 + Math.floor(yoe / 4) - Math.floor(yoe / 100) + doy;
  return era * 146097 + doe - 719468;
}

export function fromDayNumber(z: number): CivilDate {
  const zz = z + 719468;
  const era = Math.floor(zz / 146097);
  const doe = zz - era * 146097;
  const yoe = Math.floor(
    (doe - Math.floor(doe / 1460) + Math.floor(doe / 36524) - Math.floor(doe / 146096)) / 365,
  );
  const doy = doe - (365 * yoe + Math.floor(yoe / 4) - Math.floor(yoe / 100));
  const mp = Math.floor((5 * doy + 2) / 153);
  const d = doy - Math.floor((153 * mp + 2) / 5) + 1;
  const m = mp < 10 ? mp + 3 : mp - 9;
  return { y: era * 400 + yoe + (m <= 2 ? 1 : 0), m, d };
}

export function compareDates(a: CivilDate, b: CivilDate): number {
  return toDayNumber(a) - toDayNumber(b);
}

export function addDays(c: CivilDate, n: number): CivilDate {
  return fromDayNumber(toDayNumber(c) + n);
}

/** Add months, clamping the day to the target month's length (Jan 31 + 1 month = Feb 28/29). */
export function addMonths(c: CivilDate, n: number): CivilDate {
  const total = c.y * 12 + (c.m - 1) + n;
  const y = Math.floor(total / 12);
  const m = total - y * 12 + 1;
  return { y, m, d: Math.min(c.d, daysInMonth(y, m)) };
}

/** 0 = Monday … 6 = Sunday (ISO 8601 order; the ISO day number is this value + 1). */
export function isoWeekday(c: CivilDate): number {
  return (((toDayNumber(c) + 3) % 7) + 7) % 7;
}

/** ISO 8601 week-numbering year and week. */
export function isoWeek(c: CivilDate): { year: number; week: number } {
  const dn = toDayNumber(c);
  const thursday = dn - isoWeekday(c) + 3;
  const year = fromDayNumber(thursday).y;
  const jan1 = toDayNumber({ y: year, m: 1, d: 1 });
  return { year, week: Math.floor((thursday - jan1) / 7) + 1 };
}

export type LeapBirthdayRule = 'feb28' | 'mar1';

/**
 * The anniversary of `start` in year `y`. A 29 February start in a common year falls on
 * 28 February or 1 March depending on `rule` (jurisdictions differ; see the age calculator).
 */
export function anniversary(
  start: CivilDate,
  y: number,
  rule: LeapBirthdayRule = 'feb28',
): CivilDate {
  if (start.m === 2 && start.d === 29 && !isLeapYear(y))
    return rule === 'feb28' ? { y, m: 2, d: 28 } : { y, m: 3, d: 1 };
  return { y, m: start.m, d: start.d };
}

/**
 * Whole years, months and days from `a` to `b` (a ≤ b), counting complete calendar months
 * first and then remaining days. Months clamp to month length (Jan 31 → Feb 28 is 1 m 0 d).
 */
export function diffYMD(
  a: CivilDate,
  b: CivilDate,
  rule: LeapBirthdayRule = 'feb28',
): { years: number; months: number; days: number } {
  if (compareDates(b, a) < 0) throw new RangeError('end before start');
  let years = b.y - a.y;
  if (compareDates(anniversary(a, b.y, rule), b) > 0) years--;
  const base = anniversary(a, a.y + years, rule);
  // Month marks after the last birthday keep the birth day-of-month, clamped to each month's
  // length. Mark 0 is the birthday itself (which may have moved to 28 Feb or 1 Mar).
  const mark = (k: number): CivilDate => {
    if (k === 0) return base;
    const t = addMonths({ y: base.y, m: base.m, d: 1 }, k);
    return { ...t, d: Math.min(a.d, daysInMonth(t.y, t.m)) };
  };
  // At most 11: a twelfth month would be a full year, which the year count already decides.
  let months = 0;
  while (months < 11 && compareDates(mark(months + 1), b) <= 0) months++;
  return { years, months, days: toDayNumber(b) - toDayNumber(mark(months)) };
}
