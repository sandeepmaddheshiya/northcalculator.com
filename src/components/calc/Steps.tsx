/** Numbered working with the user's own numbers. */
export function Steps({ steps }: { steps: readonly { text: string; math?: string }[] }) {
  return (
    <ol className="space-y-3">
      {steps.map((s, i) => (
        <li key={i} className="grid grid-cols-[1.75rem_1fr] gap-2">
          <span className="num mt-0.5 font-mono text-sm text-subtle">
            {String(i + 1).padStart(2, '0')}
          </span>
          <div>
            <p className="text-[15px]">{s.text}</p>
            {s.math && (
              <p
                tabIndex={0}
                className="num mt-1 overflow-x-auto font-mono text-sm whitespace-nowrap text-muted"
              >
                {s.math}
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
