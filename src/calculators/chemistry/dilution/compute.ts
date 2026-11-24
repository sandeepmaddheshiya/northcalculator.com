import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean } from '@/engine/money';

/**
 * Dilution: the moles of solute are unchanged, so C₁V₁ = C₂V₂ (OpenStax Chemistry 2e §3.3;
 * LibreTexts Introductory Chemistry §13.7). Solve for whichever quantity is unknown. Units are
 * whatever the user enters, as long as both concentrations and both volumes share a unit.
 * Solvent to add = V₂ − V₁; dilution factor = C₁ ÷ C₂ = V₂ ÷ V₁.
 */
type Q = 'c1' | 'v1' | 'c2' | 'v2';
const ALL: readonly Q[] = ['c1', 'v1', 'c2', 'v2'];

export const compute: ComputeFn = (inputs, { fmt }) => {
  const find: Q = (ALL as readonly string[]).includes(String(inputs.find))
    ? (inputs.find as Q)
    : 'v1';
  const val = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const none = (key?: string): ComputeResult => ({
    outputs: { result: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  const q: Record<Q, number> = { c1: 0, v1: 0, c2: 0, v2: 0 };
  for (const k of ALL) {
    if (k === find) continue;
    const x = val(k);
    if (x === null) return none();
    if (!(x > 0)) return none('warn.zero');
    q[k] = x;
  }
  if (find === 'c1') q.c1 = (q.c2 * q.v2) / q.v1;
  else if (find === 'v1') q.v1 = (q.c2 * q.v2) / q.c1;
  else if (find === 'c2') q.c2 = (q.c1 * q.v1) / q.v2;
  else q.v2 = (q.c1 * q.v1) / q.c2;
  const s = (x: number) => fmt.sig(clean(x), 8);
  const concentrating = q.c2 > q.c1 * (1 + 1e-12);
  const formula = {
    c1: `C₁ = ${s(q.c2)} × ${s(q.v2)} ÷ ${s(q.v1)}`,
    v1: `V₁ = ${s(q.c2)} × ${s(q.v2)} ÷ ${s(q.c1)}`,
    c2: `C₂ = ${s(q.c1)} × ${s(q.v1)} ÷ ${s(q.v2)}`,
    v2: `V₂ = ${s(q.c1)} × ${s(q.v1)} ÷ ${s(q.c2)}`,
  }[find];
  return {
    outputs: {
      result: clean(q[find]),
      solvent: concentrating ? null : clean(q.v2 - q.v1),
      factor: clean(q.c1 / q.c2),
    },
    explain: {
      key: 'explain',
      values: { v1: s(q.v1), c1: s(q.c1), v2: s(q.v2), c2: s(q.c2), add: s(q.v2 - q.v1) },
    },
    steps: [
      { key: 'step.rearrange', math: `${formula} = ${s(q[find])}` },
      ...(concentrating
        ? []
        : [{ key: 'step.solvent', math: `${s(q.v2)} − ${s(q.v1)} = ${s(q.v2 - q.v1)}` }]),
    ],
    warnings: concentrating ? [{ key: 'warn.concentrating', level: 'warn' }] : [],
  };
};
