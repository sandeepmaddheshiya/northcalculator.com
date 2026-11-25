import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean } from '@/engine/money';
import { chiSqInv, chiSqSf } from '@/engine/chi';

/**
 * Chi-square tests (OpenStax Introductory Statistics 2e §11.2–11.3; NIST/SEMATECH e-Handbook
 * §1.3.5.15): χ² = Σ (O − E)² ÷ E, always right-tailed.
 *  - goodness of fit: E from equal shares, given counts or percentages (rescaled to the observed
 *    total), df = categories − 1;
 *  - independence: E = row total × column total ÷ grand total, df = (rows − 1)(columns − 1).
 * The p-value is the regularized upper incomplete gamma Q(df/2, χ²/2).
 */
export function parseRow(text: string): number[] | null {
  const parts = text
    .trim()
    .split(/[\s,\t]+/)
    .filter(Boolean)
    .map(Number);
  return parts.length && parts.every((x) => Number.isFinite(x) && x >= 0) ? parts : null;
}

export function parseTable(text: string): number[][] | null {
  const rows = text
    .split(/[;\n]+/)
    .map((r) => r.trim())
    .filter(Boolean)
    .map(parseRow);
  if (!rows.length || rows.some((r) => r === null)) return null;
  const width = rows[0]!.length;
  return rows.every((r) => r!.length === width) ? (rows as number[][]) : null;
}

export function chiSquare(obs: number[], exp: number[]): number {
  return obs.reduce((a, o, i) => a + (o - exp[i]!) ** 2 / exp[i]!, 0);
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
  let obs: number[];
  let exp: number[];
  let df: number;
  let rows: (string | number)[][];
  let columns: { key: string; format: 'text' | 'sig' | 'integer' }[];
  const steps: ComputeResult['steps'] = [];

  if (inputs.mode === 'independence') {
    const t = parseTable(String(inputs.table ?? ''));
    if (!t) return none('warn.table');
    if (t.length < 2 || t[0]!.length < 2) return none('warn.size');
    const rTot = t.map((r) => r.reduce((a, b) => a + b, 0));
    const cTot = t[0]!.map((_, j) => t.reduce((a, r) => a + r[j]!, 0));
    const n = rTot.reduce((a, b) => a + b, 0);
    if (rTot.some((x) => x === 0) || cTot.some((x) => x === 0)) return none('warn.zeroTotal');
    obs = t.flat();
    exp = t.flatMap((r, i) => r.map((_, j) => (rTot[i]! * cTot[j]!) / n));
    df = (t.length - 1) * (t[0]!.length - 1);
    steps.push({
      key: 'step.expInd',
      math: `E₁₁ = ${s(rTot[0]!)} × ${s(cTot[0]!)} ÷ ${s(n)} = ${s(exp[0]!)}`,
    });
    columns = [
      { key: 'table.cell', format: 'text' },
      { key: 'table.obs', format: 'sig' },
      { key: 'table.exp', format: 'sig' },
      { key: 'table.contrib', format: 'sig' },
    ];
    rows = t.flatMap((r, i) =>
      r.map((o, j) => {
        const e = (rTot[i]! * cTot[j]!) / n;
        return [`R${i + 1} C${j + 1}`, o, clean(e), clean((o - e) ** 2 / e)];
      }),
    );
  } else {
    const o = parseRow(String(inputs.observed ?? ''));
    if (!o) return none('warn.observed');
    if (o.length < 2) return none('warn.size');
    const n = o.reduce((a, b) => a + b, 0);
    if (!(n > 0)) return none('warn.observed');
    const kind =
      inputs.expected === 'counts' || inputs.expected === 'percent' ? inputs.expected : 'equal';
    let e: number[];
    if (kind === 'equal') e = o.map(() => n / o.length);
    else {
      const given = parseRow(String(inputs.exp ?? ''));
      if (!given || given.length !== o.length) return none('warn.expLength');
      const total = given.reduce((a, b) => a + b, 0);
      if (!(total > 0) || given.some((x) => x === 0)) return none('warn.expZero');
      e = total === n ? given : given.map((g) => (g / total) * n);
      if (kind === 'counts' && Math.abs(total - n) > 1e-9 * n)
        steps.push({ key: 'step.rescale', math: `× ${s(n)} ÷ ${s(total)}` });
    }
    obs = o;
    exp = e;
    df = o.length - 1;
    columns = [
      { key: 'table.category', format: 'integer' },
      { key: 'table.obs', format: 'sig' },
      { key: 'table.exp', format: 'sig' },
      { key: 'table.contrib', format: 'sig' },
    ];
    rows = o.map((x, i) => [i + 1, x, clean(e[i]!), clean((x - e[i]!) ** 2 / e[i]!)]);
  }

  const chi2 = chiSquare(obs, exp);
  const p = chiSqSf(chi2, df);
  const critical = chiSqInv(alpha, df);
  const reject = p < alpha;
  const minE = Math.min(...exp);
  steps.push(
    { key: 'step.chi', math: `Σ (O − E)² ÷ E = ${s(chi2)}` },
    { key: 'step.df', math: `df = ${df}` },
    {
      key: 'step.p',
      math: `P(χ² > ${s(chi2)}) = ${s(p)} ${reject ? '<' : '≥'} ${fmt.num(alpha, 2)}`,
    },
  );

  return {
    outputs: {
      p: clean(p),
      decision: tr(reject ? 'decision.reject' : 'decision.keep'),
      chi2: clean(chi2),
      df,
      critical: clean(critical),
      minE: clean(minE),
    },
    explain: {
      key: reject ? 'explain.reject' : 'explain.keep',
      values: { p: fmt.sig(clean(p), 4), a: fmt.num(alpha, 2) },
    },
    steps,
    table: { captionKey: 'table.caption', columns, rows },
    warnings: minE < 5 ? [{ key: 'warn.small', level: 'warn', values: { m: s(minE) } }] : [],
  };
};
