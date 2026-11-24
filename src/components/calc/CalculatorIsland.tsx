'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type {
  CalculatorDefinition,
  CalculatorInput,
  ComputeFn,
  ComputeResult,
  Fmt,
  InputValue,
  InputValues,
} from '@/calculators/types';
import type { CalcChrome } from '@/i18n/labels';
import type { ValidationMessages } from '@/components/ui/NumberField';
import { NumberField } from '@/components/ui/NumberField';
import { SelectField } from '@/components/ui/SelectField';
import { Segmented } from '@/components/ui/Segmented';
import { Switch } from '@/components/ui/Switch';
import { DateField } from '@/components/ui/DateField';
import { TimeField } from '@/components/ui/TimeField';
import { ListField } from '@/components/ui/ListField';
import { Callout } from '@/components/ui/Callout';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { ResultHero } from './ResultHero';
import { ResultList } from './ResultList';
import { Steps } from './Steps';
import { LineChart } from './LineChart';
import { DataTable } from './DataTable';
import { makeFmt } from '@/calculators/fmt';
import { decodeState, defaultValues, encodeState } from '@/calculators/url-state';
import { fill } from '@/lib/fill';
import { newSeed } from '@/engine/random';
import { formatOutput, outputLabel } from '@/calculators/format-output';
import { addEntry, clearEntries, readEntries, removeEntry, type HistoryEntry } from './history';
import { HistoryPanel } from './HistoryPanel';
import { ComparePanel, type CompareRow } from './ComparePanel';

export { formatOutput };

export interface IslandProps {
  locale: string;
  /** Build date (ISO) so server and first client render agree; replaced by the real date after mount. */
  today: string;
  ui: Record<string, string>;
  chrome: CalcChrome;
  validation: ValidationMessages;
  /** Build-time data from CalculatorModule.data (serialisable). */
  data?: unknown;
  /** Page path to use in shared links when the island is shown elsewhere (embeds). */
  canonicalPath?: string;
}

function currencySymbol(locale: string, currency: string): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      currencyDisplay: 'narrowSymbol',
    })
      .formatToParts(0)
      .find((p) => p.type === 'currency')!.value;
  } catch {
    return currency;
  }
}

