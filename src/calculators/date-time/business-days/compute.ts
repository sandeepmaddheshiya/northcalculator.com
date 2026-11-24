import type { ComputeFn, ComputeResult, Step } from '@/calculators/types';
import {
  formatISODate,
  fromDayNumber,
  isoWeekday,
  parseISODate,
  toDayNumber,
  type CivilDate,
} from '@/engine/dates';

/**
 * Business days: calendar days minus weekend days minus listed holidays that fall on a working
 * day. Counting includes both the start and the end date. Adding N business days starts the
 * count on the day after the start date (N = 0 returns the start date if it is a working day,
 * otherwise the next one); negative N counts backwards. Weekday numbering per ISO 8601
 * (Monday first). Holidays are whatever the user lists; the default is the US federal list.
 */
const WEEKENDS: Record<string, readonly number[]> = {
  satSun: [5, 6], // isoWeekday: Monday = 0
  friSat: [4, 5],
  sun: [6],
  none: [],
};
const MAX_SPAN = 366 * 200;

export function parseHolidays(raw: string): { days: Set<number>; bad: string[] } {
  const days = new Set<number>();
  const bad: string[] = [];
  for (const tok of raw.split(/[\s,;]+/).filter(Boolean)) {
    const c = parseISODate(tok);
    if (c) days.add(toDayNumber(c));
    else bad.push(tok);
  }
  return { days, bad };
}

export const compute: ComputeFn = (inputs, { fmt }) => {
  const weekend = new Set(WEEKENDS[String(inputs.weekend)] ?? WEEKENDS.satSun);
  const { days: holidays, bad } = parseHolidays(
    typeof inputs.holidays === 'string' ? inputs.holidays : '',
  );
  const start = typeof inputs.start === 'string' ? parseISODate(inputs.start) : null;
  const none = (key?: string): ComputeResult => ({
    outputs: { result: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  if (!start) return none();
  const isWeekend = (dn: number) => weekend.has(isoWeekday(fromDayNumber(dn)));
  const working = (dn: number) => !isWeekend(dn) && !holidays.has(dn);
  const warnings: ComputeResult['warnings'] = [];
  if (bad.length)
    warnings.push({
      key: 'warn.badHoliday',
      values: { list: bad.slice(0, 5).join(', '), n: bad.length },
      level: 'info',
    });

  if (inputs.mode === 'add') {
    const n = typeof inputs.days === 'number' ? Math.trunc(inputs.days) : null;
    if (n === null) return none();
    let dn = toDayNumber(start);
    let left = Math.abs(n);
    const step = n < 0 ? -1 : 1;
    let calendar = 0;
    if (n === 0) while (!working(dn)) dn++;
    while (left > 0) {
      dn += step;
      calendar++;
      if (working(dn)) left--;
      if (calendar > MAX_SPAN) return none('warn.span');
    }
    const result = formatISODate(fromDayNumber(dn));
    return {
      outputs: {
        result,
        calendar: Math.abs(dn - toDayNumber(start)),
        weekendDays: null,
        holidaysOff: null,
      },
      explain: {
        key: n < 0 ? 'explain.addBack' : 'explain.add',
        values: {
          n: fmt.int(Math.abs(n)),
          start: fmt.date(formatISODate(start)),
          date: fmt.date(result),
        },
      },
      steps: [{ key: 'step.add', values: { n: fmt.int(Math.abs(n)) } }],
      warnings,
    };
  }

  let end = typeof inputs.end === 'string' ? parseISODate(inputs.end) : null;
  if (!end) return none();
  let a: CivilDate = start;
  if (toDayNumber(end) < toDayNumber(a)) {
    [a, end] = [end, a];
    warnings.push({ key: 'warn.swapped', level: 'info' });
  }
  const from = toDayNumber(a);
  const to = toDayNumber(end);
  if (to - from > MAX_SPAN) return none('warn.span');
  let weekendDays = 0;
  let holidaysOff = 0;
  for (let dn = from; dn <= to; dn++) {
    if (isWeekend(dn)) weekendDays++;
    else if (holidays.has(dn)) holidaysOff++;
  }
  const calendar = to - from + 1;
  const result = calendar - weekendDays - holidaysOff;
  const steps: Step[] = [
    {
      key: 'step.calendar',
      math: `${fmt.date(formatISODate(a))} → ${fmt.date(formatISODate(end))}: ${fmt.int(calendar)}`,
    },
    {
      key: 'step.subtract',
      math: `${fmt.int(calendar)} − ${fmt.int(weekendDays)} − ${fmt.int(holidaysOff)} = ${fmt.int(result)}`,
    },
  ];
  return {
    outputs: { result, calendar, weekendDays, holidaysOff },
    explain: {
      key: 'explain.count',
      values: {
        n: fmt.int(result),
        a: fmt.date(formatISODate(a)),
        b: fmt.date(formatISODate(end)),
      },
    },
    steps,
    warnings,
  };
};
