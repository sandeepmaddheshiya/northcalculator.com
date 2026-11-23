import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { minorDigits, roundTo } from '@/engine/money';
import type { RateData } from './definition';

/**
 * Currency conversion with daily reference rates (ADR-007). Rates are quoted against one base
 * currency, so any pair is a cross rate: from→to = rates[to] ÷ rates[from] (triangulation, as
 * the ECB describes for its reference rates). The result is rounded half-up to the target
 * currency's minor unit (ISO 4217 via Intl). With a custom rate (your bank's quote), the markup
 * against the reference rate is shown.
 */
export const compute: ComputeFn = (inputs, { fmt, data, t: tr }) => {
  const t = tr ?? ((k: string) => k);
  const d = data as RateData | undefined;
  const amount = typeof inputs.amount === 'number' ? inputs.amount : null;
  const from = String(inputs.from);
  const to = String(inputs.to);
  const custom = inputs.mode === 'custom';
  const none = (key?: string): ComputeResult => ({
    outputs: { result: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  if (amount === null) return none();

  const rf = d?.rates[from];
  const rt = d?.rates[to];
  const refRate = rf && rt ? rt / rf : null;
  const customRate = typeof inputs.rate === 'number' && inputs.rate > 0 ? inputs.rate : null;
  const rate = custom ? customRate : refRate;
  if (rate === null) return none(custom ? 'warn.noRate' : 'warn.noData');

  const digits = minorDigits(to);
  const result = roundTo(amount * rate, digits);
  const refResult = refRate !== null ? roundTo(amount * refRate, digits) : null;
  // Markup: how much worse the custom rate is than the reference, as a share of the reference.
  const markup = custom && refRate !== null ? ((refRate - rate) / refRate) * 100 : null;
  const sig = (x: number) => fmt.sig(x, 6);
  const asOf =
    d && d.time > 0
      ? t('asOf', {
          date: new Intl.DateTimeFormat(fmt.locale, {
            dateStyle: 'medium',
            timeStyle: 'short',
            timeZone: 'UTC',
          }).format(new Date(d.time * 1000)),
          source: t(`source.${d.source}`),
        })
      : null;

  const warnings: ComputeResult['warnings'] = [];
  if (from === to) warnings.push({ key: 'warn.same', level: 'info' });
  if (markup !== null && Math.abs(markup) > 15)
    warnings.push({ key: 'warn.markupLarge', values: { p: fmt.pct(markup, 1) }, level: 'warn' });

  const steps = custom
    ? [
        {
          key: 'step.custom',
          math: `${fmt.num(amount, 6)} ${from} × ${sig(rate)} = ${fmt.money(result)}`,
        },
      ]
    : [
        {
          key: 'step.cross',
          values: { base: d!.base },
          math: `${sig(rt!)} ÷ ${sig(rf!)} = ${sig(rate)} ${to} per ${from}`,
        },
        {
          key: 'step.multiply',
          math: `${fmt.num(amount, 6)} × ${sig(rate)} = ${fmt.money(result)}`,
        },
      ];
  if (markup !== null)
    steps.push({
      key: 'step.markup',
      math: `(${sig(refRate!)} − ${sig(rate)}) ÷ ${sig(refRate!)} = ${fmt.pct(markup, 2)}`,
    });

  return {
    outputs: {
      result,
      rateText: `1 ${from} = ${sig(rate)} ${to}`,
      inverseText: `1 ${to} = ${sig(1 / rate)} ${from}`,
      refResult: custom ? refResult : null,
      markup,
      asOf,
    },
    explain: {
      key: custom ? 'explain.custom' : 'explain.ref',
      values: {
        amount: fmt.num(amount, 6),
        from,
        result: fmt.money(result),
        markup: markup === null ? '' : fmt.pct(Math.abs(markup), 2),
      },
    },
    steps,
    warnings,
  };
};
