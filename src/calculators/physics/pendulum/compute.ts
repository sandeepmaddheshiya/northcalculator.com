import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean } from '@/engine/money';

/**
 * Simple pendulum (small swings, under about 15°): T = 2π√(L/g), so L = gT²/(4π²) and
 * g = 4π²L/T² (OpenStax College Physics 2e §16.4; University Physics Vol. 1 §15.4).
 * The period does not depend on the bob’s mass.
 */
export const compute: ComputeFn = (inputs, { fmt }) => {
  const val = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const find = inputs.find === 'length' || inputs.find === 'g' ? inputs.find : 'period';
  const none = (key?: string): ComputeResult => ({
    outputs: { result: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  let l: number;
  let t: number;
  let g: number;
  const s = (x: number) => fmt.sig(clean(x), 8);
  if (find === 'period') {
    const a = val('length');
    const b = val('g');
    if (a === null || b === null) return none();
    if (!(b > 0)) return none('warn.g');
    [l, g] = [a, b];
    t = 2 * Math.PI * Math.sqrt(l / g);
  } else if (find === 'length') {
    const a = val('period');
    const b = val('g');
    if (a === null || b === null) return none();
    [t, g] = [a, b];
    l = (g * t * t) / (4 * Math.PI ** 2);
  } else {
    const a = val('length');
    const b = val('period');
    if (a === null || b === null) return none();
    if (!(b > 0)) return none('warn.period');
    [l, t] = [a, b];
    g = (4 * Math.PI ** 2 * l) / (t * t);
  }
  return {
    outputs: {
      result: clean(find === 'period' ? t : find === 'length' ? l : g),
      frequency: t > 0 ? clean(1 / t) : null,
      perMinute: t > 0 ? clean(60 / t) : null,
    },
    explain: { key: 'explain', values: { l: s(l), t: s(t), g: s(g) } },
    steps: [
      find === 'period'
        ? { key: 'step.period', math: `2π√(${s(l)} ÷ ${s(g)}) = ${s(t)} s` }
        : find === 'length'
          ? { key: 'step.length', math: `${s(g)} × ${s(t)}² ÷ (4π²) = ${s(l)} m` }
          : { key: 'step.g', math: `4π² × ${s(l)} ÷ ${s(t)}² = ${s(g)} m/s²` },
    ],
    warnings: [],
  };
};
