import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean, roundTo } from '@/engine/money';
import { WEIGHTS } from '@/calculators/chemistry/molar-mass/elements';
import { parseMasses } from '@/calculators/chemistry/percent-composition/compute';

/**
 * Empirical and molecular formulas (OpenStax Chemistry 2e §3.2; LibreTexts Introductory Chemistry
 * §6.8–6.9). Percentages are read as grams of a 100 g sample. Each mass ÷ atomic weight gives
 * moles; dividing by the smallest gives the mole ratio; the ratio is multiplied by the smallest
 * whole number (1–10) that brings every value within 0.1 of an integer (1.5 → ×2, 1.33 → ×3).
 * With a molar mass, n = molar mass ÷ empirical formula mass, rounded, multiplies the subscripts.
 */
export const TOLERANCE = 0.1;
const MAX_MULTIPLIER = 10;

export function wholeRatio(ratios: number[]): { k: number; counts: number[]; dev: number } {
  let best = { k: 1, counts: ratios.map(Math.round), dev: Infinity };
  for (let k = 1; k <= MAX_MULTIPLIER; k++) {
    const dev = Math.max(...ratios.map((r) => Math.abs(r * k - Math.round(r * k))));
    if (dev < best.dev) best = { k, counts: ratios.map((r) => Math.round(r * k)), dev };
    if (dev <= TOLERANCE) return { k, counts: ratios.map((r) => Math.round(r * k)), dev };
  }
  return best;
}

export const formulaText = (els: string[], counts: number[]) =>
  els.map((el, i) => `${el}${counts[i] === 1 ? '' : counts[i]}`).join('');

export const compute: ComputeFn = (inputs, { fmt }) => {
  const none = (key?: string, values?: Record<string, string>): ComputeResult => ({
    outputs: { empirical: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn', values }] : [],
  });
  const { masses, bad } = parseMasses(String(inputs.amounts ?? ''));
  const warnings: ComputeResult['warnings'] = [];
  if (bad) warnings.push({ key: 'warn.bad', level: 'info', values: { n: String(bad) } });
  const entries = [...masses].filter(([, m]) => m > 0);
  if (entries.length === 0) {
    const r = none();
    r.warnings.push(...warnings, { key: 'warn.none', level: 'warn' });
    return r;
  }
  const missing = entries.filter(([el]) => WEIGHTS[el] === null).map(([el]) => el);
  if (missing.length) return none('warn.unstable', { at: missing.join(', ') });

  const els = entries.map(([el]) => el);
  const moles = entries.map(([el, m]) => m / WEIGHTS[el]!);
  const smallest = Math.min(...moles);
  const ratios = moles.map((n) => n / smallest);
  const { k, counts, dev } = wholeRatio(ratios);
  if (dev > TOLERANCE) warnings.push({ key: 'warn.noWhole', level: 'warn' });
  const empirical = formulaText(els, counts);
  const efm = roundTo(
    counts.reduce((a, c, i) => a + c * WEIGHTS[els[i]!]!, 0),
    6,
  );

  const molar = typeof inputs.molar === 'number' && inputs.molar > 0 ? inputs.molar : null;
  let n: number | null = null;
  let molecular: string | null = null;
  if (molar !== null) {
    const exact = molar / efm;
    n = Math.max(1, Math.round(exact));
    if (Math.abs(exact - n) > TOLERANCE || exact < 0.9)
      warnings.push({ key: 'warn.molar', level: 'warn', values: { x: fmt.num(exact, 3) } });
    molecular = formulaText(
      els,
      counts.map((c) => c * n!),
    );
  }

  const s = (x: number) => fmt.num(clean(x), 4);
  return {
    outputs: {
      empirical,
      molecular,
      efm,
      n,
      multiplier: k,
    },
    explain: {
      key: molecular === null ? 'explain.empirical' : 'explain.molecular',
      values: { e: empirical, m: molecular ?? '', n: n ?? 1 },
    },
    steps: [
      {
        key: 'step.moles',
        math: entries
          .map(([el, m]) => `${el}: ${s(m)} ÷ ${WEIGHTS[el]} = ${s(m / WEIGHTS[el]!)} mol`)
          .join('; '),
      },
      {
        key: 'step.ratio',
        values: { min: s(smallest) },
        math: els.map((el, i) => `${el} ${s(ratios[i]!)}`).join(' : '),
      },
      ...(k > 1
        ? [
            {
              key: 'step.multiply',
              values: { k },
              math: els.map((el, i) => `${el} ${s(ratios[i]! * k)}`).join(' : '),
            },
          ]
        : []),
      ...(molar === null
        ? []
        : [
            {
              key: 'step.molecular',
              math: `${s(molar)} ÷ ${s(efm)} = ${s(molar / efm)} → n = ${n}`,
            },
          ]),
    ],
    table: {
      captionKey: 'table.caption',
      columns: [
        { key: 'table.element', format: 'text' },
        { key: 'table.mass', format: 'sig' },
        { key: 'table.moles', format: 'sig' },
        { key: 'table.ratio', format: 'sig' },
        { key: 'table.subscript', format: 'integer' },
      ],
      rows: els.map((el, i) => [
        el,
        clean(entries[i]![1]),
        Number(moles[i]!.toPrecision(6)),
        Number(ratios[i]!.toPrecision(6)),
        counts[i]!,
      ]),
    },
    warnings,
  };
};
