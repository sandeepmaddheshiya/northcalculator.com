/**
 * NorthCalculator icon set: 24-unit grid, 1.6 stroke, square caps softened with round joins.
 * Drawn for this project (no icon library). Category glyphs live in CategoryGlyph.tsx.
 */
const PATHS = {
  search: 'M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13Zm4.7-1.8L20 20',
  close: 'M6 6l12 12M18 6 6 18',
  copy: 'M9 9h10v11H9zM5 15V4h10',
  link: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
  print: 'M7 9V4h10v5M7 17H4v-7h16v7h-3M7 14h10v6H7z',
  reset: 'M4 12a8 8 0 1 0 2.4-5.7M4 4v4.5h4.5',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  chevronDown: 'M6 9l6 6 6-6',
  chevronRight: 'M9 6l6 6-6 6',
  arrowRight: 'M4 12h15M13 6l6 6-6 6',
  north: 'M12 3l5 14-5-3-5 3z',
  sun: 'M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4',
  moon: 'M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10Z',
  monitor: 'M3 5h18v11H3zM9 20h6M12 16v4',
  globe:
    'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM3 12h18M12 3c2.5 2.5 3.8 5.5 3.8 9S14.5 18.5 12 21c-2.5-2.5-3.8-5.5-3.8-9S9.5 5.5 12 3Z',
  info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 11v6M12 7.5v.5',
  warning: 'M12 3.5 21.5 20h-19L12 3.5ZM12 10v4.5M12 17v.5',
  steps: 'M4 6h3M4 12h3M4 18h3M10 6h10M10 12h10M10 18h6',
  menu: 'M4 7h16M4 12h16M4 17h16',
  download: 'M12 4v11M7 10l5 5 5-5M5 20h14',
  swap: 'M7 4 4 7l3 3M4 7h13M17 20l3-3-3-3M20 17H7',
  lock: 'M6 11h12v9H6zM8.5 11V8a3.5 3.5 0 0 1 7 0v3',
  plus: 'M12 5v14M5 12h14',
  trash: 'M5 7h14M10 7V4.5h4V7M7 7l.8 12.5h8.4L17 7M10.5 11v5M13.5 11v5',
  backspace: 'M9 5h11v14H9l-6-7 6-7ZM12.5 9.5l5 5M17.5 9.5l-5 5',
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({
  name,
  size = 20,
  className,
  label,
}: {
  name: IconName;
  size?: number;
  className?: string;
  /** Provide only when the icon carries meaning on its own. */
  label?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
