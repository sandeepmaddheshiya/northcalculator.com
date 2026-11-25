import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean } from '@/engine/money';

/**
 * Momentum p = mv; impulse J = Δp = m(v₂ − v₁); average force F = Δp ÷ Δt (OpenStax College
 * Physics 2e §8.1–8.2; University Physics Vol. 1 §9.1–9.2). Velocities are signed along one
 * line. The force is also expressed in multiples of the body’s weight at gₙ = 9.80665 m/s².
 */
const GN = 9.80665;

export const compute: ComputeFn = (inputs, { fmt }) => {
  const val = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const none = (key?: string): ComputeResult => ({
    outputs: { impulse: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  const m = val('mass');
  const v1 = val('v1') ?? 0;
  const v2 = val('v2');
  const t = val('time');
  if (m === null || v2 === null) return none();
  if (!(m > 0)) return none('warn.mass');
  const p1 = m * v1;
  const p2 = m * v2;
  const dp = m * (v2 - v1);
  const f = t !== null && t > 0 ? dp / t : null;
  const s = (x: number) => fmt.sig(clean(x), 8);
  return {
    outputs: {
      impulse: clean(dp),
      p1: clean(p1),
      p2: clean(p2),
      force: f === null ? null : clean(f),
      gs: f === null ? null : clean(Math.abs(f) / (m * GN)),
    },
    explain: {
      key: f === null ? 'explain' : 'explain.force',
      values: { dp: s(dp), f: f === null ? '' : s(Math.abs(f)) },
    },
    steps: [
      {
        key: 'step.p',
        math: `${s(m)} × ${s(v1)} = ${s(p1)}, ${s(m)} × ${s(v2)} = ${s(p2)} kg·m/s`,
      },
      { key: 'step.dp', math: `${s(p2)} − ${s(p1)} = ${s(dp)} kg·m/s` },
      ...(f === null ? [] : [{ key: 'step.force', math: `${s(dp)} ÷ ${s(t!)} = ${s(f)} N` }]),
    ],
    warnings: [],
  };
};
