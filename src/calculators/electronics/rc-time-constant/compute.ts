import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean } from '@/engine/money';

/**
 * RC circuit (OpenStax College Physics 2e §21.6; University Physics Vol. 2 §10.5): τ = RC.
 *   charging:    V(t) = V_s(1 − e^(−t/τ)), time to reach V: t = −τ ln(1 − V/V_s)
 *   discharging: V(t) = V₀e^(−t/τ),        time to fall to V: t = −τ ln(V/V₀)
 * The current at t is (V_s − V)/R while charging and V/R while discharging. 5τ ≈ 99.3%.
 * expm1/log1p keep precision for times much shorter than τ.
 */
const F = { F: 1, mF: 1e-3, uF: 1e-6, nF: 1e-9, pF: 1e-12 } as const;

export const compute: ComputeFn = (inputs, { fmt }) => {
  const val = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const none = (key?: string): ComputeResult => ({
    outputs: { tau: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  const r = val('r');
  const cIn = val('c');
  if (r === null || cIn === null) return none();
  if (!(r > 0 && cIn > 0)) return none('warn.zero');
  const cu = typeof inputs.cu === 'string' && inputs.cu in F ? (inputs.cu as keyof typeof F) : 'uF';
  const c = cIn * F[cu];
  const tau = r * c;
  const charging = inputs.mode !== 'discharging';
  const vs = val('v');
  const t = val('t');
  const target = val('target');
  const s = (x: number) => fmt.sig(clean(x), 8);

  let vAt: number | null = null;
  let frac: number | null = null;
  let current: number | null = null;
  if (vs !== null && t !== null) {
    frac = charging ? -Math.expm1(-t / tau) : Math.exp(-t / tau);
    vAt = vs * frac;
    current = charging ? (vs - vAt) / r : vAt / r;
  }
  let tTarget: number | null = null;
  const warnings: ComputeResult['warnings'] = [];
  if (vs !== null && vs > 0 && target !== null && target > 0) {
    if (target >= vs) warnings.push({ key: charging ? 'warn.never' : 'warn.above', level: 'warn' });
    else tTarget = charging ? -tau * Math.log1p(-target / vs) : -tau * Math.log(target / vs);
  }
  return {
    outputs: {
      tau: clean(tau),
      vAt: vAt === null ? null : clean(vAt),
      percent: frac === null ? null : clean(frac * 100),
      tTarget: tTarget === null ? null : clean(tTarget),
      fiveTau: clean(5 * tau),
      current: current === null ? null : clean(current),
    },
    explain: {
      key: charging ? 'explain.charging' : 'explain.discharging',
      values: { tau: s(tau), five: s(5 * tau) },
    },
    steps: [
      { key: 'step.tau', math: `τ = ${s(r)} Ω × ${s(c)} F = ${s(tau)} s` },
      ...(vAt !== null
        ? [
            {
              key: charging ? 'step.charge' : 'step.discharge',
              math: charging
                ? `${s(vs!)} × (1 − e^(−${s(t!)} ÷ ${s(tau)})) = ${s(vAt)} V`
                : `${s(vs!)} × e^(−${s(t!)} ÷ ${s(tau)}) = ${s(vAt)} V`,
            },
          ]
        : []),
      ...(tTarget !== null
        ? [
            {
              key: 'step.target',
              math: charging
                ? `−${s(tau)} × ln(1 − ${s(target!)} ÷ ${s(vs!)}) = ${s(tTarget)} s`
                : `−${s(tau)} × ln(${s(target!)} ÷ ${s(vs!)}) = ${s(tTarget)} s`,
            },
          ]
        : []),
    ],
    warnings,
  };
};
