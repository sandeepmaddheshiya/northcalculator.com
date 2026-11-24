import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean } from '@/engine/money';

/**
 * Triangle from three sides (SSS). Area by Heron’s formula in the rearranged, rounding-safe form
 * from Corral, Elementary Trigonometry §2.4: with a ≥ b ≥ c,
 *   K = ¼ √((a + (b + c))(c − (a − b))(c + (a − b))(a + (b − c))).
 * Angles by the law of cosines (OpenStax Algebra and Trigonometry 2e §10.2): cos A = (b² + c² − a²) ÷ 2bc.
 */
export function heron(x: number, y: number, z: number): number {
  const [a, b, c] = [x, y, z].sort((p, q) => q - p) as [number, number, number];
  const p = (a + (b + c)) * (c - (a - b)) * (c + (a - b)) * (a + (b - c));
  return p > 0 ? Math.sqrt(p) / 4 : 0;
}

const angle = (a: number, b: number, c: number) => {
  const cos = (b * b + c * c - a * a) / (2 * b * c);
  return (Math.acos(Math.min(1, Math.max(-1, cos))) * 180) / Math.PI;
};

export const compute: ComputeFn = (inputs, ctx) => {
  const { fmt } = ctx;
  const t = ctx.t ?? ((k: string) => k);
  const val = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const a = val('a');
  const b = val('b');
  const c = val('c');
  const none = (key?: string): ComputeResult => ({
    outputs: { area: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  if (a === null || b === null || c === null) return none();
  if (!(a > 0 && b > 0 && c > 0)) return none('warn.zero');
  const [big, mid, small] = [a, b, c].sort((p, q) => q - p) as [number, number, number];
  if (!(mid + small > big)) return none('warn.inequality');
  const area = heron(a, b, c);
  const A = angle(a, b, c);
  const B = angle(b, a, c);
  const C = 180 - A - B;
  const s = (a + b + c) / 2;
  const sides =
    a === b && b === c ? 'equilateral' : a === b || b === c || a === c ? 'isosceles' : 'scalene';
  const diff = big * big - (mid * mid + small * small);
  const corner = Math.abs(diff) <= 1e-9 * big * big ? 'right' : diff > 0 ? 'obtuse' : 'acute';
  const n = (x: number) => fmt.sig(clean(x), 10);
  return {
    outputs: {
      area: clean(area),
      perimeter: clean(a + b + c),
      angleA: clean(A),
      angleB: clean(B),
      angleC: clean(C),
      kind: `${t(`kind.${sides}`)}, ${t(`kind.${corner}`)}`,
    },
    explain: {
      key: 'explain',
      values: { area: n(area), kind: `${t(`kind.${sides}`)} ${t(`kind.${corner}`)}`.toLowerCase() },
    },
    steps: [
      { key: 'step.s', math: `s = (${n(a)} + ${n(b)} + ${n(c)}) ÷ 2 = ${n(s)}` },
      {
        key: 'step.heron',
        math: `√(${n(s)} × ${n(s - a)} × ${n(s - b)} × ${n(s - c)}) = ${n(area)}`,
      },
      {
        key: 'step.angle',
        math: `A = cos⁻¹((${n(b)}² + ${n(c)}² − ${n(a)}²) ÷ (2 × ${n(b)} × ${n(c)})) = ${fmt.sig(clean(A), 8)}°`,
      },
      {
        key: 'step.sum',
        math: `C = 180° − ${fmt.sig(clean(A), 8)}° − ${fmt.sig(clean(B), 8)}° = ${fmt.sig(clean(C), 8)}°`,
      },
    ],
    warnings: [],
  };
};
