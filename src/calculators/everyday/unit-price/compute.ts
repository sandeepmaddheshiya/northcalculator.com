import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { roundTo } from '@/engine/money';

/**
 * Unit price = price ÷ quantity (OpenStax Prealgebra 2e §5.6; NIST SP 1181). The lowest unit price
 * is the better buy, provided every quantity is in the same unit. Unit prices are kept to 4
 * decimal places so close comparisons are not decided by rounding to the cent.
 */
export const compute: ComputeFn = (inputs, ctx) => {
  const { fmt } = ctx;
  const t = ctx.t ?? ((k: string, v?: Record<string, string | number>) => `${k} ${v?.n ?? ''}`);
  const rows = Array.isArray(inputs.items)
    ? (inputs.items as readonly Record<string, unknown>[])
    : [];
  const num = (v: unknown) =>
    typeof v === 'number' ? v : typeof v === 'string' && v.trim() !== '' ? Number(v) : NaN;
  const priced: { n: number; price: number; qty: number; unit: number }[] = [];
  let skipped = 0;
  rows.forEach((r, i) => {
    const price = num(r.price);
    const qty = num(r.qty);
    if (!Number.isFinite(price) || !Number.isFinite(qty) || qty <= 0 || price < 0) {
      skipped++;
      return;
    }
    priced.push({ n: i + 1, price, qty, unit: price / qty });
  });
  if (!priced.length) {
    const none: ComputeResult = {
      outputs: { best: null },
      steps: [],
      warnings: [{ key: 'warn.empty', level: 'warn' }],
    };
    return none;
  }
  const min = Math.min(...priced.map((p) => p.unit));
  const max = Math.max(...priced.map((p) => p.unit));
  const winners = priced.filter((p) => Math.abs(p.unit - min) < 1e-12);
  const best =
    priced.length === 1
      ? t('fmt.item', { n: priced[0]!.n })
      : winners.length > 1
        ? t('fmt.tie', { list: winners.map((w) => w.n).join(', ') })
        : t('fmt.item', { n: winners[0]!.n });
  const warnings: ComputeResult['warnings'] = [];
  if (skipped) warnings.push({ key: 'warn.skipped', values: { n: skipped }, level: 'info' });
  if (priced.length > 1 && max > 0 && (max - min) / max < 0.01 && max !== min)
    warnings.push({ key: 'warn.close', level: 'info' });

  return {
    outputs: {
      best,
      unit: roundTo(min, 4),
      saving: priced.length > 1 && max > 0 ? roundTo(((max - min) / max) * 100, 4) : null,
      worst: priced.length > 1 ? roundTo(max, 4) : null,
    },
    explain: {
      key: priced.length === 1 ? 'explain.one' : 'explain',
      values: { best, unit: fmt.money(roundTo(min, 4), 4), worst: fmt.money(roundTo(max, 4), 4) },
    },
    steps: [
      {
        key: 'step.divide',
        math: priced
          .map(
            (p) =>
              `${p.n}: ${fmt.money(p.price)} ÷ ${fmt.num(p.qty, 4)} = ${fmt.money(roundTo(p.unit, 4), 4)}`,
          )
          .join('\n'),
      },
      { key: 'step.compare' },
    ],
    table: {
      captionKey: 'table.caption',
      columns: [
        { key: 'table.item', format: 'integer' },
        { key: 'table.unit', format: 'number' },
        { key: 'table.vsBest', format: 'percent' },
      ],
      rows: priced.map((p) => [
        p.n,
        roundTo(p.unit, 4),
        min > 0 ? roundTo(((p.unit - min) / min) * 100, 2) : 0,
      ]),
    },
    warnings,
  };
};
