import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean } from '@/engine/money';
import { FARAD, HENRY, HZ, pick } from '@/calculators/electronics/reactance/compute';

/**
 * Series RLC (or RL, RC) circuit on AC (OpenStax College Physics 2e §23.12; University Physics
 * Vol. 2 §15.3–15.4): Z = √(R² + (X_L − X_C)²), phase angle φ = tan⁻¹((X_L − X_C) ÷ R),
 * power factor cos φ = R ÷ Z, current I = V ÷ Z and average power P = I V cos φ = I²R.
 * Enter rms voltage: the current is then rms and P is the true average power. (A peak voltage
 * gives peak current, but P would then be twice the average.)
 * Positive φ: current lags (inductive); negative: current leads (capacitive).
 */
const DEG = 180 / Math.PI;

export const compute: ComputeFn = (inputs, { fmt }) => {
  const val = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const comp = inputs.comp === 'RL' || inputs.comp === 'RC' ? inputs.comp : 'RLC';
  const none = (key?: string): ComputeResult => ({
    outputs: { z: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  const R = val('R');
  const fIn = val('f');
  const lIn = comp === 'RC' ? null : val('L');
  const cIn = comp === 'RL' ? null : val('C');
  const V = val('V');
  if (
    R === null ||
    fIn === null ||
    (comp !== 'RC' && lIn === null) ||
    (comp !== 'RL' && cIn === null)
  )
    return none();
  const f = fIn * HZ[pick(HZ, inputs.fu, 'Hz')];
  const L = lIn === null ? null : lIn * HENRY[pick(HENRY, inputs.lu, 'mH')];
  const C = cIn === null ? null : cIn * FARAD[pick(FARAD, inputs.cu, 'uF')];
  if ((L !== null && !(L > 0)) || (C !== null && !(C > 0))) return none('warn.zero');
  if (!(f > 0)) return none('warn.dc');
  if (R < 0) return none('warn.r');

  const w = 2 * Math.PI * f;
  const xl = L === null ? 0 : w * L;
  const xc = C === null ? 0 : 1 / (w * C);
  let x = xl - xc;
  // At resonance the reactances cancel up to rounding.
  if (Math.abs(x) <= 1e-9 * Math.max(xl, xc)) x = 0;
  const z = Math.hypot(R, x);
  if (z === 0) return none('warn.short');
  const phi = Math.atan2(x, R);
  const pf = R / z;
  const current = V === null ? null : V / z;
  const power = current === null ? null : current * V! * pf;
  const f0 = L !== null && C !== null ? 1 / (2 * Math.PI * Math.sqrt(L * C)) : null;
  const s = (v: number) => fmt.sig(clean(v), 8);

  const steps: ComputeResult['steps'] = [];
  if (L !== null) steps.push({ key: 'step.xl', math: `2π × ${s(f)} × ${s(L)} = ${s(xl)} Ω` });
  if (C !== null) steps.push({ key: 'step.xc', math: `1 ÷ (2π × ${s(f)} × ${s(C)}) = ${s(xc)} Ω` });
  steps.push(
    { key: 'step.z', math: `√(${s(R)}² + (${s(xl)} − ${s(xc)})²) = ${s(z)} Ω` },
    {
      key: 'step.phi',
      math: `tan⁻¹(${s(x)} ÷ ${s(R)}) = ${s(phi * DEG)}°; cos φ = ${s(R)} ÷ ${s(z)} = ${s(pf)}`,
    },
  );
  if (current !== null)
    steps.push(
      { key: 'step.i', math: `${s(V!)} V ÷ ${s(z)} Ω = ${s(current)} A` },
      { key: 'step.p', math: `${s(current)} × ${s(V!)} × ${s(pf)} = ${s(power!)} W` },
    );

  return {
    outputs: {
      z: clean(z),
      phi: clean(phi * DEG),
      pf: clean(pf),
      current: current === null ? null : clean(current),
      power: power === null ? null : clean(power),
      xl: L === null ? null : clean(xl),
      xc: C === null ? null : clean(xc),
      f0: f0 === null ? null : clean(f0),
    },
    explain: {
      key: x > 0 ? 'explain.lag' : x < 0 ? 'explain.lead' : 'explain.resonant',
      values: { z: s(z), phi: s(Math.abs(phi * DEG)) },
    },
    steps,
    warnings: [],
  };
};
