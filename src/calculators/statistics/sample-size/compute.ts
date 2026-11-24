import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean } from '@/engine/money';
import { normalInv } from '@/engine/stats';

/**
 * Sample size for a confidence interval of a given margin of error E (OpenStax Intro Stats 2e
 * §8.1 and §8.3; NIST/SEMATECH 7.2.2.2):
 *   mean:       n = (zσ ÷ E)²
 *   proportion: n = z²p(1 − p) ÷ E², with p = 0.5 when unknown (the largest n)
 * always rounded up. z is the two-sided critical value, computed rather than rounded to 1.96.
 * The result is rounded to 9 decimals before rounding up so floating-point noise cannot add one.
 */
export const compute: ComputeFn = (inputs, { fmt }) => {
  const val = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const none = (key?: string): ComputeResult => ({
    outputs: { n: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  const level = val('level');
  const e = val('margin');
  if (level === null || e === null) return none();
  if (!(level > 0 && level < 100)) return none('warn.level');
  if (!(e > 0)) return none('warn.margin');
  const z = normalInv(1 - (1 - level / 100) / 2);
  const prop = inputs.type !== 'mean';
  let exact: number;
  let math: string;
  const s = (x: number) => fmt.sig(clean(x), 8);
  if (prop) {
    const pp = val('p');
    if (pp === null) return none();
    const p = pp / 100;
    const ee = e / 100;
    exact = (z * z * p * (1 - p)) / (ee * ee);
    math = `${s(z)}² × ${s(p)} × ${s(1 - p)} ÷ ${s(ee)}² = ${s(exact)}`;
  } else {
    const sd = val('sd');
    if (sd === null) return none();
    exact = ((z * sd) / e) ** 2;
    math = `(${s(z)} × ${s(sd)} ÷ ${s(e)})² = ${s(exact)}`;
  }
  const n = Math.max(1, Math.ceil(Math.round(exact * 1e9) / 1e9));
  return {
    outputs: { n, exact: clean(exact), z: clean(z) },
    explain: {
      key: prop ? 'explain.proportion' : 'explain.mean',
      values: { n: fmt.num(n, 0), e: fmt.num(e, 4), level: fmt.num(level, 2) },
    },
    steps: [
      { key: 'step.z', math: `z = ${s(z)}` },
      { key: prop ? 'step.proportion' : 'step.mean', math },
      { key: 'step.ceil', math: `⌈${s(exact)}⌉ = ${n}` },
    ],
    warnings: [],
  };
};
