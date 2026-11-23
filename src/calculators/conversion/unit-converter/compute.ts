import type { ComputeFn, ComputeResult, Step } from '@/calculators/types';
import { convert, findUnit, UNITS, type Quantity } from '@/engine/units';
import { clean } from '@/engine/money';
import { PAIRS, QUANTITIES } from './definition';

/**
 * Unit conversion through each quantity's SI base unit with exact defined factors (NIST SP 811,
 * HB 44, BIPM). Temperature is affine and fuel economy reciprocal, so those use formulas instead of
 * a single factor. Results keep 12 significant digits (binary noise removed) and are shown to 10.
 */
const BASE: Record<Quantity, string> = {
  length: 'm',
  mass: 'kg',
  volume: 'm³',
  temperature: 'K',
  area: 'm²',
  speed: 'm/s',
  pressure: 'Pa',
  energy: 'J',
  power: 'W',
  data: 'bit',
  time: 's',
  fuel: 'km/L',
};

export const compute: ComputeFn = (inputs, { fmt, t: tr }) => {
  const t = tr ?? ((k: string) => k);
  const q = (QUANTITIES.includes(inputs.q as Quantity) ? inputs.q : 'length') as Quantity;
  const v = typeof inputs.v === 'number' ? inputs.v : null;
  const from = findUnit(q, String(inputs.from)) ? String(inputs.from) : PAIRS[q][0];
  const to = findUnit(q, String(inputs.to)) ? String(inputs.to) : PAIRS[q][1];
  const none = (key?: string): ComputeResult => ({
    outputs: { result: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  if (v === null) return none();

  const a = findUnit(q, from)!;
  const b = findUnit(q, to)!;
  const sym = (id: string) => t(`s.${id}`);
  const raw = convert(v, q, from, to);
  if (!Number.isFinite(raw)) return none('warn.undefined');
  const result = clean(raw);

  const affine = q === 'temperature' && (a.toBase || b.fromBase);
  const reciprocal = q === 'fuel' && (from === 'l100km' || to === 'l100km') && from !== to;
  const warnings: ComputeResult['warnings'] = [];
  if (q === 'temperature' && convert(v, q, from, 'k') < 0)
    warnings.push({ key: 'warn.belowZero', level: 'warn' });
  if (q === 'fuel' && v <= 0) warnings.push({ key: 'warn.fuelZero', level: 'warn' });

  let relation: string;
  const steps: Step[] = [];
  if (affine) {
    relation =
      t(`f.${from}.${to}`) === `f.${from}.${to}`
        ? `${fmt.sig(v)} ${sym(from)} = ${fmt.sig(result)} ${sym(to)}`
        : t(`f.${from}.${to}`);
    const kelvin = convert(v, q, from, 'k');
    steps.push({
      key: 'step.toBase',
      values: { base: BASE[q] },
      math: `${fmt.sig(v)} ${sym(from)} = ${fmt.sig(clean(kelvin))} K`,
    });
    steps.push({
      key: 'step.fromBase',
      math: `${fmt.sig(clean(kelvin))} K = ${fmt.sig(result)} ${sym(to)}`,
    });
  } else if (reciprocal) {
    relation = t('f.reciprocal');
    steps.push({
      key: 'step.reciprocal',
      math: `${fmt.sig(v)} ${sym(from)} → ${fmt.sig(result)} ${sym(to)}`,
    });
  } else {
    const ratio = clean(convert(1, q, from, to));
    relation = `1 ${sym(from)} = ${fmt.sig(ratio, 12)} ${sym(to)}`;
    steps.push({
      key: 'step.toBase',
      values: { base: BASE[q] },
      math: `${fmt.sig(v)} ${sym(from)} × ${fmt.sig(a.factor!, 12)} = ${fmt.sig(clean(v * a.factor!), 12)} ${BASE[q]}`,
    });
    steps.push({
      key: 'step.fromBase',
      math: `${fmt.sig(clean(v * a.factor!), 12)} ${BASE[q]} ÷ ${fmt.sig(b.factor!, 12)} = ${fmt.sig(result, 12)} ${sym(to)}`,
    });
  }

  return {
    outputs: { result, relation, exact: a.exact && b.exact ? 'exact.yes' : 'exact.no' },
    explain: {
      key: 'explain',
      values: { v: fmt.sig(v), from: t(`u.${from}`), r: fmt.sig(result), to: t(`u.${to}`) },
    },
    steps,
    table: {
      captionKey: 'table.caption',
      columns: [
        { key: 'table.unit', format: 'text' },
        { key: 'table.value', format: 'sig' },
      ],
      rows: UNITS[q]
        .filter((u) => u.id !== from)
        .map((u) => [`u.${u.id}`, clean(convert(v, q, from, u.id))]),
    },
    warnings,
  };
};
