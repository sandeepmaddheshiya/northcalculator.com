import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean } from '@/engine/money';

/**
 * Least-squares line ŷ = a + bx (OpenStax Introductory Statistics 2e §12.3), computed with
 * centred sums so it stays accurate for large, nearly collinear data: b = Sxy ÷ Sxx,
 * a = ȳ − b·x̄, r = Sxy ÷ √(Sxx·Syy), and the residual standard error s = √(SSE ÷ (n − 2)).
 * Matches NIST’s certified Norris coefficients to about 1e−12.
 */
const MINUS = '−';

export function parsePairs(text: string): { pairs: [number, number][]; bad: string[] } {
  const pairs: [number, number][] = [];
  const bad: string[] = [];
  for (const raw of text.split(/[;\n]+/)) {
    const line = raw.trim();
    if (!line) continue;
    const parts = line
      .split(/[\s,\t]+/)
      .filter(Boolean)
      .map((p) => Number(p.replace('−', '-')));
    if (parts.length === 2 && parts.every(Number.isFinite)) pairs.push([parts[0]!, parts[1]!]);
    else bad.push(line);
  }
  return { pairs, bad };
}

export const compute: ComputeFn = (inputs, { fmt }) => {
  const { pairs, bad } = parsePairs(String(inputs.data ?? ''));
  const none = (key?: string): ComputeResult => ({
    outputs: { equation: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  const n = pairs.length;
  if (n < 2) return none(n || bad.length ? 'warn.few' : undefined);
  const mx = pairs.reduce((s, p) => s + p[0], 0) / n;
  const my = pairs.reduce((s, p) => s + p[1], 0) / n;
  let sxx = 0;
  let syy = 0;
  let sxy = 0;
  for (const [x, y] of pairs) {
    sxx += (x - mx) ** 2;
    syy += (y - my) ** 2;
    sxy += (x - mx) * (y - my);
  }
  if (sxx === 0) return none('warn.vertical');
  const b = sxy / sxx;
  const a = my - b * mx;
  const r = syy === 0 ? null : sxy / Math.sqrt(sxx * syy);
  const sse = pairs.reduce((s, [x, y]) => s + (y - (a + b * x)) ** 2, 0);
  const se = n > 2 ? Math.sqrt(sse / (n - 2)) : null;
  const xq = typeof inputs.x === 'number' ? inputs.x : null;
  const s = (v: number) => fmt.sig(clean(v), 8).replace(/^-/, MINUS);
  const B = clean(b);
  const A = clean(a);
  const coef = Math.abs(B) === 1 ? '' : s(Math.abs(b));
  const equation =
    B === 0
      ? `ŷ = ${s(a)}`
      : A === 0
        ? `ŷ = ${B < 0 ? MINUS : ''}${coef}x`
        : `ŷ = ${s(a)} ${B < 0 ? MINUS : '+'} ${coef}x`;
  return {
    outputs: {
      equation,
      slope: clean(b),
      intercept: clean(a),
      r: r === null ? null : clean(r),
      r2: r === null ? null : clean(r * r),
      predicted: xq === null ? null : clean(a + b * xq),
      se: se === null ? null : clean(se),
      n,
    },
    explain: {
      key: r === null ? 'explain.flat' : 'explain',
      values: {
        n,
        b: s(b),
        r: r === null ? '' : fmt.sig(clean(r), 4),
        pct: r === null ? '' : fmt.pct(clean(r * r * 100), 1),
      },
    },
    steps: [
      { key: 'step.means', math: `x̄ = ${s(mx)}, ȳ = ${s(my)}` },
      { key: 'step.slope', math: `b = ${s(sxy)} ÷ ${s(sxx)} = ${s(b)}` },
      { key: 'step.intercept', math: `a = ${s(my)} − ${s(b)} × ${s(mx)} = ${s(a)}` },
    ],
    warnings: bad.length ? [{ key: 'warn.bad', level: 'warn', values: { n: bad.length } }] : [],
  };
};
