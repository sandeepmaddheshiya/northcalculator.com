import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean } from '@/engine/money';
import { fInv, fSf } from '@/engine/fdist';

/**
 * One-way ANOVA (NIST/SEMATECH e-Handbook §7.4.3.3; OpenStax Introductory Statistics 2e §13.2).
 * SS_between = Σ nⱼ(x̄ⱼ − x̄)², SS_within = Σ Σ (x − x̄ⱼ)², df k − 1 and N − k,
 * F = MS_between ÷ MS_within, p = P(F > f) from the F distribution (NIST §1.3.6.6.5).
 */
export function parseGroups(text: string): number[][] | null {
  const groups = text
    .split(/[;\n]+/)
    .map((r) => r.trim())
    .filter(Boolean)
    .map((r) =>
      r
        .split(/[\s,\t]+/)
        .filter(Boolean)
        .map(Number),
    );
  return groups.length && groups.every((g) => g.length && g.every(Number.isFinite)) ? groups : null;
}

/** Group means, grand mean and the between- and within-group sums of squares. */
export function anova(groups: number[][]) {
  const sum = (g: number[]) => g.reduce((a, b) => a + b, 0);
  const N = groups.reduce((a, g) => a + g.length, 0);
  const means = groups.map((g) => sum(g) / g.length);
  const grand = groups.reduce((a, g) => a + sum(g), 0) / N;
  const ssb = groups.reduce((a, g, j) => a + g.length * (means[j]! - grand) ** 2, 0);
  const ssw = groups.reduce((a, g, j) => a + g.reduce((b, x) => b + (x - means[j]!) ** 2, 0), 0);
  return { means, grand, ssb, ssw };
}

export const compute: ComputeFn = (inputs, ctx) => {
  const { fmt } = ctx;
  const tr = ctx.t ?? ((k: string) => k);
  const none = (key?: string): ComputeResult => ({
    outputs: { p: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  const alpha = Number(inputs.alpha) > 0 && Number(inputs.alpha) < 1 ? Number(inputs.alpha) : 0.05;
  const s = (x: number) => fmt.sig(clean(x), 6);
  const r5 = (x: number) => Number(x.toPrecision(5));
  const groups = parseGroups(String(inputs.groups ?? ''));
  if (!groups) return none('warn.groups');
  const k = groups.length;
  const N = groups.reduce((a, g) => a + g.length, 0);
  if (k < 2) return none('warn.k');
  if (N - k < 1) return none('warn.n');
  const { means, grand, ssb, ssw } = anova(groups);
  const dfB = k - 1;
  const dfW = N - k;
  const msb = ssb / dfB;
  const msw = ssw / dfW;
  if (!(msw > 0)) return none('warn.noVariance');
  const f = msb / msw;
  const p = fSf(f, dfB, dfW);
  const critical = fInv(alpha, dfB, dfW);
  const reject = p < alpha;
  const small = groups.some((g) => g.length < 2);

  return {
    outputs: {
      p: clean(p),
      decision: tr(reject ? 'decision.reject' : 'decision.keep'),
      f: clean(f),
      critical: clean(critical),
      dfB,
      dfW,
    },
    explain: {
      key: reject ? 'explain.reject' : 'explain.keep',
      values: { p: fmt.sig(clean(p), 4), a: fmt.num(alpha, 2) },
    },
    steps: [
      { key: 'step.means', math: `x̄ⱼ = ${means.map(s).join(', ')}; x̄ = ${s(grand)}` },
      { key: 'step.ss', math: `SS_between = ${s(ssb)}, SS_within = ${s(ssw)}` },
      {
        key: 'step.f',
        math: `F = (${s(ssb)} ÷ ${dfB}) ÷ (${s(ssw)} ÷ ${dfW}) = ${s(msb)} ÷ ${s(msw)} = ${s(f)}`,
      },
      {
        key: 'step.p',
        math: `P(F > ${s(f)}) = ${s(p)} ${reject ? '<' : '≥'} ${fmt.num(alpha, 2)}`,
      },
    ],
    table: {
      captionKey: 'table.caption',
      columns: [
        { key: 'table.source', format: 'text' },
        { key: 'table.ss', format: 'sig' },
        { key: 'table.df', format: 'integer' },
        { key: 'table.ms', format: 'sig' },
        { key: 'table.f', format: 'sig' },
      ],
      rows: [
        [tr('table.between'), r5(ssb), dfB, r5(msb), r5(f)],
        [tr('table.within'), r5(ssw), dfW, r5(msw), ''],
        [tr('table.total'), r5(ssb + ssw), N - 1, '', ''],
      ],
    },
    warnings: small ? [{ key: 'warn.single', level: 'info' }] : [],
  };
};
