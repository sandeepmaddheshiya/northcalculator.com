export function Kbd({ children }: { children: string }) {
  return (
    <kbd className="border-line bg-surface rounded-xs border border-b-2 px-1.5 py-0.5 font-mono text-xs">
      {children}
    </kbd>
  );
}
