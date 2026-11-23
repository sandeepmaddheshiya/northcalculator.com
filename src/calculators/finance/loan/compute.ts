import type { ComputeFn, ComputeResult, Step } from '@/calculators/types';
import { amortize } from '@/engine/finance';
import { fromMinor, minorDigits, toMinor } from '@/engine/money';

/**
 * Amortized loan with level monthly payments (EMI). Same ledger as the mortgage calculator
 * (integer minor units, ADR-017). With upfront fees, the APR follows Regulation Z Appendix J
 * (b)(1): the monthly rate i that equates the amount actually received with the payments,
 * times 12. The effective annual rate (1 + i)^12 − 1 is the EU/UK APRC for monthly payments.
 */
export const compute: ComputeFn = (inputs, { fmt }) => {
  const num = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const amount = num('amount');
  const rate = num('rate');
  const term = num('term');
  const none = (key?: string): ComputeResult => ({
    outputs: { payment: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  if (amount === null || rate === null || term === null || term < 1) return none();

  const digits = minorDigits(fmt.currency);
  const m = (minor: number) => fromMinor(minor, digits);
  const money = (minor: number) => fmt.money(m(minor));
  const P = toMinor(amount, digits);
  if (P <= 0) return none('warn.noLoan');
  const n = inputs.unit === 'm' ? Math.round(term) : Math.round(term * 12);
  if (n > 600) return none('warn.tooLong');
  const r = rate / 100 / 12;
  const extraMinor = toMinor(num('extra') ?? 0, digits);
  const feeMinor = toMinor(num('fee') ?? 0, digits);
  if (feeMinor >= P) return none('warn.feeTooBig');

  const base = amortize(P, r, n);
  const ledger = extraMinor > 0 ? amortize(P, r, n, { extraMinor }) : base;

  // APR including fees: solve Σ payment_k / (1 + i)^k = P − fee for the monthly rate i (bisection).
  let apr: number | null = null;
  let ear: number | null = null;
  if (feeMinor > 0) {
    const received = P - feeMinor;
    const pv = (i: number) =>
      ledger.rows.reduce((a, row) => a + row.payment / (1 + i) ** row.period, 0);
    let lo = 0;
    let hi = 1;
    for (let k = 0; k < 200; k++) {
      const mid = (lo + hi) / 2;
      if (pv(mid) > received) lo = mid;
      else hi = mid;
    }
    const i = (lo + hi) / 2;
    apr = i * 12 * 100;
    ear = ((1 + i) ** 12 - 1) * 100;
  }

  const steps: Step[] = [
    { key: 'step.rate', math: `${fmt.pct(rate, 3)} ÷ 12 = ${fmt.num(r, 8)}` },
    {
      key: 'step.n',
      math: inputs.unit === 'm' ? `n = ${fmt.int(n)}` : `${fmt.int(term)} × 12 = ${fmt.int(n)}`,
    },
    {
      key: 'step.payment',
      math:
        r === 0
          ? `${money(P)} ÷ ${fmt.int(n)} = ${money(base.payment)}`
          : `${money(P)} × ${fmt.num(r, 8)} × (1 + ${fmt.num(r, 8)})^${fmt.int(n)} ÷ ((1 + ${fmt.num(r, 8)})^${fmt.int(n)} − 1) = ${money(base.payment)}`,
    },
    {
      key: 'step.first',
      math: `${money(P)} × ${fmt.num(r, 8)} = ${money(ledger.rows[0]!.interest)}`,
    },
    {
      key: 'step.interest',
      math: `${money(ledger.totalPaid)} − ${money(P)} = ${money(ledger.totalInterest)}`,
    },
  ];
  if (apr !== null)
    steps.push({
      key: 'step.apr',
      values: { received: money(P - feeMinor) },
      math: `APR = 12 × i = ${fmt.pct(apr, 2)} · (1 + i)^12 − 1 = ${fmt.pct(ear!, 2)}`,
    });

  // Schedule: monthly for short loans, yearly otherwise.
  const monthlyTable = ledger.rows.length <= 24;
  const tableRows: (readonly (string | number)[])[] = [];
  const balancePts: [number, number][] = [[0, m(P)]];
  const interestPts: [number, number][] = [[0, 0]];
  let cum = 0;
  if (monthlyTable) {
    for (const row of ledger.rows) {
      cum += row.interest;
      tableRows.push([
        row.period,
        m(row.payment),
        m(row.principal + row.extra),
        m(row.interest),
        m(row.balance),
      ]);
      balancePts.push([row.period, m(row.balance)]);
      interestPts.push([row.period, m(cum)]);
    }
  } else {
    for (let y = 1; (y - 1) * 12 < ledger.rows.length; y++) {
      const yr = ledger.rows.slice((y - 1) * 12, y * 12);
      const interest = yr.reduce((a, x) => a + x.interest, 0);
      cum += interest;
      tableRows.push([
        y,
        m(yr.reduce((a, x) => a + x.payment, 0)),
        m(yr.reduce((a, x) => a + x.principal + x.extra, 0)),
        m(interest),
        m(yr.at(-1)!.balance),
      ]);
      balancePts.push([y, m(yr.at(-1)!.balance)]);
      interestPts.push([y, m(cum)]);
    }
  }

  const warnings: ComputeResult['warnings'] = [];
  if (rate >= 36) warnings.push({ key: 'warn.highRate', level: 'warn' });

  return {
    outputs: {
      payment: m(base.payment),
      interest: m(ledger.totalInterest),
      total: m(ledger.totalPaid),
      apr,
      ear,
      received: feeMinor > 0 ? m(P - feeMinor) : null,
      payoff: extraMinor > 0 ? ledger.rows.length : null,
      saved: extraMinor > 0 ? m(base.totalInterest - ledger.totalInterest) : null,
    },
    explain: {
      key: feeMinor > 0 ? 'explain.fee' : 'explain.base',
      values: {
        payment: money(base.payment),
        n: fmt.int(n),
        interest: money(ledger.totalInterest),
        apr: apr === null ? '' : fmt.pct(apr, 2),
        rate: fmt.pct(rate, 3),
      },
    },
    steps,
    chart: {
      xKey: monthlyTable ? 'chart.xMonth' : 'chart.xYear',
      yFormat: 'money',
      series: [
        { key: 'chart.balance', points: balancePts, tone: 'brand' },
        { key: 'chart.interest', points: interestPts, tone: 'accent' },
      ],
      summaryKey: 'chart.summary',
      summaryValues: {
        share: fmt.pct((ledger.totalInterest / ledger.totalPaid) * 100, 1),
        first: fmt.pct((ledger.rows[0]!.interest / ledger.rows[0]!.payment) * 100, 1),
      },
    },
    table: {
      captionKey: monthlyTable ? 'table.captionMonth' : 'table.captionYear',
      columns: [
        { key: monthlyTable ? 'table.month' : 'table.year', format: 'integer' },
        { key: 'table.paid', format: 'money' },
        { key: 'table.principal', format: 'money' },
        { key: 'table.interest', format: 'money' },
        { key: 'table.balance', format: 'money' },
      ],
      rows: tableRows,
    },
    csv: {
      filename: 'loan-schedule.csv',
      columns: [
        'table.month',
        'table.paid',
        'table.principal',
        'csv.extra',
        'table.interest',
        'table.balance',
      ],
      rows: ledger.rows.map((x) => [
        x.period,
        m(x.payment),
        m(x.principal),
        m(x.extra),
        m(x.interest),
        m(x.balance),
      ]),
    },
    warnings,
  };
};
