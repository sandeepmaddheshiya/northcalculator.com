import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { fromMinor, roundHalfUp, roundTo, toMinor } from '@/engine/money';
import cpi from './cpi.json';

/**
 * Inflation adjustment with US CPI-U annual averages (BLS, 1982–84 = 100):
 *   value in year B = amount × CPI(B) ÷ CPI(A)
 * The cumulative change is the percentage change of the index (OpenStax Principles of
 * Macroeconomics 3e §9.1) and the average yearly rate is its compound annual rate.
 */
const ANNUAL = cpi.annual as Record<string, number>;

export const compute: ComputeFn = (inputs, { fmt }) => {
  const amount = typeof inputs.amount === 'number' ? inputs.amount : null;
  const from = typeof inputs.from === 'number' ? Math.round(inputs.from) : null;
  const to = typeof inputs.to === 'number' ? Math.round(inputs.to) : null;
  const none = (key?: string): ComputeResult => ({
    outputs: { value: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn', values: { first: cpi.first, last: cpi.last } }] : [],
  });
  if (amount === null || from === null || to === null) return none();
  const a = ANNUAL[String(from)];
  const b = ANNUAL[String(to)];
  if (a === undefined || b === undefined) return none('warn.range');
  const value = fromMinor(roundHalfUp((toMinor(amount, 2) * b) / a), 2);
  const years = Math.abs(to - from);
  const ratio = b / a;
  const annual =
    years > 0 ? roundTo(((to > from ? ratio : 1 / ratio) ** (1 / years) - 1) * 100, 4) : null;
  return {
    outputs: { value, change: roundTo((ratio - 1) * 100, 4), annual, cpiFrom: a, cpiTo: b },
    explain: {
      key: to >= from ? 'explain.forward' : 'explain.back',
      values: { amount: fmt.money(amount), from, to, value: fmt.money(value) },
    },
    steps: [
      { key: 'step.ratio', math: `${fmt.num(b, 3)} ÷ ${fmt.num(a, 3)} = ${fmt.num(ratio, 6)}` },
      {
        key: 'step.value',
        math: `${fmt.money(amount)} × ${fmt.num(ratio, 6)} = ${fmt.money(value)}`,
      },
    ],
    warnings: [],
  };
};
