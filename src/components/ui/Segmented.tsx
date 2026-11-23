'use client';

import { useId } from 'react';

/**
 * Segmented control built on native radio inputs: arrow keys, form semantics and
 * screen-reader announcements work without custom ARIA.
 */
export function Segmented<V extends string>({
  label,
  value,
  onChange,
  options,
  hideLabel,
}: {
  label: string;
  value: V;
  onChange: (v: V) => void;
  options: readonly { value: V; label: string }[];
  hideLabel?: boolean;
}) {
  const name = useId();
  return (
    <fieldset className="flex min-w-0 flex-col gap-1.5">
      <legend className={hideLabel ? 'sr-only' : 'mb-1.5 text-sm font-medium'}>{label}</legend>
      <div className="inline-flex max-w-full overflow-x-auto rounded-sm border border-line-strong bg-sunken p-0.5">
        {options.map((o) => (
          <label
            key={o.value}
            className="relative flex min-h-10 flex-1 cursor-pointer items-center justify-center rounded-xs px-3 text-sm whitespace-nowrap text-muted transition-colors has-[:checked]:bg-surface has-[:checked]:font-medium has-[:checked]:text-text has-[:checked]:shadow-[0_0_0_1px_var(--tok-border)] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-brand"
          >
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
              className="sr-only"
            />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
