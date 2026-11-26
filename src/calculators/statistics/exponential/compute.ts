import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean } from '@/engine/money';

/**
 * Exponential distribution (OpenStax Introductory Statistics 2e §5.3; NIST/SEMATECH e-Handbook
 * §1.3.6.6.7 and §8.1.6.1). With decay rate m = 1/μ: pdf f(x) = m e^(−mx), P(X < x) = 1 − e^(−mx),
 * P(X > x) = e^(−mx), mean = standard deviation = 1/m, median ln 2/m, and the k-th percentile
 * −ln(1 − p)/m. Lower-tail probabilities use expm1 so tiny values stay accurate.
 */
export const compute: ComputeFn = (inputs, { fmt }) => {
  const num = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const none = (key?: string): ComputeResult => ({
    outputs: { below: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  const pIn = num('param');
  if (pIn === null) return none();
  if (!(pIn > 0)) return none('warn.param');
  const m = inputs.by === 'rate' ? pIn : 1 / pIn;
  const x = num('x');
  if (x === null) return none();
  if (x < 0) return none('warn.x');
  const x2 = num('x2');
  const pct = num('pct');
  const below = -Math.expm1(-m * x);
  const above = Math.exp(-m * x);
  const between = x2 !== null && x2 > x ? Math.exp(-m * x) - Math.exp(-m * x2) : null;
  const k = pct !== null && pct > 0 && pct < 100 ? -Math.log1p(-pct / 100) / m : null;
  const s = (v: number) => fmt.sig(clean(v), 8);

  return {
    outputs: {
      below: clean(below),
      above: clean(above),
      between: between === null ? null : clean(between),
      pdf: clean(m * Math.exp(-m * x)),
      percentile: k === null ? null : clean(k),
      mean: clean(1 / m),
      median: clean(Math.LN2 / m),
      rate: clean(m),
    },
    explain: { key: 'explain', values: { x: s(x), p: fmt.sig(clean(below), 4), mean: s(1 / m) } },
    steps: [
      ...(inputs.by === 'rate' ? [] : [{ key: 'step.m', math: `m = 1 ÷ ${s(pIn)} = ${s(m)}` }]),
      { key: 'step.below', math: `1 − e^(−${s(m)} × ${s(x)}) = ${s(below)}` },
      ...(between === null
        ? []
        : [
            {
              key: 'step.between',
              math: `e^(−${s(m)} × ${s(x)}) − e^(−${s(m)} × ${s(x2!)}) = ${s(between)}`,
            },
          ]),
      ...(k === null
        ? []
        : [{ key: 'step.pct', math: `−ln(1 − ${s(pct! / 100)}) ÷ ${s(m)} = ${s(k)}` }]),
    ],
    warnings: x2 !== null && x2 <= x && x2 > 0 ? [{ key: 'warn.x2', level: 'info' }] : [],
  };
};
