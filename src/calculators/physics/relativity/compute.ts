import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean } from '@/engine/money';

/**
 * Special-relativity time dilation and length contraction (OpenStax College Physics 2e
 * Eqs. 28.10–28.11, 28.21; University Physics Vol. 3 Eqs. 5.1–5.4):
 *   γ = 1/√(1 − v²/c²), Δt = γΔt₀, L = L₀/γ.
 * Δt₀ is the proper time (measured by a clock moving with the object); L₀ the proper length
 * (measured at rest relative to the object). c = 299,792,458 m/s exactly. For small v the
 * excess γ − 1 is computed as β²/(√(1 − β²)(1 + √(1 − β²))) to avoid cancellation.
 */
export const C = 299792458;

export function lorentz(beta: number): { gamma: number; excess: number } {
  const r = Math.sqrt((1 - beta) * (1 + beta));
  return { gamma: 1 / r, excess: (beta * beta) / (r * (1 + r)) };
}

export const compute: ComputeFn = (inputs, { fmt }) => {
  const num = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const none = (key?: string): ComputeResult => ({
    outputs: { gamma: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  const vIn = num('speed');
  if (vIn === null) return none();
  if (vIn < 0) return none('warn.negative');
  const su = inputs.su === 'ms' || inputs.su === 'kms' ? inputs.su : 'c';
  const beta = su === 'c' ? vIn : su === 'kms' ? (vIn * 1000) / C : vIn / C;
  if (!(beta < 1)) return none('warn.light');
  const { gamma, excess } = lorentz(beta);
  const t0 = num('t0');
  const l0 = num('l0');
  const s = (x: number) => fmt.sig(clean(x), 8);

  return {
    outputs: {
      gamma: clean(gamma),
      beta: clean(beta),
      dilated: t0 === null ? null : clean(gamma * t0),
      lag: t0 === null ? null : clean(excess * t0),
      contracted: l0 === null ? null : clean(l0 / gamma),
      excess: clean(excess),
    },
    explain: { key: 'explain', values: { g: s(gamma), b: s(beta) } },
    steps: [
      { key: 'step.gamma', math: `1 ÷ √(1 − ${s(beta)}²) = ${s(gamma)}` },
      ...(t0 === null
        ? []
        : [{ key: 'step.t', math: `${s(gamma)} × ${s(t0)} = ${s(gamma * t0)}` }]),
      ...(l0 === null
        ? []
        : [{ key: 'step.l', math: `${s(l0)} ÷ ${s(gamma)} = ${s(l0 / gamma)}` }]),
    ],
    warnings: [],
  };
};
