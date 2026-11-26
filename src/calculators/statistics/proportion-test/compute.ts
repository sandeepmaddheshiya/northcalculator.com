import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean } from '@/engine/money';
import { normalCdf, normalInv, type Tail } from '@/engine/stats';

/**
 * One-proportion z-test (OpenStax Introductory Statistics 2e §9.5; NIST/SEMATECH e-Handbook
 * §7.2.4): p̂ = x ÷ n, z = (p̂ − p₀) ÷ √(p₀(1 − p₀) ÷ n), with the standard error computed from
 * the hypothesized p₀. P-values come from the standard normal; tails use Φ(−|z|) directly so small
 * p-values stay accurate. The normal approximation needs n·p₀ and n(1 − p₀) both at least 5.
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
  const x = num('x');
  const n = num('n');
  const p0In = num('p0');
  if (x === null || n === null || p0In === null) return none();
  if (!Number.isInteger(n) || n < 1) return none('warn.n');
  if (!Number.isInteger(x) || x < 0 || x > n) return none('warn.x');
  const p0 = p0In / 100;
  if (!(p0 > 0 && p0 < 1)) return none('warn.p0');
  const tail: Tail = inputs.tail === 'right' || inputs.tail === 'left' ? inputs.tail : 'two';
  const alpha = Number(inputs.alpha) > 0 && Number(inputs.alpha) < 1 ? Number(inputs.alpha) : 0.05;
  const pHat = x / n;
  const se = Math.sqrt((p0 * (1 - p0)) / n);
  const z = (pHat - p0) / se;
  const p =
    tail === 'right'
      ? normalCdf(-z)
      : tail === 'left'
        ? normalCdf(z)
        : Math.min(1, 2 * normalCdf(-Math.abs(z)));
  const crit = tail === 'two' ? normalInv(1 - alpha / 2) : normalInv(1 - alpha);
  const reject = p < alpha;
  const s = (v: number) => fmt.sig(clean(v), 8);
  const symbol = tail === 'two' ? '≠' : tail === 'right' ? '>' : '<';
  const small = n * p0 < 5 || n * (1 - p0) < 5;

  return {
    outputs: {
      p: clean(p),
      decision: tr(reject ? 'decision.reject' : 'decision.keep'),
      z: clean(z),
      pHat: clean(pHat * 100),
      critical: clean(tail === 'left' ? -crit : crit),
      se: clean(se * 100),
    },
    explain: {
      key: reject ? 'explain.reject' : 'explain.keep',
      values: { p: fmt.sig(clean(p), 4), a: fmt.num(alpha, 3), sym: symbol, p0: s(p0In) },
    },
    steps: [
      { key: 'step.phat', math: `${x} ÷ ${n} = ${s(pHat)}` },
      { key: 'step.se', math: `√(${s(p0)} × ${s(1 - p0)} ÷ ${n}) = ${s(se)}` },
      { key: 'step.z', math: `(${s(pHat)} − ${s(p0)}) ÷ ${s(se)} = ${s(z)}` },
      { key: `step.p.${tail}`, math: `p = ${s(p)} ${reject ? '<' : '≥'} ${fmt.num(alpha, 3)}` },
    ],
    warnings: small ? [{ key: 'warn.small', level: 'warn' }] : [],
  };
};
