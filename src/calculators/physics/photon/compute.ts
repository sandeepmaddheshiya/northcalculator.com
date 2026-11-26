import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean } from '@/engine/money';

/**
 * Photon energy, frequency and wavelength (OpenStax College Physics 2e Eq. 29.12; University
 * Physics Vol. 3 Eq. 6.13; Physics §21.1): E = hf = hc/λ, c = fλ. h = 6.62607015 × 10⁻³⁴ J·s,
 * c = 299,792,458 m/s and e = 1.602176634 × 10⁻¹⁹ C are exact SI values, so hc = 1239.84 eV·nm
 * (the textbooks’ 1240 eV·nm). An optional light power gives the photon rate P ÷ E.
 */
export const H = 6.62607015e-34;
export const C = 299792458;
export const EV = 1.602176634e-19;

const LAMBDA = { nm: 1e-9, um: 1e-6, m: 1 } as const;
const FREQ = { Hz: 1, THz: 1e12, MHz: 1e6 } as const;
const ENERGY = { eV: EV, J: 1, keV: 1e3 * EV } as const;

const pick = <T extends Record<string, number>>(map: T, v: unknown, d: keyof T): keyof T =>
  typeof v === 'string' && v in map ? (v as keyof T) : d;

export const compute: ComputeFn = (inputs, { fmt }) => {
  const num = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const none = (key?: string): ComputeResult => ({
    outputs: { ev: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  const from = inputs.from === 'frequency' || inputs.from === 'energy' ? inputs.from : 'wavelength';
  const x = num('value');
  if (x === null) return none();
  if (!(x > 0)) return none('warn.positive');
  let E: number;
  if (from === 'wavelength') E = (H * C) / (x * LAMBDA[pick(LAMBDA, inputs.lu, 'nm')]);
  else if (from === 'frequency') E = H * x * FREQ[pick(FREQ, inputs.fu, 'Hz')];
  else E = x * ENERGY[pick(ENERGY, inputs.eu, 'eV')];
  const f = E / H;
  const lambda = C / f;
  const P = num('power');
  const rate = P !== null && P > 0 ? P / E : null;
  const s = (v: number) => fmt.sig(clean(v), 6);

  return {
    outputs: {
      ev: clean(E / EV),
      joules: clean(E),
      nm: clean(lambda * 1e9),
      hz: clean(f),
      rate: rate === null ? null : clean(rate),
      kjmol: clean((E * 6.02214076e23) / 1000),
    },
    explain: { key: 'explain', values: { e: s(E / EV), l: s(lambda * 1e9) } },
    steps: [
      from === 'wavelength'
        ? { key: 'step.fromL', math: `E = ${H} × ${C} ÷ ${s(lambda)} m = ${s(E)} J` }
        : from === 'frequency'
          ? { key: 'step.fromF', math: `E = ${H} × ${s(f)} Hz = ${s(E)} J` }
          : { key: 'step.fromE', math: `λ = ${H} × ${C} ÷ ${s(E)} J = ${s(lambda)} m` },
      { key: 'step.ev', math: `${s(E)} J ÷ ${EV} = ${s(E / EV)} eV` },
      ...(rate === null
        ? []
        : [{ key: 'step.rate', math: `${s(P!)} W ÷ ${s(E)} J = ${s(rate)} photons/s` }]),
    ],
    warnings: [],
  };
};
