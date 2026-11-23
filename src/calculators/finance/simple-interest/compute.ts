import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { fromMinor, minorDigits, roundHalfUp, toMinor } from '@/engine/money';

/**
 * Simple interest I = P × r × t (OpenStax Contemporary Mathematics §6.3). Time in months is t =
 * months ÷ 12; time in days is t = days ÷ 365, or ÷ 360 under the "banker's rule" some lenders use.
 * Interest is rounded half-up to the smallest currency unit.
 */
export const compute: ComputeFn = (inputs, { fmt }) => {
  const num = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const P = num('principal');
  const rate = num('rate');
  const time = num('time');
  if (P === null || rate === null || time === null) {
    const none: ComputeResult = { outputs: { interest: null }, steps: [], warnings: [] };
    return none;
  }
  const d = minorDigits(fmt.currency);
  const m = (x: number) => fromMinor(x, d);
  const basis = inputs.basis === '360' ? 360 : 365;
  const years = inputs.unit === 'm' ? time / 12 : inputs.unit === 'd' ? time / basis : time;
  const Pm = toMinor(P, d);
  const I = roundHalfUp(Pm * (rate / 100) * years);
  const tMath =
    inputs.unit === 'm'
      ? `${fmt.num(time, 4)} ÷ 12 = ${fmt.num(years, 6)}`
      : inputs.unit === 'd'
        ? `${fmt.num(time, 4)} ÷ ${basis} = ${fmt.num(years, 6)}`
        : `${fmt.num(years, 6)}`;
  return {
    outputs: { interest: m(I), total: m(Pm + I), years: inputs.unit === 'y' ? null : years },
    explain: { key: 'explain', values: { i: fmt.money(m(I)), total: fmt.money(m(Pm + I)) } },
    steps: [
      { key: 'step.rate', math: `${fmt.pct(rate, 3)} = ${fmt.num(rate / 100, 6)}` },
      { key: 'step.time', math: `t = ${tMath}` },
      {
        key: 'step.interest',
        math: `${fmt.money(P)} × ${fmt.num(rate / 100, 6)} × ${fmt.num(years, 6)} = ${fmt.money(m(I))}`,
      },
      { key: 'step.total', math: `${fmt.money(P)} + ${fmt.money(m(I))} = ${fmt.money(m(Pm + I))}` },
    ],
    warnings: [],
  };
};
