import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean } from '@/engine/money';

/**
 * Resistance of a uniform wire, R = ρL/A with A = πd²/4, and its change with temperature,
 * R = R₀(1 + α(T − 20 °C)) (OpenStax College Physics 2e Eqs. 20.18, 20.24; University Physics
 * Vol. 2 Eqs. 9.9, 9.10). Solves for R, the diameter needed for a resistance, or the length.
 * Material constants at 20 °C are University Physics Table 9.1. A current, if given, adds the
 * voltage drop V = IR and the power lost, P = I²R.
 */
export const MATERIALS: Record<string, { rho: number; alpha: number }> = {
  silver: { rho: 1.59e-8, alpha: 0.0038 },
  copper: { rho: 1.68e-8, alpha: 0.0039 },
  gold: { rho: 2.44e-8, alpha: 0.0034 },
  aluminum: { rho: 2.65e-8, alpha: 0.0039 },
  tungsten: { rho: 5.6e-8, alpha: 0.0045 },
  iron: { rho: 9.71e-8, alpha: 0.0065 },
  platinum: { rho: 10.6e-8, alpha: 0.0039 },
  constantan: { rho: 49e-8, alpha: 0.00003 },
  nichrome: { rho: 100e-8, alpha: 0.0004 },
};

export const compute: ComputeFn = (inputs, { fmt }) => {
  const num = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const none = (key?: string): ComputeResult => ({
    outputs: { result: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  const m = typeof inputs.material === 'string' ? inputs.material : 'copper';
  const mat = MATERIALS[m];
  const rho = mat ? mat.rho : num('rho') === null ? null : num('rho')! * 1e-8;
  const alpha = mat ? mat.alpha : (num('alpha') ?? 0);
  const T = num('temp') ?? 20;
  if (rho === null) return none();
  if (!(rho > 0)) return none('warn.rho');
  const factor = 1 + alpha * (T - 20);
  if (!(factor > 0)) return none('warn.temp');
  const rhoT = rho * factor;
  const find = inputs.find === 'd' || inputs.find === 'l' ? inputs.find : 'r';
  const s = (x: number) => fmt.sig(clean(x), 6);
  let L: number;
  let dMm: number;
  let R: number;
  if (find === 'r') {
    const l = num('length');
    const d = num('diameter');
    if (l === null || d === null) return none();
    if (!(l > 0) || !(d > 0)) return none('warn.size');
    L = l;
    dMm = d;
    R = (rhoT * L) / ((Math.PI * (dMm / 1000) ** 2) / 4);
  } else {
    const target = num('target');
    if (target === null) return none();
    if (!(target > 0)) return none('warn.target');
    R = target;
    if (find === 'd') {
      const l = num('length');
      if (l === null) return none();
      if (!(l > 0)) return none('warn.size');
      L = l;
      const A = (rhoT * L) / R;
      dMm = Math.sqrt((4 * A) / Math.PI) * 1000;
    } else {
      const d = num('diameter');
      if (d === null) return none();
      if (!(d > 0)) return none('warn.size');
      dMm = d;
      L = (R * ((Math.PI * (dMm / 1000) ** 2) / 4)) / rhoT;
    }
  }
  const A = (Math.PI * (dMm / 1000) ** 2) / 4;
  const I = num('current');
  const result = find === 'r' ? R : find === 'd' ? dMm : L;

  return {
    outputs: {
      result: clean(result),
      r: clean(R),
      r20: clean(R / factor),
      area: clean(A * 1e6),
      perM: clean(R / L),
      vdrop: I === null || I === 0 ? null : clean(I * R),
      loss: I === null || I === 0 ? null : clean(I * I * R),
    },
    explain: {
      key: 'explain',
      values: { r: s(R), l: s(L), d: s(dMm), t: s(T) },
    },
    steps: [
      { key: 'step.area', math: `π × (${s(dMm)} mm)² ÷ 4 = ${s(A * 1e6)} mm²` },
      ...(T === 20
        ? []
        : [
            {
              key: 'step.temp',
              math: `${s(rho)} × (1 + ${s(alpha)} × (${s(T)} − 20)) = ${s(rhoT)} Ω·m`,
            },
          ]),
      find === 'r'
        ? { key: 'step.r', math: `${s(rhoT)} × ${s(L)} ÷ ${s(A)} = ${s(R)} Ω` }
        : find === 'd'
          ? {
              key: 'step.d',
              math: `A = ${s(rhoT)} × ${s(L)} ÷ ${s(R)} = ${s(A)} m² → d = ${s(dMm)} mm`,
            }
          : { key: 'step.l', math: `${s(R)} × ${s(A)} ÷ ${s(rhoT)} = ${s(L)} m` },
    ],
    warnings: [],
  };
};
