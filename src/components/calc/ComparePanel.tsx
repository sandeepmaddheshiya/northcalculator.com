'use client';

import type { CalcChrome } from '@/i18n/labels';

export interface CompareRow {
  label: string;
  a: string;
  b: string;
  /** Formatted B − A, or null when not numeric. */
  diff: string | null;
}

/** Scenario A (pinned) against scenario B (current inputs), output by output (BRIEF §6). */
export function ComparePanel({
  rows,
  chrome,
  onClear,
}: {
  rows: CompareRow[];
  chrome: CalcChrome;
  onClear: () => void;
}) {
  return (
    <div className="mt-5 border-t border-line pt-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold">{chrome.compareHeading}</h3>
        <button
          type="button"
          onClick={onClear}
          className="text-sm text-muted underline underline-offset-2 hover:text-text"
        >
          {chrome.compareClear}
        </button>
      </div>
      <div className="mt-2 overflow-x-auto">
        <table className="num w-full min-w-[22rem] text-sm">
          <thead>
            <tr className="border-b border-line text-xs text-subtle">
              <th scope="col" className="py-1.5 text-start font-medium" />
              <th scope="col" className="py-1.5 text-end font-medium">
                {chrome.scenarioA}
              </th>
              <th scope="col" className="py-1.5 text-end font-medium">
                {chrome.scenarioB}
              </th>
              <th scope="col" className="py-1.5 text-end font-medium">
                {chrome.difference}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label} className="border-b border-line/60">
                <th scope="row" className="py-1.5 pe-3 text-start font-normal text-muted">
                  {r.label}
                </th>
                <td className="py-1.5 ps-2 text-end">{r.a}</td>
                <td className="py-1.5 ps-2 text-end font-medium">{r.b}</td>
                <td className="py-1.5 ps-2 text-end text-muted">{r.diff ?? ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
