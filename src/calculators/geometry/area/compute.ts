import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean } from '@/engine/money';

/**
 * Areas of common shapes (OpenStax Prealgebra 2e §9.4–9.5): rectangle LW, triangle ½bh,
 * trapezoid ½h(b + B), circle πr², parallelogram bh. Perimeter where the inputs determine it
 * (rectangle 2L + 2W, circle 2πr). Full-precision π; results keep 12 significant digits.
 */
export const compute: ComputeFn = (inputs, { fmt }) => {
  const n = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const shape = String(inputs.shape ?? 'rectangle');
  const a = n('a');
  const b = n('b');
  const c = n('c');
  const none = (): ComputeResult => ({ outputs: { area: null }, steps: [], warnings: [] });
  const s = (x: number) => fmt.sig(x, 10);
  let area: number;
  let perimeter: number | null = null;
  let math: string;
  switch (shape) {
    case 'circle':
      if (a === null) return none();
      area = Math.PI * a * a;
      perimeter = 2 * Math.PI * a;
      math = `π × ${s(a)}² = ${s(clean(area))}`;
      break;
    case 'triangle':
      if (a === null || b === null) return none();
      area = (a * b) / 2;
      math = `½ × ${s(a)} × ${s(b)} = ${s(clean(area))}`;
      break;
    case 'trapezoid':
      if (a === null || b === null || c === null) return none();
      area = (a * (b + c)) / 2;
      math = `½ × ${s(a)} × (${s(b)} + ${s(c)}) = ${s(clean(area))}`;
      break;
    case 'parallelogram':
      if (a === null || b === null) return none();
      area = a * b;
      math = `${s(a)} × ${s(b)} = ${s(clean(area))}`;
      break;
    default:
      if (a === null || b === null) return none();
      area = a * b;
      perimeter = 2 * (a + b);
      math = `${s(a)} × ${s(b)} = ${s(clean(area))}`;
  }
  return {
    outputs: { area: clean(area), perimeter: perimeter === null ? null : clean(perimeter) },
    explain: { key: `explain.${shape}`, values: { area: s(clean(area)) } },
    steps: [{ key: `step.${shape}`, math }],
    warnings:
      shape === 'circle'
        ? [{ key: 'warn.pi', values: { book: fmt.num(clean(3.14 * a! * a!), 4) }, level: 'info' }]
        : [],
  };
};
