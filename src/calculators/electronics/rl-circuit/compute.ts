import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean } from '@/engine/money';

/**
 * Series RL circuit with a DC source (OpenStax College Physics 2e Eqs. 23.45–23.47; University
 * Physics Vol. 2 Eqs. 14.24–14.32): τ = L/R, final current I₀ = V/R.
 *  - switched on: I(t) = I₀(1 − e^(−t/τ)), inductor voltage V e^(−t/τ);
 *  - switched off (source removed, loop kept closed): I(t) = I₀ e^(−t/τ).
 * Stored energy U = ½LI². The time for the current to halve while decaying is τ ln 2.
 */
const HENRY = { H: 1, mH: 1e-3, uH: 1e-6 } as const;
const TIME = { s: 1, ms: 1e-3, us: 1e-6 } as const;
const pick = <T extends Record<string, number>>(map: T, v: unknown, d: keyof T): keyof T =>
  typeof v === 'string' && v in map ? (v as keyof T) : d;

export const compute: ComputeFn = (inputs, { fmt }) => {
  const num = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const none = (key?: string): ComputeResult => ({
    outputs: { tau: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  const lIn = num('L');
  const R = num('R');
  const V = num('V');
  const tIn = num('t');
  if (lIn === null || R === null) return none();
  if (!(lIn > 0) || !(R > 0)) return none('warn.positive');
  const L = lIn * HENRY[pick(HENRY, inputs.lu, 'mH')];
  const tau = L / R;
  const decay = inputs.mode === 'decay';
  const s = (x: number) => fmt.sig(clean(x), 6);
  const steps: ComputeResult['steps'] = [
    { key: 'step.tau', math: `${s(L)} H ÷ ${s(R)} Ω = ${s(tau)} s` },
  ];
  let I: number | null = null;
  let vL: number | null = null;
  let I0: number | null = null;
  if (V !== null && V >= 0) {
    I0 = V / R;
    steps.push({ key: 'step.i0', math: `${s(V)} V ÷ ${s(R)} Ω = ${s(I0)} A` });
    if (tIn !== null && tIn >= 0) {
      const t = tIn * TIME[pick(TIME, inputs.tu, 'ms')];
      const f = Math.exp(-t / tau);
      I = decay ? I0 * f : I0 * (1 - f);
      vL = V * f;
      steps.push(
        decay
          ? { key: 'step.decay', math: `${s(I0)} × e^(−${s(t)} ÷ ${s(tau)}) = ${s(I)} A` }
          : { key: 'step.rise', math: `${s(I0)} × (1 − e^(−${s(t)} ÷ ${s(tau)})) = ${s(I)} A` },
      );
    }
  }
  const energy = I === null ? null : 0.5 * L * I * I;

  return {
    outputs: {
      tau: clean(tau),
      i0: I0 === null ? null : clean(I0),
      i: I === null ? null : clean(I),
      pct: I === null || I0 === null || I0 === 0 ? null : clean((I / I0) * 100),
      vL: vL === null ? null : clean(vL),
      energy: energy === null ? null : clean(energy),
      half: clean(tau * Math.LN2),
      five: clean(tau * 5),
    },
    explain: { key: 'explain', values: { tau: s(tau), five: s(tau * 5) } },
    steps,
    warnings: [],
  };
};
