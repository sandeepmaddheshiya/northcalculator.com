import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean } from '@/engine/money';

/**
 * Steady conduction through a flat layer, Q/t = kA(T_hot − T_cold) ÷ d (OpenStax College Physics
 * 2e Eq. 14.26; University Physics Vol. 2 Eq. 1.9). R = d ÷ k in m²·K/W, converted to US
 * ft²·°F·h/Btu with NIST SP 811: 1 ft²·°F·h/Btu = 0.1761102 m²·K/W. Conductivities are College
 * Physics Table 14.3 (polystyrene foam from University Physics Table 1.5), near 0 °C.
 */
export const K: Record<string, number> = {
  copper: 390,
  aluminum: 220,
  steel: 80,
  stainless: 14,
  ice: 2.2,
  glass: 0.84,
  concrete: 0.84,
  water: 0.6,
  plasterboard: 0.16,
  snow: 0.1,
  cork: 0.042,
  glasswool: 0.042,
  wool: 0.04,
  polystyrene: 0.035,
  air: 0.023,
  styrofoam: 0.01,
};
export const R_US = 0.1761102;

export const compute: ComputeFn = (inputs, { fmt }) => {
  const num = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const none = (key?: string): ComputeResult => ({
    outputs: { power: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  const m = typeof inputs.material === 'string' ? inputs.material : 'custom';
  const k = m in K ? K[m]! : num('k');
  const A = num('area');
  const dCm = num('thickness');
  const hot = num('hot');
  const cold = num('cold');
  const hours = num('hours') ?? 0;
  if (k === null || A === null || dCm === null || hot === null || cold === null) return none();
  if (!(k > 0)) return none('warn.k');
  if (!(A > 0) || !(dCm > 0)) return none('warn.size');
  const d = dCm / 100;
  const dT = hot - cold;
  const power = (k * A * dT) / d;
  const R = d / k;
  const Q = power * hours * 3600;
  const s = (x: number) => fmt.sig(clean(x), 6);
  return {
    outputs: {
      power: clean(power),
      heat: hours > 0 ? clean(Q) : null,
      kwh: hours > 0 ? clean(Q / 3.6e6) : null,
      rSI: clean(R),
      rUS: clean(R / R_US),
      perArea: clean(power / A),
    },
    explain: {
      key: dT >= 0 ? 'explain' : 'explain.reverse',
      values: { p: s(Math.abs(power)), r: fmt.sig(clean(R / R_US), 3) },
    },
    steps: [
      {
        key: 'step.rate',
        math: `${s(k)} × ${s(A)} × (${s(hot)} − ${s(cold)}) ÷ ${s(d)} = ${s(power)} W`,
      },
      ...(hours > 0
        ? [{ key: 'step.heat', math: `${s(power)} W × ${s(hours * 3600)} s = ${s(Q)} J` }]
        : []),
      { key: 'step.r', math: `${s(d)} ÷ ${s(k)} = ${s(R)} m²·K/W = ${s(R / R_US)} ft²·°F·h/Btu` },
    ],
    warnings: dT < 0 ? [{ key: 'warn.reverse', level: 'info' }] : [],
  };
};
