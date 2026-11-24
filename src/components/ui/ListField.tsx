'use client';

import { useId, useState } from 'react';
import { parseLocaleNumber } from '@/engine/parse';
import { formatNumber } from '@/engine/format';
import { Icon } from './Icon';

export interface ListColumn {
  id: string;
  label: string;
  kind: 'number' | 'select' | 'time';
  options?: readonly { value: string; label: string }[];
  /** Relative column width (CSS grid fr). */
  width?: number;
}

type Row = Record<string, unknown>;

/**
 * Editable rows of small fields (e.g. GPA courses). Native inputs only; every cell carries an
 * accessible name ("Credits, row 3") because the visible column header is shared.
 */
export function ListField({
  label,
  columns,
  rows,
  onChange,
  newRow,
  maxRows,
  formatLocale,
  rowLabel,
  addLabel,
  removeLabel,
}: {
  label: string;
  columns: readonly ListColumn[];
  rows: readonly Row[];
  onChange: (rows: Row[]) => void;
  newRow: Row;
  maxRows: number;
  formatLocale: string;
  /** "Course {n}" */
  rowLabel: (n: number) => string;
  addLabel: string;
  removeLabel: (n: number) => string;
}) {
  const id = useId();
  const template = `${columns.map((c) => `minmax(0,${c.width ?? 1}fr)`).join(' ')} 2.75rem`;
  const update = (i: number, col: string, v: unknown) =>
    onChange(rows.map((r, k) => (k === i ? { ...r, [col]: v } : r)));
  const cell =
    'h-11 w-full min-w-0 rounded-sm border border-line-strong bg-surface px-2.5 text-base hover:border-text/60 focus:border-brand focus:shadow-[0_0_0_3px_var(--tok-brand-wash)] focus:outline-none';

  return (
    <fieldset className="min-w-0">
      <legend className="text-sm font-medium">{label}</legend>
      <div className="mt-2 grid gap-2" style={{ gridTemplateColumns: template }} aria-hidden="true">
        {columns.map((c) => (
          <span key={c.id} className="text-xs font-medium text-subtle">
            {c.label}
          </span>
        ))}
      </div>
      <ol className="mt-1.5 space-y-2">
        {rows.map((r, i) => (
          <li key={i} className="grid items-center gap-2" style={{ gridTemplateColumns: template }}>
            {columns.map((c) => {
              const name = `${c.label}, ${rowLabel(i + 1)}`;
              if (c.kind === 'select')
                return (
                  <select
                    key={c.id}
                    aria-label={name}
                    value={String(r[c.id] ?? '')}
                    onChange={(e) => update(i, c.id, e.target.value)}
                    className={cell}
                  >
                    {c.options!.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                );
              if (c.kind === 'time')
                return (
                  <input
                    key={c.id}
                    type="time"
                    aria-label={name}
                    value={String(r[c.id] ?? '')}
                    onChange={(e) => update(i, c.id, e.target.value)}
                    className={`num time-cell ${cell} px-1.5 text-[15px]`}
                  />
                );
              const v = r[c.id];
              return (
                <CellNumber
                  key={c.id}
                  label={name}
                  value={typeof v === 'number' ? v : null}
                  onChange={(n) => update(i, c.id, n)}
                  locale={formatLocale}
                  className={`num ${cell}`}
                />
              );
            })}
            <button
              type="button"
              onClick={() => onChange(rows.filter((_, k) => k !== i))}
              disabled={rows.length <= 1}
              className="flex size-11 items-center justify-center rounded-sm text-subtle hover:bg-sunken hover:text-danger disabled:opacity-40"
              aria-label={removeLabel(i + 1)}
            >
              <Icon name="trash" size={18} />
            </button>
          </li>
        ))}
      </ol>
      {rows.length < maxRows && (
        <button
          type="button"
          id={`${id}-add`}
          onClick={() => onChange([...rows, { ...newRow }])}
          className="mt-3 inline-flex h-11 items-center gap-2 rounded-sm border border-dashed border-line-strong px-4 text-sm font-medium text-brand hover:border-brand"
        >
          <Icon name="plus" size={16} /> {addLabel}
        </button>
      )}
    </fieldset>
  );
}

function CellNumber({
  label,
  value,
  onChange,
  locale,
  className,
}: {
  label: string;
  value: number | null;
  onChange: (v: number | null) => void;
  locale: string;
  className: string;
}) {
  const show = (v: number | null) =>
    v === null ? '' : formatNumber(v, locale, { maxDecimals: 2 });
  const [text, setText] = useState(() => show(value));
  const [last, setLast] = useState(value);
  // Resync when the row's value changes from outside (row removed above, reset, URL state).
  if (value !== last) {
    setLast(value);
    const p = parseLocaleNumber(text, locale);
    if (!(p.ok && p.value === value)) setText(show(value));
  }
  const p = parseLocaleNumber(text, locale);
  return (
    <input
      aria-label={label}
      type="text"
      inputMode="decimal"
      autoComplete="off"
      value={text}
      aria-invalid={text !== '' && !p.ok ? true : undefined}
      onChange={(e) => {
        setText(e.target.value);
        const r = parseLocaleNumber(e.target.value, locale);
        const n = r.ok ? r.value : null;
        setLast(n);
        onChange(n);
      }}
      className={className}
    />
  );
}
