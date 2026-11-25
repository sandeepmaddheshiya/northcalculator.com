import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean, fromMinor, minorDigits, roundHalfUp, roundTo } from '@/engine/money';
import { parseList } from '@/calculators/math/average/compute';

/**
 * Depreciation schedules (OpenStax Principles of Financial Accounting §11.3; Jonick, Principles of
 * Financial Accounting §4.5):
 *  - straight line: (cost − salvage) ÷ useful life each year;
 *  - double declining balance: book value × 2 ÷ life, never taking book value below salvage, and
 *    in the final year of the life the remaining book value above salvage;
 *  - units of production: (cost − salvage) ÷ total units × units used, capped at the remaining
 *    depreciable amount.
 * Amounts are worked in integer minor units (cents) and each year is rounded half-up, so the
 * schedule ends exactly at salvage value.
 */
export type Method = 'sl' | 'ddb' | 'units';

export interface Year {
  year: number;
  dep: number;
  accumulated: number;
  book: number;
}

const MAX_YEARS = 100;

/** All money arguments and results are integer minor units. */
export function schedule(
  method: Method,
  cost: number,
  salvage: number,
  life: number,
  units: { total: number; used: number[] } = { total: 0, used: [] },
): Year[] {
  const base = cost - salvage;
  const rows: Year[] = [];
  let book = cost;
  let acc = 0;
  const push = (dep: number) => {
    acc += dep;
    book -= dep;
    rows.push({ year: rows.length + 1, dep, accumulated: acc, book });
  };
  if (method === 'units') {
    for (const u of units.used.slice(0, MAX_YEARS))
      push(Math.max(0, Math.min(roundHalfUp((base * u) / units.total), book - salvage)));
    return rows;
  }
  for (let y = 1; y <= life; y++) {
    const left = book - salvage;
    if (y === life) push(Math.max(0, left));
    else if (method === 'sl') push(Math.min(roundHalfUp(base / life), Math.max(0, left)));
    else push(Math.max(0, Math.min(roundHalfUp((book * 2) / life), left)));
  }
  return rows;
}

export const compute: ComputeFn = (inputs, { fmt }) => {
  const none = (key?: string): ComputeResult => ({
    outputs: { first: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  const num = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const method = (
    ['sl', 'ddb', 'units'].includes(inputs.method as string) ? inputs.method : 'sl'
  ) as Method;
  const costIn = num('cost');
  const salvageIn = num('salvage') ?? 0;
  const life = num('life');
  const totalUnits = num('totalUnits');
  if (costIn === null) return none();
  const d = minorDigits(fmt.currency);
  const minor = (x: number) => roundHalfUp(roundTo(x * 10 ** d, 6));
  const major = (m: number) => fromMinor(m, d);
  const cost = minor(costIn);
  const salvage = minor(salvageIn);
  if (cost <= 0) return none('warn.cost');
  if (salvage > cost) return none('warn.salvage');

  const warnings: ComputeResult['warnings'] = [];
  let used: number[] = [];
  if (method === 'units') {
    if (totalUnits === null || totalUnits <= 0) return none('warn.units');
    const parsed = parseList(String(inputs.used ?? ''), fmt.locale);
    used = parsed.values.filter((u) => u >= 0);
    if (!used.length) return none('warn.used');
    if (parsed.bad.length || used.length < parsed.values.length)
      warnings.push({ key: 'warn.bad', level: 'info' });
    if (used.length > MAX_YEARS)
      warnings.push({ key: 'warn.tooMany', level: 'warn', values: { max: MAX_YEARS } });
    const sumUsed = used.slice(0, MAX_YEARS).reduce((a, b) => a + b, 0);
    if (sumUsed > totalUnits)
      warnings.push({
        key: 'warn.overUnits',
        level: 'info',
        values: { total: fmt.num(totalUnits, 6) },
      });
  } else if (life === null || life < 1 || !Number.isInteger(life)) return none('warn.life');

  const rows = schedule(method, cost, salvage, life ?? 0, {
    total: totalUnits ?? 0,
    used,
  });
  const base = cost - salvage;
  const first = rows[0]!;
  const last = rows.at(-1)!;
  const m = (x: number) => fmt.money(major(x));
  const rate = method === 'units' ? null : (method === 'ddb' ? 2 : 1) / life!;
  const perUnit = method === 'units' ? major(base) / totalUnits! : null;
  if (method === 'units' && last.book > salvage)
    warnings.push({
      key: 'warn.remaining',
      level: 'info',
      values: { left: m(last.book - salvage) },
    });

  const steps: ComputeResult['steps'] = [
    { key: 'step.base', math: `${m(cost)} − ${m(salvage)} = ${m(base)}` },
  ];
  if (method === 'sl')
    steps.push({ key: 'step.sl', math: `${m(base)} ÷ ${life} = ${m(first.dep)}` });
  else if (method === 'ddb') {
    steps.push({
      key: 'step.ddbRate',
      math: `2 ÷ ${life} = ${fmt.pct(clean(rate! * 100), 4)}`,
    });
    steps.push({
      key: 'step.ddb',
      math: `${m(cost)} × ${fmt.pct(clean(rate! * 100), 4)} = ${m(first.dep)}`,
    });
    steps.push({ key: 'step.ddbStop' });
  } else {
    steps.push({
      key: 'step.perUnit',
      math: `${m(base)} ÷ ${fmt.num(totalUnits!, 6)} = ${fmt.sig(clean(perUnit!), 6)}`,
    });
    steps.push({
      key: 'step.units',
      math: `${fmt.num(used[0]!, 6)} × ${fmt.sig(clean(perUnit!), 6)} = ${m(first.dep)}`,
    });
  }

  return {
    outputs: {
      first: major(first.dep),
      final: rows.length > 1 ? major(last.dep) : null,
      rate: rate === null ? null : clean(rate * 100),
      perUnit: perUnit === null ? null : clean(perUnit),
      base: major(base),
      total: major(last.accumulated),
      endBook: major(last.book),
    },
    explain: {
      key: 'explain',
      values: {
        first: m(first.dep),
        cost: m(cost),
        end: m(last.book),
        n: rows.length,
      },
    },
    steps,
    table: {
      captionKey: 'table.caption',
      columns: [
        { key: 'table.year', format: 'integer' },
        { key: 'table.dep', format: 'money' },
        { key: 'table.acc', format: 'money' },
        { key: 'table.book', format: 'money' },
      ],
      rows: rows.map((r) => [r.year, major(r.dep), major(r.accumulated), major(r.book)]),
    },
    warnings,
  };
};
