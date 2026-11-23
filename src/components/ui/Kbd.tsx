export function Kbd({ children }: { children: string }) {
  return (
    <kbd className="rounded-xs border border-b-2 border-line bg-surface px-1.5 py-0.5 font-mono text-xs">
      {children}
    </kbd>
  );
}
