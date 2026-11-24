import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean } from '@/engine/money';
import { factorize, MAX_VALUE } from '../lcm-gcf/compute';

/**
 * n-th root (OpenStax Intermediate Algebra 2e §8.1): b = ⁿ√a when bⁿ = a. Odd roots of negative
 * numbers are negative; even roots of negative numbers are not real. For whole numbers the radical
 * is simplified with the product property (§8.2): every prime factor contributes ⌊e/n⌋ to the
 * outside and e mod n to the inside.
 */
const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
export const radical = (n: number) =>
  n === 2
    ? '√'
    : n === 3
      ? '∛'
      : n === 4
        ? '∜'
        : `${[...String(n)].map((d) => SUP[Number(d)]).join('')}√`;

export function simplifyRadical(x: number, n: number): { out: number; inside: number } {
  let out = 1;
  let inside = 1;
  for (const [p, e] of factorize(x)) {
    out *= p ** Math.floor(e / n);
    inside *= p ** (e % n);
  }
  return { out, inside };
}

export const compute: ComputeFn = (inputs, { fmt }) => {
  const x = typeof inputs.x === 'number' ? inputs.x : null;
  const n = typeof inputs.n === 'number' ? Math.round(inputs.n) : 2;
  if (x === null || n < 2) {
    const none: ComputeResult = { outputs: { root: null }, steps: [], warnings: [] };
    return none;
  }
  const sym = radical(n);
  if (x < 0 && n % 2 === 0) {
    const none: ComputeResult = {
      outputs: { root: null },
      steps: [],
      warnings: [{ key: 'warn.notReal', values: { n }, level: 'warn' }],
    };
    return none;
  }
  const mag = Math.abs(x) ** (1 / n);
  const snapped =
    Math.abs(mag - Math.round(mag)) < 1e-9 * Math.max(1, mag) &&
    Math.round(mag) ** n === Math.abs(x)
      ? Math.round(mag)
      : mag;
  const value = clean(Math.sign(x) * snapped);
  const sign = x < 0 ? '−' : '';
  const nf = new Intl.NumberFormat(fmt.locale, { maximumFractionDigits: 0 });

  let simplified: string | null = null;
  let between: string | null = null;
  const steps: ComputeResult['steps'] = [];
  if (Number.isInteger(x) && Math.abs(x) <= MAX_VALUE && x !== 0) {
    const { out, inside } = simplifyRadical(Math.abs(x), n);
    simplified =
      inside === 1
        ? `${sign}${nf.format(out)}`
        : `${sign}${out === 1 ? '' : nf.format(out)}${sym}${nf.format(inside)}`;
    if (inside !== 1) {
      const lo = Math.floor(mag);
      between =
        x < 0
          ? `${nf.format(-lo - 1)} and ${nf.format(-lo)}`
          : `${nf.format(lo)} and ${nf.format(lo + 1)}`;
      steps.push({
        key: 'step.factor',
        values: { n },
        math: `${sym}${nf.format(Math.abs(x))} = ${sym}(${nf.format(out ** n)} × ${nf.format(inside)}) = ${simplified.replace('−', '')}`,
      });
    }
  }
  if (Number.isInteger(x) && simplified && !between)
    steps.push({
      key: 'step.perfect',
      math: `${fmt.sig(Math.abs(value), 12)}^${n} = ${nf.format(Math.abs(x))}`,
    });
  steps.push({ key: 'step.decimal', math: `${sym}${fmt.num(x, 10)} ≈ ${fmt.sig(value, 12)}` });

  return {
    outputs: { root: value, simplified, between },
    explain: {
      key: n === 2 ? 'explain.square' : 'explain.nth',
      values: { x: fmt.num(x, 10), n, r: fmt.sig(value, 12) },
    },
    steps,
    warnings: [],
  };
};
