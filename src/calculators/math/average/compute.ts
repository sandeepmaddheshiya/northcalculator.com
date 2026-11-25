import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { localeSeparators, parseLocaleNumber } from '@/engine/parse';
import { clean } from '@/engine/money';

/**
 * Mean, median, mode, range and standard deviation of a list (OpenStax Introductory Statistics
 * §2.5, §2.7). Sample SD divides by n − 1, population SD by n. Sums use Neumaier compensated
 * summation so long lists don't accumulate floating-point error; results keep 12 significant digits.
 */
const MAX = 10000;

export function parseList(raw: string, locale: string): { values: number[]; bad: string[] } {
  // Commas separate values unless the locale uses the comma as its decimal mark.
  const splitter = localeSeparators(locale).decimal === ',' ? /[\s;]+/ : /[\s;,]+/;
  const values: number[] = [];
  const bad: string[] = [];
  for (const tok of raw
    .split(splitter)
    .filter(Boolean)
    .slice(0, MAX + 1)) {
    const r = parseLocaleNumber(tok, locale);
    if (r.ok) values.push(r.value);
    else bad.push(tok);
  }
  return { values, bad };
}

export function sum(xs: number[]): number {
  let s = 0;
  let c = 0;
  for (const x of xs) {
    const t = s + x;
    c += Math.abs(s) >= Math.abs(x) ? s - t + x : x - t + s;
    s = t;
  }
  return s + c;
}

export const compute: ComputeFn = (inputs, { fmt }) => {
  const { values, bad } = parseList(
    typeof inputs.values === 'string' ? inputs.values : '',
    fmt.locale,
  );
  const warnings: ComputeResult['warnings'] = [];
  if (bad.length)
    warnings.push({
      key: 'warn.ignored',
      values: { list: bad.slice(0, 5).join(', '), n: bad.length },
      level: 'info',
    });
  if (values.length > MAX)
    warnings.push({ key: 'warn.tooMany', values: { max: MAX }, level: 'warn' });
  const xs = values.slice(0, MAX);
  const n = xs.length;
  if (n === 0) {
    const none: ComputeResult = {
      outputs: { mean: null },
      steps: [],
      warnings: [...warnings, { key: 'warn.empty', level: 'warn' }],
    };
    return none;
  }

  const total = sum(xs);
  const mean = total / n;
  const sorted = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(n / 2);
  const median = n % 2 ? sorted[mid]! : (sorted[mid - 1]! + sorted[mid]!) / 2;
  const counts = new Map<number, number>();
  for (const x of sorted) counts.set(x, (counts.get(x) ?? 0) + 1);
  const top = Math.max(...counts.values());
  const modes = top > 1 ? [...counts].filter(([, c]) => c === top).map(([v]) => v) : [];
  const ss = sum(xs.map((x) => (x - mean) ** 2));
  const sd = n > 1 ? Math.sqrt(ss / (n - 1)) : null;
  const psd = Math.sqrt(ss / n);
  const show = (x: number) => fmt.sig(clean(x), 10);

  return {
    outputs: {
      mean: clean(mean),
      median: clean(median),
      mode: modes.length ? modes.map(show).join(', ') : 'mode.none',
      range: clean(sorted[n - 1]! - sorted[0]!),
      count: n,
      sum: clean(total),
      min: sorted[0]!,
      max: sorted[n - 1]!,
      sd: sd === null ? null : clean(sd),
      psd: clean(psd),
    },
    explain: {
      key: modes.length > 1 ? 'explain.multimodal' : 'explain',
      values: { n: fmt.int(n), mean: show(mean), median: show(median) },
    },
    steps: [
      {
        key: 'step.mean',
        values: { n: fmt.int(n) },
        math: `${show(total)} ÷ ${fmt.int(n)} = ${show(mean)}`,
      },
      {
        key: n % 2 ? 'step.medianOdd' : 'step.medianEven',
        values: { k: fmt.int(mid + 1) },
        math:
          n % 2
            ? `${show(median)}`
            : `(${show(sorted[mid - 1]!)} + ${show(sorted[mid]!)}) ÷ 2 = ${show(median)}`,
      },
      {
        key: modes.length ? 'step.mode' : 'step.noMode',
        values: { c: fmt.int(top) },
        math: modes.length ? modes.map(show).join(', ') : '—',
      },
      ...(sd === null
        ? []
        : [{ key: 'step.sd', math: `√(${show(ss)} ÷ ${fmt.int(n - 1)}) = ${fmt.sig(sd, 6)}` }]),
    ],
    warnings,
  };
};
