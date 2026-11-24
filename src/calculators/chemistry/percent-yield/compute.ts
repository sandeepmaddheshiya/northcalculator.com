import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean } from '@/engine/money';

/**
 * Percent yield = actual yield ÷ theoretical yield × 100% (OpenStax Chemistry 2e §4.4;
 * LibreTexts Introductory Chemistry §8.7), solved for any one of the three. Both yields must
 * use the same unit (grams, moles, …). “Lost” is theoretical − actual.
 */
export const compute: ComputeFn = (inputs, { fmt }) => {
  const val = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const find = inputs.find === 'actual' || inputs.find === 'theoretical' ? inputs.find : 'percent';
  const none = (key?: string): ComputeResult => ({
    outputs: { result: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  let a: number;
  let th: number;
  let p: number;
  if (find === 'percent') {
    const x = val('actual');
    const y = val('theoretical');
    if (x === null || y === null) return none();
    if (!(y > 0)) return none('warn.theoretical');
    [a, th] = [x, y];
    p = (a / th) * 100;
  } else if (find === 'actual') {
    const y = val('theoretical');
    const z = val('percent');
    if (y === null || z === null) return none();
    [th, p] = [y, z];
    a = (p / 100) * th;
  } else {
    const x = val('actual');
    const z = val('percent');
    if (x === null || z === null) return none();
    if (!(z > 0)) return none('warn.percent');
    [a, p] = [x, z];
    th = a / (p / 100);
  }
  const s = (x: number) => fmt.sig(clean(x), 8);
  return {
    outputs: {
      result: clean(find === 'percent' ? p : find === 'actual' ? a : th),
      lost: clean(th - a),
    },
    explain: { key: 'explain', values: { a: s(a), th: s(th), p: s(p) } },
    steps: [
      find === 'percent'
        ? { key: 'step.percent', math: `${s(a)} ÷ ${s(th)} × 100 = ${s(p)}%` }
        : find === 'actual'
          ? { key: 'step.actual', math: `${s(p)}% × ${s(th)} = ${s(a)}` }
          : { key: 'step.theoretical', math: `${s(a)} ÷ ${s(p)}% = ${s(th)}` },
    ],
    warnings: p > 100 + 1e-9 ? [{ key: 'warn.over', level: 'warn' }] : [],
  };
};
