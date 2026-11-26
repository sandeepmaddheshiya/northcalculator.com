import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean } from '@/engine/money';
import { K } from '@/calculators/electronics/coulomb/compute';

/**
 * Electric potential of a point charge (or outside a charged sphere), V = kQ/r (OpenStax College
 * Physics 2e Eq. 19.38; University Physics Vol. 2 Eq. 7.8), with the field E = k|Q|/r² (College
 * Physics Eq. 18.13). Solves for V from Q, or Q = rV/k from a voltage. A test charge q at that
 * point has potential energy U = qV and feels F = qE. k = 1/(4πε₀), CODATA 2022.
 */
const CHARGE = { C: 1, uC: 1e-6, nC: 1e-9, pC: 1e-12 } as const;
const DIST = { m: 1, cm: 1e-2, mm: 1e-3 } as const;
const pick = <T extends Record<string, number>>(map: T, v: unknown, d: keyof T): keyof T =>
  typeof v === 'string' && v in map ? (v as keyof T) : d;

export const compute: ComputeFn = (inputs, { fmt }) => {
  const num = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const none = (key?: string): ComputeResult => ({
    outputs: { result: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  const rIn = num('r');
  if (rIn === null) return none();
  if (!(rIn > 0)) return none('warn.r');
  const r = rIn * DIST[pick(DIST, inputs.ru, 'cm')];
  const cu = pick(CHARGE, inputs.qu, 'nC');
  const findQ = inputs.find === 'q';
  let Q: number;
  let V: number;
  if (findQ) {
    const v = num('v');
    if (v === null) return none();
    V = v;
    Q = (r * V) / K;
  } else {
    const q = num('q');
    if (q === null) return none();
    Q = q * CHARGE[cu];
    V = (K * Q) / r;
  }
  const E = (K * Math.abs(Q)) / (r * r);
  const t = num('test');
  const qt = t === null || t === 0 ? null : t * CHARGE[pick(CHARGE, inputs.tu, 'uC')];
  const s = (x: number) => fmt.sig(clean(x), 6);

  return {
    outputs: {
      result: clean(findQ ? Q / CHARGE[cu] : V),
      v: clean(V),
      e: clean(E),
      q: clean(Q),
      u: qt === null ? null : clean(qt * V),
      f: qt === null ? null : clean(Math.abs(qt) * E),
    },
    explain: {
      key: findQ ? 'explain.q' : 'explain.v',
      values: { v: s(V), q: s(Q), r: s(r) },
    },
    steps: [
      findQ
        ? { key: 'step.q', math: `${s(r)} m × ${s(V)} V ÷ ${s(K)} = ${s(Q)} C` }
        : { key: 'step.v', math: `${s(K)} × ${s(Q)} C ÷ ${s(r)} m = ${s(V)} V` },
      { key: 'step.e', math: `${s(K)} × ${s(Math.abs(Q))} ÷ ${s(r)}² = ${s(E)} N/C` },
      ...(qt === null
        ? []
        : [{ key: 'step.u', math: `U = ${s(qt)} C × ${s(V)} V = ${s(qt * V)} J` }]),
    ],
    warnings: [],
  };
};
