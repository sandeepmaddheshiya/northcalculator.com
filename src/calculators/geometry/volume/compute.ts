import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean } from '@/engine/money';

/**
 * Volume and surface area (OpenStax Prealgebra 2e §9.6): box LWH and 2(LW + LH + WH); cube s³ and
 * 6s²; cylinder πr²h and 2πr² + 2πrh; sphere ⁴⁄₃πr³ and 4πr²; cone ⅓πr²h and πr(r + √(r² + h²)).
 * Full-precision π; 12 significant digits kept.
 */
export const compute: ComputeFn = (inputs, { fmt }) => {
  const n = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const shape = String(inputs.shape ?? 'box');
  const a = n('a');
  const b = n('b');
  const c = n('c');
  const none = (): ComputeResult => ({ outputs: { volume: null }, steps: [], warnings: [] });
  const s = (x: number) => fmt.sig(clean(x), 10);
  let v: number;
  let sa: number;
  let math: string;
  const P = Math.PI;
  switch (shape) {
    case 'cube':
      if (a === null) return none();
      v = a ** 3;
      sa = 6 * a * a;
      math = `${s(a)}³ = ${s(v)}`;
      break;
    case 'cylinder':
      if (a === null || b === null) return none();
      v = P * a * a * b;
      sa = 2 * P * a * a + 2 * P * a * b;
      math = `π × ${s(a)}² × ${s(b)} = ${s(v)}`;
      break;
    case 'sphere':
      if (a === null) return none();
      v = (4 / 3) * P * a ** 3;
      sa = 4 * P * a * a;
      math = `4/3 × π × ${s(a)}³ = ${s(v)}`;
      break;
    case 'cone':
      if (a === null || b === null) return none();
      v = (P * a * a * b) / 3;
      sa = P * a * (a + Math.hypot(a, b));
      math = `1/3 × π × ${s(a)}² × ${s(b)} = ${s(v)}`;
      break;
    default:
      if (a === null || b === null || c === null) return none();
      v = a * b * c;
      sa = 2 * (a * b + a * c + b * c);
      math = `${s(a)} × ${s(b)} × ${s(c)} = ${s(v)}`;
  }
  const round = ['cylinder', 'sphere', 'cone'].includes(shape);
  return {
    outputs: { volume: clean(v), surface: clean(sa) },
    explain: { key: 'explain', values: { v: s(v), sa: s(sa) } },
    steps: [{ key: `step.${shape}`, math }],
    warnings: round
      ? [{ key: 'warn.pi', values: { v: fmt.num(clean((v * 3.14) / P), 4) }, level: 'info' }]
      : [],
  };
};
