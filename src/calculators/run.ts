import 'server-only';
import { getModule } from './registry';
import { makeFmt } from './fmt';
import { defaultValues, encodeState } from './url-state';
import { calculatorPath } from './paths';
import { formatOutput, outputLabel } from './format-output';
import { buildToday } from '@/lib/build-date';
import { fill } from '@/lib/fill';
import type { InputValues } from './types';

/**
 * Runs a calculator at build time exactly as its page does (same defaults, currency, strings),
 * for homepage samples and other server-rendered results. Returns null if the calculator is not
 * published in this locale.
 */
export async function runCalculator(
  id: string,
  locale: string,
  inputs: Record<string, unknown>,
  opts: { digits?: number } = {},
) {
  const mod = getModule(id);
  if (!mod || !mod.definition.locales.includes(locale)) return null;
  const def = mod.definition;
  const [content, data] = await Promise.all([mod.content[locale]!(), mod.data?.()]);
  const today = buildToday();
  const defaults = defaultValues(def, today);
  const values = { ...defaults, ...inputs } as InputValues;
  const currency =
    def.currency && 'input' in def.currency
      ? String(values[def.currency.input])
      : def.currency && 'fixed' in def.currency
        ? def.currency.fixed
        : 'USD';
  const fmt = makeFmt(locale, currency);
  const r = mod.compute(values, {
    today,
    fmt,
    data,
    t: (k, v) => fill(content.ui[k] ?? k, v ?? {}),
  });
  const primary = def.outputs.find((o) => o.primary)!;
  const raw = r.outputs[primary.id] ?? null;
  const value =
    typeof raw === 'number' && primary.format === 'sig' && opts.digits
      ? fmt.sig(raw, opts.digits)
      : formatOutput(fmt, primary.format, raw, content.ui, primary.decimals);
  const q = encodeState(def, values, defaults);
  return {
    name: content.name,
    label: outputLabel(primary, values, content.ui),
    value,
    href: `${calculatorPath(def, locale)}${q ? `?${q}` : ''}`,
  };
}
