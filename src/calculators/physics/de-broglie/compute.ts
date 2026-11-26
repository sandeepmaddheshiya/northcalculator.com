import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean } from '@/engine/money';

/**
 * De Broglie wavelength λ = h/p (OpenStax University Physics Vol. 3 Eq. 6.54; College Physics 2e
 * Eq. 29.34), with the relativistic momentum so results stay right at any speed:
 *  - from speed: p = γmv, γ = 1/√(1 − v²/c²);
 *  - from kinetic energy: p = √(K(K + 2mc²))/c (University Physics Eq. 6.58).
 * Constants: h, c, e exact (SI); particle masses CODATA 2022 (NIST).
 */
export const H = 6.62607015e-34;
export const C = 299792458;
export const EV = 1.602176634e-19;
export const MASS: Record<string, number> = {
  electron: 9.1093837139e-31,
  proton: 1.67262192595e-27,
  neutron: 1.67492750056e-27,
};

export const compute: ComputeFn = (inputs, { fmt }) => {
  const num = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const none = (key?: string): ComputeResult => ({
    outputs: { lambda: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  const particle = typeof inputs.particle === 'string' ? inputs.particle : 'electron';
  const m = MASS[particle] ?? num('mass');
  if (m === null) return none();
  if (!(m > 0)) return none('warn.mass');
  const s = (x: number) => fmt.sig(clean(x), 6);
  let p: number;
  let v: number;
  let K: number;
  const E0 = m * C * C;
  if (inputs.from === 'energy') {
    const kIn = num('energy');
    if (kIn === null) return none();
    if (!(kIn > 0)) return none('warn.positive');
    K = kIn * (inputs.eu === 'keV' ? 1e3 : inputs.eu === 'MeV' ? 1e6 : 1) * EV;
    p = Math.sqrt(K * (K + 2 * E0)) / C;
    // v = pc²/E stays accurate when K ≪ mc², where 1 − 1/γ² would cancel.
    v = (p * C * C) / (K + E0);
  } else {
    const vIn = num('speed');
    if (vIn === null) return none();
    if (!(vIn > 0)) return none('warn.positive');
    v = inputs.su === 'c' ? vIn * C : vIn;
    if (!(v < C)) return none('warn.light');
    const gamma = 1 / Math.sqrt(1 - (v / C) ** 2);
    p = gamma * m * v;
    // (γ − 1)mc² computed as γ²β²/(γ + 1) mc² to avoid cancellation at low speed.
    K = ((gamma * gamma * (v / C) ** 2) / (gamma + 1)) * E0;
  }
  const lambda = H / p;
  const classical = Math.sqrt(2 * m * K);

  return {
    outputs: {
      lambda: clean(lambda),
      nm: clean(lambda * 1e9),
      p: clean(p),
      kEv: clean(K / EV),
      speed: clean(v),
      beta: clean(v / C),
    },
    explain: { key: 'explain', values: { l: s(lambda), nm: s(lambda * 1e9) } },
    steps: [
      inputs.from === 'energy'
        ? {
            key: 'step.pFromK',
            math: `p = √(${s(K)} × (${s(K)} + 2 × ${s(E0)})) ÷ c = ${s(p)} kg·m/s`,
          }
        : { key: 'step.pFromV', math: `p = γmv = ${s(p)} kg·m/s` },
      { key: 'step.lambda', math: `${H} ÷ ${s(p)} = ${s(lambda)} m` },
    ],
    warnings:
      Math.abs(p - classical) > 0.01 * p ? [{ key: 'warn.relativistic', level: 'info' }] : [],
  };
};
