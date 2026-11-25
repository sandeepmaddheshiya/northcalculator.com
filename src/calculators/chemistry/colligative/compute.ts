import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean } from '@/engine/money';

/**
 * Boiling point elevation and freezing point depression (OpenStax Chemistry 2e §11.4; LibreTexts
 * Introductory Chemistry §13.9): ΔT_b = i K_b m and ΔT_f = i K_f m, where m is the molality of
 * the solute (mol per kg of solvent) and i the van ’t Hoff factor (1 for non-electrolytes, 2 for
 * NaCl, 3 for CaCl₂, ideally). The molar mass of an unknown follows from a measured freezing
 * point: M = mass ÷ (ΔT_f ÷ (i K_f) × kg solvent). Solvent constants: OpenStax Table 11.2.
 */
export const SOLVENTS: Record<string, { bp: number; kb: number; fp: number; kf: number }> = {
  water: { bp: 100.0, kb: 0.512, fp: 0.0, kf: 1.86 },
  acetic: { bp: 118.1, kb: 3.07, fp: 16.6, kf: 3.9 },
  benzene: { bp: 80.1, kb: 2.53, fp: 5.5, kf: 5.12 },
  chloroform: { bp: 61.26, kb: 3.63, fp: -63.5, kf: 4.68 },
  nitrobenzene: { bp: 210.9, kb: 5.24, fp: 5.67, kf: 8.1 },
};

export const compute: ComputeFn = (inputs, { fmt }) => {
  const num = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const none = (key?: string): ComputeResult => ({
    outputs: { result: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  const name = typeof inputs.solvent === 'string' ? inputs.solvent : 'water';
  let sv = SOLVENTS[name];
  if (!sv) {
    const bp = num('bp');
    const kb = num('kb');
    const fp = num('fp');
    const kf = num('kf');
    if (bp === null || kb === null || fp === null || kf === null) return none();
    sv = { bp, kb, fp, kf };
  }
  const i = num('i') ?? 1;
  if (!(i > 0)) return none('warn.i');
  const mode = inputs.mode === 'mass' || inputs.mode === 'molarMass' ? inputs.mode : 'molality';
  const s = (x: number) => fmt.sig(clean(x), 6);
  const steps: ComputeResult['steps'] = [];

  if (mode === 'molarMass') {
    const g = num('solute');
    const kg = (num('solventG') ?? 0) / 1000;
    const tf = num('observed');
    if (g === null || tf === null) return none();
    if (!(g > 0) || !(kg > 0)) return none('warn.mass');
    const dTf = sv.fp - tf;
    if (!(dTf > 0)) return none('warn.noDepression');
    const m = dTf / (i * sv.kf);
    const mol = m * kg;
    const M = g / mol;
    steps.push(
      { key: 'step.dTf', math: `${s(sv.fp)} − ${s(tf)} = ${s(dTf)} °C` },
      { key: 'step.mFromT', math: `${s(dTf)} ÷ (${s(i)} × ${s(sv.kf)}) = ${s(m)} mol/kg` },
      { key: 'step.M', math: `${s(g)} g ÷ (${s(m)} × ${s(kg)} kg) = ${s(M)} g/mol` },
    );
    return {
      outputs: { result: clean(M), molality: clean(m), dTf: clean(dTf) },
      explain: { key: 'explain.M', values: { M: s(M) } },
      steps,
      warnings: [],
    };
  }

  let m: number;
  if (mode === 'mass') {
    const g = num('solute');
    const mm = num('mm');
    const kg = (num('solventG') ?? 0) / 1000;
    if (g === null || mm === null) return none();
    if (!(g >= 0) || !(mm > 0) || !(kg > 0)) return none('warn.mass');
    m = g / mm / kg;
    steps.push({
      key: 'step.m',
      math: `(${s(g)} g ÷ ${s(mm)} g/mol) ÷ ${s(kg)} kg = ${s(m)} mol/kg`,
    });
  } else {
    const mIn = num('molality');
    if (mIn === null) return none();
    if (mIn < 0) return none('warn.mass');
    m = mIn;
  }
  const dTb = i * sv.kb * m;
  const dTf = i * sv.kf * m;
  steps.push(
    { key: 'step.dTb', math: `${s(i)} × ${s(sv.kb)} × ${s(m)} = ${s(dTb)} °C` },
    { key: 'step.dTfCalc', math: `${s(i)} × ${s(sv.kf)} × ${s(m)} = ${s(dTf)} °C` },
  );
  return {
    outputs: {
      result: clean(sv.fp - dTf),
      bp: clean(sv.bp + dTb),
      dTb: clean(dTb),
      dTf: clean(dTf),
      molality: clean(m),
      particles: clean(i * m),
    },
    explain: { key: 'explain', values: { fp: s(sv.fp - dTf), bp: s(sv.bp + dTb) } },
    steps,
    warnings: m > 2 ? [{ key: 'warn.dilute', level: 'info' }] : [],
  };
};
