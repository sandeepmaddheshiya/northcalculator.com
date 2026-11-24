import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { amortize } from '@/engine/finance';
import { fromMinor, minorDigits, roundHalfUp, toMinor } from '@/engine/money';

/**
 * Car loan (OpenStax Contemporary Mathematics §6.11):
 *   tax      = tax rate × (price, or price − trade-in where the state taxes the net price)
 *   financed = price + tax + fees − down payment − trade-in
 *   payment  = annuity payment at APR ÷ 12 over the term (same ledger as the loan calculator,
 *              rounded half-up; the last payment absorbs the rounding).
 * Total cost = everything paid for the car: down payment, trade-in value and all loan payments.
 */
export const compute: ComputeFn = (inputs, { fmt }) => {
  const num = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const price = num('price');
  const rate = num('rate');
  const n = Number(inputs.term) || 60;
  if (price === null || rate === null) {
    const none: ComputeResult = { outputs: { payment: null }, steps: [], warnings: [] };
    return none;
  }
  const d = minorDigits(fmt.currency);
  const M = (x: number | null) => toMinor(x ?? 0, d);
  const m = (x: number) => fromMinor(x, d);
  const tradeIn = M(num('tradeIn'));
  const down = M(num('down'));
  const fees = M(num('fees'));
  const taxBase = Math.max(0, inputs.taxOn === 'net' ? M(price) - tradeIn : M(price));
  const tax = roundHalfUp((taxBase * (num('taxRate') ?? 0)) / 100);
  const financed = M(price) + tax + fees - down - tradeIn;
  const warnings: ComputeResult['warnings'] = [];
  if (financed <= 0) {
    return {
      outputs: {
        payment: 0,
        financed: 0,
        tax: m(tax),
        interest: 0,
        totalCost: m(M(price) + tax + fees),
      },
      explain: { key: 'explain.cash', values: {} },
      steps: [],
      warnings: [{ key: 'warn.noLoan', level: 'info' }],
    };
  }
  const r = rate / 100 / 12;
  const ledger = amortize(financed, r, n);
  const totalCost = down + tradeIn + ledger.totalPaid;
  if (rate > 20) warnings.push({ key: 'warn.highRate', level: 'info' });
  return {
    outputs: {
      payment: m(ledger.payment),
      financed: m(financed),
      tax: m(tax),
      interest: m(ledger.totalInterest),
      totalCost: m(totalCost),
    },
    explain: {
      key: 'explain',
      values: {
        pay: fmt.money(m(ledger.payment)),
        n,
        financed: fmt.money(m(financed)),
        interest: fmt.money(m(ledger.totalInterest)),
      },
    },
    steps: [
      {
        key: 'step.tax',
        math: `${fmt.money(m(taxBase))} × ${fmt.pct(num('taxRate') ?? 0, 3)} = ${fmt.money(m(tax))}`,
      },
      {
        key: 'step.financed',
        math: `${fmt.money(price)} + ${fmt.money(m(tax))} + ${fmt.money(m(fees))} − ${fmt.money(m(down))} − ${fmt.money(m(tradeIn))} = ${fmt.money(m(financed))}`,
      },
      {
        key: 'step.payment',
        math:
          r === 0
            ? `${fmt.money(m(financed))} ÷ ${n} = ${fmt.money(m(ledger.payment))}`
            : `${fmt.money(m(financed))} × ${fmt.num(r, 8)} ÷ (1 − (1 + ${fmt.num(r, 8)})^−${n}) = ${fmt.money(m(ledger.payment))}`,
      },
    ],
    warnings,
  };
};
