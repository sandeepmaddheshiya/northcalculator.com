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
        className="group border-line-strong bg-sunken aria-checked:border-brand aria-checked:bg-brand relative mt-0.5 inline-flex h-6 w-10 shrink-0 items-center rounded-full border transition-colors"
      >
        <span
          className="bg-muted group-aria-checked:bg-on-brand inline-block size-4 translate-x-1 rounded-full transition-transform group-aria-checked:translate-x-5 rtl:-translate-x-1 rtl:group-aria-checked:-translate-x-5"
          aria-hidden="true"
        />
      </button>
      <div>
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        {help && (
          <p id={`${id}-help`} className="text-subtle text-sm">
            {help}
          </p>
        )}
      </div>
    </div>
  );
}