export function CalculatorIsland({
  def,
  compute,
  locale,
  today: buildToday,
  ui,
  chrome,
  validation,
  data,
  canonicalPath,
}: IslandProps & { def: CalculatorDefinition; compute: ComputeFn }) {
  const [today, setToday] = useState(buildToday);
  const defaults = useMemo(() => defaultValues(def, today), [def, today]);
  const [values, setValues] = useState<InputValues>(() => defaultValues(def, buildToday));
  const [notice, setNotice] = useState<string | null>(null);
  const [showSteps, setShowSteps] = useState(false);
  const [heroVisible, setHeroVisible] = useState(true);
  const [recent, setRecent] = useState<HistoryEntry[]>([]);
  const [saved, setSaved] = useState<HistoryEntry[]>([]);
  const [pinned, setPinned] = useState<InputValues | null>(null);
  const sensitive = def.inputs.some((i) => i.sensitive);
  const canCompare = def.category === 'finance' || def.category === 'health';
  const hydrated = useRef(false);
  const heroRef = useRef<HTMLDivElement>(null);

  // After mount: real "today", then URL state (shared links reopen the exact result).
  useEffect(() => {
    const d = new Date();
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const fromUrl = decodeState(def, window.location.search);
    /* eslint-disable react-hooks/set-state-in-effect -- one-time sync from browser-only sources */
    setToday(iso);
    setValues((v) => {
      const next = { ...v };
      for (const i of def.inputs)
        if (i.type === 'date' && i.default === 'today' && v[i.id] === buildToday) next[i.id] = iso;
      const merged = { ...next, ...fromUrl } as InputValues;
      // Random tools: a fresh draw on each visit unless the link carries a seed.
      if (def.reroll && fromUrl[def.reroll.input] === undefined)
        merged[def.reroll.input] = newSeed();
      return merged;
    });
    setRecent(readEntries('history', def.id));
    setSaved(readEntries('saved', def.id));
    /* eslint-enable react-hooks/set-state-in-effect */
    hydrated.current = true;
  }, [def, buildToday]);

  // Keep the URL in sync (debounced, replaceState: no history spam).
  useEffect(() => {
    if (!hydrated.current) return;
    const id = window.setTimeout(() => {
      const q = encodeState(def, values, defaults);
      const url = `${window.location.pathname}${q ? `?${q}` : ''}${window.location.hash}`;
      window.history.replaceState(window.history.state, '', url);
    }, 250);
    return () => window.clearTimeout(id);
  }, [def, values, defaults]);

  // Sticky mobile result bar when the result scrolls out of view.
  useEffect(() => {
    const el = heroRef.current;
    if (!el || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(([e]) => setHeroVisible(e!.isIntersecting), {
      threshold: 0,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const currency =
    def.currency && 'input' in def.currency
      ? String(values[def.currency.input] ?? 'USD')
      : def.currency && 'fixed' in def.currency
        ? def.currency.fixed
        : 'USD';
  const fmt = useMemo(() => makeFmt(locale, currency), [locale, currency]);

  const result: ComputeResult = useMemo(() => {
    try {
      return compute(values, { today, fmt, data, t: (k, v) => fill(ui[k] ?? k, v ?? {}) });
    } catch {
      return { outputs: {}, steps: [], warnings: [{ key: 'error.generic', level: 'warn' }] };
    }
  }, [compute, values, today, fmt, data, ui]);

  // Auto-history: a settled, non-default calculation is remembered after 2 s (never for
  // calculators with personal inputs, which are only kept when the user saves them).
  const primaryOut = def.outputs.find((o) => o.primary)!;
  const primaryNow = result.outputs[primaryOut.id] ?? null;
  const primaryText =
    primaryNow === null
      ? null
      : formatOutput(
          fmt,
          primaryOut.formatBy
            ? (primaryOut.formatBy.map[String(values[primaryOut.formatBy.input])] ??
                primaryOut.format)
            : primaryOut.format,
          primaryNow,
          ui,
          primaryOut.decimals,
        );
  useEffect(() => {
    if (!hydrated.current || sensitive || primaryText === null) return;
    const q = encodeState(def, values, defaults);
    if (!q) return;
    const id = window.setTimeout(
      () => setRecent(addEntry('history', def.id, { q, label: primaryText, at: Date.now() })),
      2000,
    );
    return () => window.clearTimeout(id);
  }, [def, values, defaults, sensitive, primaryText]);

  const openEntry = (q: string) =>
    setValues({ ...defaults, ...decodeState(def, `?${q}`) } as InputValues);

  const set = (id: string, v: InputValue) =>
    setValues((prev) => {
      const next: InputValues = { ...prev, [id]: v };
      // Keep dependent selects valid (e.g. units when the quantity changes).
      for (const i of def.inputs) {
        if (
          (i.type !== 'select' && i.type !== 'segmented') ||
          !i.optionsBy ||
          i.optionsBy.input !== id
        )
          continue;
        const allowed = i.optionsBy.map[String(v)] ?? [];
        if (!allowed.includes(String(next[i.id])))
          next[i.id] = i.optionsBy.fallback?.[String(v)] ?? allowed[0] ?? i.default;
      }
      return next;
    });
  const optionsOf = (i: Extract<CalculatorInput, { type: 'select' | 'segmented' }>) => {
    const allowed = i.optionsBy ? i.optionsBy.map[String(values[i.optionsBy.input])] : undefined;
    return (allowed ? i.options.filter((o) => allowed.includes(o.value)) : i.options).map((o) => ({
      value: o.value,
      label: ui[o.labelKey] ?? o.value,
    }));
  };
  const visible = (i: CalculatorInput) =>
    !i.showIf || i.showIf.in.includes(values[i.showIf.input] as string | boolean);
  const label = (i: CalculatorInput) =>
    (i.labelBy ? ui[`${i.labelKey}.${String(values[i.labelBy])}`] : undefined) ??
    ui[i.labelKey] ??
    i.labelKey;

  const primary = def.outputs.find((o) => o.primary)!;
  const secondary = def.outputs.filter(
    (o) => !o.primary && result.outputs[o.id] !== undefined && result.outputs[o.id] !== null,
  );
  const primaryValue = result.outputs[primary.id] ?? null;
  const primaryIsNumber = typeof primaryValue === 'number';
  const out = (id: string, v: number | string | null) => {
    const o = def.outputs.find((x) => x.id === id)!;
    const format = o.formatBy
      ? (o.formatBy.map[String(values[o.formatBy.input])] ?? o.format)
      : o.format;
    return formatOutput(fmt, format, v, ui, o.decimals);
  };

  const pinnedResult = useMemo(() => {
    if (!pinned) return null;
    try {
      return compute(pinned, { today, fmt, data, t: (k, v) => fill(ui[k] ?? k, v ?? {}) });
    } catch {
      return null;
    }
  }, [compute, pinned, today, fmt, data, ui]);
  const compareRows: CompareRow[] = pinnedResult
    ? def.outputs
        .filter(
          (o) =>
            (pinnedResult.outputs[o.id] ?? null) !== null ||
            (result.outputs[o.id] ?? null) !== null,
        )
        .map((o) => {
          const a = pinnedResult.outputs[o.id] ?? null;
          const b = result.outputs[o.id] ?? null;
          const d = typeof a === 'number' && typeof b === 'number' ? b - a : null;
          const diff =
            d === null || o.format === 'text'
              ? null
              : `${d > 0 ? '+' : d < 0 ? '−' : ''}${out(o.id, Math.abs(d))}`;
          return { label: outputLabel(o, values, ui), a: out(o.id, a), b: out(o.id, b), diff };
        })
    : [];

  function flash(msg: string) {
    setNotice(msg);
    window.setTimeout(() => setNotice(null), 2500);
  }

  async function copy(text: string, msg: string) {
    try {
      await navigator.clipboard.writeText(text);
      flash(msg);
    } catch {
      /* clipboard blocked: the URL is still in the address bar */
    }
  }

  function currentUrl() {
    const q = encodeState(def, values, defaults);
    return `${window.location.origin}${canonicalPath ?? window.location.pathname}${q ? `?${q}` : ''}`;
  }

  function resultText() {
    const lines = [`${outputLabel(primary, values, ui)}: ${out(primary.id, primaryValue)}`];
    for (const o of secondary)
      lines.push(`${outputLabel(o, values, ui)}: ${out(o.id, result.outputs[o.id] ?? null)}`);
    lines.push(currentUrl());
    return lines.join('\n');
  }

  function downloadCsv() {
    if (!result.csv) return;
    const esc = (c: string | number) =>
      typeof c === 'number' ? String(c) : `"${c.replace(/"/g, '""')}"`;
    const body = [
      result.csv.columns.map((c) => esc(ui[c] ?? c)),
      ...result.csv.rows.map((r) => r.map(esc)),
    ]
      .map((r) => r.join(','))
      .join('\n');
    const url = URL.createObjectURL(new Blob([body], { type: 'text/csv;charset=utf-8' }));
    const a = Object.assign(document.createElement('a'), {
      href: url,
      download: result.csv.filename,
    });
    a.click();
    URL.revokeObjectURL(url);
  }

  const renderInput = (i: CalculatorInput) => {
    if (!visible(i) || i.hidden) return null;
    const v = values[i.id];
    const help = i.helpKey ? ui[i.helpKey] : undefined;
    switch (i.type) {
      case 'number':
      case 'currency':
      case 'percent':
        return (
          <NumberField
            key={i.id}
            name={i.param}
            label={label(i)}
            value={typeof v === 'number' ? v : null}
            onChange={(n) => set(i.id, n)}
            prefix={
              i.type === 'currency'
                ? currencySymbol(fmt.locale, currency)
                : i.prefixKey
                  ? ui[i.prefixKey]
                  : undefined
            }
            suffix={i.type === 'percent' ? '%' : i.suffixKey ? ui[i.suffixKey] : undefined}
            help={help}
            min={i.min}
            max={i.max}
            integer={i.integer}
            allowNegative={i.allowNegative}
            formatLocale={
              i.type === 'currency'
                ? currency === 'INR' && locale === 'en'
                  ? 'en-IN'
                  : locale
                : locale
            }
            messages={validation}
          />
        );
      case 'select': {
        const field = (
          <SelectField
            key={i.id}
            label={label(i)}
            value={String(v)}
            onChange={(e) => set(i.id, e.target.value)}
            options={optionsOf(i)}
            help={help}
          />
        );
        if (!i.swapWith) return field;
        const other = i.swapWith;
        return (
          <div key={i.id} className="space-y-2">
            {field}
            <button
              type="button"
              data-field
              onClick={() =>
                setValues((p) => ({ ...p, [i.id]: p[other] ?? null, [other]: p[i.id] ?? null }))
              }
              className="inline-flex h-11 items-center gap-2 rounded-sm px-2 text-sm font-medium text-brand hover:bg-brand-wash"
            >
              <Icon name="swap" size={18} className="rotate-90" /> {chrome.swap}
            </button>
          </div>
        );
      }
      case 'segmented':
        return (
          <Segmented
            key={i.id}
            label={label(i)}
            value={String(v)}
            onChange={(nv) => set(i.id, nv)}
            options={optionsOf(i)}
          />
        );
      case 'toggle':
        return (
          <Switch
            key={i.id}
            label={label(i)}
            checked={Boolean(v)}
            onChange={(b) => set(i.id, b)}
            help={help}
          />
        );
      case 'date':
        return (
          <DateField
            key={i.id}
            label={label(i)}
            value={String(v)}
            onChange={(d) => set(i.id, d)}
            min={i.min}
            max={i.max}
            help={help}
          />
        );
      case 'time':
        return (
          <TimeField
            key={i.id}
            label={label(i)}
            value={String(v ?? '')}
            onChange={(t) => set(i.id, t)}
            help={help}
          />
        );
      case 'text': {
        const cls =
          'w-full rounded-sm border border-line-strong bg-surface px-3 py-2.5 text-base hover:border-text/60 focus:border-brand focus:shadow-[0_0_0_3px_var(--tok-brand-wash)] focus:outline-none';
        const helpId = help ? `${i.id}-help` : undefined;
        return (
          <div key={i.id} className="flex flex-col gap-1.5">
            <label htmlFor={`f-${i.id}`} className="text-sm font-medium">
              {label(i)}
            </label>
            {i.multiline ? (
              <textarea
                id={`f-${i.id}`}
                value={String(v ?? '')}
                maxLength={i.maxLength}
                rows={4}
                spellCheck={false}
                aria-describedby={helpId}
                onChange={(e) => set(i.id, e.target.value)}
                className={`num font-mono ${cls}`}
              />
            ) : (
              <input
                id={`f-${i.id}`}
                value={String(v ?? '')}
                maxLength={i.maxLength}
                aria-describedby={helpId}
                onChange={(e) => set(i.id, e.target.value)}
                className={`h-12 ${cls}`}
              />
            )}
            {help && (
              <p id={helpId} className="text-sm text-subtle">
                {help}
              </p>
            )}
          </div>
        );
      }
      case 'list':
        return (
          <ListField
            key={i.id}
            label={label(i)}
            rows={Array.isArray(v) ? (v as readonly Record<string, unknown>[]) : []}
            onChange={(rows) => set(i.id, rows)}
            maxRows={i.maxRows}
            formatLocale={locale}
            newRow={Object.fromEntries(i.columns.map((c) => [c.id, c.default]))}
            columns={i.columns.map((c) => ({
              id: c.id,
              label: ui[c.labelKey] ?? c.id,
              kind:
                c.type === 'select' || c.type === 'segmented'
                  ? 'select'
                  : c.type === 'time'
                    ? 'time'
                    : 'number',
              options:
                'options' in c
                  ? c.options.map((o) => ({ value: o.value, label: ui[o.labelKey] ?? o.value }))
                  : undefined,
              // Short-option selects (grades) stay narrow; wordier ones get the extra room.
              width:
                c.type === 'time'
                  ? 4
                  : 'options' in c && c.options.some((o) => (ui[o.labelKey] ?? o.value).length > 3)
                    ? 3
                    : 2,
            }))}
            rowLabel={(n) => fill(ui[`${i.labelKey}.row`] ?? '{n}', { n })}
            addLabel={ui[`${i.labelKey}.add`] ?? '+'}
            removeLabel={(n) => fill(ui[`${i.labelKey}.remove`] ?? '{n}', { n })}
          />
        );
      default:
        return null;
    }
  };

  const main = def.inputs.filter((i) => !i.advanced);
  const advanced = def.inputs.filter((i) => i.advanced);
  const ymyl = def.ymyl;

  return (
    <>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-10">
        <form
          aria-label={chrome.inputs}
          onSubmit={(e) => e.preventDefault()}
          className="no-print-controls space-y-5"
        >
          {groupRows(main).map((g) =>
            g.row ? (
              <fieldset key={g.row.id} className="min-w-0">
                <legend className="mb-2 text-sm font-semibold">
                  {ui[g.row.legendKey] ?? g.row.id}
                </legend>
                <div
                  className="grid items-end gap-3"
                  style={{ gridTemplateColumns: `repeat(${g.items.length}, minmax(0, 1fr))` }}
                >
                  {g.items.map(renderInput)}
                </div>
              </fieldset>
            ) : (
              renderInput(g.items[0]!)
            ),
          )}
          {advanced.some(visible) && (
            <details
              className="group rounded-sm border border-line bg-surface"
              open={advanced.some((i) => values[i.id] !== defaults[i.id])}
            >
              <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-medium">
                {ui['group.more'] ?? chrome.moreOptions}
                <Icon
                  name="chevronDown"
                  size={18}
                  className="text-subtle transition-transform group-open:rotate-180"
                />
              </summary>
              <div className="space-y-5 border-t border-line p-4">{advanced.map(renderInput)}</div>
            </details>
          )}
          {def.reroll && (
            <Button
              variant="primary"
              onClick={() => set(def.reroll!.input, newSeed())}
              className="w-full sm:w-auto"
            >
              {ui[def.reroll.labelKey] ?? def.reroll.labelKey}
            </Button>
          )}
          <p className="flex gap-2 text-xs text-subtle">
            <Icon name="lock" size={14} className="mt-0.5 shrink-0" />
            {chrome.onDevice}
          </p>
        </form>

        <section aria-label={chrome.result} className="min-w-0">
          <div className="rounded-md border border-line bg-grid bg-surface p-5 sm:p-6">
            <div ref={heroRef}>
              {primaryIsNumber || primaryValue === null ? (
                <ResultHero
                  label={outputLabel(primary, values, ui)}
                  value={primaryIsNumber ? (primaryValue as number) : null}
                  format={(n) => out(primary.id, n)}
                />
              ) : (
                <div>
                  <p className="text-sm font-medium text-muted">
                    {outputLabel(primary, values, ui)}
                  </p>
                  <p
                    className="num mt-1 text-result font-semibold tracking-tight"
                    aria-live="polite"
                  >
                    {out(primary.id, primaryValue)}
                  </p>
                </div>
              )}
              {result.explain && primaryValue !== null && (
                <p className="mt-3 max-w-prose text-[15px] text-muted">
                  {fill(ui[result.explain.key] ?? '', result.explain.values)}
                </p>
              )}
            </div>
            {secondary.length > 0 && (
              <div className="mt-5">
                <ResultList
                  items={secondary.map((o) => ({
                    label: outputLabel(o, values, ui),
                    value: out(o.id, result.outputs[o.id] ?? null),
                  }))}
                />
              </div>
            )}
            {(result.warnings.length > 0 || primaryValue === null) && (
              <div className="mt-5 space-y-2">
                {primaryValue === null && result.warnings.length === 0 && (
                  <Callout tone="warn">{chrome.cannotCompute}</Callout>
                )}
                {result.warnings.map((w) => (
                  <Callout key={w.key} tone={w.level === 'warn' ? 'warn' : 'info'}>
                    {fill(ui[w.key] ?? w.key, w.values ?? {})}
                  </Callout>
                ))}
              </div>
            )}
            {ymyl && <p className="mt-4 text-xs text-subtle">{chrome.ymylDisclaimer}</p>}

            <div className="no-print mt-5 flex flex-wrap gap-2 border-t border-line pt-4">
              <Button
                size="sm"
                variant="primary"
                onClick={() => copy(currentUrl(), chrome.linkCopied)}
              >
                <Icon name="link" size={16} /> {chrome.copyLink}
              </Button>
              <Button size="sm" onClick={() => copy(resultText(), chrome.resultCopied)}>
                <Icon name="copy" size={16} /> {chrome.copyResult}
              </Button>
              <Button
                size="sm"
                disabled={primaryText === null}
                onClick={() => {
                  setSaved(
                    addEntry('saved', def.id, {
                      q: encodeState(def, values, defaults),
                      label: primaryText ?? '',
                      at: Date.now(),
                    }),
                  );
                  flash(chrome.savedDone);
                }}
              >
                <Icon name="star" size={16} /> {chrome.save}
              </Button>
              {canCompare && !pinned && (
                <Button size="sm" disabled={primaryText === null} onClick={() => setPinned(values)}>
                  <Icon name="compare" size={16} /> {chrome.compare}
                </Button>
              )}
              <Button size="sm" onClick={() => window.print()}>
                <Icon name="print" size={16} /> {chrome.print}
              </Button>
              {result.csv && (
                <Button size="sm" onClick={downloadCsv}>
                  <Icon name="download" size={16} /> {chrome.downloadCsv}
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={() => setValues(defaults)}>
                <Icon name="reset" size={16} /> {chrome.reset}
              </Button>
            </div>
            <p role="status" aria-live="polite" className="min-h-5 pt-2 text-sm text-success">
              {notice}
            </p>

            {pinned && compareRows.length > 0 && (
              <ComparePanel rows={compareRows} chrome={chrome} onClear={() => setPinned(null)} />
            )}

            <HistoryPanel
              recent={recent}
              saved={saved}
              chrome={chrome}
              sensitive={sensitive}
              onOpen={openEntry}
              onRemoveSaved={(q) => setSaved(removeEntry('saved', def.id, q))}
              onClearRecent={() => {
                clearEntries('history', def.id);
                setRecent([]);
              }}
            />

            {result.steps.length > 0 && (
              <div className="mt-3 border-t border-line pt-4">
                <button
                  type="button"
                  aria-expanded={showSteps}
                  onClick={() => setShowSteps((s) => !s)}
                  className="inline-flex items-center gap-2 text-sm font-medium text-brand hover:underline"
                >
                  <Icon name="steps" size={16} /> {chrome.showSteps}
                  <Icon name="chevronDown" size={16} className={showSteps ? 'rotate-180' : ''} />
                </button>
                <div hidden={!showSteps} className="mt-4 print:block">
                  <h3 className="sr-only">{chrome.stepsHeading}</h3>
                  <Steps
                    steps={result.steps.map((s) => ({
                      text: fill(ui[s.key] ?? s.key, s.values ?? {}),
                      math: s.math,
                    }))}
                  />
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      {(result.chart || result.table) && primaryValue !== null && (
        <div className="mt-10 grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-2">
          {result.chart && (
            <section aria-label={chrome.chartHeading}>
              <LineChart
                series={result.chart.series.map((s) => ({
                  label: ui[s.key] ?? s.key,
                  points: s.points,
                  tone: s.tone,
                }))}
                xLabel={ui[result.chart.xKey] ?? ''}
                formatY={(n) =>
                  result.chart!.yFormat === 'money' ? compactMoney(fmt, n) : fmt.num(n, 0)
                }
              />
              <p className="mt-3 text-sm text-muted">
                {fill(ui[result.chart.summaryKey] ?? '', result.chart.summaryValues)}
              </p>
            </section>
          )}
          {result.table && (
            <section aria-label={chrome.tableHeading} className="min-w-0">
              <DataTable
                caption={ui[result.table.captionKey] ?? ''}
                columns={result.table.columns.map((c) => ui[c.key] ?? c.key)}
                rows={result.table.rows.map((r) =>
                  r.map((cell, i) => formatCell(fmt, result.table!.columns[i]!.format, cell, ui)),
                )}
              />
            </section>
          )}
        </div>
      )}

      {/* Sticky result bar on small screens while the inputs are being edited (BRIEF §6). */}
      {!heroVisible && primaryValue !== null && (
        <div className="no-print fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface/95 px-4 py-2.5 shadow-[0_-4px_16px_rgb(0_0_0/0.06)] backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() => heroRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
            className="flex w-full items-center justify-between gap-3 text-start"
          >
            {/* Name built from visible text plus a hidden prefix, so it always contains the label (WCAG 2.5.3). */}
            <span className="truncate text-sm text-muted">
              <span className="sr-only">{chrome.backToResult}: </span>
              {outputLabel(primary, values, ui)}
            </span>
            <span className="num text-lg font-semibold">{out(primary.id, primaryValue)}</span>
          </button>
        </div>
      )}
    </>
  );
}

function formatCell(
  fmt: Fmt,
  format: string,
  cell: string | number,
  ui: Record<string, string>,
): string {
  if (typeof cell === 'string')
    return format === 'date' ? fmt.date(cell, 'month') : (ui[cell] ?? cell);
  switch (format) {
    case 'money':
      return fmt.money(cell);
    case 'percent':
      return fmt.pct(cell);
    case 'integer':
      return fmt.int(cell);
    case 'sig':
      return fmt.sig(cell);
    default:
      return fmt.num(cell);
  }
}

function compactMoney(fmt: Fmt, n: number): string {
  try {
    return new Intl.NumberFormat(
      fmt.locale === 'en' && fmt.currency === 'INR' ? 'en-IN' : fmt.locale,
      {
        style: 'currency',
        currency: fmt.currency,
        notation: 'compact',
        maximumFractionDigits: 1,
      },
    ).format(n);
  } catch {
    return fmt.num(n, 0);
  }
}

/** Groups consecutive inputs that share a `row` so they render side by side. */
function groupRows(
  inputs: readonly CalculatorInput[],
): { row?: CalculatorInput['row']; items: CalculatorInput[] }[] {
  const out: { row?: CalculatorInput['row']; items: CalculatorInput[] }[] = [];
  for (const i of inputs) {
    const last = out[out.length - 1];
    if (i.row && last?.row?.id === i.row.id) last.items.push(i);
    else out.push({ row: i.row, items: [i] });
  }
  return out;
}
