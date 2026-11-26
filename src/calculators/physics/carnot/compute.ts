import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean } from '@/engine/money';

/**
 * Carnot (maximum) efficiency and coefficients of performance (OpenStax College Physics 2e
 * Eq. 15.34; University Physics Vol. 2 Eqs. 4.5–4.7): e = 1 − T_c/T_h with absolute temperatures,
 * refrigerator COP K_R = T_c/(T_h − T_c), heat-pump COP K_P = T_h/(T_h − T_c). With a known work or
 * hot-side heat per cycle: W = e·Q_h and Q_c = Q_h − W (College Physics Eqs. 15.25–15.26).
 */
export const compute: ComputeFn = (inputs, { fmt }) => {
  const num = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const none = (key?: string): ComputeResult => ({
    outputs: { eff: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  const toK = (t: number | null) => (t === null ? null : inputs.tu === 'C' ? t + 273.15 : t);
  const Th = toK(num('th'));
  const Tc = toK(num('tc'));
  if (Th === null || Tc === null) return none();
  if (!(Tc > 0) || !(Th > 0)) return none('warn.kelvin');
  if (!(Th > Tc)) return none('warn.order');
  const e = 1 - Tc / Th;
  const kR = Tc / (Th - Tc);
  const kP = Th / (Th - Tc);
  const s = (x: number) => fmt.sig(clean(x), 6);
  const steps: ComputeResult['steps'] = [];
  if (inputs.tu === 'C')
    steps.push({ key: 'step.kelvin', math: `T_h = ${s(Th)} K, T_c = ${s(Tc)} K` });
  steps.push({ key: 'step.eff', math: `1 − ${s(Tc)} ÷ ${s(Th)} = ${s(e)}` });

  let qh: number | null = null;
  let w: number | null = null;
  const given = inputs.given === 'work' || inputs.given === 'heat' ? inputs.given : 'none';
  const amount = num('amount');
  if (given !== 'none' && amount !== null && amount > 0) {
    if (given === 'work') {
      w = amount;
      qh = w / e;
    } else {
      qh = amount;
      w = e * qh;
    }
    steps.push({ key: 'step.energy', math: `Q_h = ${s(qh)}, W = ${s(w)}, Q_c = ${s(qh - w)}` });
  }

  return {
    outputs: {
      eff: clean(e * 100),
      kR: clean(kR),
      kP: clean(kP),
      qh: qh === null ? null : clean(qh),
      w: w === null ? null : clean(w),
      qc: qh === null || w === null ? null : clean(qh - w),
    },
    explain: { key: 'explain', values: { e: fmt.sig(clean(e * 100), 4), kp: s(kP) } },
    steps,
    warnings: [],
  };
};
