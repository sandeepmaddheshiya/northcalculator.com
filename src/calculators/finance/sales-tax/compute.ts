import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { fromMinor, minorDigits, roundHalfUp, toMinor } from '@/engine/money';

/**
 * Sales tax, VAT and GST on a single rate (OpenStax Contemporary Mathematics §6.2; HMRC VAT Notice
 * 700 for VAT-inclusive prices). Add: tax = price × rate. Remove: net = gross ÷ (1 + rate), tax =
 * gross − net. Rate: (gross − net) ÷ net. Tax is rounded half-up to the smallest currency unit.
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
  const amount = num('amount');
  if (amount === null) return none();
  const A = toMinor(amount, d);

  if (inputs.mode === 'rate') {
    const gross = num('gross');
    if (gross === null) return none();
    if (A === 0) return none('warn.zeroNet');
    const G = toMinor(gross, d);
    const rate = ((G - A) / A) * 100;
    return {
      outputs: { result: rate, tax: m(G - A), net: m(A), total: m(G) },
      explain: { key: 'explain.rate', values: { r: fmt.pct(rate, 3) } },
      steps: [
        {
          key: 'step.taxPaid',
          math: `${fmt.money(gross)} − ${fmt.money(amount)} = ${fmt.money(m(G - A))}`,
        },
        {
          key: 'step.rate',
          math: `${fmt.money(m(G - A))} ÷ ${fmt.money(amount)} × 100 = ${fmt.pct(rate, 3)}`,
        },
      ],
      warnings: G < A ? [{ key: 'warn.grossLower', level: 'warn' }] : [],
    };
  }

  const rate = num('rate');
  if (rate === null) return none();
  if (inputs.mode === 'remove') {
    const net = roundHalfUp(A / (1 + rate / 100));
    return {
      outputs: { result: m(net), tax: m(A - net), net: m(net), total: m(A) },
      explain: {
        key: 'explain.remove',
        values: { net: fmt.money(m(net)), tax: fmt.money(m(A - net)) },
      },
      steps: [
        {
          key: 'step.divide',
          math: `${fmt.money(amount)} ÷ (1 + ${fmt.num(rate / 100, 6)}) = ${fmt.money(m(net))}`,
        },
        {
          key: 'step.taxIncluded',
          math: `${fmt.money(amount)} − ${fmt.money(m(net))} = ${fmt.money(m(A - net))}`,
        },
      ],
      warnings: [],
    };
  }

  const tax = roundHalfUp((A * rate) / 100);
  return {
    outputs: { result: m(A + tax), tax: m(tax), net: m(A), total: m(A + tax) },
    explain: {
      key: 'explain.add',
      values: { tax: fmt.money(m(tax)), total: fmt.money(m(A + tax)) },
    },
    steps: [
      {
        key: 'step.tax',
        math: `${fmt.money(amount)} × ${fmt.pct(rate, 3)} = ${fmt.money(m(tax))}`,
      },
      {
        key: 'step.total',
        math: `${fmt.money(amount)} + ${fmt.money(m(tax))} = ${fmt.money(m(A + tax))}`,
      },
    ],
    warnings: [],
  };
};
