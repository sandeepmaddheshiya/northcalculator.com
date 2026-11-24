import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { fromMinor, minorDigits, roundHalfUp, toMinor } from '@/engine/money';

/**
 * Regular saving needed to reach a goal (OpenStax Contemporary Mathematics §6.6–6.7): the future
 * value of an annuity solved for the payment, with payments and compounding at the same frequency:
 *   pmt = (goal − start × (1 + i)^N) × i ÷ ((1 + i)^N − 1),   i = r ÷ n, N = n × years
 * Payments at the start of each period (annuity due) are divided by (1 + i). With r = 0 the
 * payment is simply (goal − start) ÷ N. The payment is rounded half-up to the smallest currency unit.
 */
export const compute: ComputeFn = (inputs, { fmt }) => {
  const num = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const goal = num('goal');
  const years = num('years');
  const rate = num('rate');
  const start = num('start') ?? 0;
  const n = Number(inputs.freq) || 12;
  const begin = inputs.timing === 'begin';
  const none = (key?: string): ComputeResult => ({
    outputs: { payment: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  if (goal === null || years === null || rate === null) return none();
  const N = Math.round(years * n);
  if (N < 1) return none('warn.years');
  const i = rate / 100 / n;
  const g = (1 + i) ** N;
  const grownStart = start * g;
  if (grownStart >= goal) {
    return {
      outputs: {
        payment: 0,
        contributed: start,
        interest: Math.max(0, grownStart - start),
        periods: N,
      },
      explain: {
        key: 'explain.reached',
        values: { start: fmt.money(start), grown: fmt.money(grownStart) },
      },
      steps: [],
      warnings: [{ key: 'warn.reached', level: 'info' }],
    };
  }
  let raw = i === 0 ? (goal - start) / N : ((goal - grownStart) * i) / (g - 1);
  if (begin && i > 0) raw /= 1 + i;
  const d = minorDigits(fmt.currency);
  const payment = fromMinor(roundHalfUp(raw * 10 ** d), d);
  const contributed = fromMinor(toMinor(start, d) + roundHalfUp(raw * 10 ** d) * N, d);
  return {
    outputs: {
      payment,
      contributed,
      interest: Math.max(0, fromMinor(toMinor(goal, d) - toMinor(contributed, d), d)),
      periods: N,
    },
    explain: {
      key: `explain.${n}`,
      values: {
        pmt: fmt.money(payment),
        goal: fmt.money(goal),
        years: fmt.num(years, 2),
        rate: fmt.pct(rate, 3),
      },
    },
    steps: [
      {
        key: 'step.rate',
        math: `i = ${fmt.num(rate, 4)}% ÷ ${n} = ${fmt.num(i, 8)} · N = ${fmt.num(years, 4)} × ${n} = ${N}`,
      },
      ...(start > 0
        ? [
            {
              key: 'step.start',
              math: `${fmt.money(start)} × ${fmt.num(g, 8)} = ${fmt.money(grownStart)}`,
            },
          ]
        : []),
      {
        key: begin ? 'step.paymentBegin' : 'step.payment',
        math:
          i === 0
            ? `(${fmt.money(goal)} − ${fmt.money(start)}) ÷ ${N} = ${fmt.money(payment)}`
            : `(${fmt.money(goal)} − ${fmt.money(grownStart)}) × ${fmt.num(i, 8)} ÷ (${fmt.num(g, 8)} − 1)${begin ? ` ÷ ${fmt.num(1 + i, 8)}` : ''} = ${fmt.money(payment)}`,
      },
    ],
    warnings: [],
  };
};
