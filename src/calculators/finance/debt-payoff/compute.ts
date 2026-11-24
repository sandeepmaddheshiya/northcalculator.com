import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { fromMinor, minorDigits, roundHalfUp, toMinor } from '@/engine/money';

/**
 * Debt payoff simulation, month by month, in integer minor units. Each month every balance accrues
 * interest at APR ÷ 12 (rounded half-up), every debt gets its minimum payment, and the extra
 * budget plus the minimums of debts already paid off goes to one target debt (CFPB, "How to reduce
 * your debt"): the highest APR first (avalanche) or the smallest balance first (snowball).
 * Stops after 100 years, which signals that the payments never cover the interest.
 */
export interface Debt {
  balance: number;
  apr: number;
  minimum: number;
}
const MAX_MONTHS = 1200;

export function simulate(
  debts: readonly Debt[],
  extra: number,
  method: 'avalanche' | 'snowball',
): { months: number; interest: number; order: number[] } | null {
  const bal = debts.map((d) => d.balance);
  const rate = debts.map((d) => d.apr / 100 / 12);
  const budget = debts.reduce((a, d) => a + d.minimum, 0) + extra;
  const order: number[] = [];
  let interest = 0;
  let month = 0;
  while (bal.some((b) => b > 0)) {
    if (++month > MAX_MONTHS) return null;
    for (let i = 0; i < bal.length; i++) {
      if (bal[i]! <= 0) continue;
      const int = roundHalfUp(bal[i]! * rate[i]!);
      bal[i]! += int;
      interest += int;
    }
    let left = budget;
    for (let i = 0; i < bal.length; i++) {
      if (bal[i]! <= 0) continue;
      const pay = Math.min(debts[i]!.minimum, bal[i]!, left);
      bal[i]! -= pay;
      left -= pay;
    }
    const open = () =>
      bal
        .map((b, i) => [b, i] as const)
        .filter(([b]) => b > 0)
        .sort((a, b) =>
          method === 'avalanche'
            ? debts[b[1]]!.apr - debts[a[1]]!.apr || a[0] - b[0]
            : a[0] - b[0] || debts[b[1]]!.apr - debts[a[1]]!.apr,
        );
    for (const [, i] of open()) {
      if (left <= 0) break;
      const pay = Math.min(bal[i]!, left);
      bal[i]! -= pay;
      left -= pay;
    }
    bal.forEach((b, i) => {
      if (b <= 0 && !order.includes(i)) order.push(i);
    });
  }
  return { months: month, interest, order };
}

export const compute: ComputeFn = (inputs, ctx) => {
  const { fmt } = ctx;
  const t = ctx.t ?? ((k: string, v?: Record<string, string | number>) => `${k} ${v?.n ?? ''}`);
  const d = minorDigits(fmt.currency);
  const rows = Array.isArray(inputs.debts)
    ? (inputs.debts as readonly Record<string, unknown>[])
    : [];
  const num = (v: unknown) =>
    typeof v === 'number' ? v : typeof v === 'string' && v.trim() !== '' ? Number(v) : NaN;
  const debts: Debt[] = [];
  const index: number[] = [];
  rows.forEach((r, i) => {
    const b = num(r.balance);
    if (!(b > 0)) return;
    const apr = num(r.apr);
    const min = num(r.minimum);
    debts.push({
      balance: toMinor(b, d),
      apr: Number.isFinite(apr) ? apr : 0,
      minimum: toMinor(Number.isFinite(min) ? min : 0, d),
    });
    index.push(i + 1);
  });
  const none = (key: string): ComputeResult => ({
    outputs: { months: null },
    steps: [],
    warnings: [{ key, level: 'warn' }],
  });
  if (!debts.length) return none('warn.empty');
  const extra = toMinor(typeof inputs.extra === 'number' ? inputs.extra : 0, d);
  const method = inputs.method === 'snowball' ? 'snowball' : 'avalanche';
  const other = method === 'snowball' ? 'avalanche' : 'snowball';
  const mine = simulate(debts, extra, method);
  if (!mine) return none('warn.never');
  const theirs = simulate(debts, extra, other)!;
  const m = (x: number) => fromMinor(x, d);
  const saved = theirs.interest - mine.interest;
  const years = Math.floor(mine.months / 12);
  const rest = mine.months % 12;
  return {
    outputs: {
      months: mine.months,
      interest: m(mine.interest),
      otherMonths: theirs.months,
      otherInterest: m(theirs.interest),
      order: mine.order.map((i) => t('fmt.debt', { n: index[i]! })).join(' → '),
    },
    explain: {
      key: saved >= 0 ? 'explain.better' : 'explain.costlier',
      values: {
        months: fmt.int(mine.months),
        y: fmt.int(years),
        m: fmt.int(rest),
        interest: fmt.money(m(mine.interest)),
        diff: fmt.money(m(Math.abs(saved))),
      },
    },
    steps: [
      {
        key: 'step.budget',
        math: `${debts.map((x) => fmt.money(m(x.minimum))).join(' + ')} + ${fmt.money(m(extra))} = ${fmt.money(m(debts.reduce((a, x) => a + x.minimum, 0) + extra))}`,
      },
      { key: `step.${method}` },
    ],
    warnings: [],
  };
};
