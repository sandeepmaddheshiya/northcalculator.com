'use client';

import { useId } from 'react';

/** Native time input: the browser shows 12- or 24-hour format by locale; the value is "HH:MM". */
export function TimeField({
  label,
  value,
  onChange,
  help,
}: {
  label: string;
  value: string;
  onChange: (hhmm: string) => void;
  help?: string;
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        type="time"
        value={value}
        aria-describedby={help ? `${id}-help` : undefined}
        onChange={(e) => e.target.value && onChange(e.target.value)}
        className="num h-12 rounded-sm border border-line-strong bg-surface px-3 text-base hover:border-text/60 focus:border-brand focus:shadow-[0_0_0_3px_var(--tok-brand-wash)] focus:outline-none"
      />
      {help && (
        <p id={`${id}-help`} className="text-sm text-subtle">
          {help}
        </p>
      )}
    </div>
  );
}
