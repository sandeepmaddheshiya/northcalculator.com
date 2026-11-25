import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean } from '@/engine/money';

/**
 * Mean, variance and standard deviation of a discrete probability distribution (OpenStax
 * Introductory Statistics 2e §4.2; Contemporary Mathematics §7.11): μ = Σ x·P(x),
 * σ² = Σ (x − μ)²·P(x). Probabilities may be decimals, percentages (50%) or fractions (1/6);
 * they should add up to 1, and the calculator warns when they do not.
 */
export function parseProb(tok: string): number {
  const t = tok.trim();
  if (/^\d+(\.\d+)?%$/.test(t)) return Number(t.slice(0, -1)) / 100;
  const f = /^(\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)$/.exec(t);
  if (f) return Number(f[1]) / Number(f[2]);
  return Number(t);
}

export function parsePairs(text: string): { pairs: [number, number][]; bad: number } {
  const pairs: [number, number][] = [];
  let bad = 0;
  for (const line of text.split(/[;\n]+/)) {
    const parts = line
      .trim()
      .split(/[\s,\t]+/)
      .filter(Boolean);
    if (!parts.length) continue;
    const x = Number(parts[0]!.replace('−', '-').replace(/[$€£]/g, ''));
    const p = parts[1] === undefined ? NaN : parseProb(parts[1]);
    if (parts.length === 2 && Number.isFinite(x) && Number.isFinite(p) && p >= 0)
      pairs.push([x, p]);
    else bad++;
  }
  return { pairs, bad };
}

export const compute: ComputeFn = (inputs, { fmt }) => {
  const none = (key?: string): ComputeResult => ({
    outputs: { mean: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  const { pairs, bad } = parsePairs(String(inputs.pairs ?? ''));
  if (!pairs.length) return none(bad ? 'warn.none' : undefined);
  const total = pairs.reduce((a, [, p]) => a + p, 0);
  const mean = pairs.reduce((a, [x, p]) => a + x * p, 0);
  const variance = pairs.reduce((a, [x, p]) => a + (x - mean) ** 2 * p, 0);
  const s = (v: number) => fmt.sig(clean(v), 10);
  const warnings: ComputeResult['warnings'] = [];
  if (Math.abs(total - 1) > 1e-6)
    warnings.push({ key: 'warn.total', level: 'warn', values: { t: s(total) } });
  if (bad) warnings.push({ key: 'warn.bad', level: 'warn', values: { n: bad } });
  return {
    outputs: {
      mean: clean(mean),
      sd: clean(Math.sqrt(variance)),
      variance: clean(variance),
      total: clean(total),
      count: pairs.length,
    },
    explain: { key: 'explain', values: { m: s(mean), sd: s(Math.sqrt(variance)) } },
    steps: [
      {
        key: 'step.mean',
        math: `${pairs
          .slice(0, 6)
          .map(([x, p]) => `${s(x)} × ${s(p)}`)
          .join(' + ')}${pairs.length > 6 ? ' + …' : ''} = ${s(mean)}`,
      },
      { key: 'step.var', math: `Σ (x − ${s(mean)})² × P(x) = ${s(variance)}` },
    ],
    warnings,
  };
};
