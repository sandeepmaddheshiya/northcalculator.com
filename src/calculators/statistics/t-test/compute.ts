import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean } from '@/engine/money';
import { pValue, tInv, type Tail } from '@/engine/stats';
import { parseList, sum } from '@/calculators/math/average/compute';

/**
 * One-sample t-test (NIST/SEMATECH e-Handbook §1.3.5.2; OpenStax Introductory Statistics 2e §9.5):
 * t = (x̄ − μ₀) ÷ (s ÷ √n) with n − 1 degrees of freedom. P-values come straight from the
 * regularized incomplete beta function, P(T > |t|) = ½ I_{ν/(ν+t²)}(ν/2, ½), so tiny p-values keep
 * their precision. Critical values are t quantiles (engine/stats tInv). Assumes a random sample
 * from a roughly normal population, or a large sample.
 */
export { pValue, upperTail, type Tail } from '@/engine/stats';

export const compute: ComputeFn = (inputs, ctx) => {
  const { fmt } = ctx;
  const tr = ctx.t ?? ((k: string) => k);
  const num = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const none = (key?: string): ComputeResult => ({
    outputs: { p: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  const tail: Tail = inputs.tail === 'right' || inputs.tail === 'left' ? inputs.tail : 'two';
  const alpha = Number(inputs.alpha) > 0 && Number(inputs.alpha) < 1 ? Number(inputs.alpha) : 0.05;
  const mu0 = num('mu0');
  if (mu0 === null) return none();

  let n: number;
  let mean: number;
  let sd: number;
  const warnings: ComputeResult['warnings'] = [];
  if (inputs.mode === 'data') {
    const { values, bad } = parseList(String(inputs.data ?? ''), fmt.locale);
    if (bad.length)
      warnings.push({ key: 'warn.ignored', level: 'info', values: { n: bad.length } });
    n = values.length;
    if (n < 2) {
      const r = none();
      r.warnings.push(...warnings, { key: 'warn.two', level: 'warn' });
      return r;
    }
    mean = sum(values) / n;
    sd = Math.sqrt(sum(values.map((x) => (x - mean) ** 2)) / (n - 1));
  } else {
    const nIn = num('n');
    const mIn = num('mean');
    const sIn = num('sd');
    if (nIn === null || mIn === null || sIn === null) return none();
    if (!Number.isInteger(nIn) || nIn < 2) return none('warn.two');
    n = nIn;
    mean = mIn;
    sd = sIn;
  }
  if (!(sd > 0)) return none('warn.sd');

  const df = n - 1;
  const se = sd / Math.sqrt(n);
  const t = (mean - mu0) / se;
  const p = pValue(t, df, tail);
  const critical = tail === 'two' ? tInv(1 - alpha / 2, df) : tInv(1 - alpha, df);
  const reject = p < alpha;
  const s = (x: number) => fmt.sig(clean(x), 8);
  const symbol = tail === 'two' ? '≠' : tail === 'right' ? '>' : '<';

  return {
    outputs: {
      p: clean(p),
      decision: tr(reject ? 'decision.reject' : 'decision.keep'),
      t: clean(t),
      df,
      critical: clean(tail === 'left' ? -critical : critical),
      se: clean(se),
      mean: clean(mean),
      sd: clean(sd),
    },
    explain: {
      key: reject ? 'explain.reject' : 'explain.keep',
      values: { p: fmt.sig(clean(p), 4), a: fmt.num(alpha, 2), sym: symbol, mu: s(mu0) },
    },
    steps: [
      { key: 'step.se', math: `${s(sd)} ÷ √${n} = ${s(se)}` },
      { key: 'step.t', math: `(${s(mean)} − ${s(mu0)}) ÷ ${s(se)} = ${s(t)}` },
      {
        key: `step.p.${tail}`,
        values: { df },
        math: `p = ${s(p)}`,
      },
      {
        key: 'step.decide',
        math: `${s(p)} ${reject ? '<' : '≥'} ${fmt.num(alpha, 2)}`,
      },
    ],
    warnings: n < 30 ? [...warnings, { key: 'warn.small', level: 'info' }] : warnings,
  };
};
