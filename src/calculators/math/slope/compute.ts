import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean } from '@/engine/money';
import { simplifyRoot } from '@/calculators/math/quadratic/compute';

/**
 * For two points: slope m = (y₂ − y₁) ÷ (x₂ − x₁) (OpenStax Intermediate Algebra 2e §3.2),
 * distance √((x₂ − x₁)² + (y₂ − y₁)²) and midpoint ((x₁ + x₂)/2, (y₁ + y₂)/2) (§11.1; College
 * Algebra 2e §2.1). With whole-number coordinates the slope is also shown as a reduced fraction and
 * the distance in simplest radical form.
 */
const MINUS = '−';
const neg = (s: string) => s.replace(/^-/, MINUS);
const gcd = (a: number, b: number): number => {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a;
};
const isInt = (...xs: number[]) => xs.every((x) => Number.isInteger(x) && Math.abs(x) <= 1e6);

export const compute: ComputeFn = (inputs, ctx) => {
  const { fmt } = ctx;
  const t = ctx.t ?? ((k: string) => k);
  const val = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const [x1, y1, x2, y2] = ['x1', 'y1', 'x2', 'y2'].map(val);
  const none = (key?: string): ComputeResult => ({
    outputs: { slope: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  if (x1 == null || y1 == null || x2 == null || y2 == null) return none();
  if (x1 === x2 && y1 === y2) return none('warn.same');
  const dx = x2 - x1;
  const dy = y2 - y1;
  const n = (x: number) => neg(fmt.sig(clean(x), 8));
  const ints = isInt(x1, y1, x2, y2);

  let slope: string;
  let equation: string;
  let m: number | null = null;
  if (dx === 0) {
    slope = t('undefined');
    equation = `x = ${n(x1)}`;
  } else {
    m = dy / dx;
    const g = gcd(dy, dx) || 1;
    const [p, q] = dx < 0 ? [-dy / g, -dx / g] : [dy / g, dx / g];
    slope = ints && q !== 1 ? `${neg(String(p))}/${q} = ${n(m)}` : n(m);
    const b = y1 - m * x1;
    const mx = m === 0 ? '' : m === 1 ? 'x' : m === -1 ? `${MINUS}x` : `${n(m)}x`;
    const bb = clean(b);
    equation = `y = ${mx}${mx && bb !== 0 ? (bb > 0 ? ` + ${n(bb)}` : ` ${MINUS} ${n(-bb)}`) : mx ? '' : n(bb)}`;
  }
  const d2 = dx * dx + dy * dy;
  const d = Math.hypot(dx, dy);
  let distance = n(d);
  if (ints && !Number.isInteger(Math.sqrt(d2))) {
    const [k, r] = simplifyRoot(d2);
    distance = `${k === 1 ? '' : k}√${r} ≈ ${fmt.sig(clean(d), 9)}`;
  }
  const mid = `(${n((x1 + x2) / 2)}, ${n((y1 + y2) / 2)})`;
  // Inclination of the line, −90° to 90° (90° for a vertical line).
  const angle = m === null ? 90 : (Math.atan(m) * 180) / Math.PI;
  return {
    outputs: { slope, equation, distance, midpoint: mid, angle: clean(angle) },
    explain: {
      key: m === null ? 'explain.vertical' : 'explain',
      values: { m: m === null ? '' : n(m), d: n(d), mid },
    },
    steps: [
      {
        key: 'step.slope',
        math: `(${n(y2)} − ${n(y1)}) ÷ (${n(x2)} − ${n(x1)}) = ${n(dy)} ÷ ${n(dx)}`,
      },
      { key: 'step.distance', math: `√(${n(dx)}² + ${n(dy)}²) = √${n(d2)}` },
      {
        key: 'step.midpoint',
        math: `((${n(x1)} + ${n(x2)}) ÷ 2, (${n(y1)} + ${n(y2)}) ÷ 2) = ${mid}`,
      },
    ],
    warnings: [],
  };
};
