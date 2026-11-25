import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean } from '@/engine/money';

/**
 * Newton’s law of gravitation F = G m₁m₂ ÷ r² (OpenStax College Physics 2e §6.5; University
 * Physics Vol. 1 §13.1) with the 2022 CODATA G = 6.67430 × 10⁻¹¹ m³ kg⁻¹ s⁻² (NIST). r is the
 * distance between the centres of mass. Each body accelerates at F ÷ its own mass, so with
 * m₂ = 1 kg the force equals the gravitational field strength of m₁ at that distance.
 */
export const G = 6.6743e-11;

export const compute: ComputeFn = (inputs, { fmt }) => {
  const val = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const none = (key?: string): ComputeResult => ({
    outputs: { force: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  const m1 = val('m1');
  const m2 = val('m2');
  const r0 = val('r');
  if (m1 === null || m2 === null || r0 === null) return none();
  if (!(r0 > 0)) return none('warn.r');
  const r = inputs.ru === 'km' ? r0 * 1000 : r0;
  const f = (G * m1 * m2) / (r * r);
  const s = (x: number) => fmt.sig(clean(x), 8);
  return {
    outputs: {
      force: clean(f),
      a1: m1 > 0 ? clean(f / m1) : null,
      a2: m2 > 0 ? clean(f / m2) : null,
    },
    explain: { key: 'explain', values: { f: s(f) } },
    steps: [
      { key: 'step.force', math: `6.6743 × 10⁻¹¹ × ${s(m1)} × ${s(m2)} ÷ ${s(r)}² = ${s(f)} N` },
    ],
    warnings: [],
  };
};
