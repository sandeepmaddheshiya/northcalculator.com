import type { ComputeContext, ComputeFn, ComputeResult } from '@/calculators/types';
import {
  addDays,
  compareDates,
  diffYMD,
  formatISODate,
  parseISODate,
  toDayNumber,
} from '@/engine/dates';
import { weekdaysFrom } from '../date-difference/compute';

/**
 * Days until (or since) a date: the difference between two civil dates (no time zones, ADR-005),
 * counting the days after the start date up to and including the target, as Python's
 * date subtraction does. Weekdays are Monday–Friday among those days.
 */
function plural(ctx: ComputeContext, unit: string, n: number): string {
  const t = ctx.t ?? ((k: string) => k);
  const key = `unit.${unit}.${new Intl.PluralRules(ctx.fmt.locale).select(n)}`;
  const s = t(key, { n: ctx.fmt.int(n) });
  return s === key ? t(`unit.${unit}.other`, { n: ctx.fmt.int(n) }) : s;
}

export const compute: ComputeFn = (inputs, ctx) => {
  const { fmt } = ctx;
  const from = typeof inputs.from === 'string' ? parseISODate(inputs.from) : null;
  const target = typeof inputs.target === 'string' ? parseISODate(inputs.target) : null;
  if (!from || !target) {
    const none: ComputeResult = { outputs: { days: null }, steps: [], warnings: [] };
    return none;
  }
  const past = compareDates(target, from) < 0;
  const [a, b] = past ? [target, from] : [from, target];
  const days = toDayNumber(b) - toDayNumber(a);
  const weekdays = weekdaysFrom(addDays(a, 1), days);
  const { years, months, days: dd } = diffYMD(a, b);
  const ymd = [
    years ? plural(ctx, 'year', years) : '',
    months ? plural(ctx, 'month', months) : '',
    dd || (!years && !months) ? plural(ctx, 'day', dd) : '',
  ]
    .filter(Boolean)
    .join(', ');
  const weeks = [
    Math.floor(days / 7) ? plural(ctx, 'week', Math.floor(days / 7)) : '',
    days % 7 || days < 7 ? plural(ctx, 'day', days % 7) : '',
  ]
    .filter(Boolean)
    .join(', ');
  return {
    outputs: { days, weeks, ymd, weekdays, weekendsLeft: days - weekdays },
    explain: {
      key: days === 0 ? 'explain.today' : past ? 'explain.since' : 'explain.until',
      values: {
        n: plural(ctx, 'day', days),
        date: fmt.date(formatISODate(target)),
        from: fmt.date(formatISODate(from)),
      },
    },
    steps: [
      {
        key: 'step.subtract',
        math: `${formatISODate(b)} − ${formatISODate(a)} = ${fmt.int(toDayNumber(b))} − ${fmt.int(toDayNumber(a))} = ${fmt.int(days)}`,
      },
      {
        key: 'step.weeks',
        math: `${fmt.int(days)} = 7 × ${fmt.int(Math.floor(days / 7))} + ${days % 7}`,
      },
    ],
    warnings: past ? [{ key: 'warn.past', level: 'info' }] : [],
  };
};
