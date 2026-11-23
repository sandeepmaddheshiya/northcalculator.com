import type { ComputeContext, ComputeFn, ComputeResult } from '@/calculators/types';
import {
  anniversary,
  compareDates,
  diffYMD,
  formatISODate,
  isoWeekday,
  parseISODate,
  toDayNumber,
  type LeapBirthdayRule,
} from '@/engine/dates';

/**
 * Age in calendar years, months and days (ADR-005: civil dates, no time zones). Whole years are
 * counted to the most recent birthday, then whole months, then the remaining days. A month step
 * keeps the birth day-of-month, clamped to the month's length (31 Jan → 28 Feb is one month).
 * For 29 February births, the birthday in common years is 28 Feb or 1 Mar, chosen by the user.
 */
function plural(ctx: ComputeContext, unit: string, n: number): string {
  const t = ctx.t ?? ((k: string) => k);
  const cat = new Intl.PluralRules(ctx.fmt.locale).select(n);
  const key = `unit.${unit}.${cat}`;
  const s = t(key, { n: ctx.fmt.int(n) });
  return s === key ? t(`unit.${unit}.other`, { n: ctx.fmt.int(n) }) : s;
}

export const compute: ComputeFn = (inputs, ctx) => {
  const { fmt } = ctx;
  const t = ctx.t ?? ((k: string) => k);
  const dob = typeof inputs.dob === 'string' ? parseISODate(inputs.dob) : null;
  const asOf = typeof inputs.asOf === 'string' ? parseISODate(inputs.asOf) : null;
  const none = (key?: string): ComputeResult => ({
    outputs: { age: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  if (!dob || !asOf) return none();
  if (compareDates(asOf, dob) < 0) return none('warn.future');
  const rule: LeapBirthdayRule = inputs.rule === 'mar1' ? 'mar1' : 'feb28';

  const { years, months, days } = diffYMD(dob, asOf, rule);
  const totalDays = toDayNumber(asOf) - toDayNumber(dob);
  const totalMonths = years * 12 + months;
  const parts = [
    plural(ctx, 'year', years),
    plural(ctx, 'month', months),
    plural(ctx, 'day', days),
  ];
  const age = t('fmt.ymd', { y: parts[0]!, m: parts[1]!, d: parts[2]! });

  // Next birthday on or after asOf + 1 day (today's birthday shows the next one, a year away).
  let next = anniversary(dob, asOf.y, rule);
  if (compareDates(next, asOf) <= 0) next = anniversary(dob, asOf.y + 1, rule);
  const until = toDayNumber(next) - toDayNumber(asOf);
  const isBirthday = compareDates(anniversary(dob, asOf.y, rule), asOf) === 0 && totalDays > 0;
  const weekdayName = new Intl.DateTimeFormat(fmt.locale, {
    weekday: 'long',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(dob.y, dob.m - 1, dob.d, 12)));

  const lastBirthday = anniversary(dob, dob.y + years, rule);
  const monthMark = (() => {
    // The date `months` whole months after the last birthday (day clamped to month length),
    // matching diffYMD: with no whole months it is the (possibly moved) birthday itself.
    if (months === 0) return lastBirthday;
    const m0 = lastBirthday.m - 1 + months;
    const y = lastBirthday.y + Math.floor(m0 / 12);
    const m = (m0 % 12) + 1;
    const dim = new Date(Date.UTC(y, m, 0)).getUTCDate();
    return { y, m, d: Math.min(dob.d, dim) };
  })();

  const warnings: ComputeResult['warnings'] = [];
  if (dob.m === 2 && dob.d === 29) warnings.push({ key: 'warn.leap', level: 'info' });

  return {
    outputs: {
      age,
      months: totalMonths,
      weeks: t('fmt.weeks', {
        w: plural(ctx, 'week', Math.floor(totalDays / 7)),
        d: plural(ctx, 'day', totalDays % 7),
      }),
      days: totalDays,
      next: formatISODate(next),
      until,
      weekday: weekdayName,
    },
    explain: {
      key: isBirthday ? 'explain.birthday' : 'explain',
      values: {
        age,
        next: fmt.date(formatISODate(next)),
        until: plural(ctx, 'day', until),
        dob: fmt.date(formatISODate(dob)),
        weekday: weekdayName,
      },
    },
    steps: [
      {
        key: 'step.years',
        values: { n: years },
        math: `${fmt.date(formatISODate(dob))} → ${fmt.date(formatISODate(lastBirthday))} = ${plural(ctx, 'year', years)}`,
      },
      {
        key: 'step.months',
        math: `${fmt.date(formatISODate(lastBirthday))} → ${fmt.date(formatISODate(monthMark))} = ${plural(ctx, 'month', months)}`,
      },
      {
        key: 'step.days',
        math: `${fmt.date(formatISODate(monthMark))} → ${fmt.date(formatISODate(asOf))} = ${plural(ctx, 'day', days)}`,
      },
      {
        key: 'step.total',
        math: `${fmt.int(totalDays)} ÷ 7 = ${fmt.int(Math.floor(totalDays / 7))} r ${fmt.int(totalDays % 7)}`,
      },
    ],
    warnings,
  };
};

/** ISO weekday of the birth date (1 = Monday), exposed for tests. */
export const weekdayOf = (iso: string) => isoWeekday(parseISODate(iso)!) + 1;
