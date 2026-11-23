'use client';

import { useId } from 'react';

export function Switch({
  label,
  checked,
  onChange,
  help,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  help?: string;
}) {
  const id = useId();
  return (
    <div className="flex items-start gap-3">
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-describedby={help ? `${id}-help` : undefined}
        data-field
        onClick={() => onChange(!checked)}
        className="group relative mt-0.5 inline-flex h-6 w-10 shrink-0 items-center rounded-full border border-line-strong bg-sunken transition-colors aria-checked:border-brand aria-checked:bg-brand"
      >
        <span
          className="inline-block size-4 translate-x-1 rounded-full bg-muted transition-transform group-aria-checked:translate-x-5 group-aria-checked:bg-on-brand rtl:-translate-x-1 rtl:group-aria-checked:-translate-x-5"
          aria-hidden="true"
        />
      </button>
      <div>
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        {help && (
          <p id={`${id}-help`} className="text-sm text-subtle">
            {help}
          </p>
        )}
      </div>
    </div>
  );
}
