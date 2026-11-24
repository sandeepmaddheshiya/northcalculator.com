import type { ComputeFn, ComputeResult, Step } from '@/calculators/types';
import { fromMinor, minorDigits, roundHalfUp, roundTo, toMinor } from '@/engine/money';

/**
 * Margin and markup (OpenStax Contemporary Mathematics §6.2; Principles of Accounting §6.6):
 *   profit = price − cost
 *   markup = profit ÷ cost        price = cost × (1 + markup)
 *   margin = profit ÷ price       price = cost ÷ (1 − margin)
 * Prices and costs are integer minor units, rounded half-up; percentages to 4 decimals.
 */
export const compute: ComputeFn = (inputs, { fmt }) => {
  const num = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const calc = String(inputs.calc ?? 'costPrice');
  const d = minorDigits(fmt.currency);
  const m = (x: number) => fromMinor(x, d);
  const none = (key?: string): ComputeResult => ({
    outputs: { result: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });

  let cost: number;
  let price: number;
  const steps: Step[] = [];
  const pctOf = (k: string) => {
    const v = num(k);
    return v === null ? null : v / 100;
  };

  if (calc === 'costPrice') {
    const c = num('cost');
    const p = num('price');
    if (c === null || p === null) return none();
    cost = toMinor(c, d);
    price = toMinor(p, d);
  } else if (calc === 'costMargin' || calc === 'costMarkup') {
    const c = num('cost');
    const r = pctOf(calc === 'costMargin' ? 'marginPct' : 'markupPct');
    if (c === null || r === null) return none();
    if (calc === 'costMargin' && r >= 1) return none('warn.margin100');
    cost = toMinor(c, d);
    price = roundHalfUp(calc === 'costMargin' ? cost / (1 - r) : cost * (1 + r));
    steps.push(
      calc === 'costMargin'
        ? {
            key: 'step.priceFromMargin',
            math: `${fmt.money(c)} ÷ (1 − ${fmt.num(r, 6)}) = ${fmt.money(m(price))}`,
          }
        : {
            key: 'step.priceFromMarkup',
            math: `${fmt.money(c)} × (1 + ${fmt.num(r, 6)}) = ${fmt.money(m(price))}`,
          },
    );
  } else {
    const p = num('price');
    const r = pctOf(calc === 'priceMargin' ? 'marginPct' : 'markupPct');
    if (p === null || r === null) return none();
    if (calc === 'priceMarkup' && r <= -1) return none('warn.markup100');
    price = toMinor(p, d);
    cost = roundHalfUp(calc === 'priceMargin' ? price * (1 - r) : price / (1 + r));
    steps.push(
      calc === 'priceMargin'
        ? {
            key: 'step.costFromMargin',
            math: `${fmt.money(p)} × (1 − ${fmt.num(r, 6)}) = ${fmt.money(m(cost))}`,
          }
        : {
            key: 'step.costFromMarkup',
            math: `${fmt.money(p)} ÷ (1 + ${fmt.num(r, 6)}) = ${fmt.money(m(cost))}`,
          },
    );
  }

  const profit = price - cost;
  const margin = price > 0 ? roundTo((profit / price) * 100, 4) : null;
  const markup = cost > 0 ? roundTo((profit / cost) * 100, 4) : null;
  steps.push({
    key: 'step.profit',
    math: `${fmt.money(m(price))} − ${fmt.money(m(cost))} = ${fmt.money(m(profit))}`,
  });
  if (margin !== null)
    steps.push({
      key: 'step.margin',
      math: `${fmt.money(m(profit))} ÷ ${fmt.money(m(price))} = ${fmt.pct(margin, 4)}`,
    });
  if (markup !== null)
    steps.push({
      key: 'step.markup',
      math: `${fmt.money(m(profit))} ÷ ${fmt.money(m(cost))} = ${fmt.pct(markup, 4)}`,
    });

  const warnings: ComputeResult['warnings'] = [];
  if (profit < 0) warnings.push({ key: 'warn.loss', level: 'warn' });
  if (calc === 'costPrice' && price === 0) warnings.push({ key: 'warn.zeroPrice', level: 'warn' });

  const result = calc === 'costPrice' ? margin : calc.startsWith('cost') ? m(price) : m(cost);
  return {
    outputs: {
      result,
      // Hide the secondary row that repeats the headline figure.
      price: calc.startsWith('cost') && calc !== 'costPrice' ? null : m(price),
      cost: calc.startsWith('price') ? null : m(cost),
      profit: m(profit),
      margin: calc === 'costPrice' ? null : margin,
      markup,
    },
    ...(margin !== null && markup !== null
      ? {
          explain: {
            key: 'explain',
            values: {
              cost: fmt.money(m(cost)),
              price: fmt.money(m(price)),
              profit: fmt.money(m(profit)),
              margin: fmt.pct(margin, 2),
              markup: fmt.pct(markup, 2),
            },
          },
        }
      : {}),
    steps,
    warnings,
  };
};
