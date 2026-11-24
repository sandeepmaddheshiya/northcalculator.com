import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean, roundTo } from '@/engine/money';

/**
 * pH = −log₁₀[H₃O⁺], pOH = −log₁₀[OH⁻] and pH + pOH = pK_w = 14.00 at 25 °C
 * (OpenStax Chemistry 2e §14.2; LibreTexts Introductory Chemistry §14.9). Concentrations in mol/L.
 * pH and pOH are shown to 4 decimals; the usual reporting rule (as many decimals as the
 * concentration has significant figures) is left to the user.
 */
const PKW = 14;

export const compute: ComputeFn = (inputs, ctx) => {
  const { fmt } = ctx;
  const t = ctx.t ?? ((k: string) => k);
  const v = typeof inputs.value === 'number' ? inputs.value : null;
  const known = ['h', 'oh', 'ph', 'poh'].includes(String(inputs.known))
    ? String(inputs.known)
    : 'h';
  const none = (key?: string): ComputeResult => ({
    outputs: { ph: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  if (v === null) return none();
  if ((known === 'h' || known === 'oh') && !(v > 0)) return none('warn.conc');
  const ph =
    known === 'h'
      ? -Math.log10(v)
      : known === 'oh'
        ? PKW + Math.log10(v)
        : known === 'ph'
          ? v
          : PKW - v;
  const poh = PKW - ph;
  const h = known === 'h' ? v : 10 ** -ph;
  const oh = known === 'oh' ? v : 10 ** -poh;
  const r = roundTo(ph, 2);
  const nature = r < 7 ? 'acidic' : r > 7 ? 'basic' : 'neutral';
  const n4 = (x: number) => fmt.num(roundTo(x, 4), 4);
  return {
    outputs: {
      ph: roundTo(ph, 4),
      poh: roundTo(poh, 4),
      h: clean(h),
      oh: clean(oh),
      nature: t(`nature.${nature}`),
    },
    explain: {
      key: 'explain',
      values: { ph: n4(ph), nature: t(`nature.${nature}`).toLowerCase() },
    },
    steps: [
      known === 'h'
        ? { key: 'step.ph', math: `−log(${fmt.sig(v, 6)}) = ${n4(ph)}` }
        : known === 'oh'
          ? { key: 'step.poh', math: `−log(${fmt.sig(v, 6)}) = ${n4(poh)}` }
          : known === 'ph'
            ? { key: 'step.h', math: `10^−${n4(ph)} = ${fmt.sig(clean(h), 6)} M` }
            : { key: 'step.ohFromPoh', math: `10^−${n4(poh)} = ${fmt.sig(clean(oh), 6)} M` },
      { key: 'step.sum', math: `${n4(ph)} + ${n4(poh)} = 14` },
    ],
    warnings: ph < 0 || ph > 14 ? [{ key: 'warn.range', level: 'info' }] : [],
  };
};
