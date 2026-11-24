import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean, roundTo } from '@/engine/money';

/**
 * Percentage change = (new − original) ÷ |original| × 100 (OpenStax Prealgebra 2e §6.2: the
 * increase or decrease as a percent of the original amount). Dividing by the size of the original
 * keeps the sign meaningful when it is negative. The reverse change is the one that undoes it.
 * Percentages are rounded to 4 decimal places and shown to 2.
 */
export const compute: ComputeFn = (inputs, { fmt }) => {
  const num = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const a = num('from');
  const b = num('to');
  if (a === null || b === null) {
    const none: ComputeResult = { outputs: { change: null }, steps: [], warnings: [] };
    return none;
  }
  if (a === 0) {
    const none: ComputeResult = {
      outputs: { change: null, difference: clean(b - a) },
      steps: [],
      warnings: [{ key: 'warn.zero', level: 'warn' }],
    };
    return none;
  }
  const diff = clean(b - a);
  const change = roundTo((diff / Math.abs(a)) * 100, 4);
  const reverse = b !== 0 ? roundTo(((a - b) / Math.abs(b)) * 100, 4) : null;
  const warnings: ComputeResult['warnings'] = [];
  if (a < 0 || b < 0) warnings.push({ key: 'warn.negative', level: 'info' });
  const kind = change > 0 ? 'up' : change < 0 ? 'down' : 'same';
  return {
    outputs: {
      change,
      difference: diff,
      multiplier: a > 0 && b >= 0 ? clean(b / a) : null,
      reverse,
    },
    explain: {
      key: `explain.${kind}`,
      values: { a: fmt.num(a, 6), b: fmt.num(b, 6), r: fmt.pct(Math.abs(change), 2) },
    },
    steps: [
      { key: 'step.difference', math: `${fmt.num(b, 6)} − ${fmt.num(a, 6)} = ${fmt.num(diff, 6)}` },
      {
        key: 'step.divide',
        math: `${fmt.num(diff, 6)} ÷ ${fmt.num(Math.abs(a), 6)} = ${fmt.num(diff / Math.abs(a), 6)}`,
      },
      {
        key: 'step.percent',
        math: `${fmt.num(diff / Math.abs(a), 6)} × 100 = ${fmt.pct(change, 4)}`,
      },
    ],
    warnings,
  };
};
