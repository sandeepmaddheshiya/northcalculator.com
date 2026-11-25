import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean } from '@/engine/money';

/**
 * Nernst equation and cell thermodynamics (OpenStax Chemistry 2e §17.4; LibreTexts “Nernst
 * Equation”): E = E° − (RT/nF) ln Q, ΔG = −nFE, ΔG° = −nFE°, K = e^(nFE°/RT). At 25 °C the slope
 * RT ln 10 / F is 0.05916 V, the textbooks’ 0.0592 V. F = 96,485.33212 C/mol and
 * R = 8.314462618 J/(mol·K) (CODATA, exact).
 */
export const F = 96485.33212;
export const R = 8.314462618;

export const compute: ComputeFn = (inputs, ctx) => {
  const { fmt } = ctx;
  const tr = ctx.t ?? ((k: string) => k);
  const num = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const none = (key?: string): ComputeResult => ({
    outputs: { result: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  const e0 = num('e0');
  const n = num('n');
  const tC = num('t');
  if (e0 === null || n === null || tC === null) return none();
  if (!(n > 0) || !Number.isInteger(n)) return none('warn.n');
  const T = tC + 273.15;
  if (!(T > 0)) return none('warn.kelvin');
  const slope = (R * T) / (n * F);
  const s = (x: number) => fmt.sig(clean(x), 6);
  const dG0 = (-n * F * e0) / 1000;
  const lnK = e0 / slope;
  const K = lnK > 709 ? null : Math.exp(lnK);
  const log10K = lnK / Math.LN10;
  const steps: ComputeResult['steps'] = [
    { key: 'step.slope', math: `${R} × ${s(T)} ÷ (${n} × ${F}) = ${s(slope)} V` },
  ];

  if (inputs.mode === 'k') {
    steps.push(
      { key: 'step.k', math: `K = e^(${s(e0)} ÷ ${s(slope)}) = 10^${s(log10K)}` },
      { key: 'step.g0', math: `−${n} × ${F} × ${s(e0)} = ${s(dG0 * 1000)} J/mol` },
    );
    return {
      outputs: {
        result: K === null ? null : clean(K),
        log10K: clean(log10K),
        dG0: clean(dG0),
        verdict: tr(e0 > 0 ? 'verdict.yes' : e0 < 0 ? 'verdict.no' : 'verdict.eq'),
      },
      explain: { key: 'explain.k', values: { k: fmt.sig(clean(log10K), 4) } },
      steps,
      warnings: K === null ? [{ key: 'warn.huge', level: 'info', values: { k: s(log10K) } }] : [],
    };
  }

  const q = num('q');
  if (q === null) return none();
  if (!(q > 0)) return none('warn.q');
  const E = e0 - slope * Math.log(q);
  const dG = (-n * F * E) / 1000;
  steps.push(
    { key: 'step.e', math: `${s(e0)} − ${s(slope)} × ln(${s(q)}) = ${s(E)} V` },
    { key: 'step.g', math: `−${n} × ${F} × ${s(E)} = ${s(dG * 1000)} J/mol` },
  );
  return {
    outputs: {
      result: clean(E),
      dG: clean(dG),
      verdict: tr(E > 0 ? 'verdict.yes' : E < 0 ? 'verdict.no' : 'verdict.eq'),
      dG0: clean(dG0),
      log10K: clean(log10K),
    },
    explain: { key: E >= 0 ? 'explain.yes' : 'explain.no', values: { e: s(E) } },
    steps,
    warnings: [],
  };
};
