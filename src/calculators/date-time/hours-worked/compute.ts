import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { minutesBetween, parseClock } from '@/engine/clock';
import { fromMinor, minorDigits, roundHalfUp, roundTo, toMinor } from '@/engine/money';

/**
 * Time card: each row's hours = (end − start, wrapping past midnight) − unpaid break, using
 * 1 h = 60 min (OpenStax Prealgebra 2e Table 7.2). Pay applies overtime at the chosen multiple
 * (default 1.5) to hours above the threshold (default 40) for the week, the FLSA rule (US
 * Department of Labor). All rows are treated as one workweek. Minutes are exact; pay is rounded
 * half-up to the smallest currency unit.
 */
export const compute: ComputeFn = (inputs, ctx) => {
  const { fmt } = ctx;
  const t = ctx.t ?? ((k: string, v?: Record<string, string | number>) => `${v?.h ?? ''}${k}`);
  const rows = Array.isArray(inputs.days)
    ? (inputs.days as readonly Record<string, unknown>[])
    : [];
  const num = (v: unknown) =>
    typeof v === 'number' ? v : typeof v === 'string' && v.trim() !== '' ? Number(v) : 0;
  let minutes = 0;
  let skipped = 0;
  const table: (readonly (string | number)[])[] = [];
  const warnings: ComputeResult['warnings'] = [];
  rows.forEach((r, i) => {
    const s = parseClock(String(r.start ?? ''));
    const e = parseClock(String(r.end ?? ''));
    if (s === null || e === null) {
      skipped++;
      return;
    }
    const span = minutesBetween(s, e);
    const brk = Math.max(0, num(r.brk));
    const worked = Math.max(0, span - brk);
    if (brk > span) warnings.push({ key: 'warn.break', values: { n: i + 1 }, level: 'warn' });
    minutes += worked;
    table.push([i + 1, String(r.start), String(r.end), brk, roundTo(worked / 60, 4)]);
  });
  if (!table.length) {
    const none: ComputeResult = {
      outputs: { hours: null },
      steps: [],
      warnings: [{ key: 'warn.empty', level: 'warn' }],
    };
    return none;
  }
  if (skipped) warnings.push({ key: 'warn.skipped', values: { n: skipped }, level: 'info' });
  const hours = roundTo(minutes / 60, 6);
  const otAfter = typeof inputs.otAfter === 'number' ? inputs.otAfter : 40;
  const otRate = typeof inputs.otRate === 'number' ? inputs.otRate : 1.5;
  const overtimeMin = Math.max(0, minutes - otAfter * 60);
  const rate = typeof inputs.rate === 'number' ? inputs.rate : 0;
  const d = minorDigits(fmt.currency);
  const rateMinor = toMinor(rate, d);
  const pay =
    rate > 0
      ? fromMinor(
          roundHalfUp(
            (rateMinor * (minutes - overtimeMin)) / 60 + (rateMinor * otRate * overtimeMin) / 60,
          ),
          d,
        )
      : null;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes - h * 60);
  const hm =
    [h ? t('fmt.h', { n: fmt.int(h) }) : '', m ? t('fmt.m', { n: fmt.int(m) }) : '']
      .filter(Boolean)
      .join(' ') || t('fmt.m', { n: '0' });
  if (rows.length > 7) warnings.push({ key: 'warn.week', level: 'info' });
  return {
    outputs: { hours, hm, overtime: overtimeMin > 0 ? roundTo(overtimeMin / 60, 6) : null, pay },
    explain: {
      key: pay === null ? 'explain' : 'explain.pay',
      values: { hm, hours: fmt.num(hours, 2), pay: pay === null ? '' : fmt.money(pay) },
    },
    steps: [
      {
        key: 'step.rows',
        math: table
          .map((r) => `${r[0]}: ${r[1]}–${r[2]} − ${r[3]} min = ${fmt.num(r[4] as number, 2)} h`)
          .join('\n'),
      },
      { key: 'step.total', math: `${fmt.int(minutes)} min ÷ 60 = ${fmt.num(hours, 2)} h` },
      ...(pay !== null
        ? [
            {
              key: 'step.pay',
              math: `${fmt.num((minutes - overtimeMin) / 60, 2)} h × ${fmt.money(rate)}${overtimeMin ? ` + ${fmt.num(overtimeMin / 60, 2)} h × ${fmt.money(rate)} × ${fmt.num(otRate, 2)}` : ''} = ${fmt.money(pay)}`,
            },
          ]
        : []),
    ],
    table: {
      captionKey: 'table.caption',
      columns: [
        { key: 'table.n', format: 'integer' },
        { key: 'table.hours', format: 'number' },
      ],
      rows: table.map((r) => [r[0]!, r[4]!]),
    },
    warnings,
  };
};
