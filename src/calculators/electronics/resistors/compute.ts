import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean } from '@/engine/money';

/**
 * Equivalent resistance (OpenStax College Physics 2e §21.1; University Physics Vol. 2 §10.2):
 *   series   R_s = R₁ + R₂ + …
 *   parallel R_p = 1 ÷ (1/R₁ + 1/R₂ + …)
 * With a supply voltage, I = V ÷ R and P = V² ÷ R for the chosen arrangement.
 * Values may use the prefixes k (×1,000) and M (×1,000,000) and an optional Ω.
 */
const PREFIX: Record<string, number> = { '': 1, k: 1e3, K: 1e3, M: 1e6 };

export function parseResistors(text: string): { values: number[]; bad: string[] } {
  const values: number[] = [];
  const bad: string[] = [];
  for (const raw of text.split(/[\s,;]+/)) {
    if (!raw) continue;
    const m = /^(\d+(?:\.\d+)?|\.\d+)([kKM]?)$/.exec(raw.replace(/(Ω|ohms?)$/i, ''));
    const v = m ? Number(m[1]) * PREFIX[m[2] ?? '']! : NaN;
    if (Number.isFinite(v) && v > 0) values.push(v);
    else bad.push(raw);
  }
  return { values, bad };
}

export const compute: ComputeFn = (inputs, { fmt }) => {
  const { values, bad } = parseResistors(String(inputs.values ?? ''));
  const parallel = inputs.mode !== 'series';
  const none = (key?: string): ComputeResult => ({
    outputs: { result: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  if (!values.length) return none(bad.length ? 'warn.none' : undefined);
  const rs = values.reduce((a, r) => a + r, 0);
  const rp = 1 / values.reduce((a, r) => a + 1 / r, 0);
  const r = parallel ? rp : rs;
  const v = typeof inputs.voltage === 'number' ? inputs.voltage : null;
  const s = (x: number) => fmt.sig(clean(x), 8);
  return {
    outputs: {
      result: clean(r),
      series: clean(rs),
      parallel: clean(rp),
      current: v === null ? null : clean(v / r),
      power: v === null ? null : clean((v * v) / r),
      count: values.length,
    },
    explain: {
      key: parallel ? 'explain.parallel' : 'explain.series',
      values: { n: values.length, r: s(r) },
    },
    steps: parallel
      ? [
          {
            key: 'step.parallel',
            math: `1 ÷ (${values.map((x) => `1/${s(x)}`).join(' + ')}) = ${s(rp)} Ω`,
          },
          ...(v === null
            ? []
            : [{ key: 'step.current', math: `${s(v)} V ÷ ${s(rp)} Ω = ${s(v / rp)} A` }]),
        ]
      : [
          { key: 'step.series', math: `${values.map(s).join(' + ')} = ${s(rs)} Ω` },
          ...(v === null
            ? []
            : [{ key: 'step.current', math: `${s(v)} V ÷ ${s(rs)} Ω = ${s(v / rs)} A` }]),
        ],
    warnings: bad.length
      ? [{ key: 'warn.bad', level: 'warn', values: { bad: bad.join(', ') } }]
      : [],
  };
};
