import type { ComputeFn, ComputeResult } from '@/calculators/types';
import {
  addDays,
  formatISODate,
  isoWeek,
  isoWeekday,
  parseISODate,
  toDayNumber,
} from '@/engine/dates';

/**
 * Week numbers.
 * ISO 8601 (Python date.isocalendar; Excel WEEKNUM system 2): weeks run Monday–Sunday and week 1
 * is the one containing the year’s first Thursday, so early January can belong to the previous
 * week-year and late December to the next.
 * US (Excel WEEKNUM system 1, return type 1): weeks run Sunday–Saturday and week 1 is the week
 * containing January 1, so the first and last weeks may be partial.
 */
export const compute: ComputeFn = (inputs, { fmt }) => {
  const c = typeof inputs.date === 'string' ? parseISODate(inputs.date) : null;
  if (!c) {
    const none: ComputeResult = { outputs: { week: null }, steps: [], warnings: [] };
    return none;
  }
  const jan1 = { y: c.y, m: 1, d: 1 };
  const dec31 = { y: c.y, m: 12, d: 31 };
  const dayOfYear = toDayNumber(c) - toDayNumber(jan1) + 1;
  const iso = inputs.system !== 'us';

  if (iso) {
    const { year, week } = isoWeek(c);
    const monday = addDays(c, -isoWeekday(c));
    const weeks = isoWeek({ y: year, m: 12, d: 28 }).week;
    return {
      outputs: {
        week,
        weekYear: String(year),
        start: formatISODate(monday),
        end: formatISODate(addDays(monday, 6)),
        weeks,
        dayOfYear,
      },
      explain: {
        key: year === c.y ? 'explain.iso' : 'explain.isoOther',
        values: { date: fmt.date(formatISODate(c)), w: week, y: year },
      },
      steps: [
        { key: 'step.isoThursday', math: `${fmt.date(formatISODate(addDays(monday, 3)))}` },
        { key: 'step.isoCount', values: { y: year } },
      ],
      warnings: year !== c.y ? [{ key: 'warn.otherYear', values: { y: year }, level: 'info' }] : [],
    };
  }

  // US: Sunday = 0.
  const sun = (d: typeof c) => (isoWeekday(d) + 1) % 7;
  const offset = sun(jan1);
  const week = Math.floor((dayOfYear - 1 + offset) / 7) + 1;
  const weeks = Math.floor((toDayNumber(dec31) - toDayNumber(jan1) + offset) / 7) + 1;
  const sunday = addDays(c, -sun(c));
  const saturday = addDays(sunday, 6);
  const start = toDayNumber(sunday) < toDayNumber(jan1) ? jan1 : sunday;
  const end = toDayNumber(saturday) > toDayNumber(dec31) ? dec31 : saturday;
  return {
    outputs: {
      week,
      weekYear: String(c.y),
      start: formatISODate(start),
      end: formatISODate(end),
      weeks,
      dayOfYear,
    },
    explain: { key: 'explain.us', values: { date: fmt.date(formatISODate(c)), w: week, y: c.y } },
    steps: [
      { key: 'step.usJan1', values: { n: offset } },
      { key: 'step.usCount', math: `⌊(${dayOfYear} − 1 + ${offset}) ÷ 7⌋ + 1 = ${week}` },
    ],
    warnings: week === 1 || week === weeks ? [{ key: 'warn.partial', level: 'info' }] : [],
  };
};
