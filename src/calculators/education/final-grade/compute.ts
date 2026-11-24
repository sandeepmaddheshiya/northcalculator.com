import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { roundTo } from '@/engine/money';

/**
 * Score needed on a final worth w of the course grade, given the grade so far on the rest:
 *   final grade = current × (1 − w) + exam × w   ⇒   exam = (target − current × (1 − w)) ÷ w
 * This is the weighted-grade formula (Illinois CITL; CSU Chico) solved for the last component.
 * Percentages are rounded to 4 decimal places and shown to 2.
 */
const LETTERS = [
  ['A', 90],
  ['B', 80],
  ['C', 70],
  ['D', 60],
] as const;

export const compute: ComputeFn = (inputs, { fmt }) => {
  const num = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const current = num('current');
  const target = num('target');
  const weightPct = num('weight');
  if (
    current === null ||
    target === null ||
    weightPct === null ||
    weightPct <= 0 ||
    weightPct > 100
  ) {
    const none: ComputeResult = { outputs: { needed: null }, steps: [], warnings: [] };
    return none;
  }
  const w = weightPct / 100;
  const need = (t: number) => roundTo((t - current * (1 - w)) / w, 4);
  const needed = need(target);
  const ifPerfect = roundTo(current * (1 - w) + 100 * w, 4);
  const ifZero = roundTo(current * (1 - w), 4);

  const warnings: ComputeResult['warnings'] = [];
  let key = 'explain';
  if (needed > 100) {
    warnings.push({ key: 'warn.over100', values: { best: fmt.pct(ifPerfect, 2) }, level: 'warn' });
    key = 'explain.over';
  } else if (needed <= 0) {
    warnings.push({ key: 'warn.secured', level: 'info' });
    key = 'explain.secured';
  }
  return {
    outputs: { needed, ifPerfect, ifZero },
    explain: {
      key,
      values: {
        n: fmt.pct(Math.max(needed, 0), 2),
        t: fmt.pct(target, 2),
        w: fmt.pct(weightPct, 2),
      },
    },
    steps: [
      {
        key: 'step.kept',
        math: `${fmt.num(current, 4)}% × (1 − ${fmt.num(w, 4)}) = ${fmt.num(ifZero, 4)}%`,
      },
      {
        key: 'step.gap',
        math: `${fmt.num(target, 4)}% − ${fmt.num(ifZero, 4)}% = ${fmt.num(roundTo(target - ifZero, 4), 4)}%`,
      },
      {
        key: 'step.divide',
        math: `${fmt.num(roundTo(target - ifZero, 4), 4)} ÷ ${fmt.num(w, 4)} = ${fmt.num(needed, 4)}%`,
      },
    ],
    table: {
      captionKey: 'table.caption',
      columns: [
        { key: 'table.letter', format: 'text' },
        { key: 'table.target', format: 'percent' },
        { key: 'table.needed', format: 'percent' },
      ],
      rows: LETTERS.map(([l, t]) => [l, t, need(t)]),
    },
    warnings,
  };
};
