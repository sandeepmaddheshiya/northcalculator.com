import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean } from '@/engine/money';

/**
 * Clausius–Clapeyron equation, two-point form (OpenStax Chemistry 2e §10.3; Chieh & Censullo,
 * LibreTexts “Clausius-Clapeyron Equation”): ln(P₂/P₁) = (ΔH_vap/R)(1/T₁ − 1/T₂). Solves for
 * ΔH_vap, the vapour pressure P₂ at T₂, or the temperature T₂ where the vapour pressure is P₂
 * (a boiling point at that pressure). Pressures may be in any one unit; temperatures in °C or K.
 * R = 8.314462618 J/(mol·K). Assumes ΔH_vap is constant over the range.
 */
export const R = 8.314462618;

export const compute: ComputeFn = (inputs, { fmt }) => {
  const num = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const none = (key?: string): ComputeResult => ({
    outputs: { result: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  const celsius = inputs.tu !== 'K';
  const toK = (t: number | null) => (t === null ? null : celsius ? t + 273.15 : t);
  const fromK = (t: number) => (celsius ? t - 273.15 : t);
  const find = inputs.find === 'p2' || inputs.find === 't2' ? inputs.find : 'dh';
  const P1 = num('p1');
  const T1 = toK(num('t1'));
  if (P1 === null || T1 === null) return none();
  if (!(P1 > 0)) return none('warn.p');
  if (!(T1 > 0)) return none('warn.t');
  const s = (x: number) => fmt.sig(clean(x), 6);

  if (find === 'dh') {
    const P2 = num('p2');
    const T2 = toK(num('t2'));
    if (P2 === null || T2 === null) return none();
    if (!(P2 > 0)) return none('warn.p');
    if (!(T2 > 0)) return none('warn.t');
    if (T1 === T2) return none('warn.same');
    const dh = (R * Math.log(P2 / P1)) / (1 / T1 - 1 / T2);
    return {
      outputs: { result: clean(dh / 1000), dh: clean(dh / 1000) },
      explain: { key: 'explain.dh', values: { dh: s(dh / 1000) } },
      steps: [
        {
          key: 'step.dh',
          math: `${R} × ln(${s(P2)} ÷ ${s(P1)}) ÷ (1/${s(T1)} − 1/${s(T2)}) = ${s(dh)} J/mol`,
        },
      ],
      warnings: dh < 0 ? [{ key: 'warn.negative', level: 'warn' }] : [],
    };
  }

  const dhIn = num('dh');
  if (dhIn === null) return none();
  if (!(dhIn > 0)) return none('warn.dh');
  const dh = dhIn * 1000;
  if (find === 'p2') {
    const T2 = toK(num('t2'));
    if (T2 === null) return none();
    if (!(T2 > 0)) return none('warn.t');
    const P2 = P1 * Math.exp((dh / R) * (1 / T1 - 1 / T2));
    return {
      outputs: { result: clean(P2), p2: clean(P2), dh: clean(dhIn) },
      explain: { key: 'explain.p2', values: { p: s(P2) } },
      steps: [
        {
          key: 'step.p2',
          math: `${s(P1)} × e^((${s(dh)} ÷ ${R}) × (1/${s(T1)} − 1/${s(T2)})) = ${s(P2)}`,
        },
      ],
      warnings: [],
    };
  }
  const P2 = num('p2');
  if (P2 === null) return none();
  if (!(P2 > 0)) return none('warn.p');
  const inv = 1 / T1 - (R * Math.log(P2 / P1)) / dh;
  if (!(inv > 0)) return none('warn.range');
  const T2 = 1 / inv;
  return {
    outputs: { result: clean(fromK(T2)), t2K: clean(T2), dh: clean(dhIn) },
    explain: { key: 'explain.t2', values: { t: s(fromK(T2)), u: celsius ? '°C' : 'K' } },
    steps: [
      {
        key: 'step.t2',
        math: `1 ÷ (1/${s(T1)} − ${R} × ln(${s(P2)} ÷ ${s(P1)}) ÷ ${s(dh)}) = ${s(T2)} K`,
      },
    ],
    warnings: [],
  };
};
