import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean } from '@/engine/money';

/**
 * Capacitor charge and energy: Q = CV and E = ½CV² = ½QV = Q²/2C (OpenStax College Physics 2e
 * §19.5, 19.7; University Physics Vol. 2 §8.1, 8.3), solved for energy, capacitance or voltage.
 * The capacitance result is given in the chosen unit; charge in coulombs, energy in joules.
 */
const F = { F: 1, mF: 1e-3, uF: 1e-6, nF: 1e-9, pF: 1e-12 } as const;

export const compute: ComputeFn = (inputs, { fmt }) => {
  const val = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const find = inputs.find === 'capacitance' || inputs.find === 'voltage' ? inputs.find : 'energy';
  const cu = typeof inputs.cu === 'string' && inputs.cu in F ? (inputs.cu as keyof typeof F) : 'uF';
  const none = (key?: string): ComputeResult => ({
    outputs: { result: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  let c: number;
  let v: number;
  let e: number;
  const s = (x: number) => fmt.sig(clean(x), 8);
  if (find === 'energy') {
    const a = val('c');
    const b = val('v');
    if (a === null || b === null) return none();
    [c, v] = [a * F[cu], b];
    e = 0.5 * c * v * v;
  } else if (find === 'capacitance') {
    const a = val('v');
    const b = val('e');
    if (a === null || b === null) return none();
    if (!(a > 0)) return none('warn.zero');
    [v, e] = [a, b];
    c = (2 * e) / (v * v);
  } else {
    const a = val('c');
    const b = val('e');
    if (a === null || b === null) return none();
    if (!(a > 0)) return none('warn.zero');
    [c, e] = [a * F[cu], b];
    v = Math.sqrt((2 * e) / c);
  }
  const q = c * v;
  return {
    outputs: {
      result: clean(find === 'energy' ? e : find === 'capacitance' ? c / F[cu] : v),
      charge: clean(q),
      joules: clean(e),
      farads: clean(c),
    },
    explain: { key: 'explain', values: { c: s(c), v: s(v), q: s(q), e: s(e) } },
    steps: [
      find === 'energy'
        ? { key: 'step.energy', math: `½ × ${s(c)} F × ${s(v)}² = ${s(e)} J` }
        : find === 'capacitance'
          ? { key: 'step.capacitance', math: `2 × ${s(e)} ÷ ${s(v)}² = ${s(c)} F` }
          : { key: 'step.voltage', math: `√(2 × ${s(e)} ÷ ${s(c)}) = ${s(v)} V` },
      { key: 'step.charge', math: `${s(c)} F × ${s(v)} V = ${s(q)} C` },
    ],
    warnings: [],
  };
};
