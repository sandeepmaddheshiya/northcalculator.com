import type { ComputeFn, ComputeResult, Step } from '@/calculators/types';
import {
  effectiveAnnualRate,
  monthlyEffectiveRate,
  PERIODS_PER_YEAR,
  type Compounding,
} from '@/engine/finance';
import { roundTo } from '@/engine/money';

/**
 * Compound interest with optional regular deposits (OpenStax Contemporary Mathematics §6.4, §6.6).
 * The balance is stepped month by month at the monthly rate equivalent to the chosen compounding,
 * which reproduces A = P(1 + r/n)^(nt) exactly at every whole compounding period. Deposits are made
 * at the end (ordinary annuity) or start (annuity due) of each month or year.
 * Values are kept unrounded and rounded to the cent only for display.
 */
export const compute: ComputeFn = (inputs, { fmt }) => {
  const num = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const P = num('principal');
  const rate = num('rate');
  const years = num('years');
  const add = num('add') ?? 0;
  const none = (key?: string): ComputeResult => ({
    outputs: { fv: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  if (P === null || rate === null || years === null || years < 1) return none();
  if (P === 0 && add === 0) return none('warn.nothing');

  const comp = (inputs.comp as Compounding) ?? 'monthly';
  const annualDeposits = inputs.freq === 'annually';
  const start = inputs.timing === 'start';
  const r = rate / 100;
  const i = monthlyEffectiveRate(r, comp);
  const months = Math.round(years * 12);

  let balance = P;
  let contrib = P;
  const rows: (readonly (string | number)[])[] = [];
  const balancePts: [number, number][] = [[0, P]];
  const contribPts: [number, number][] = [[0, P]];
  for (let k = 1; k <= months; k++) {
    const depositNow = annualDeposits ? (start ? k % 12 === 1 : k % 12 === 0) : true;
    if (start && depositNow) {
      balance += add;
      contrib += add;
    }
    balance *= 1 + i;
    if (!start && depositNow) {
      balance += add;
      contrib += add;
    }
    if (k % 12 === 0) {
      const y = k / 12;
      rows.push([y, roundTo(contrib, 2), roundTo(balance - contrib, 2), roundTo(balance, 2)]);
      balancePts.push([y, balance]);
      contribPts.push([y, contrib]);
    }
  }
  const interest = balance - contrib;
  const crossover = rows.find((row) => (row[2] as number) > (row[1] as number));
  const apy = effectiveAnnualRate(r, comp) * 100;
  const doubling = r > 0 ? Math.log(2) / Math.log(1 + apy / 100) : null;

  const steps: Step[] = [];
  if (comp === 'continuous')
    steps.push({
      key: 'step.growthCont',
      math: `${fmt.money(P)} × e^(${fmt.num(r, 6)} × ${fmt.int(years)}) = ${fmt.money(P * Math.exp(r * years))}`,
    });
  else {
    const n = PERIODS_PER_YEAR[comp];
    steps.push({
      key: 'step.periodic',
      values: { n: fmt.int(n) },
      math: `${fmt.num(r, 6)} ÷ ${fmt.int(n)} = ${fmt.num(r / n, 8)}`,
    });
    if (P > 0)
      steps.push({
        key: 'step.growth',
        math: `${fmt.money(P)} × (1 + ${fmt.num(r / n, 8)})^${fmt.int(n * years)} = ${fmt.money(P * (1 + r / n) ** (n * years))}`,
      });
  }
  if (add > 0) {
    const payments = annualDeposits ? years : months;
    const rate = annualDeposits ? (1 + i) ** 12 - 1 : i;
    const annuity = rate === 0 ? add * payments : (add * ((1 + rate) ** payments - 1)) / rate;
    steps.push({
      key: start ? 'step.annuityDue' : 'step.annuity',
      values: { n: fmt.int(payments) },
      math: `${fmt.money(add)} × ((1 + ${fmt.num(rate, 8)})^${fmt.int(payments)} − 1) ÷ ${fmt.num(rate, 8)}${start ? ` × (1 + ${fmt.num(rate, 8)})` : ''} = ${fmt.money(start ? annuity * (1 + rate) : annuity)}`,
    });
  }
  steps.push({
    key: 'step.total',
    math: `${fmt.money(balance)} − ${fmt.money(contrib)} = ${fmt.money(interest)}`,
  });
  steps.push({
    key: 'step.apy',
    math:
      comp === 'continuous'
        ? `e^${fmt.num(r, 6)} − 1 = ${fmt.pct(apy, 3)}`
        : `(1 + ${fmt.num(r / PERIODS_PER_YEAR[comp], 8)})^${fmt.int(PERIODS_PER_YEAR[comp])} − 1 = ${fmt.pct(apy, 3)}`,
  });

  return {
    outputs: {
      fv: roundTo(balance, 2),
      contrib: roundTo(contrib, 2),
      interest: roundTo(interest, 2),
      apy,
      double: doubling,
    },
    explain: {
      key: 'explain',
      values: {
        fv: fmt.money(balance),
        years: fmt.int(years),
        contrib: fmt.money(contrib),
        interest: fmt.money(interest),
        share: fmt.pct((interest / balance) * 100, 1),
      },
    },
    steps,
    chart: {
      xKey: 'chart.x',
      yFormat: 'money',
      series: [
        { key: 'chart.balance', points: balancePts, tone: 'brand' },
        { key: 'chart.contrib', points: contribPts, tone: 'ink' },
      ],
      // When does accumulated interest overtake the money paid in?
      summaryKey: crossover ? 'chart.summary' : 'chart.summaryNot',
      summaryValues: {
        year: crossover ? fmt.int(crossover[0] as number) : '',
        share: fmt.pct((interest / balance) * 100, 1),
      },
    },
    table: {
      captionKey: 'table.caption',
      columns: [
        { key: 'table.year', format: 'integer' },
        { key: 'table.contrib', format: 'money' },
        { key: 'table.interest', format: 'money' },
        { key: 'table.balance', format: 'money' },
      ],
      rows,
    },
    csv: {
      filename: 'compound-interest.csv',
      columns: ['table.year', 'table.contrib', 'table.interest', 'table.balance'],
      rows,
    },
    warnings: [],
  };
};
