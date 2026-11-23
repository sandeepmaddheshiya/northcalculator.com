import type { ComputeFn, ComputeResult, Step } from '@/calculators/types';
import {
  addDays,
  addMonths,
  formatISODate,
  isoWeek,
  isoWeekday,
  parseISODate,
  toDayNumber,
  type CivilDate,
} from '@/engine/dates';

/**
 * Adds or subtracts years, months, weeks and days from a calendar date. Years and months are applied
 * first, keeping the day of the month and clamping to the month's length (31 Jan + 1 month =
 * 28 Feb), then weeks and days, matching Python's dateutil.relativedelta. In business-day mode the
 * days count only Monday–Friday (public holidays are not removed).
 */
function addBusinessDays(c: CivilDate, n: number, sign: 1 | -1): CivilDate {
  let d = c;
  let left = n;
  while (left > 0) {
    d = addDays(d, sign);
    if (isoWeekday(d) < 5) left--;
  }
  return d;
}

export const compute: ComputeFn = (inputs, { fmt }) => {
  const start = typeof inputs.start === 'string' ? parseISODate(inputs.start) : null;
  const n = (k: string) => (typeof inputs[k] === 'number' ? Math.round(inputs[k] as number) : 0);
  if (!start) {
    const none: ComputeResult = { outputs: { result: null }, steps: [], warnings: [] };
    return none;
  }
  const sign: 1 | -1 = inputs.op === 'sub' ? -1 : 1;
  const months = n('years') * 12 + n('months');
  const plainDays = n('weeks') * 7 + (inputs.business === true ? 0 : n('days'));
  const steps: Step[] = [];
  let d = start;
  if (months) {
    d = addMonths(d, sign * months);
    steps.push({
      key: 'step.months',
      math: `${fmt.date(formatISODate(start))} ${sign > 0 ? '+' : '−'} ${fmt.int(months)} → ${fmt.date(formatISODate(d))}`,
    });
  }
  if (plainDays) {
    const before = d;
    d = addDays(d, sign * plainDays);
    steps.push({
      key: 'step.days',
      math: `${fmt.date(formatISODate(before))} ${sign > 0 ? '+' : '−'} ${fmt.int(plainDays)} → ${fmt.date(formatISODate(d))}`,
    });
  }
  if (inputs.business === true && n('days') > 0) {
    if (n('days') > 20000)
      return {
        outputs: { result: null },
        steps: [],
        warnings: [{ key: 'warn.tooMany', level: 'warn' }],
      };
    const before = d;
    d = addBusinessDays(d, n('days'), sign);
    steps.push({
      key: 'step.business',
      math: `${fmt.date(formatISODate(before))} ${sign > 0 ? '+' : '−'} ${fmt.int(n('days'))} → ${fmt.date(formatISODate(d))}`,
    });
  }
  const iso = formatISODate(d);
  const wk = isoWeek(d);
  const weekday = new Intl.DateTimeFormat(fmt.locale, { weekday: 'long', timeZone: 'UTC' }).format(
    new Date(Date.UTC(d.y, d.m - 1, d.d, 12)),
  );
  const clamped = months > 0 && d.d !== start.d && n('days') === 0 && n('weeks') === 0;
  return {
    outputs: {
      result: iso,
      weekday,
      offset: toDayNumber(d) - toDayNumber(start),
      isoWeek: `${wk.year}-W${String(wk.week).padStart(2, '0')}`,
    },
    explain: { key: 'explain', values: { date: fmt.date(iso), weekday } },
    steps,
    warnings: clamped ? [{ key: 'warn.clamped', level: 'info' }] : [],
  };
};
