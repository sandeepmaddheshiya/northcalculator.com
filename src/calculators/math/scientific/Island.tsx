'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { IslandProps } from '@/components/calc/CalculatorIsland';
import { Icon } from '@/components/ui/Icon';
import { Segmented } from '@/components/ui/Segmented';
import { makeFmt } from '@/calculators/fmt';
import { decodeState, defaultValues, encodeState } from '@/calculators/url-state';
import { fill } from '@/lib/fill';
import { definition } from './definition';
import { compute } from './compute';

type Key = {
  label: string;
  insert?: string;
  action?: 'clear' | 'back' | 'equals';
  aria?: string;
  tone?: 'fn' | 'num' | 'op' | 'eq';
};

const FN: Key[] = [
  { label: 'sin', insert: 'sin(' },
  { label: 'cos', insert: 'cos(' },
  { label: 'tan', insert: 'tan(' },
  { label: 'ln', insert: 'ln(' },
  { label: 'log', insert: 'log(', aria: 'log base 10' },
  { label: '√', insert: '√(', aria: 'square root' },
  { label: 'sin⁻¹', insert: 'asin(', aria: 'arcsine' },
  { label: 'cos⁻¹', insert: 'acos(', aria: 'arccosine' },
  { label: 'tan⁻¹', insert: 'atan(', aria: 'arctangent' },
  { label: 'x²', insert: '^2', aria: 'squared' },
  { label: 'xʸ', insert: '^', aria: 'power' },
  { label: 'n!', insert: '!', aria: 'factorial' },
  { label: '(', insert: '(' },
  { label: ')', insert: ')' },
  { label: 'π', insert: 'π', aria: 'pi' },
  { label: 'e', insert: 'e', aria: 'Euler’s number' },
  { label: 'Ans', insert: 'Ans', aria: 'previous answer' },
  { label: 'EXP', insert: 'E', aria: 'times ten to the power' },
].map((k) => ({ ...k, tone: 'fn' as const }));

const PAD: Key[] = [
  { label: '7', insert: '7', tone: 'num' },
  { label: '8', insert: '8', tone: 'num' },
  { label: '9', insert: '9', tone: 'num' },
  { label: '÷', insert: '÷', aria: 'divide', tone: 'op' },
  { label: '4', insert: '4', tone: 'num' },
  { label: '5', insert: '5', tone: 'num' },
  { label: '6', insert: '6', tone: 'num' },
  { label: '×', insert: '×', aria: 'multiply', tone: 'op' },
  { label: '1', insert: '1', tone: 'num' },
  { label: '2', insert: '2', tone: 'num' },
  { label: '3', insert: '3', tone: 'num' },
  { label: '−', insert: '−', aria: 'minus', tone: 'op' },
  { label: '0', insert: '0', tone: 'num' },
  { label: '.', insert: '.', aria: 'decimal point', tone: 'num' },
  { label: '%', insert: '%', aria: 'percent', tone: 'op' },
  { label: '+', insert: '+', aria: 'plus', tone: 'op' },
  { label: 'AC', action: 'clear', aria: 'clear all', tone: 'op' },
  { label: '⌫', action: 'back', aria: 'delete', tone: 'op' },
  { label: '=', action: 'equals', aria: 'equals', tone: 'eq' },
];

/**
 * Accessible name. WCAG 2.5.3 (label in name): it must contain the visible text, so word-like
 * labels get the spoken description appended, e.g. "sin⁻¹ (arcsine)". Pure symbols (×, ÷, =)
 * and the icon-only delete key use the description alone.
 */
function nameOf(k: Key): string | undefined {
  if (!k.aria) return undefined;
  if (k.action === 'back' || /^[^\p{L}\p{N}]+$/u.test(k.label)) return k.aria;
  return `${k.label} (${k.aria})`;
}

const TONE = {
  fn: 'h-11 text-sm bg-surface hover:bg-sunken border border-line',
  num: 'h-14 text-xl bg-surface hover:bg-sunken border border-line font-medium',
  op: 'h-14 text-xl bg-sunken hover:bg-line/60 border border-line text-brand',
  eq: 'h-14 text-xl bg-brand text-on-brand hover:bg-brand-hover col-span-2 font-semibold',
} as const;

