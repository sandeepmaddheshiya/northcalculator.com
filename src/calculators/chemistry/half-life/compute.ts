import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean } from '@/engine/money';

/**
 * First-order decay N = N₀e^(−λt) = N₀(½)^(t/t½), λ = ln 2 ÷ t½ (OpenStax Chemistry 2e §21.3;
 * College Physics 2e §31.5), solved for the amount remaining, the elapsed time or the
 * half-life. Times and half-life share whatever unit is entered; amounts share theirs (grams,
 * atoms, activity). The exact ln 2 is used, not 0.693.
 */
export const compute: ComputeFn = (inputs, { fmt }) => {
  const val = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const find = inputs.find === 'time' || inputs.find === 'halfLife' ? inputs.find : 'remaining';
  const none = (key?: string): ComputeResult => ({
    outputs: { result: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  const n0 = val('initial');
  if (n0 === null) return none();
  if (!(n0 > 0)) return none('warn.initial');
  let n: number;
  let t: number;
  let h: number;
  const s = (x: number) => fmt.sig(clean(x), 8);
  if (find === 'remaining') {
    const a = val('time');
    const b = val('halfLife');
    if (a === null || b === null) return none();
    if (!(b > 0)) return none('warn.halfLife');
    [t, h] = [a, b];
    n = n0 * 2 ** (-t / h);
  } else if (find === 'time') {
    const a = val('remaining');
    const b = val('halfLife');
    if (a === null || b === null) return none();
    if (!(a > 0) || a > n0) return none('warn.remaining');
    if (!(b > 0)) return none('warn.halfLife');
    [n, h] = [a, b];
    t = (-h * Math.log(n / n0)) / Math.LN2;
  } else {
    const a = val('remaining');
    const b = val('time');
    if (a === null || b === null) return none();
    if (!(a > 0) || !(a < n0)) return none('warn.remaining');
    if (!(b > 0)) return none('warn.time');
    [n, t] = [a, b];
    h = (-t * Math.LN2) / Math.log(n / n0);
  }
  const lambda = Math.LN2 / h;
  return {
    outputs: {
      result: clean(find === 'remaining' ? n : find === 'time' ? t : h),
      percent: clean((n / n0) * 100),
      halfLives: clean(t / h),
      lambda: clean(lambda),
    },
    explain: {
      key: 'explain',
      values: { t: s(t), h: s(h), pct: fmt.pct(clean((n / n0) * 100), 2), k: s(t / h) },
    },
    steps: [
      { key: 'step.lambda', math: `λ = ln 2 ÷ ${s(h)} = ${s(lambda)}` },
      find === 'remaining'
        ? { key: 'step.remaining', math: `${s(n0)} × ½^(${s(t)} ÷ ${s(h)}) = ${s(n)}` }
        : find === 'time'
          ? { key: 'step.time', math: `−${s(h)} × ln(${s(n)} ÷ ${s(n0)}) ÷ ln 2 = ${s(t)}` }
          : { key: 'step.halfLife', math: `−${s(t)} × ln 2 ÷ ln(${s(n)} ÷ ${s(n0)}) = ${s(h)}` },
    ],
    warnings: [],
  };
};
