import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean } from '@/engine/money';

/**
 * Two events (OpenStax Contemporary Mathematics §7.8; Introductory Statistics 2e §3.2–3.3):
 *   P(A and B) = P(A)·P(B) if independent; 0 if mutually exclusive; or as given
 *   P(A or B)  = P(A) + P(B) − P(A and B)          (inclusion–exclusion)
 *   P(not A)   = 1 − P(A); neither = 1 − P(A or B); exactly one = P(A or B) − P(A and B)
 */
export const compute: ComputeFn = (inputs, { fmt }) => {
  const n = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const a = n('pa');
  const b = n('pb');
  const rel = String(inputs.relation ?? 'independent');
  const none = (key?: string): ComputeResult => ({
    outputs: { or: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  if (a === null || b === null) return none();
  if (a < 0 || a > 1 || b < 0 || b > 1) return none('warn.range');
  let and: number;
  if (rel === 'exclusive') {
    if (a + b > 1 + 1e-12) return none('warn.exclusive');
    and = 0;
  } else if (rel === 'given') {
    const g = n('pab');
    if (g === null) return none();
    if (g > Math.min(a, b) + 1e-12 || g < a + b - 1 - 1e-12) return none('warn.given');
    and = g;
  } else and = a * b;
  const or = a + b - and;
  const s = (x: number) => fmt.sig(clean(x), 10);
  return {
    outputs: {
      or: clean(or),
      and: clean(and),
      notA: clean(1 - a),
      notB: clean(1 - b),
      neither: clean(1 - or),
      exactlyOne: clean(or - and),
    },
    explain: {
      key: 'explain',
      values: { or: s(or), and: s(and), pct: fmt.pct(clean(or * 100), 2) },
    },
    steps: [
      {
        key: `step.and.${rel}`,
        math: rel === 'independent' ? `${s(a)} × ${s(b)} = ${s(and)}` : `P(A and B) = ${s(and)}`,
      },
      { key: 'step.or', math: `${s(a)} + ${s(b)} − ${s(and)} = ${s(or)}` },
    ],
    warnings: [],
  };
};
