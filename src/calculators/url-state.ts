/**
 * Calculator state ⇄ URL query (BRIEF §6): compact, human-readable, only non-default values.
 * The canonical URL never includes these params (BRIEF §9), so shared links can't duplicate pages.
 */
import { parseISODate } from '@/engine/dates';
import { parseClock } from '@/engine/clock';
import type { CalculatorDefinition, CalculatorInput, InputValue, InputValues } from './types';

export function defaultValues(def: CalculatorDefinition, today: string): InputValues {
  const out: InputValues = {};
  for (const i of def.inputs)
    out[i.id] = i.type === 'date' && i.default === 'today' ? today : (i.default as InputValue);
  return out;
}

function encodeOne(input: CalculatorInput, v: InputValue): string | null {
  if (v === null || v === undefined) return null;
  switch (input.type) {
    case 'toggle':
      return v ? '1' : '0';
    case 'list':
      return encodeList(
        input.columns.map((c) => c.id),
        v as readonly Record<string, unknown>[],
      );
    default:
      return String(v);
  }
}

/** Lists encode as rows separated by "_" and cells by "~" (both URL-safe, rarely typed). */
function encodeList(cols: string[], rows: readonly Record<string, unknown>[]): string {
  return rows
    .map((r) => cols.map((c) => String(r[c] ?? '').replace(/[~_]/g, ' ')).join('~'))
    .join('_');
}

function decodeOne(input: CalculatorInput, raw: string): InputValue | undefined {
  switch (input.type) {
    case 'number':
    case 'currency':
    case 'percent': {
      const n = Number(raw);
      if (!Number.isFinite(n)) return undefined;
      if ('min' in input && input.min !== undefined && n < input.min) return undefined;
      if ('max' in input && input.max !== undefined && n > input.max) return undefined;
      return n;
    }
    case 'select':
    case 'segmented':
      return input.options.some((o) => o.value === raw) ? raw : undefined;
    case 'toggle':
      return raw === '1' ? true : raw === '0' ? false : undefined;
    case 'date':
      return parseISODate(raw) ? raw : undefined;
    case 'time':
      return parseClock(raw) === null ? undefined : raw;
    case 'text':
      return raw.slice(0, input.maxLength);
    case 'list': {
      const cols = input.columns.map((c) => c.id);
      const rows = raw
        .split('_')
        .slice(0, input.maxRows)
        .map((r) => Object.fromEntries(r.split('~').map((cell, i) => [cols[i], cell])));
      return rows.filter((r) => Object.keys(r).length > 0);
    }
  }
}

export function encodeState(
  def: CalculatorDefinition,
  values: InputValues,
  defaults: InputValues,
): string {
  const q = new URLSearchParams();
  for (const input of def.inputs) {
    const v = values[input.id];
    const d = defaults[input.id];
    const ev = encodeOne(input, v ?? null);
    if (ev === null || ev === encodeOne(input, d ?? null)) continue;
    q.set(input.param, ev);
  }
  return q.toString();
}

export function decodeState(def: CalculatorDefinition, search: string): Partial<InputValues> {
  const q = new URLSearchParams(search);
  const out: Partial<InputValues> = {};
  for (const input of def.inputs) {
    const raw = q.get(input.param);
    if (raw === null) continue;
    const v = decodeOne(input, raw);
    if (v !== undefined) out[input.id] = v;
  }
  return out;
}
