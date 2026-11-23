import { useId, type SelectHTMLAttributes } from 'react';
import { Icon } from './Icon';

/** Native select: best mobile UX and accessibility for free (ADR-002). */
export function SelectField({
  label,
  options,
  help,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  options: readonly { value: string; label: string }[];
  help?: string;
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          aria-describedby={help ? `${id}-help` : undefined}
          className="border-line-strong bg-surface hover:border-text/60 focus:border-brand h-12 w-full appearance-none rounded-sm border ps-3 pe-10 text-base focus:shadow-[0_0_0_3px_var(--tok-brand-wash)] focus:outline-none"
          {...rest}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <Icon
          name="chevronDown"
          size={18}
          className="text-subtle pointer-events-none absolute end-3 top-1/2 -translate-y-1/2"
        />
      </div>
      {help && (
        <p id={`${id}-help`} className="text-subtle text-sm">
          {help}
        </p>
      )}
    </div>
  );
}
