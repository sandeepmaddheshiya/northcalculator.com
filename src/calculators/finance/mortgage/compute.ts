import type { ComputeFn, ComputeResult, Step } from '@/calculators/types';
import { amortize, annuityPayment, monthlyEffectiveRate } from '@/engine/finance';
import { fromMinor, minorDigits, roundHalfUp, toMinor } from '@/engine/money';

/**
 * Fixed-rate mortgage (OpenStax Contemporary Mathematics §6.12). Money is held in integer minor
 * units (ADR-017): the level payment and each month's interest are rounded half-up to the cent,
 * and the final payment clears the remaining balance exactly.
 *
 * Monthly rate: nominal annual ÷ 12 (US, UK, India, most of the world), or the monthly rate
 * equivalent to semi-annual compounding, which Canadian fixed-rate mortgages use (Interest Act s. 6).
 * PMI ends when the scheduled balance reaches 78% of the original value (US Homeowners Protection Act).
 */
export const compute: ComputeFn = (inputs, { fmt }) => {
  const num = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const price = num('price');
  const down = num('down');
  const rate = num('rate');
  const years = num('years');
  const none = (key?: string): ComputeResult => ({
    outputs: { monthly: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  if (price === null || down === null || rate === null || years === null || years < 1)
    return none();

  const digits = minorDigits(fmt.currency);
  const m = (minor: number) => fromMinor(minor, digits);
  const money = (minor: number) => fmt.money(m(minor));
  const priceMinor = toMinor(price, digits);
  const downMinor = roundHalfUp((priceMinor * down) / 100);
  const loanMinor = priceMinor - downMinor;
  if (loanMinor <= 0) return none('warn.noLoan');

  const semi = inputs.comp === 'semiannual';
  const r = semi ? monthlyEffectiveRate(rate / 100, 'semiannual') : rate / 100 / 12;
  const n = Math.round(years * 12);
  const extraMinor = toMinor(num('extra') ?? 0, digits);

  const base = amortize(loanMinor, r, n);
  const withExtra = extraMinor > 0 ? amortize(loanMinor, r, n, { extraMinor }) : base;
  const pi = base.payment;

  // PMI: charged while the *scheduled* balance (no extras) is above 78% of the original value.
  const pmiRate = num('pmi') ?? 0;
  const pmiApplies = pmiRate > 0 && loanMinor > 0.8 * priceMinor;
  const pmiMo = pmiApplies ? roundHalfUp((loanMinor * pmiRate) / 100 / 12) : 0;
  const pmiMonths = pmiApplies
    ? base.rows.findIndex((row) => row.balance <= 0.78 * priceMinor) + 1 || n
    : 0;

  const taxMo = roundHalfUp(toMinor(num('tax') ?? 0, digits) / 12);
  const insMo = roundHalfUp(toMinor(num('ins') ?? 0, digits) / 12);
  const hoaMo = toMinor(num('hoa') ?? 0, digits);
  const monthly = pi + taxMo + insMo + hoaMo + pmiMo;

  const nz = (minor: number) => (minor > 0 ? m(minor) : null);
  const ledger = withExtra;
  const payoffMonths = ledger.rows.length;

  const rateText = fmt.pct(rate, 3);
  const steps: Step[] = [
    {
      key: 'step.loan',
      math: `${money(priceMinor)} × (1 − ${fmt.pct(down, 2)}) = ${money(loanMinor)}`,
    },
    semi
      ? {
          key: 'step.rateSemi',
          math: `(1 + ${fmt.num(rate / 100, 6)} ÷ 2)^(1/6) − 1 = ${fmt.num(r, 8)}`,
        }
      : { key: 'step.rate', math: `${rateText} ÷ 12 = ${fmt.num(r, 8)}` },
    { key: 'step.n', math: `${fmt.int(years)} × 12 = ${fmt.int(n)}` },
    {
      key: 'step.payment',
      math:
        r === 0
          ? `${money(loanMinor)} ÷ ${fmt.int(n)} = ${money(pi)}`
          : `${money(loanMinor)} × ${fmt.num(r, 8)} ÷ (1 − (1 + ${fmt.num(r, 8)})^−${fmt.int(n)}) = ${money(pi)}`,
    },
  ];
  if (monthly !== pi)
    steps.push({
      key: 'step.escrow',
      math:
        [
          money(pi),
          taxMo && money(taxMo),
          insMo && money(insMo),
          hoaMo && money(hoaMo),
          pmiMo && money(pmiMo),
        ]
          .filter(Boolean)
          .join(' + ') + ` = ${money(monthly)}`,
    });
  steps.push({
    key: 'step.interest',
    math: `${money(base.totalPaid)} − ${money(loanMinor)} = ${money(base.totalInterest)}`,
  });
  if (extraMinor > 0)
    steps.push({
      key: 'step.extra',
      values: { extra: money(extraMinor) },
      math: `${money(base.totalInterest)} − ${money(withExtra.totalInterest)} = ${money(base.totalInterest - withExtra.totalInterest)}`,
    });

  // Yearly summary table and chart from the ledger actually paid (with extras).
  const rowsByYear: (readonly (string | number)[])[] = [];
  const balancePts: [number, number][] = [[0, m(loanMinor)]];
  const interestPts: [number, number][] = [[0, 0]];
  let cumInterest = 0;
  for (let y = 1; y * 12 - 11 <= payoffMonths; y++) {
    const yr = ledger.rows.slice((y - 1) * 12, y * 12);
    const principal = yr.reduce((a, x) => a + x.principal + x.extra, 0);
    const interest = yr.reduce((a, x) => a + x.interest, 0);
    cumInterest += interest;
    const bal = yr[yr.length - 1]!.balance;
    rowsByYear.push([y, m(principal), m(interest), m(bal)]);
    balancePts.push([y, m(bal)]);
    interestPts.push([y, m(cumInterest)]);
  }
  const halfYear = rowsByYear.find((row) => (row[3] as number) <= m(loanMinor) / 2)?.[0] ?? years;
  const interestShare = (ledger.totalInterest / ledger.totalPaid) * 100;

  const warnings: ComputeResult['warnings'] = [];
  if (down < 20 && pmiRate === 0) warnings.push({ key: 'warn.pmi', level: 'info' });
  if (semi && fmt.currency !== 'CAD') warnings.push({ key: 'warn.semi', level: 'info' });

  return {
    outputs: {
      monthly: m(monthly),
      pi: m(pi),
      taxMo: nz(taxMo),
      insMo: nz(insMo),
      hoaMo: nz(hoaMo),
      pmiMo: nz(pmiMo),
      loan: m(loanMinor),
      downAmt: nz(downMinor),
      interest: m(ledger.totalInterest),
      total: m(ledger.totalPaid),
      payoff: payoffMonths,
      saved: extraMinor > 0 ? m(base.totalInterest - withExtra.totalInterest) : null,
      pmiMonths: pmiApplies ? pmiMonths : null,
    },
    explain: {
      key: extraMinor > 0 ? 'explain.extra' : 'explain.base',
      values: {
        pi: money(pi),
        loan: money(loanMinor),
        n: fmt.int(n),
        interest: money(ledger.totalInterest),
        saved: money(base.totalInterest - withExtra.totalInterest),
        months: fmt.int(n - payoffMonths),
      },
    },
    steps,
    chart: {
      xKey: 'chart.x',
      yFormat: 'money',
      series: [
        { key: 'chart.balance', points: balancePts, tone: 'brand' },
        { key: 'chart.interest', points: interestPts, tone: 'accent' },
      ],
      summaryKey: 'chart.summary',
      summaryValues: { year: fmt.int(Number(halfYear)), share: fmt.pct(interestShare, 1) },
    },
    table: {
      captionKey: 'table.caption',
      columns: [
        { key: 'table.year', format: 'integer' },
        { key: 'table.principal', format: 'money' },
        { key: 'table.interest', format: 'money' },
        { key: 'table.balance', format: 'money' },
      ],
      rows: rowsByYear,
    },
    csv: {
      filename: 'mortgage-schedule.csv',
      columns: [
        'csv.month',
        'csv.payment',
        'csv.principal',
        'csv.interest',
        'csv.extra',
        'csv.balance',
      ],
      rows: ledger.rows.map((x) => [
        x.period,
        m(x.payment),
        m(x.principal),
        m(x.interest),
        m(x.extra),
        m(x.balance),
      ]),
    },
    warnings,
  };
};

/** Exposed for tests: unrounded level payment. */
export const levelPayment = annuityPayment;
