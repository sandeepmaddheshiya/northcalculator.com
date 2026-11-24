/**
 * Clock times of day as "HH:MM" (24-hour, as HTML time inputs produce) ⇄ minutes after midnight.
 * Durations between clock times wrap past midnight: 22:00 → 06:00 is 8 hours.
 */
export function parseClock(s: string): number | null {
  const m = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(s.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59 || (m[3] !== undefined && Number(m[3]) > 59)) return null;
  return h * 60 + min + (m[3] ? Number(m[3]) / 60 : 0);
}

/** Minutes from `start` to `end`, wrapping past midnight when end is earlier (or equal = 24 h if wrap). */
export function minutesBetween(start: number, end: number, sameIsFullDay = false): number {
  const d = end - start;
  if (d > 0) return d;
  if (d === 0) return sameIsFullDay ? 1440 : 0;
  return d + 1440;
}
