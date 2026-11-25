import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean } from '@/engine/money';

/**
 * Coulomb’s law F = k|q₁q₂| ÷ r² (OpenStax College Physics 2e §18.3; University Physics Vol. 2
 * §5.3) with k = 1 ÷ (4πε₀) from the 2022 CODATA ε₀ (≈ 8.98755 × 10⁹ N·m²/C²) and the exact
 * elementary charge e = 1.602176634 × 10⁻¹⁹ C. Like charges repel, unlike attract. The field of
 * charge 1 at that distance is E = k|q₁| ÷ r².
 */
export const EPS0 = 8.8541878188e-12;
export const K = 1 / (4 * Math.PI * EPS0);
const C = { C: 1, mC: 1e-3, uC: 1e-6, nC: 1e-9, e: 1.602176634e-19 } as const;

export const compute: ComputeFn = (inputs, ctx) => {
  const { fmt } = ctx;
  const t = ctx.t ?? ((k: string) => k);
  const val = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const unit = (k: string) =>
    typeof inputs[k] === 'string' && (inputs[k] as string) in C
      ? (inputs[k] as keyof typeof C)
      : 'e';
  const none = (key?: string): ComputeResult => ({
    outputs: { force: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  const a = val('q1');
  const b = val('q2');
  const r = val('r');
  if (a === null || b === null || r === null) return none();
  if (!(r > 0)) return none('warn.r');
  const q1 = a * C[unit('u1')];
  const q2 = b * C[unit('u2')];
  const f = (K * Math.abs(q1 * q2)) / (r * r);
  const kind = q1 === 0 || q2 === 0 ? 'none' : q1 * q2 > 0 ? 'repel' : 'attract';
  const s = (x: number) => fmt.sig(clean(x), 8);
  return {
    outputs: {
      force: clean(f),
      kind: t(`kind.${kind}`),
      field: clean((K * Math.abs(q1)) / (r * r)),
    },
    explain: { key: `explain.${kind}`, values: { f: s(f) } },
    steps: [
      { key: 'step.charges', math: `q₁ = ${s(q1)} C, q₂ = ${s(q2)} C` },
      { key: 'step.force', math: `8.98755 × 10⁹ × |${s(q1)} × ${s(q2)}| ÷ ${s(r)}² = ${s(f)} N` },
    ],
    warnings: [],
  };
};
