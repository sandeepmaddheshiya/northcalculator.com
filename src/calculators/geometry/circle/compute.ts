import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean } from '@/engine/money';

/**
 * Circle from any one measurement (OpenStax Prealgebra 2e §9.5): d = 2r, C = 2πr, A = πr², so
 * r = d ÷ 2 = C ÷ 2π = √(A ÷ π). Full-precision π; 12 significant digits kept.
 */
export const compute: ComputeFn = (inputs, { fmt }) => {
  const v = typeof inputs.value === 'number' ? inputs.value : null;
  const known = String(inputs.known ?? 'r');
  if (v === null || v < 0) {
    const none: ComputeResult = { outputs: { area: null }, steps: [], warnings: [] };
    return none;
  }
  const r =
    known === 'd'
      ? v / 2
      : known === 'c'
        ? v / (2 * Math.PI)
        : known === 'a'
          ? Math.sqrt(v / Math.PI)
          : v;
  const area = Math.PI * r * r;
  const c = 2 * Math.PI * r;
  const s = (x: number) => fmt.sig(clean(x), 10);
  return {
    outputs: {
      area: clean(area),
      radius: clean(r),
      diameter: clean(2 * r),
      circumference: clean(c),
    },
    explain: { key: 'explain', values: { r: s(r), a: s(area), c: s(c) } },
    steps: [
      ...(known === 'r' ? [] : [{ key: `step.r.${known}`, math: `r = ${s(r)}` }]),
      { key: 'step.c', math: `C = 2 × π × ${s(r)} = ${s(c)}` },
      { key: 'step.a', math: `A = π × ${s(r)}² = ${s(area)}` },
    ],
    warnings: [
      {
        key: 'warn.pi',
        values: { a: fmt.num(clean(3.14 * r * r), 4), c: fmt.num(clean(2 * 3.14 * r), 4) },
        level: 'info',
      },
    ],
  };
};
