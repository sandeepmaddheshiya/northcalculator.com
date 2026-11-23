/** Secondary results: a ruled ledger, label left, tabular value right. */
export function ResultList({
  items,
}: {
  items: readonly { label: string; value: string; emphasis?: boolean }[];
}) {
  return (
    <dl className="divide-y divide-line border-y border-line">
      {items.map((it) => (
        <div key={it.label} className="flex items-baseline justify-between gap-4 py-2.5">
          <dt className="text-sm text-muted">{it.label}</dt>
          <dd className={`num text-end ${it.emphasis ? 'font-semibold' : ''}`}>{it.value}</dd>
        </div>
      ))}
    </dl>
  );
}
