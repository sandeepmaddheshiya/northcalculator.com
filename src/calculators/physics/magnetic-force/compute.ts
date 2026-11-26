import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean } from '@/engine/money';

/**
 * Charged particle in a uniform magnetic field (OpenStax College Physics 2e Eqs. 22.1, 22.7;
 * University Physics Vol. 2 Eqs. 11.5–11.8): force F = |q|vB sin θ, circular radius
 * r = m v⊥ ÷ (|q|B) with v⊥ = v sin θ, period T = 2πm ÷ (|q|B), cyclotron frequency 1/T, and the
 * helix pitch v∥T with v∥ = v cos θ. Non-relativistic. Particle constants: CODATA 2022 (NIST).
 */
export const E = 1.602176634e-19;
export const PARTICLES: Record<string, { m: number; q: number }> = {
  electron: { m: 9.1093837139e-31, q: -E },
  proton: { m: 1.67262192595e-27, q: E },
  alpha: { m: 6.644657345e-27, q: 2 * E },
};

export const compute: ComputeFn = (inputs, { fmt }) => {
  const num = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const none = (key?: string): ComputeResult => ({
    outputs: { force: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  const name = typeof inputs.particle === 'string' ? inputs.particle : 'electron';
  let m: number | null;
  let q: number | null;
  if (PARTICLES[name]) ({ m, q } = PARTICLES[name]!);
  else {
    m = num('mass');
    const qe = num('charge');
    q = qe === null ? null : qe * (inputs.qu === 'C' ? 1 : E);
  }
  const v = num('v');
  const B = num('b');
  const deg = num('angle') ?? 90;
  if (m === null || q === null || v === null || B === null) return none();
  if (!(m > 0)) return none('warn.mass');
  if (q === 0) return none('warn.charge');
  if (!(v >= 0) || !(B > 0)) return none('warn.positive');
  if (v >= 299792458) return none('warn.light');
  const th = (deg * Math.PI) / 180;
  const sin = Math.abs(Math.sin(th)) < 1e-15 ? 0 : Math.sin(th);
  const cos = Math.abs(Math.cos(th)) < 1e-15 ? 0 : Math.cos(th);
  const aq = Math.abs(q);
  const F = aq * v * B * Math.abs(sin);
  const T = (2 * Math.PI * m) / (aq * B);
  const r = (m * v * Math.abs(sin)) / (aq * B);
  const pitch = v * Math.abs(cos) * T;
  const s = (x: number) => fmt.sig(clean(x), 6);

  return {
    outputs: {
      force: clean(F),
      radius: clean(r),
      period: clean(T),
      freq: clean(1 / T),
      pitch: clean(pitch),
    },
    explain: { key: 'explain', values: { f: s(F), r: s(r), t: s(T) } },
    steps: [
      { key: 'step.f', math: `${s(aq)} C × ${s(v)} m/s × ${s(B)} T × sin ${s(deg)}° = ${s(F)} N` },
      {
        key: 'step.r',
        math: `${s(m)} × ${s(v * Math.abs(sin))} ÷ (${s(aq)} × ${s(B)}) = ${s(r)} m`,
      },
      { key: 'step.t', math: `2π × ${s(m)} ÷ (${s(aq)} × ${s(B)}) = ${s(T)} s` },
    ],
    warnings: v > 3e7 ? [{ key: 'warn.fast', level: 'info' }] : [],
  };
};
