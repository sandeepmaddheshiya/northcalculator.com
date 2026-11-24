import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean, roundTo } from '@/engine/money';

/**
 * Percent difference = |a − b| ÷ ((a + b) ÷ 2) × 100, for two values on an equal footing.
 * Percent error = |measured − accepted| ÷ |accepted| × 100, when one value is the reference.
 * (LibreTexts CK-12 Introductory Chemistry §3.13; Texas A&M–Corpus Christi physics lab.) Rounded to 4 decimal places.
 */
export const compute: ComputeFn = (inputs, { fmt }) => {
  const num = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const a = num('a');
  const b = num('b');
  const error = inputs.mode === 'error';
  const none = (key?: string): ComputeResult => ({
    outputs: { result: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  if (a === null || b === null) return none();
  const diff = clean(Math.abs(a - b));
  const warnings: ComputeResult['warnings'] = [];
  if (error) {
    if (b === 0) return none('warn.zeroAccepted');
    const result = roundTo((diff / Math.abs(b)) * 100, 4);
    return {
      outputs: { result, diff, mean: null },
      explain: {
        key: 'explain.error',
        values: { a: fmt.num(a, 8), b: fmt.num(b, 8), r: fmt.pct(result, 2) },
      },
      steps: [
        { key: 'step.diff', math: `|${fmt.num(a, 8)} − ${fmt.num(b, 8)}| = ${fmt.num(diff, 8)}` },
        {
          key: 'step.divideAccepted',
          math: `${fmt.num(diff, 8)} ÷ ${fmt.num(Math.abs(b), 8)} × 100 = ${fmt.pct(result, 4)}`,
        },
      ],
      warnings,
    };
  }
  const mean = clean((a + b) / 2);
  if (mean === 0) return none('warn.zeroMean');
  if (a < 0 || b < 0) warnings.push({ key: 'warn.negative', level: 'info' });
  const result = roundTo((diff / Math.abs(mean)) * 100, 4);
  return {
    outputs: { result, diff, mean },
    explain: {
      key: 'explain.difference',
      values: { a: fmt.num(a, 8), b: fmt.num(b, 8), r: fmt.pct(result, 2) },
    },
    steps: [
      { key: 'step.diff', math: `|${fmt.num(a, 8)} − ${fmt.num(b, 8)}| = ${fmt.num(diff, 8)}` },
      { key: 'step.mean', math: `(${fmt.num(a, 8)} + ${fmt.num(b, 8)}) ÷ 2 = ${fmt.num(mean, 8)}` },
      {
        key: 'step.divideMean',
        math: `${fmt.num(diff, 8)} ÷ ${fmt.num(Math.abs(mean), 8)} × 100 = ${fmt.pct(result, 4)}`,
      },
    ],
    warnings,
  };
};
