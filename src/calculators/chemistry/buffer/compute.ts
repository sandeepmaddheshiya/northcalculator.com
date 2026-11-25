import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean } from '@/engine/money';

/**
 * Buffer pH by the Henderson–Hasselbalch equation, pH = pKa + log([A⁻] ÷ [HA]) (OpenStax
 * Chemistry 2e §14.6; LibreTexts, Henderson–Hasselbalch Approximation). Amounts may be moles or
 * molarities in the same solution: only their ratio matters. A strong acid added converts that
 * much A⁻ to HA; a strong base converts HA to A⁻ (same units). pKa = −log Ka, or 14.00 − pKb for
 * a weak base and its conjugate acid at 25 °C. Valid when both components are well above Ka and
 * their ratio stays between 0.1 and 10 (pKa ± 1).
 */
export const PKW = 14;

export function pKaOf(kind: string, k: number): number | null {
  if (kind === 'ka') return k > 0 ? -Math.log10(k) : null;
  if (kind === 'pkb') return PKW - k;
  return k;
}

export const compute: ComputeFn = (inputs, { fmt }) => {
  const num = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const none = (key?: string): ComputeResult => ({
    outputs: { result: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  const kind = inputs.kt === 'ka' || inputs.kt === 'pkb' ? inputs.kt : 'pka';
  const k = num('k');
  if (k === null) return none();
  const pKa = pKaOf(kind, k);
  if (pKa === null) return none('warn.ka');
  const s = (x: number) => fmt.sig(clean(x), 6);
  const steps: ComputeResult['steps'] = [];
  if (kind === 'ka') steps.push({ key: 'step.pka', math: `−log(${s(k)}) = ${s(pKa)}` });
  if (kind === 'pkb') steps.push({ key: 'step.pkb', math: `14.00 − ${s(k)} = ${s(pKa)}` });
  const acidIn = num('acid');

  if (inputs.find === 'ratio') {
    const target = num('target');
    if (target === null) return none();
    const ratio = 10 ** (target - pKa);
    steps.push({ key: 'step.ratio', math: `10^(${s(target)} − ${s(pKa)}) = ${s(ratio)}` });
    const baseNeeded = acidIn !== null && acidIn > 0 ? acidIn * ratio : null;
    if (baseNeeded !== null)
      steps.push({ key: 'step.base', math: `${s(acidIn!)} × ${s(ratio)} = ${s(baseNeeded)}` });
    return {
      outputs: {
        result: clean(ratio),
        pKa: clean(pKa),
        baseNeeded: baseNeeded === null ? null : clean(baseNeeded),
        low: clean(pKa - 1),
        high: clean(pKa + 1),
      },
      explain: { key: 'explain.ratio', values: { r: s(ratio), pH: s(target) } },
      steps,
      warnings: Math.abs(target - pKa) > 1 ? [{ key: 'warn.range', level: 'warn' }] : [],
    };
  }

  const baseIn = num('base');
  if (acidIn === null || baseIn === null) return none();
  if (acidIn < 0 || baseIn < 0) return none('warn.negative');
  const added = inputs.added === 'acid' || inputs.added === 'base' ? inputs.added : 'none';
  const x = added === 'none' ? 0 : (num('amount') ?? 0);
  const acid = added === 'acid' ? acidIn + x : added === 'base' ? acidIn - x : acidIn;
  const base = added === 'acid' ? baseIn - x : added === 'base' ? baseIn + x : baseIn;
  if (added !== 'none' && x > 0)
    steps.push({
      key: added === 'acid' ? 'step.addAcid' : 'step.addBase',
      math: `HA ${s(acidIn)} → ${s(acid)}; A⁻ ${s(baseIn)} → ${s(base)}`,
    });
  if (acid <= 0 || base <= 0) return none(acid <= 0 && base <= 0 ? 'warn.empty' : 'warn.exceeded');
  const ratio = base / acid;
  const pH = pKa + Math.log10(ratio);
  steps.push({ key: 'step.hh', math: `${s(pKa)} + log(${s(base)} ÷ ${s(acid)}) = ${s(pH)}` });
  const warnings: ComputeResult['warnings'] = [];
  if (ratio < 0.1 || ratio > 10) warnings.push({ key: 'warn.range', level: 'warn' });
  return {
    outputs: {
      result: clean(pH),
      pKa: clean(pKa),
      ratio: clean(ratio),
      before: added !== 'none' && x > 0 ? clean(pKa + Math.log10(baseIn / acidIn)) : null,
      low: clean(pKa - 1),
      high: clean(pKa + 1),
    },
    explain: { key: 'explain.ph', values: { pH: fmt.num(clean(pH), 2), r: s(ratio) } },
    steps,
    warnings,
  };
};
