'use client';

import { useId, useState } from 'react';
import { fill } from '@/lib/fill';
import { parseLocaleNumber } from '@/engine/parse';
import { formatNumber } from '@/engine/format';

export interface NumberFieldProps {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  /** Shown inside the field, e.g. "$" (prefix) or "%" / "years" (suffix). */
  prefix?: string;
  suffix?: string;
  help?: string;
  min?: number;
  max?: number;
  integer?: boolean;
  allowNegative?: boolean;
  /** Decimals kept when re-formatting on blur. */
  maxDecimals?: number;
  /** Formatting locale (may be region-specific, e.g. en-IN). */
  formatLocale: string;
  /** Raw validation templates from the server (messages.validation). */
  messages: ValidationMessages;
  name?: string;
}

export interface ValidationMessages {
  invalid: string;
  empty: string;
  min: string;
  max: string;
  integer: string;
  negative: string;
}

/**
 * Forgiving numeric input (BRIEF §6): accepts "1,000", "1 000", "$10", "10%".
 * Never blocks typing; validates inline and explains, wired with aria-describedby/aria-invalid.
 * Uses type="text" + inputmode="decimal" so locale separators are allowed and mobile shows a numeric keypad.
 */
export function NumberField({
  label,
  value,
  onChange,
  prefix,
  suffix,
  help,
  min,
  max,
  integer,
  allowNegative,
  maxDecimals = 6,
  formatLocale,
  messages,
  name,
}: NumberFieldProps) {
  const fmtLocale = formatLocale;
  const t = (k: keyof ValidationMessages, v: Record<string, string> = {}) => fill(messages[k], v);
  const id = useId();
  const show = (v: number | null) =>
    v === null ? '' : formatNumber(v, fmtLocale, { maxDecimals }).replace('−', '-');
  const [text, setText] = useState(() => show(value));
  const [error, setError] = useState<string | null>(null);
  const [lastValue, setLastValue] = useState(value);

  // Sync when the value is changed from outside (reset, URL state, example links).
  if (value !== lastValue) {
    setLastValue(value);
    const parsed = parseLocaleNumber(text, fmtLocale);
    if (!(parsed.ok && parsed.value === value)) setText(show(value));
  }

  function validate(raw: string): { v: number | null; err: string | null } {
    const r = parseLocaleNumber(raw, fmtLocale);
    if (!r.ok) return { v: null, err: r.reason === 'empty' ? t('empty') : t('invalid') };
    if (!allowNegative && r.value < 0) return { v: null, err: t('negative') };
    if (integer && !Number.isInteger(r.value)) return { v: null, err: t('integer') };
    if (min !== undefined && r.value < min)
      return { v: null, err: t('min', { min: formatNumber(min, fmtLocale) }) };
    if (max !== undefined && r.value > max)
      return { v: null, err: t('max', { max: formatNumber(max, fmtLocale) }) };
    return { v: r.value, err: null };
  }

  const helpId = help ? `${id}-help` : undefined;
  const errId = error ? `${id}-err` : undefined;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-text text-sm font-medium">
        {label}
      </label>
      <div
        className={`group bg-surface focus-within:border-brand flex h-12 items-stretch rounded-sm border transition-colors focus-within:shadow-[0_0_0_3px_var(--tok-brand-wash)] ${
          error ? 'border-danger' : 'border-line-strong hover:border-text/60'
        }`}
      >
        {prefix && (
          <span
            className="text-subtle flex items-center ps-3 font-mono text-sm select-none"
            aria-hidden="true"
          >
            {prefix}
          </span>
        )}
        <input
          id={id}
          name={name}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          spellCheck={false}
          value={text}
          aria-invalid={error ? true : undefined}
          aria-describedby={[errId, helpId].filter(Boolean).join(' ') || undefined}
          onChange={(e) => {
            const raw = e.target.value;
            setText(raw);
            const { v, err } = validate(raw);
            setError(err);
            if (v !== null) {
              setLastValue(v);
              onChange(v);
            }
          }}
          onBlur={() => {
            const { v } = validate(text);
            if (v !== null) setText(show(v));
          }}
          onKeyDown={(e) => {
            // Enter moves to the next field (BRIEF §6 keyboard-first).
            if (e.key === 'Enter') {
              e.preventDefault();
              const form = e.currentTarget.form;
              const fields = form
                ? Array.from(
                    form.querySelectorAll<HTMLElement>('input, select, button[data-field]'),
                  )
                : [];
              fields[fields.indexOf(e.currentTarget) + 1]?.focus();
            }
          }}
          className="num min-w-0 flex-1 bg-transparent px-3 text-lg outline-none"
        />
        {suffix && (
          <span
            className="text-subtle flex items-center pe-3 font-mono text-sm select-none"
            aria-hidden="true"
          >
            {suffix}
          </span>
        )}
      </div>
      {error && (
        <p id={errId} className="text-danger text-sm">
          {error}
        </p>
      )}
      {help && (
        <p id={helpId} className="text-subtle text-sm">
          {help}
        </p>
      )}
    </div>
  );
}
