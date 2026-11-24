import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { fromMinor, minorDigits, roundHalfUp, roundTo, toMinor } from '@/engine/money';
import { DEBTS } from './definition';

/**
 * Debt-to-income ratio = total monthly debt payments ÷ gross monthly income (CFPB). The
 * front-end ratio uses the housing payment alone. Fannie Mae's Selling Guide (B3-6-02) caps total
 * DTI at 36% for manually underwritten loans (45% with compensating factors) and 50% through
 * Desktop Underwriter; those figures are shown for context, not as a lending decision.
 * "Room to 36%" is the extra monthly debt that would bring the ratio to 36%.
 */
export const compute: ComputeFn = (inputs, { fmt }) => {
  const num = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : 0);
  const d = minorDigits(fmt.currency);
  const yearly = inputs.period === 'year';
  const incomeIn = typeof inputs.income === 'number' ? inputs.income : null;
  if (incomeIn === null) {
    const none: ComputeResult = { outputs: { dti: null }, steps: [], warnings: [] };
    return none;
  }
  if (incomeIn <= 0) {
    const none: ComputeResult = {
      outputs: { dti: null },
      steps: [],
      warnings: [{ key: 'warn.income', level: 'warn' }],
    };
    return none;
  }
  const income = yearly ? incomeIn / 12 : incomeIn;
  const debtMinor = DEBTS.reduce((a, k) => a + toMinor(num(k), d), 0);
  const debt = fromMinor(debtMinor, d);
  const dti = roundTo((debt / income) * 100, 4);
  const frontEnd = roundTo((num('housing') / income) * 100, 4);
  const room = fromMinor(Math.max(0, roundHalfUp(toMinor(income, d) * 0.36) - debtMinor), d);
  const band = dti <= 36 ? 'low' : dti <= 45 ? 'mid' : dti <= 50 ? 'high' : 'over';
  return {
    outputs: {
      dti,
      frontEnd,
      debt,
      monthlyIncome: roundTo(income, d),
      roomTo36: room,
    },
    explain: {
      key: `explain.${band}`,
      values: { dti: fmt.pct(dti, 1), debt: fmt.money(debt), income: fmt.money(income) },
    },
    steps: [
      ...(yearly
        ? [{ key: 'step.monthly', math: `${fmt.money(incomeIn)} ÷ 12 = ${fmt.money(income)}` }]
        : []),
      {
        key: 'step.debt',
        math: `${DEBTS.map((k) => fmt.money(num(k))).join(' + ')} = ${fmt.money(debt)}`,
      },
      { key: 'step.ratio', math: `${fmt.money(debt)} ÷ ${fmt.money(income)} = ${fmt.pct(dti, 2)}` },
    ],
    warnings: [{ key: `info.${band}`, level: band === 'over' ? 'warn' : 'info' }],
  };
};
