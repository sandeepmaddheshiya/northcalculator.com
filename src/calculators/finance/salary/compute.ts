import type { ComputeFn, ComputeResult, Step } from '@/calculators/types';
import { fromMinor, minorDigits, roundHalfUp, toMinor } from '@/engine/money';
import { PERIODS, type Period } from './definition';

/**
 * Pay converter. The entered amount is turned into an annual figure (amount × periods per year),
 * and every other period is that annual figure ÷ its periods per year, rounded half-up to the
 * smallest currency unit (OPM's rule for hourly rates). Periods per year:
 *   hour = hours/week × weeks/year,  day = days/week × weeks/year,  week = weeks/year,
 *   biweek = weeks/year ÷ 2,  semimonth = 24,  month = 12,  year = 1.
 * With 40 hours and 52.175 weeks this is OPM's 2,087-hour divisor.
 */
export const compute: ComputeFn = (inputs, { fmt }) => {
  const num = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const amount = num('amount');
  const hours = num('hours');
  const days = num('days') ?? 5;
  const weeks = num('weeks') ?? 52;
  const per = (PERIODS as readonly string[]).includes(String(inputs.per))
    ? (inputs.per as Period)
    : 'hour';
  if (amount === null || hours === null || hours <= 0 || days <= 0 || weeks <= 0) {
    const none: ComputeResult = { outputs: { result: null }, steps: [], warnings: [] };
    return none;
  }
  const perYear: Record<Period, number> = {
    hour: hours * weeks,
    day: days * weeks,
    week: weeks,
    biweek: weeks / 2,
    semimonth: 24,
    month: 12,
    year: 1,
  };
  const d = minorDigits(fmt.currency);
  const annualMinor = toMinor(amount, d) * perYear[per]; // exact until the final rounding
  const values = Object.fromEntries(
    PERIODS.map((p) => [p, fromMinor(roundHalfUp(annualMinor / perYear[p]), d)]),
  ) as Record<Period, number>;

  const headline: Period = per === 'year' ? 'hour' : 'year';
  const steps: Step[] = [];
  if (per !== 'year')
    steps.push({
      key: `step.toYear.${per}`,
      values: { n: fmt.num(perYear[per], 3) },
      math: `${fmt.money(amount)} × ${fmt.num(perYear[per], 3)} = ${fmt.money(values.year)}`,
    });
  steps.push({
    key: 'step.hoursYear',
    math: `${fmt.num(hours, 2)} × ${fmt.num(weeks, 3)} = ${fmt.num(perYear.hour, 3)}`,
  });
  steps.push({
    key: 'step.fromYear',
    math: `${fmt.money(fromMinor(annualMinor, d), d + 2)} ÷ ${fmt.num(perYear.hour, 3)} = ${fmt.money(values.hour)}`,
  });

  const warnings: ComputeResult['warnings'] = [];
  if (hours > 60) warnings.push({ key: 'warn.hours', level: 'info' });
  if (hours > days * 24) warnings.push({ key: 'warn.days', level: 'warn' });

  return {
    outputs: {
      result: values[headline],
      ...Object.fromEntries(
        PERIODS.map((p) => [p, p === headline || p === per ? null : values[p]]),
      ),
    },
    explain: {
      key: 'explain',
      values: {
        hour: fmt.money(values.hour),
        year: fmt.money(values.year),
        hours: fmt.num(hours, 2),
        weeks: fmt.num(weeks, 3),
      },
    },
    steps,
    warnings,
  };
};
