import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean, fromMinor, minorDigits, roundHalfUp, roundTo } from '@/engine/money';

/**
 * Capital budgeting on a list of cash flows, year 0 first (OpenStax Principles of Finance
 * §16.1–16.3; Principles of Accounting Vol. 2 §11.4):
 *   NPV = Σ CFₜ ÷ (1 + r)ᵗ; IRR is the rate where NPV = 0, found by bisection on a sign change;
 *   profitability index = PV of later flows ÷ initial outlay;
 *   payback = years until the running total turns non-negative, interpolating within the year
 *   on the assumption that that year’s cash arrives evenly.
 * Money results are rounded half-up to the smallest currency unit.
 */
export function npv(rate: number, flows: number[]): number {
  return flows.reduce((s, c, t) => s + c / (1 + rate) ** t, 0);
}

export function irr(flows: number[]): number | null {
  let lo = -0.9999;
  let hi = 10;
  let flo = npv(lo, flows);
  const fhi = npv(hi, flows);
  if (!Number.isFinite(flo) || flo * fhi > 0) return null;
  for (let i = 0; i < 300; i++) {
    const mid = (lo + hi) / 2;
    const fm = npv(mid, flows);
    if (fm === 0) return mid;
    if (fm * flo < 0) hi = mid;
    else {
      lo = mid;
      flo = fm;
    }
  }
  return (lo + hi) / 2;
}

export function payback(flows: number[]): number | null {
  let total = flows[0]!;
  if (total >= 0) return 0;
  for (let t = 1; t < flows.length; t++) {
    const before = total;
    total += flows[t]!;
    if (total >= 0) return t - 1 + -before / flows[t]!;
  }
  return null;
}

/**
 * Splits on spaces and semicolons; a chunk with thousands grouping such as 16,000 or (16,000) is
 * one number, otherwise commas also separate values. Parentheses mean negative, as in accounts.
 */
export function parseFlows(text: string): { flows: number[]; bad: number } {
  const flows: number[] = [];
  let bad = 0;
  const one = (tok: string) => {
    const neg = /^\(.*\)$/.test(tok);
    const v = Number(tok.replace(/[()$€£,]/g, '').replace('−', '-'));
    if (tok && Number.isFinite(v)) flows.push(neg ? -v : v);
    else if (tok) bad++;
  };
  for (const chunk of text.split(/[\s;]+/)) {
    const c = chunk.replace(/^,+|,+$/g, '');
    if (!c) continue;
    if (/^\(?[−-]?[$€£]?\d{1,3}(,\d{3})+(\.\d+)?\)?$/.test(c)) one(c);
    else c.split(',').forEach(one);
  }
  return { flows, bad };
}

export const compute: ComputeFn = (inputs, { fmt }) => {
  const none = (key?: string): ComputeResult => ({
    outputs: { npv: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  const rate = typeof inputs.rate === 'number' ? inputs.rate / 100 : null;
  const { flows, bad } = parseFlows(String(inputs.flows ?? ''));
  if (rate === null) return none();
  if (rate <= -1) return none('warn.rate');
  if (flows.length < 2) return none('warn.flows');
  const d = minorDigits(fmt.currency);
  const money = (x: number) => fromMinor(roundHalfUp(roundTo(x * 10 ** d, 6)), d);
  const value = npv(rate, flows);
  const pvIn = npv(rate, [0, ...flows.slice(1)]);
  const outlay = -flows[0]!;
  const r = irr(flows);
  const pb = payback(flows);
  const warnings: ComputeResult['warnings'] = [];
  if (bad) warnings.push({ key: 'warn.bad', level: 'warn', values: { n: bad } });
  const signChanges = flows
    .slice(1)
    .reduce(
      (n, c, i) =>
        Math.sign(c) && Math.sign(flows[i]!) && Math.sign(c) !== Math.sign(flows[i]!) ? n + 1 : n,
      0,
    );
  if (signChanges > 1) warnings.push({ key: 'warn.multiple', level: 'info' });
  return {
    outputs: {
      npv: money(value),
      irr: r === null ? null : roundTo(r * 100, 6),
      payback: pb === null ? null : clean(pb),
      pi: outlay > 0 ? clean(pvIn / outlay) : null,
      pvIn: money(pvIn),
    },
    explain: {
      key: value >= 0 ? 'explain.accept' : 'explain.reject',
      values: { npv: fmt.money(money(value)), rate: fmt.num(rate * 100, 4) },
    },
    steps: [
      {
        key: 'step.npv',
        math:
          flows
            .map((c, t) => `${fmt.num(c, 2)} ÷ ${fmt.num(1 + rate, 6)}^${t}`)
            .slice(0, 6)
            .join(' + ') +
          (flows.length > 6 ? ' + …' : '') +
          ` = ${fmt.money(money(value))}`,
      },
      ...(r === null
        ? []
        : [{ key: 'step.irr', math: `NPV = 0 at ${fmt.num(roundTo(r * 100, 4), 4)}%` }]),
    ],
    warnings,
  };
};