export default function Island({ locale, today, ui, chrome }: IslandProps) {
  const defaults = useMemo(() => defaultValues(definition, today), [today]);
  const [expr, setExpr] = useState(String(defaults.expr));
  const [angle, setAngle] = useState<'deg' | 'rad'>('deg');
  const [ans, setAns] = useState(0);
  const [tape, setTape] = useState<{ expr: string; result: string }[]>([]);
  const [showError, setShowError] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const hydrated = useRef(false);
  const fmt = useMemo(() => makeFmt(locale), [locale]);
  const t = (k: string, v?: Record<string, string | number>) => fill(ui[k] ?? k, v ?? {});

  useEffect(() => {
    const s = decodeState(definition, window.location.search);
    /* eslint-disable react-hooks/set-state-in-effect -- one-time sync from the URL */
    if (typeof s.expr === 'string') setExpr(s.expr);
    if (s.angle === 'rad' || s.angle === 'deg') setAngle(s.angle);
    /* eslint-enable react-hooks/set-state-in-effect */
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    const id = window.setTimeout(() => {
      const q = encodeState(definition, { expr, angle }, defaults);
      window.history.replaceState(
        window.history.state,
        '',
        `${window.location.pathname}${q ? `?${q}` : ''}`,
      );
    }, 300);
    return () => window.clearTimeout(id);
  }, [expr, angle, defaults]);

  const r = compute({ expr, angle, ans }, { today, fmt });
  const value = r.outputs.result as number | null;
  const error = r.warnings[0];

  function insert(s: string) {
    const el = input.current;
    const start = el?.selectionStart ?? expr.length;
    const end = el?.selectionEnd ?? expr.length;
    const next = expr.slice(0, start) + s + expr.slice(end);
    setExpr(next);
    setShowError(false);
    requestAnimationFrame(() => {
      el?.focus({ preventScroll: true });
      el?.setSelectionRange(start + s.length, start + s.length);
    });
  }

  function equals() {
    if (value === null) {
      setShowError(true);
      return;
    }
    setTape((tp) => [{ expr, result: fmt.sig(value, 12) }, ...tp].slice(0, 10));
    setAns(value);
    setExpr(String(value));
  }

  function press(k: Key) {
    if (k.action === 'clear') {
      setExpr('');
      setShowError(false);
    } else if (k.action === 'back') {
      setExpr((e) => e.slice(0, -1));
      setShowError(false);
    } else if (k.action === 'equals') equals();
    else if (k.insert) insert(k.insert);
  }

  async function copy(text: string, msg: string) {
    try {
      await navigator.clipboard.writeText(text);
      setNotice(msg);
      window.setTimeout(() => setNotice(null), 2500);
    } catch {
      /* clipboard unavailable */
    }
  }

  const shareUrl = () => {
    const q = encodeState(definition, { expr, angle }, defaults);
    return `${window.location.origin}${window.location.pathname}${q ? `?${q}` : ''}`;
  };

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-10">
      <section aria-label={chrome.inputs} className="min-w-0">
        <div className="rounded-md border border-line bg-surface p-4 sm:p-5">
          <label htmlFor="sci-expr" className="text-sm font-medium text-muted">
            {t('expr')}
          </label>
          <input
            id="sci-expr"
            ref={input}
            value={expr}
            onChange={(e) => {
              setExpr(e.target.value);
              setShowError(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                equals();
              } else if (e.key === 'Escape') {
                e.preventDefault();
                setExpr('');
              }
            }}
            maxLength={500}
            inputMode="text"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            aria-describedby="sci-result"
            className="num mt-1 w-full min-w-0 bg-transparent py-1 font-mono text-xl outline-none sm:text-2xl"
          />
          <div
            id="sci-result"
            aria-live="polite"
            className="mt-2 min-h-14 border-t border-line pt-2 text-end"
          >
            {value !== null ? (
              <p className="num text-result font-semibold tracking-tight break-all">
                = {fmt.sig(value, 12)}
              </p>
            ) : showError && error ? (
              <p className="text-base text-danger">{t(error.key, error.values)}</p>
            ) : (
              <p className="text-base text-subtle">{t('hint')}</p>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <Segmented
            label={t('angle')}
            hideLabel
            value={angle}
            onChange={(v) => setAngle(v)}
            options={[
              { value: 'deg', label: t('angle.deg') },
              { value: 'rad', label: t('angle.rad') },
            ]}
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => copy(shareUrl(), chrome.linkCopied)}
              className="inline-flex h-11 items-center gap-1.5 rounded-sm px-3 text-sm font-medium text-brand hover:bg-brand-wash"
            >
              <Icon name="link" size={16} /> {chrome.copyLink}
            </button>
            <button
              type="button"
              disabled={value === null}
              onClick={() => value !== null && copy(fmt.sig(value, 12), chrome.resultCopied)}
              className="inline-flex h-11 items-center gap-1.5 rounded-sm px-3 text-sm font-medium text-brand hover:bg-brand-wash disabled:opacity-40"
            >
              <Icon name="copy" size={16} /> {chrome.copyResult}
            </button>
          </div>
        </div>
        <p role="status" aria-live="polite" className="min-h-5 pt-1 text-sm text-success">
          {notice}
        </p>

        <div className="no-print mt-2 grid grid-cols-[minmax(0,1fr)] gap-3 md:grid-cols-[minmax(0,6fr)_minmax(0,5fr)]">
          <div
            className="grid grid-cols-6 gap-1.5 md:grid-cols-3"
            role="group"
            aria-label={t('keys.functions')}
          >
            {FN.map((k) => (
              <button
                key={k.label}
                type="button"
                onClick={() => press(k)}
                aria-label={nameOf(k)}
                className={`rounded-sm font-mono ${TONE.fn}`}
              >
                {k.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-4 gap-1.5" role="group" aria-label={t('keys.numbers')}>
            {PAD.map((k) => (
              <button
                key={k.label}
                type="button"
                onClick={() => press(k)}
                aria-label={nameOf(k)}
                className={`num rounded-sm ${TONE[k.tone ?? 'num']}`}
              >
                {k.action === 'back' ? (
                  <Icon name="backspace" size={22} className="mx-auto" />
                ) : (
                  k.label
                )}
              </button>
            ))}
          </div>
        </div>
        <p className="mt-3 flex gap-2 text-xs text-subtle">
          <Icon name="lock" size={14} className="mt-0.5 shrink-0" />
          {chrome.onDevice}
        </p>
      </section>

      <aside aria-labelledby="sci-tape" className="min-w-0">
        <h2 id="sci-tape" className="text-sm font-semibold">
          {t('tape')}
        </h2>
        {tape.length === 0 ? (
          <p className="mt-2 text-sm text-subtle">{t('tape.empty')}</p>
        ) : (
          <ol className="mt-2 divide-y divide-line rounded-sm border border-line bg-surface">
            {tape.map((e, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => setExpr(e.expr)}
                  className="w-full px-3 py-2 text-end hover:bg-sunken"
                >
                  <span className="block truncate font-mono text-sm text-muted">{e.expr}</span>
                  <span className="num block font-semibold">= {e.result}</span>
                </button>
              </li>
            ))}
          </ol>
        )}
      </aside>
    </div>
  );
}
