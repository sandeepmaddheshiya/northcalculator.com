import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean, roundTo } from '@/engine/money';

/**
 * Right triangles (OpenStax Prealgebra 2e §9.3): a² + b² = c², so c = √(a² + b²) and a missing leg
 * is √(c² − a²). Also the area ½ab, the perimeter and the angle opposite leg a (atan, in degrees).
 */
export const compute: ComputeFn = (inputs, { fmt }) => {
  const a = typeof inputs.a === 'number' ? inputs.a : null;
  const b = typeof inputs.b === 'number' ? inputs.b : null;
  const findC = inputs.find !== 'leg';
  const none = (key?: string): ComputeResult => ({
    outputs: { result: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  if (a === null || b === null || a <= 0 || b <= 0) return none();
  const leg1 = a;
  let leg2: number;
  let hyp: number;
  if (findC) {
    leg2 = b;
    hyp = Math.hypot(a, b);
  } else {
    if (b <= a) return none('warn.hyp');
    hyp = b;
    leg2 = Math.sqrt((b - a) * (b + a)); // factored form avoids cancellation
  }
  const result = clean(findC ? hyp : leg2);
  const s = (x: number) => fmt.sig(clean(x), 10);
  return {
    outputs: {
      result,
      area: clean((leg1 * leg2) / 2),
      perimeter: clean(leg1 + leg2 + hyp),
      angleA: roundTo((Math.atan2(leg1, leg2) * 180) / Math.PI, 6),
    },
    explain: { key: findC ? 'explain.c' : 'explain.leg', values: { r: s(result) } },
    steps: findC
      ? [
          {
            key: 'step.c',
            math: `c = √(${s(a)}² + ${s(b)}²) = √${s(a * a + b * b)} = ${s(result)}`,
          },
        ]
      : [
          {
            key: 'step.leg',
            math: `b = √(${s(hyp)}² − ${s(a)}²) = √${s(hyp * hyp - a * a)} = ${s(result)}`,
          },
        ],
    warnings: [],
  };
};
