import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean } from '@/engine/money';

/**
 * Hooke’s law |F| = kx and stored energy ½kx² (OpenStax College Physics 2e §16.1; University
 * Physics Vol. 1 §7.1), solved for force, spring constant or extension. With a mass m on the
 * spring, the oscillation period is T = 2π√(m/k) and f = 1/T (University Physics §15.1).
 * Magnitudes only: the restoring force points against the displacement.
 */
export const compute: ComputeFn = (inputs, { fmt }) => {
  const val = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const find = inputs.find === 'force' || inputs.find === 'x' ? inputs.find : 'k';
  const none = (key?: string): ComputeResult => ({
    outputs: { result: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  let f: number;
  let k: number;
  let x: number;
  if (find === 'force') {
    const a = val('k');
    const b = val('x');
    if (a === null || b === null) return none();
    [k, x] = [a, b];
    f = k * x;
  } else if (find === 'k') {
    const a = val('force');
    const b = val('x');
    if (a === null || b === null) return none();
    if (!(b > 0)) return none('warn.x');
    [f, x] = [a, b];
    k = f / x;
  } else {
    const a = val('force');
    const b = val('k');
    if (a === null || b === null) return none();
    if (!(b > 0)) return none('warn.k');
    [f, k] = [a, b];
    x = f / k;
  }
  const m = val('mass');
  const period = m !== null && m > 0 && k > 0 ? 2 * Math.PI * Math.sqrt(m / k) : null;
  const pe = 0.5 * k * x * x;
  const s = (v: number) => fmt.sig(clean(v), 8);
  return {
    outputs: {
      result: clean(find === 'force' ? f : find === 'k' ? k : x),
      energy: clean(pe),
      period: period === null ? null : clean(period),
      frequency: period === null ? null : clean(1 / period),
    },
    explain: { key: 'explain', values: { k: s(k), x: s(x), f: s(f), e: s(pe) } },
    steps: [
      find === 'force'
        ? { key: 'step.force', math: `${s(k)} × ${s(x)} = ${s(f)} N` }
        : find === 'k'
          ? { key: 'step.k', math: `${s(f)} ÷ ${s(x)} = ${s(k)} N/m` }
          : { key: 'step.x', math: `${s(f)} ÷ ${s(k)} = ${s(x)} m` },
      { key: 'step.energy', math: `½ × ${s(k)} × ${s(x)}² = ${s(pe)} J` },
      ...(period === null
        ? []
        : [{ key: 'step.period', math: `2π√(${s(m!)} ÷ ${s(k)}) = ${s(period)} s` }]),
    ],
    warnings: [],
  };
};
