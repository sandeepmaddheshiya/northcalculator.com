/** Accessible data table: caption, scoped headers, tabular numerals, scrolls on small screens. */
export function DataTable({
  caption,
  columns,
  rows,
  numericFrom = 1,
}: {
  caption: string;
  columns: readonly string[];
  rows: readonly (readonly (string | number)[])[];
  /** Columns at or after this index are right-aligned numbers. */
  numericFrom?: number;
}) {
  return (
    <div
      className="overflow-x-auto rounded-sm border border-line"
      tabIndex={0}
      role="region"
      aria-label={caption}
    >
      <table className="num w-full border-collapse text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead className="bg-sunken">
          <tr>
            {columns.map((c, i) => (
              <th
                key={c}
                scope="col"
                className={`px-3 py-2 font-medium text-muted ${i >= numericFrom ? 'text-end' : 'text-start'}`}
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, ri) => (
            <tr key={ri} className="border-t border-line">
              {r.map((cell, ci) =>
                ci === 0 ? (
                  <th key={ci} scope="row" className="px-3 py-2 text-start font-normal">
                    {cell}
                  </th>
                ) : (
                  <td key={ci} className={`px-3 py-2 ${ci >= numericFrom ? 'text-end' : ''}`}>
                    {cell}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
