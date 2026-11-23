import type { ComputeContext, ComputeFn, ComputeResult } from '@/calculators/types';
import {
  compareDates,
  diffYMD,
  isoWeekday,
  parseISODate,
  toDayNumber,
  type CivilDate,
} from '@/engine/dates';

/**
 * Days between two calendar dates (ADR-005: civil dates, so time zones and DST can't shift the
 * count). By default the start date is counted and the end date is not, like subtracting dates;
 * "include the end date" adds one. Weekdays are Monday–Friday; public holidays are not removed.
 */
function plural(ctx: ComputeContext, unit: string, n: number): string {
  const t = ctx.t ?? ((k: string) => k);
  const key = `unit.${unit}.${new Intl.PluralRules(ctx.fmt.locale).select(n)}`;
  const s = t(key, { n: ctx.fmt.int(n) });
  return s === key ? t(`unit.${unit}.other`, { n: ctx.fmt.int(n) }) : s;
}

/** Monday–Friday days in [a, a + n) without looping over every day. */
export function weekdaysFrom(a: CivilDate, n: number): number {
  const full = Math.floor(n / 7);
  let count = full * 5;
  const startDow = isoWeekday(a); // 0 = Monday
  for (let k = 0; k < n % 7; k++) if ((startDow + k) % 7 < 5) count++;
  return count;
}

export const compute: ComputeFn = (inputs, ctx) => {
  const { fmt } = ctx;
  const t = ctx.t ?? ((k: string) => k);
  let a = typeof inputs.start === 'string' ? parseISODate(inputs.start) : null;
  let b = typeof inputs.end === 'string' ? parseISODate(inputs.end) : null;
  if (!a || !b) {
    const none: ComputeResult = { outputs: { days: null }, steps: [], warnings: [] };
    return none;
  }
  const swapped = compareDates(b, a) < 0;
  if (swapped) [a, b] = [b, a];
  const inclusive = inputs.inclusive === true;
  const raw = toDayNumber(b) - toDayNumber(a);
  const days = raw + (inclusive ? 1 : 0);
  const weekdays = weekdaysFrom(a, days);
  const { years, months, days: dd } = diffYMD(a, b);
  const ymd = [
    years ? plural(ctx, 'year', years) : '',
    months ? plural(ctx, 'month', months) : '',
    plural(ctx, 'day', dd),
  ]
    .filter(Boolean)
    .join(', ');
  return {
    outputs: {
      days,
      weeks: t('fmt.weeks', {
        w: plural(ctx, 'week', Math.floor(days / 7)),
        d: plural(ctx, 'day', days % 7),
      }),
      ymd: inclusive ? `${ymd} ${t('fmt.plusOne')}` : ymd,
      weekdays,
      weekend: days - weekdays,
      hours: days * 24,
    },
    explain: {
      key: inclusive ? 'explain.inclusive' : 'explain',
      values: {
        days: plural(ctx, 'day', days),
        from: fmt.date(inputs.start as string),
        to: fmt.date(inputs.end as string),
      },
    },
    steps: [
      {
        key: 'step.dayNumbers',
        math: `${fmt.int(toDayNumber(b))} − ${fmt.int(toDayNumber(a))} = ${fmt.int(raw)}`,
      },
      ...(inclusive
        ? [{ key: 'step.inclusive', math: `${fmt.int(raw)} + 1 = ${fmt.int(days)}` }]
        : []),
      {
        key: 'step.weekdays',
        math: `${fmt.int(Math.floor(days / 7))} × 5 + ${fmt.int(weekdays - Math.floor(days / 7) * 5)} = ${fmt.int(weekdays)}`,
      },
    ],
    warnings: swapped ? [{ key: 'warn.swapped', level: 'info' }] : [],
  };
};
