import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean } from '@/engine/money';
import { tInv } from '@/engine/stats';
import { pValue, type Tail } from '@/calculators/statistics/t-test/compute';

/**
 * Two-sample t-test for independent means (NIST/SEMATECH e-Handbook §1.3.5.3; OpenStax
 * Introductory Statistics 2e §10.1). Welch (unequal variances, the OpenStax default):
 * t = (x̄₁ − x̄₂) ÷ √(s₁²/n₁ + s₂²/n₂) with the Welch–Satterthwaite df. Pooled (equal variances):
 * sp² = ((n₁−1)s₁² + (n₂−1)s₂²) ÷ (n₁+n₂−2), t = (x̄₁ − x̄₂) ÷ (sp √(1/n₁ + 1/n₂)), df = n₁+n₂−2.
 * P-values reuse the one-sample incomplete-beta tails, which accept fractional df.
 */
export function twoSample(
  n1: number,
  m1: number,
  s1: number,
  n2: number,
  m2: number,
  s2: number,
  pooled: boolean,
): { t: number; df: number; se: number; sp: number | null } {
  if (pooled) {
    const df = n1 + n2 - 2;
    const sp = Math.sqrt(((n1 - 1) * s1 * s1 + (n2 - 1) * s2 * s2) / df);
    const se = sp * Math.sqrt(1 / n1 + 1 / n2);
    return { t: (m1 - m2) / se, df, se, sp };
  }
  const a = (s1 * s1) / n1;
  const b = (s2 * s2) / n2;
  const se = Math.sqrt(a + b);
  const df = (a + b) ** 2 / ((a * a) / (n1 - 1) + (b * b) / (n2 - 1));
  return { t: (m1 - m2) / se, df, se, sp: null };
}

export const compute: ComputeFn = (inputs, ctx) => {
  const { fmt } = ctx;
  const tr = ctx.t ?? ((k: string) => k);
  const num = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const none = (key?: string): ComputeResult => ({
    outputs: { p: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  const vals = ['n1', 'm1', 's1', 'n2', 'm2', 's2'].map(num);
  if (vals.some((v) => v === null)) return none();
  const [n1, m1, s1, n2, m2, s2] = vals as number[];
  if (!Number.isInteger(n1) || !Number.isInteger(n2) || n1! < 2 || n2! < 2) return none('warn.n');
  if (!(s1! > 0) || !(s2! > 0)) return none('warn.sd');
  const tail: Tail = inputs.tail === 'right' || inputs.tail === 'left' ? inputs.tail : 'two';
  const alpha = Number(inputs.alpha) > 0 && Number(inputs.alpha) < 1 ? Number(inputs.alpha) : 0.05;
  const pooled = inputs.method === 'pooled';
  const { t, df, se, sp } = twoSample(n1!, m1!, s1!, n2!, m2!, s2!, pooled);
  const p = pValue(t, df, tail);
  const crit = tail === 'two' ? tInv(1 - alpha / 2, df) : tInv(1 - alpha, df);
  const reject = p < alpha;
  const s = (x: number) => fmt.sig(clean(x), 8);
  const ratio = Math.max(s1!, s2!) / Math.min(s1!, s2!);
  const symbol = tail === 'two' ? '≠' : tail === 'right' ? '>' : '<';

  return {
    outputs: {
      p: clean(p),
      decision: tr(reject ? 'decision.reject' : 'decision.keep'),
      t: clean(t),
      df: clean(df),
      critical: clean(tail === 'left' ? -crit : crit),
      diff: clean(m1! - m2!),
      se: clean(se),
      sp: sp === null ? null : clean(sp),
    },
    explain: {
      key: reject ? 'explain.reject' : 'explain.keep',
      values: { p: fmt.sig(clean(p), 4), a: fmt.num(alpha, 2), sym: symbol },
    },
    steps: [
      pooled
        ? {
            key: 'step.pooled',
            math: `sp = √((${n1! - 1} × ${s(s1!)}² + ${n2! - 1} × ${s(s2!)}²) ÷ ${df}) = ${s(sp!)}; SE = ${s(sp!)} × √(1/${n1} + 1/${n2}) = ${s(se)}`,
          }
        : { key: 'step.se', math: `√(${s(s1!)}²/${n1} + ${s(s2!)}²/${n2}) = ${s(se)}` },
      { key: 'step.t', math: `(${s(m1!)} − ${s(m2!)}) ÷ ${s(se)} = ${s(t)}` },
      { key: pooled ? 'step.dfPooled' : 'step.dfWelch', math: `df = ${s(df)}` },
      { key: `step.p.${tail}`, math: `p = ${s(p)} ${reject ? '<' : '≥'} ${fmt.num(alpha, 2)}` },
    ],
    warnings: pooled && ratio > 2 ? [{ key: 'warn.unequal', level: 'info' }] : [],
  };
};
