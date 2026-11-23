import type { ComputeFn, ComputeResult, Step } from '@/calculators/types';
import { clean, fromMinor, minorDigits, roundHalfUp, toMinor } from '@/engine/money';

/**
 * Discounts (OpenStax Contemporary Mathematics §6.2): sale = original × (1 − d). A second discount
 * applies to the already-reduced price, so 25% then 20% is 40% in total, not 45%. Money is rounded
 * half-up to the smallest currency unit at each price shown.
 */
export const compute: ComputeFn = (inputs, { fmt }) => {
  const num = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const none = (key?: string): ComputeResult => ({
    outputs: { result: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  const d = minorDigits(fmt.currency);
  const m = (x: number) => fromMinor(x, d);
  const price = num('price');
  if (price === null) return none();
  const P = toMinor(price, d);

  if (inputs.mode === 'percent') {
    const sale = num('sale');
    if (sale === null) return none();
    if (P === 0) return none('warn.zeroPrice');
    const S = toMinor(sale, d);
    const pct = clean(((P - S) / P) * 100);
    return {
      outputs: { result: pct, saved: m(P - S), combined: null },
      explain: {
        key: pct >= 0 ? 'explain.percent' : 'explain.markup',
        values: { p: fmt.pct(Math.abs(pct), 2), saved: fmt.money(m(Math.abs(P - S))) },
      },
      steps: [
        {
          key: 'step.saved',
          math: `${fmt.money(price)} − ${fmt.money(sale)} = ${fmt.money(m(P - S))}`,
        },
        {
          key: 'step.percent',
          math: `${fmt.money(m(P - S))} ÷ ${fmt.money(price)} × 100 = ${fmt.pct(pct, 2)}`,
        },
      ],
      warnings: S > P ? [{ key: 'warn.higher', level: 'info' }] : [],
    };
  }

  const off = num('off');
  if (off === null) return none();
  if (inputs.mode === 'original') {
    if (off >= 100) return none('warn.full');
    const O = roundHalfUp(P / (1 - off / 100));
    return {
      outputs: { result: m(O), saved: m(O - P), combined: null },
      explain: {
        key: 'explain.original',
        values: { o: fmt.money(m(O)), off: fmt.pct(off, 2), s: fmt.money(price) },
      },
      steps: [
        { key: 'step.factor', math: `1 − ${fmt.pct(off, 2)} = ${fmt.num(1 - off / 100, 6)}` },
        {
          key: 'step.divide',
          math: `${fmt.money(price)} ÷ ${fmt.num(1 - off / 100, 6)} = ${fmt.money(m(O))}`,
        },
      ],
      warnings: [],
    };
  }

  const extra = num('extra') ?? 0;
  const first = roundHalfUp((P * off) / 100);
  const afterFirst = P - first;
  const second = roundHalfUp((afterFirst * extra) / 100);
  const S = afterFirst - second;
  const steps: Step[] = [
    {
      key: 'step.discount',
      math: `${fmt.money(price)} × ${fmt.pct(off, 2)} = ${fmt.money(m(first))}`,
    },
    {
      key: 'step.sale',
      math: `${fmt.money(price)} − ${fmt.money(m(first))} = ${fmt.money(m(afterFirst))}`,
    },
  ];
  if (extra > 0) {
    steps.push({
      key: 'step.extra',
      math: `${fmt.money(m(afterFirst))} × ${fmt.pct(extra, 2)} = ${fmt.money(m(second))} → ${fmt.money(m(S))}`,
    });
    steps.push({
      key: 'step.combined',
      math: `1 − (1 − ${fmt.num(off / 100, 4)}) × (1 − ${fmt.num(extra / 100, 4)}) = ${fmt.pct((1 - (1 - off / 100) * (1 - extra / 100)) * 100, 2)}`,
    });
  }
  return {
    outputs: {
      result: m(S),
      saved: m(P - S),
      combined: extra > 0 ? clean((1 - (1 - off / 100) * (1 - extra / 100)) * 100) : null,
    },
    explain: { key: 'explain.sale', values: { s: fmt.money(m(S)), saved: fmt.money(m(P - S)) } },
    steps,
    warnings: [],
  };
};
