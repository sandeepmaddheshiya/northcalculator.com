import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean } from '@/engine/money';
import { normalInv, tInv } from '@/engine/stats';

/**
 * Two-sided confidence intervals.
 *   Mean, sample s:      x̄ ± t(1 − α/2, n − 1)·s/√n   (NIST/SEMATECH 1.3.5.2)
 *   Mean, known σ:       x̄ ± z(1 − α/2)·σ/√n          (OpenStax Intro Stats 2e §8.1)
 *   Proportion:          p̂ ± z√(p̂(1 − p̂)/n)           (OpenStax §8.3), plus the Wilson
 *                        interval the NIST handbook recommends (7.2.4.1).
 * The interval endpoints are shown to 8 significant digits (5 decimals for proportions).
 */
export function wilson(p: number, n: number, z: number): [number, number] {
  const z2 = z * z;
  const centre = p + z2 / (2 * n);
  const spread = z * Math.sqrt((p * (1 - p)) / n + z2 / (4 * n * n));
  const d = 1 + z2 / n;
  return [(centre - spread) / d, (centre + spread) / d];
}

export const compute: ComputeFn = (inputs, ctx) => {
  const { fmt } = ctx;
  const val = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const none = (key?: string): ComputeResult => ({
    outputs: { interval: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  const n = val('n');
  const level = val('level');
  if (n === null || level === null) return none();
  if (!(level > 0 && level < 100)) return none('warn.level');
  const alpha = 1 - level / 100;
  const prop = inputs.type === 'proportion';

  if (prop) {
    const x = val('successes');
    if (x === null) return none();
    if (!(n >= 1) || x > n) return none('warn.successes');
    const p = x / n;
    const z = normalInv(1 - alpha / 2);
    const se = Math.sqrt((p * (1 - p)) / n);
    const e = z * se;
    const [wl, wu] = wilson(p, n, z);
    const d5 = (v: number) => fmt.num(clean(v), 5);
    const small = n * p <= 5 || n * (1 - p) <= 5;
    return {
      outputs: {
        interval: `(${d5(p - e)}, ${d5(p + e)})`,
        margin: clean(e),
        lower: clean(p - e),
        upper: clean(p + e),
        critical: clean(z),
        se: clean(se),
        wilson: `(${d5(wl)}, ${d5(wu)})`,
      },
      explain: {
        key: 'explain.proportion',
        values: {
          level: fmt.num(level, 2),
          lo: fmt.pct(clean((p - e) * 100), 2),
          hi: fmt.pct(clean((p + e) * 100), 2),
        },
      },
      steps: [
        { key: 'step.p', math: `p̂ = ${x} ÷ ${n} = ${fmt.sig(clean(p), 8)}` },
        { key: 'step.z', math: `z = ${fmt.sig(clean(z), 8)}` },
        {
          key: 'step.ebp',
          math: `${fmt.sig(clean(z), 8)} × √(${fmt.sig(clean(p), 8)} × ${fmt.sig(clean(1 - p), 8)} ÷ ${n}) = ${fmt.sig(clean(e), 8)}`,
        },
      ],
      warnings: small ? [{ key: 'warn.small', level: 'warn' }] : [],
    };
  }

  const mean = val('mean');
  const sd = val('sd');
  if (mean === null || sd === null) return none();
  if (!(sd >= 0)) return none('warn.sd');
  const sample = inputs.sdKind !== 'population';
  if (sample && n < 2) return none('warn.n');
  const crit = sample ? tInv(1 - alpha / 2, n - 1) : normalInv(1 - alpha / 2);
  const se = sd / Math.sqrt(n);
  const e = crit * se;
  const s8 = (v: number) => fmt.sig(clean(v), 8);
  return {
    outputs: {
      interval: `(${s8(mean - e)}, ${s8(mean + e)})`,
      margin: clean(e),
      lower: clean(mean - e),
      upper: clean(mean + e),
      critical: clean(crit),
      se: clean(se),
      wilson: null,
    },
    explain: {
      key: 'explain.mean',
      values: { level: fmt.num(level, 2), lo: s8(mean - e), hi: s8(mean + e) },
    },
    steps: [
      {
        key: sample ? 'step.t' : 'step.z',
        math: `${sample ? `t(df = ${n - 1})` : 'z'} = ${s8(crit)}`,
      },
      { key: 'step.se', math: `${s8(sd)} ÷ √${n} = ${s8(se)}` },
      { key: 'step.margin', math: `${s8(crit)} × ${s8(se)} = ${s8(e)}` },
    ],
    warnings: [],
  };
};
