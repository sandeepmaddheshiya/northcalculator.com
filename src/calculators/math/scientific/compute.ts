import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { evaluate, type AngleMode } from '@/engine/expr';
import { clean } from '@/engine/money';

/**
 * Evaluates the expression with the safe recursive-descent parser (ADR-018): standard order of
 * operations, implicit multiplication (2π, 3(4)), postfix ! and %, degrees or radians.
 * Double precision (IEEE 754); the result is cleaned to 12 significant digits.
 */
export const compute: ComputeFn = (inputs) => {
  const expr = typeof inputs.expr === 'string' ? inputs.expr : '';
  const mode: AngleMode = inputs.angle === 'rad' ? 'rad' : 'deg';
  const ans = typeof inputs.ans === 'number' ? inputs.ans : 0;
  const r = evaluate(expr, { mode, ans });
  if (!r.ok) {
    const out: ComputeResult = {
      outputs: { result: null },
      steps: [],
      warnings:
        r.error === 'empty'
          ? []
          : [{ key: `err.${r.error}`, values: { at: (r.at ?? 0) + 1 }, level: 'warn' }],
    };
    return out;
  }
  const value = clean(r.value);
  return { outputs: { result: value }, steps: [], warnings: [] };
};
