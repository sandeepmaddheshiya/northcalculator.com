import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean } from '@/engine/money';

/**
 * ρ = m ÷ V (OpenStax College Physics 2e Eq. 11.2; Chemistry 2e §1.4), solved for any one of
 * the three. Everything converts through kilograms and cubic metres with exact NIST SP 811
 * factors; 1 g/cm³ = 1 g/mL = 1000 kg/m³ = 1 kg/L, and 1 g/L = 1 kg/m³.
 */
const KG = { g: 0.001, kg: 1, lb: 0.45359237 } as const;
const M3 = { cm3: 1e-6, L: 0.001, m3: 1, ft3: 0.028316846592, galUS: 0.003785411784 } as const;
const KGM3 = { gcm3: 1000, kgm3: 1, gL: 1, lbft3: 0.45359237 / 0.028316846592 } as const;
const pick = <T extends object>(map: T, v: unknown, d: keyof T): keyof T =>
  typeof v === 'string' && v in map ? (v as keyof T) : d;

export const compute: ComputeFn = (inputs, ctx) => {
  const { fmt } = ctx;
  const t = ctx.t ?? ((k: string) => k);
  const val = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const find = inputs.find === 'mass' || inputs.find === 'volume' ? inputs.find : 'density';
  const mu = pick(KG, inputs.massUnit, 'g');
  const vu = pick(M3, inputs.volumeUnit, 'cm3');
  const du = pick(KGM3, inputs.densityUnit, 'gcm3');
  const none = (key?: string): ComputeResult => ({
    outputs: { result: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  let rho: number; // kg/m³
  let kg: number;
  let m3: number;
  if (find === 'density') {
    const m = val('mass');
    const v = val('volume');
    if (m === null || v === null) return none();
    if (!(v > 0)) return none('warn.volume');
    kg = m * KG[mu];
    m3 = v * M3[vu];
    rho = kg / m3;
  } else if (find === 'mass') {
    const d = val('density');
    const v = val('volume');
    if (d === null || v === null) return none();
    rho = d * KGM3[du];
    m3 = v * M3[vu];
    kg = rho * m3;
  } else {
    const d = val('density');
    const m = val('mass');
    if (d === null || m === null) return none();
    if (!(d > 0)) return none('warn.density');
    rho = d * KGM3[du];
    kg = m * KG[mu];
    m3 = kg / rho;
  }
  const sig = (x: number) => fmt.sig(clean(x), 8);
  const inUnit =
    find === 'density'
      ? `${sig(rho / KGM3[du])} ${t(`sym.${String(du)}`)}`
      : find === 'mass'
        ? `${sig(kg / KG[mu])} ${t(`sym.${String(mu)}`)}`
        : `${sig(m3 / M3[vu])} ${t(`sym.${String(vu)}`)}`;
  return {
    outputs: {
      result: inUnit,
      gcm3: clean(rho / 1000),
      kgm3: clean(rho),
      kg: clean(kg),
      L: clean(m3 * 1000),
    },
    explain: { key: 'explain', values: { rho: sig(rho / 1000), kg: sig(kg), L: sig(m3 * 1000) } },
    steps: [
      {
        key: `step.${find}`,
        math:
          find === 'density'
            ? `${sig(kg)} kg ÷ ${sig(m3)} m³ = ${sig(rho)} kg/m³`
            : find === 'mass'
              ? `${sig(rho)} kg/m³ × ${sig(m3)} m³ = ${sig(kg)} kg`
              : `${sig(kg)} kg ÷ ${sig(rho)} kg/m³ = ${sig(m3)} m³`,
      },
    ],
    warnings: [],
  };
};
