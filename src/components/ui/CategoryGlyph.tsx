/**
 * Category glyphs: each one is a small "instrument reading", drawn on the same 24-grid
 * as Icon but with a filled accent so categories are recognisable at a glance.
 */
export type CategoryKey =
  | 'math'
  | 'finance'
  | 'health'
  | 'date-time'
  | 'conversion'
  | 'education'
  | 'everyday'
  | 'geometry'
  | 'statistics'
  | 'physics'
  | 'electronics'
  | 'chemistry'
  | 'construction';

const GLYPHS: Record<CategoryKey, { stroke: string; accent?: string }> = {
  // ± on a ruled baseline
  math: { stroke: 'M7 5v8M3 9h8M3 17h8M14 21 20 3', accent: 'M15 13h6v2h-6z' },
  // rising curve over an axis with a coin tick
  finance: {
    stroke: 'M3 3v18h18M6 16c4 0 6-2 8-5s3.5-5 7-5',
    accent: 'M19 4.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z',
  },
  // pulse trace inside a gauge arc
  health: { stroke: 'M3 13h4l2-5 3 9 2.5-6 1.5 2H21', accent: 'M11.2 16.5 12 17l.8-.5L12 19z' },
  // calendar with one day marked
  'date-time': { stroke: 'M4 6h16v14H4zM4 10h16M8 3v5M16 3v5', accent: 'M13 13h4v4h-4z' },
  // two scales sliding against each other
  conversion: {
    stroke: 'M3 8h18M3 16h18M6 8V5M10 8V6M14 8V5M18 8V6M8 16v3M12 16v2M16 16v3',
    accent: 'M10 11h4l-2 2.5z',
  },
  // graded paper: a grade box and lines
  education: { stroke: 'M5 3h14v18H5zM8 8h8M8 12h8M8 16h4', accent: 'M14 15h3v3h-3z' },
  // receipt with torn edge
  everyday: {
    stroke: 'M6 3h12v18l-2-1.5L14 21l-2-1.5L10 21l-2-1.5L6 21zM9 8h6M9 12h6',
    accent: 'M9 15h3v2H9z',
  },
  // set square with a right-angle mark
  geometry: { stroke: 'M4 20V4l16 16H4zM4 15h5v5', accent: 'M8 12a1.5 1.5 0 1 1 0 .1z' },
  // bell curve over an axis with one bar
  statistics: { stroke: 'M3 20h18M3 18c4 0 5-12 9-12s5 12 9 12', accent: 'M11 12h2v8h-2z' },
  // pendulum swinging from a bar
  physics: { stroke: 'M4 4h16M12 4l5 12', accent: 'M17 15a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Z' },
  // resistor zigzag between two leads
  electronics: { stroke: 'M2 12h5l1.5-4 3 8 3-8 3 8 1.5-4H22', accent: 'M10.5 19h3v2h-3z' },
  // flask with liquid level
  chemistry: {
    stroke: 'M9 3h6M10 3v6l-5 10a1.5 1.5 0 0 0 1.4 2h11.2a1.5 1.5 0 0 0 1.4-2L14 9V3',
    accent: 'M7.5 15h9l2 4h-13z',
  },
  // house outline with a ruler tick
  construction: { stroke: 'M3 11 12 4l9 7M5 10v10h14V10', accent: 'M10 14h4v6h-4z' },
};

export function CategoryGlyph({
  category,
  size = 24,
  className,
}: {
  category: CategoryKey;
  size?: number;
  className?: string;
}) {
  const g = GLYPHS[category];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d={g.stroke}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {g.accent && <path d={g.accent} fill="var(--tok-brand)" />}
    </svg>
  );
}
