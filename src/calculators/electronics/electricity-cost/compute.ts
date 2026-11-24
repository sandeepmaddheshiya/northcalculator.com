import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean, fromMinor, minorDigits, roundHalfUp, roundTo } from '@/engine/money';

/**
 * Energy = power × time (OpenStax College Physics 2e Eq. 20.34): kWh = watts × hours ÷ 1000,
 * and cost = kWh × price per kWh. The total is rounded half-up to the smallest currency unit;
 * per-day and per-hour figures keep 4 decimals because they are often fractions of a cent.
 * Rates may have more decimals than the currency (e.g. 16.5¢), so they are not pre-rounded.
 */
export const compute: ComputeFn = (inputs, { fmt }) => {
  const val = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const w = val('power');
  const hours = val('hours');
  const days = val('days');
  const rate = val('rate');
  const none = (key?: string): ComputeResult => ({
    outputs: { cost: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  if (w === null || hours === null || days === null || rate === null) return none();
  if (hours > 24) return none('warn.hours');
  const kw = inputs.powerUnit === 'kW' ? w : w / 1000;
  const kwh = clean(kw * hours * days);
  const d = minorDigits(fmt.currency);
  const money = (x: number) => fromMinor(roundHalfUp(roundTo(x * 10 ** d, 6)), d);
  const cost = money(kwh * rate);
  const perDayKwh = kw * hours;
  const rd = Math.min(4, Math.max(d, (String(rate).split('.')[1] ?? '').length));
  return {
    outputs: {
      cost,
      kwh,
      perDay: roundTo(perDayKwh * rate, 4),
      perHour: roundTo(kw * rate, 4),
      perYear: days === 365 ? null : money(perDayKwh * 365 * rate),
    },
    explain: {
      key: 'explain',
      values: { kwh: fmt.sig(kwh, 8), cost: fmt.money(cost), days: fmt.num(days, 2) },
    },
    steps: [
      {
        key: 'step.kwh',
        math: `${fmt.sig(kw, 8)} kW × ${fmt.num(hours, 4)} h × ${fmt.num(days, 4)} = ${fmt.sig(kwh, 8)} kWh`,
      },
      {
        key: 'step.cost',
        math: `${fmt.sig(kwh, 8)} kWh × ${fmt.money(rate, rd)} = ${fmt.money(cost)}`,
      },
    ],
    warnings: [],
  };
};
