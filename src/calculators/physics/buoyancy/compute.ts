import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean } from '@/engine/money';

/**
 * Archimedes’ principle (OpenStax College Physics 2e §11.7; University Physics Vol. 1 §14.4):
 *   buoyant force = weight of fluid displaced = ρ_fluid × V × g
 *   a floating object sinks until the fraction submerged = ρ_object ÷ ρ_fluid
 *   weighing in air (m) and in the fluid (m′): volume = (m − m′) ÷ ρ_fluid, density = m ÷ volume.
 * g = 9.80665 m/s²; specific gravity is relative to water at 1,000 kg/m³.
 */
const GN = 9.80665;
const WATER = 1000;

export const compute: ComputeFn = (inputs, { fmt }) => {
  const val = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const mode = inputs.mode === 'float' || inputs.mode === 'weigh' ? inputs.mode : 'force';
  const none = (key?: string): ComputeResult => ({
    outputs: { result: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  const rf = val('fluid');
  if (rf === null) return none();
  if (!(rf > 0)) return none('warn.fluid');
  const s = (x: number) => fmt.sig(clean(x), 8);
  if (mode === 'force') {
    const v = val('volume');
    if (v === null) return none();
    const kg = rf * v;
    const f = kg * GN;
    return {
      outputs: { result: clean(f), percent: null, sg: null, kg: clean(kg) },
      explain: { key: 'explain.force', values: { f: s(f), kg: s(kg) } },
      steps: [{ key: 'step.force', math: `${s(rf)} × ${s(v)} × 9.80665 = ${s(f)} N` }],
      warnings: [],
    };
  }
  if (mode === 'float') {
    const ro = val('object');
    if (ro === null) return none();
    const frac = ro / rf;
    return {
      outputs: {
        result: clean(Math.min(frac, 1) * 100),
        percent: clean(frac * 100),
        sg: clean(ro / WATER),
        kg: null,
      },
      explain: {
        key: frac < 1 ? 'explain.floats' : 'explain.sinks',
        values: { pct: fmt.pct(clean(Math.min(frac, 1) * 100), 2) },
      },
      steps: [{ key: 'step.float', math: `${s(ro)} ÷ ${s(rf)} = ${s(frac)}` }],
      warnings: frac >= 1 ? [{ key: 'warn.sinks', level: 'info' }] : [],
    };
  }
  const air = val('air');
  const wet = val('inFluid');
  if (air === null || wet === null) return none();
  if (!(air > wet)) return none('warn.weigh');
  const density = (air / (air - wet)) * rf;
  return {
    outputs: { result: clean(density), percent: null, sg: clean(density / WATER), kg: null },
    explain: { key: 'explain.weigh', values: { d: s(density), sg: s(density / WATER) } },
    steps: [
      { key: 'step.displaced', math: `${s(air)} − ${s(wet)} = ${s(air - wet)}` },
      { key: 'step.density', math: `${s(air)} ÷ ${s(air - wet)} × ${s(rf)} = ${s(density)} kg/m³` },
    ],
    warnings: [],
  };
};
