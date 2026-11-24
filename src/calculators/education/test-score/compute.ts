import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { roundTo } from '@/engine/money';
import { letterFor } from '../grade/compute';

/**
 * Test score = points earned ÷ points possible × 100 (the percent proportion, OpenStax Prealgebra
 * 2e §6.5). Entering the number wrong gives points earned = total − wrong (one point per
 * question). Letter on the common 90/80/70/60 scale, shared with the grade calculator.
 */
export const compute: ComputeFn = (inputs, { fmt }) => {
  const total = typeof inputs.total === 'number' ? inputs.total : null;
  const n = typeof inputs.n === 'number' ? inputs.n : null;
  const none = (key?: string): ComputeResult => ({
    outputs: { percent: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  if (total === null || n === null) return none();
  if (total <= 0) return none('warn.total');
  const right = inputs.mode === 'right' ? n : total - n;
  if (right < 0) return none('warn.tooManyWrong');
  const percent = roundTo((right / total) * 100, 4);
  const warnings: ComputeResult['warnings'] = [];
  if (right > total) warnings.push({ key: 'warn.extra', level: 'info' });
  return {
    outputs: {
      percent,
      letter: letterFor(percent),
      right: roundTo(right, 6),
      wrong: roundTo(total - right, 6),
      perItem: roundTo(100 / total, 6),
    },
    explain: {
      key: 'explain',
      values: {
        right: fmt.num(right, 4),
        total: fmt.num(total, 4),
        p: fmt.pct(percent, 2),
        l: letterFor(percent),
      },
    },
    steps: [
      ...(inputs.mode === 'right'
        ? []
        : [
            {
              key: 'step.right',
              math: `${fmt.num(total, 4)} − ${fmt.num(n, 4)} = ${fmt.num(right, 4)}`,
            },
          ]),
      {
        key: 'step.percent',
        math: `${fmt.num(right, 4)} ÷ ${fmt.num(total, 4)} × 100 = ${fmt.pct(percent, 4)}`,
      },
    ],
    warnings,
  };
};
