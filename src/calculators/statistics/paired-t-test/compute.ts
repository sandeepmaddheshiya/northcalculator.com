import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean } from '@/engine/money';
import { pValue, tInv, type Tail } from '@/engine/stats';
import { parseList, sum } from '@/calculators/math/average/compute';

/**
 * Paired (matched-samples) t-test (OpenStax Introductory Statistics 2e §10.4; Introductory
 * Business Statistics §10.6): take each pair’s difference d = second − first, then test the mean
 * difference with t = (d̄ − μ_d) ÷ (s_d ÷ √n), n − 1 degrees of freedom. Works from two lists in
 * matching order or from the summary statistics of the differences.
 */
export const compute: ComputeFn = (inputs, ctx) => {
  const { fmt } = ctx;
  const tr = ctx.t ?? ((k: string) => k);
  const num = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const none = (key?: string): ComputeResult => ({
    outputs: { p: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  const mu = num('mu') ?? 0;
  const tail: Tail = inputs.tail === 'right' || inputs.tail === 'left' ? inputs.tail : 'two';
  const alpha = Number(inputs.alpha) > 0 && Number(inputs.alpha) < 1 ? Number(inputs.alpha) : 0.05;
  const s = (x: number) => fmt.sig(clean(x), 8);
  let n: number;
  let mean: number;
  let sd: number;
  const steps: ComputeResult['steps'] = [];

  if (inputs.mode === 'summary') {
    const nIn = num('n');
    const mIn = num('mean');
    const sIn = num('sd');
    if (nIn === null || mIn === null || sIn === null) return none();
    if (!Number.isInteger(nIn) || nIn < 2) return none('warn.two');
    n = nIn;
    mean = mIn;
    sd = sIn;
  } else {
    const a = parseList(String(inputs.first ?? ''), fmt.locale).values;
    const b = parseList(String(inputs.second ?? ''), fmt.locale).values;
    if (a.length !== b.length) return none('warn.length');
    if (a.length < 2) return none('warn.two');
    const d = b.map((x, i) => x - a[i]!);
    n = d.length;
    mean = sum(d) / n;
    sd = Math.sqrt(sum(d.map((x) => (x - mean) ** 2)) / (n - 1));
    steps.push({
      key: 'step.diffs',
      math: `${d
        .slice(0, 8)
        .map((x) => s(x))
        .join(', ')}${n > 8 ? ', …' : ''}`,
    });
  }
  if (!(sd > 0)) return none('warn.sd');
  const df = n - 1;
  const se = sd / Math.sqrt(n);
  const t = (mean - mu) / se;
  const p = pValue(t, df, tail);
  const crit = tail === 'two' ? tInv(1 - alpha / 2, df) : tInv(1 - alpha, df);
  const reject = p < alpha;
  const symbol = tail === 'two' ? '≠' : tail === 'right' ? '>' : '<';
  steps.push(
    { key: 'step.mean', math: `d̄ = ${s(mean)}, s_d = ${s(sd)}, n = ${n}` },
    { key: 'step.t', math: `(${s(mean)} − ${s(mu)}) ÷ (${s(sd)} ÷ √${n}) = ${s(t)}` },
    { key: `step.p.${tail}`, math: `p = ${s(p)} ${reject ? '<' : '≥'} ${fmt.num(alpha, 2)}` },
  );

  return {
    outputs: {
      p: clean(p),
      decision: tr(reject ? 'decision.reject' : 'decision.keep'),
      t: clean(t),
      df,
      critical: clean(tail === 'left' ? -crit : crit),
      mean: clean(mean),
      sd: clean(sd),
    },
    explain: {
      key: reject ? 'explain.reject' : 'explain.keep',
      values: { p: fmt.sig(clean(p), 4), a: fmt.num(alpha, 2), sym: symbol, mu: s(mu) },
    },
    steps,
    warnings: n < 30 ? [{ key: 'warn.small', level: 'info' }] : [],
  };
};
