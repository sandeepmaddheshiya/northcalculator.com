import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean, fromMinor, minorDigits, roundHalfUp, roundTo } from '@/engine/money';

/**
 * Board feet = thickness (in) × width (in) × length (ft) ÷ 12 per piece (UW–Extension Forestry
 * Facts 42; Oregon State EC 1127): one board foot is 144 cubic inches. Use nominal sizes for
 * how lumber is sold, or actual sizes for true volume. 12 board feet = 1 ft³, and
 * 1 in = 0.0254 m exactly, so 1 board foot = 0.002359737216 m³. Cost is rounded half-up.
 */
const M3_PER_BF = 144 * 0.0254 ** 3;

export const compute: ComputeFn = (inputs, { fmt }) => {
  const val = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const t = val('thickness');
  const w = val('width');
  const l = val('length');
  const n = Math.max(1, Math.round(val('count') ?? 1));
  const price = val('price') ?? 0;
  const none = (key?: string): ComputeResult => ({
    outputs: { boardFeet: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  if (t === null || w === null || l === null) return none();
  if (!(t > 0 && w > 0 && l > 0)) return none('warn.zero');
  const each = (t * w * l) / 12;
  const total = each * n;
  const d = minorDigits(fmt.currency);
  const cost = price > 0 ? fromMinor(roundHalfUp(roundTo(total * price * 10 ** d, 6)), d) : null;
  const s = (x: number) => fmt.sig(clean(x), 8);
  return {
    outputs: {
      boardFeet: clean(total),
      each: clean(each),
      cost,
      cubicFeet: clean(total / 12),
      m3: clean(total * M3_PER_BF),
    },
    explain: {
      key: n > 1 ? 'explain.many' : 'explain',
      values: { bf: s(total), each: s(each), n },
    },
    steps: [
      { key: 'step.each', math: `${s(t)} × ${s(w)} × ${s(l)} ÷ 12 = ${s(each)} bd ft` },
      ...(n > 1 ? [{ key: 'step.count', math: `${s(each)} × ${n} = ${s(total)} bd ft` }] : []),
      ...(cost !== null
        ? [{ key: 'step.cost', math: `${s(total)} × ${fmt.money(price)} = ${fmt.money(cost)}` }]
        : []),
    ],
    warnings: [],
  };
};
