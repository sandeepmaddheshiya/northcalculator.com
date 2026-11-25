import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean } from '@/engine/money';

/**
 * Arrhenius equation k = A e^(−Ea/RT) (OpenStax Chemistry 2e §12.5; Stephen Lower, LibreTexts
 * "Arrhenius Equation"), in three forms:
 *  - activation energy from two rate constants: Ea = R ln(k₂/k₁) ÷ (1/T₁ − 1/T₂);
 *  - a rate constant at a new temperature: k₂ = k₁ e^(−(Ea/R)(1/T₂ − 1/T₁));
 *  - a rate constant from A and Ea: k = A e^(−Ea/RT).
 * R = 8.314462618 J/(mol·K) (CODATA, exact). Ea is entered and reported in kJ/mol.
 */
export const R = 8.314462618;

export const compute: ComputeFn = (inputs, { fmt }) => {
  const num = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const none = (key?: string): ComputeResult => ({
    outputs: { result: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  const find = inputs.find === 'k2' || inputs.find === 'k' ? inputs.find : 'ea';
  const toK = (t: number | null) => (t === null ? null : inputs.tu === 'C' ? t + 273.15 : t);
  const T1 = toK(num('T1'));
  const T2 = toK(num('T2'));
  const k1 = num('k1');
  const k2In = num('k2');
  const eaIn = num('ea');
  const A = num('A');
  const s = (x: number) => fmt.sig(clean(x), 6);
  const kelvin = (...ts: (number | null)[]) => ts.every((t) => t === null || t > 0);

  if (find === 'ea') {
    if (k1 === null || k2In === null || T1 === null || T2 === null) return none();
    if (!kelvin(T1, T2)) return none('warn.kelvin');
    if (!(k1 > 0) || !(k2In > 0)) return none('warn.k');
    if (T1 === T2) return none('warn.sameT');
    const ea = (R * Math.log(k2In / k1)) / (1 / T1 - 1 / T2);
    const lnA = Math.log(k1) + ea / (R * T1);
    return {
      outputs: {
        result: clean(ea / 1000),
        ea: clean(ea / 1000),
        A: clean(Math.exp(lnA)),
        ratio: clean(k2In / k1),
      },
      explain: { key: 'explain.ea', values: { ea: s(ea / 1000) } },
      steps: [
        { key: 'step.ln', math: `ln(${s(k2In)} ÷ ${s(k1)}) = ${s(Math.log(k2In / k1))}` },
        {
          key: 'step.ea',
          math: `${R} × ${s(Math.log(k2In / k1))} ÷ (1/${s(T1)} − 1/${s(T2)}) = ${s(ea)} J/mol`,
        },
        {
          key: 'step.A',
          math: `A = ${s(k1)} × e^(${s(ea)} ÷ (${R} × ${s(T1)})) = ${s(Math.exp(lnA))}`,
        },
      ],
      warnings: ea < 0 ? [{ key: 'warn.negative', level: 'info' }] : [],
    };
  }

  if (eaIn === null) return none();
  const ea = eaIn * 1000;
  if (find === 'k2') {
    if (k1 === null || T1 === null || T2 === null) return none();
    if (!kelvin(T1, T2)) return none('warn.kelvin');
    if (!(k1 > 0)) return none('warn.k');
    const k2 = k1 * Math.exp((-ea / R) * (1 / T2 - 1 / T1));
    return {
      outputs: { result: clean(k2), k2: clean(k2), ratio: clean(k2 / k1), ea: clean(eaIn) },
      explain: { key: 'explain.k2', values: { k: s(k2), r: s(k2 / k1) } },
      steps: [
        {
          key: 'step.k2',
          math: `${s(k1)} × e^(−(${s(ea)} ÷ ${R}) × (1/${s(T2)} − 1/${s(T1)})) = ${s(k2)}`,
        },
      ],
      warnings: [],
    };
  }

  if (A === null || T1 === null) return none();
  if (!kelvin(T1)) return none('warn.kelvin');
  if (!(A > 0)) return none('warn.k');
  const k = A * Math.exp(-ea / (R * T1));
  return {
    outputs: { result: clean(k), k2: clean(k), ea: clean(eaIn) },
    explain: { key: 'explain.k', values: { k: s(k) } },
    steps: [{ key: 'step.k', math: `${s(A)} × e^(−${s(ea)} ÷ (${R} × ${s(T1)})) = ${s(k)}` }],
    warnings: [],
  };
};
