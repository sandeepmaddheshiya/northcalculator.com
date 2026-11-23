'use client';

import { useEffect, useState } from 'react';

/**
 * The primary result, displayed large (BRIEF §7 "result as hero").
 * Counts toward a new value in <300 ms (skipped under reduced motion) and flashes once,
 * like a highlighter pass. Screen readers get the final value via a polite live region.
 */
export function ResultHero({
  label,
  value,
  format,
  caption,
}: {
  label: string;
  value: number | null;
  format: (n: number) => string;
  caption?: string;
}) {
  const [shown, setShown] = useState(value);
  const [target, setTarget] = useState(value);
  const [from, setFrom] = useState(value);
  const [flashKey, setFlashKey] = useState(0);

  // Adjust state during render when the value prop changes (no effect cascade).
  if (value !== target) {
    setTarget(value);
    setFrom(shown);
    if (value === null || shown === null) setShown(value);
    else setFlashKey((k) => k + 1);
  }

  useEffect(() => {
    if (target === null || from === null || from === target) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const start = performance.now();
    const dur = reduced ? 0 : 260;
    let raf = 0;
    const tick = (now: number) => {
      const p = dur === 0 ? 1 : Math.min(1, (now - start) / dur);
      const eased = 1 - (1 - p) ** 4;
      setShown(p === 1 ? target : from + (target - from) * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, from]);

  const finalText = value === null ? '—' : format(value);
  return (
    <div>
      <p className="text-sm font-medium text-muted">{label}</p>
      <p
        key={flashKey}
        className={`num -mx-1 mt-1 rounded-xs px-1 text-result font-semibold tracking-tight text-text ${flashKey ? 'flash' : ''}`}
        aria-hidden="true"
      >
        {shown === null ? '—' : format(shown)}
      </p>
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {label}: {finalText}
      </p>
      {caption && <p className="mt-2 max-w-prose text-[15px] text-muted">{caption}</p>}
    </div>
  );
}
