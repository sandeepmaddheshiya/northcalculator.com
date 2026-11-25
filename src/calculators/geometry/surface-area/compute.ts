import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean } from '@/engine/money';

/**
 * Surface area (OpenStax Prealgebra 2e §9.6; Contemporary Mathematics §10.7):
 *   box 2LW + 2LH + 2WH; cube 6s²; cylinder 2πr² + 2πrh; sphere 4πr².
 * “Lateral” is the area without the top and bottom (box sides, cylinder wall). The full value of
 * π is used; Prealgebra rounds π to 3.14, and the page shows that comparison for round shapes.
 */
export const compute: ComputeFn = (inputs, { fmt }) => {
  const val = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const shape = ['cube', 'cylinder', 'sphere'].includes(String(inputs.shape))
    ? String(inputs.shape)
    : 'box';
  const none = (key?: string): ComputeResult => ({
    outputs: { total: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  const n = (x: number) => fmt.sig(clean(x), 10);
  let total: number;
  let lateral: number | null;
  let base: number | null;
  let volume: number;
  let math: string;
  let pi314: number | null = null;
  if (shape === 'box') {
    const [l, w, h] = [val('length'), val('width'), val('height')];
    if (l === null || w === null || h === null) return none();
    total = 2 * (l * w + l * h + w * h);
    lateral = 2 * h * (l + w);
    base = l * w;
    volume = l * w * h;
    math = `2(${n(l)} × ${n(w)}) + 2(${n(l)} × ${n(h)}) + 2(${n(w)} × ${n(h)}) = ${n(total)}`;
  } else if (shape === 'cube') {
    const s = val('side');
    if (s === null) return none();
    total = 6 * s * s;
    lateral = 4 * s * s;
    base = s * s;
    volume = s ** 3;
    math = `6 × ${n(s)}² = ${n(total)}`;
  } else if (shape === 'cylinder') {
    const [r, h] = [val('radius'), val('height')];
    if (r === null || h === null) return none();
    total = 2 * Math.PI * r * r + 2 * Math.PI * r * h;
    lateral = 2 * Math.PI * r * h;
    base = Math.PI * r * r;
    volume = Math.PI * r * r * h;
    pi314 = 2 * 3.14 * r * r + 2 * 3.14 * r * h;
    math = `2π × ${n(r)}² + 2π × ${n(r)} × ${n(h)} = ${n(total)}`;
  } else {
    const r = val('radius');
    if (r === null) return none();
    total = 4 * Math.PI * r * r;
    lateral = null;
    base = null;
    volume = (4 / 3) * Math.PI * r ** 3;
    pi314 = 4 * 3.14 * r * r;
    math = `4π × ${n(r)}² = ${n(total)}`;
  }
  return {
    outputs: {
      total: clean(total),
      lateral: lateral === null ? null : clean(lateral),
      base: base === null ? null : clean(base),
      volume: clean(volume),
    },
    explain: { key: 'explain', values: { a: n(total) } },
    steps: [{ key: `step.${shape}`, math }],
    warnings:
      pi314 === null
        ? []
        : [
            {
              key: 'warn.pi',
              level: 'info',
              values: { a: fmt.num(Math.round(pi314 * 100) / 100, 2) },
            },
          ],
  };
};
