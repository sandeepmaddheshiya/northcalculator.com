import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean } from '@/engine/money';

/**
 * Gibbs free energy change ΔG = ΔH − TΔS (OpenStax Chemistry 2e §16.4; Lower et al., LibreTexts
 * "Gibbs (Free) Energy"; Petrucci map §19.6). ΔH in kJ/mol, ΔS in J/(mol·K), so ΔS is divided by
 * 1000. ΔG < 0: spontaneous; ΔG > 0: nonspontaneous; ΔG = 0: at equilibrium. The crossover
 * temperature T = ΔH ÷ ΔS exists when ΔH and ΔS share a sign. For standard values the equilibrium
 * constant is K = e^(−ΔG°/RT), with R = 8.314462618 J/(mol·K) (CODATA).
 */
export const R = 8.314462618;

export const compute: ComputeFn = (inputs, ctx) => {
  const { fmt } = ctx;
  const tr = ctx.t ?? ((k: string) => k);
  const num = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const none = (key?: string): ComputeResult => ({
    outputs: { dG: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  const dH = num('dH');
  const dS = num('dS');
  const tIn = num('T');
  if (dH === null || dS === null || tIn === null) return none();
  const T = inputs.tu === 'C' ? tIn + 273.15 : tIn;
  if (!(T > 0)) return none('warn.kelvin');
  const tdS = (T * dS) / 1000;
  const dG = dH - tdS;
  const tol = 1e-12 * (Math.abs(dH) + Math.abs(tdS) + 1);
  const g = Math.abs(dG) <= tol ? 0 : dG;
  const crossover =
    dS !== 0 && dH !== 0 && Math.sign(dH) === Math.sign(dS) ? (dH * 1000) / dS : null;
  const lnK = (-g * 1000) / (R * T);
  const K = lnK > 709 ? null : Math.exp(lnK);
  const s = (x: number) => fmt.sig(clean(x), 8);
  const sign = (x: number) => (x > 0 ? '+' : x < 0 ? '−' : '0');
  const verdictKey = g < 0 ? 'verdict.yes' : g > 0 ? 'verdict.no' : 'verdict.eq';
  const caseKey = `case.${sign(dH) === '−' ? 'n' : 'p'}${sign(dS) === '−' ? 'n' : 'p'}`;

  return {
    outputs: {
      dG: clean(g),
      verdict: tr(verdictKey),
      tdS: clean(tdS),
      crossK: crossover === null ? null : clean(crossover),
      crossC: crossover === null ? null : clean(crossover - 273.15),
      K: K === null ? null : clean(K),
      lnK: clean(lnK),
    },
    explain: {
      key: g < 0 ? 'explain.yes' : g > 0 ? 'explain.no' : 'explain.eq',
      values: { g: s(g), t: s(T) },
    },
    steps: [
      ...(inputs.tu === 'C'
        ? [{ key: 'step.kelvin', math: `${s(tIn)} + 273.15 = ${s(T)} K` }]
        : []),
      { key: 'step.tds', math: `${s(T)} K × ${s(dS)} J/K ÷ 1000 = ${s(tdS)} kJ` },
      { key: 'step.dg', math: `${s(dH)} − (${s(tdS)}) = ${s(g)} kJ/mol` },
      ...(crossover === null
        ? []
        : [{ key: 'step.cross', math: `${s(dH)} × 1000 ÷ ${s(dS)} = ${s(crossover)} K` }]),
      {
        key: 'step.k',
        math: `K = e^(−${s(g)} × 1000 ÷ (${R} × ${s(T)})) = ${K === null ? '∞' : fmt.sig(clean(K), 4)}`,
      },
    ],
    warnings: dH !== 0 || dS !== 0 ? [{ key: caseKey, level: 'info' }] : [],
  };
};
