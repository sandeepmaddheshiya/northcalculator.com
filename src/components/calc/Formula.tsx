import type { ReactNode } from 'react';

/**
 * A formula set like an engineer's notebook entry: mono, with a margin rule and
 * variable definitions beneath. Plain text keeps it copyable and quotable by AI assistants.
 */
export function Formula({
  children,
  where,
  label,
}: {
  children: ReactNode;
  where?: readonly { symbol: string; meaning: string }[];
  label?: string;
}) {
  return (
    <figure className="border-brand bg-sunken my-6 border-s-2 py-4 ps-5 pe-4">
      {label && (
        <figcaption className="text-subtle mb-2 text-xs font-medium tracking-wide uppercase">
          {label}
        </figcaption>
      )}
      <p className="num overflow-x-auto font-mono text-lg leading-relaxed whitespace-pre">
        {children}
      </p>
      {where && (
        <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
          {where.map((w) => (
            <div key={w.symbol} className="contents">
              <dt className="text-brand font-mono">{w.symbol}</dt>
              <dd className="text-muted">{w.meaning}</dd>
            </div>
          ))}
        </dl>
      )}
    </figure>
  );
}
