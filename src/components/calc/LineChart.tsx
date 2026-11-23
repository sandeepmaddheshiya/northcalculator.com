/**
 * Tiny dependency-free SVG line chart (BRIEF §2: no heavy chart libraries).
 * Decorative to assistive tech: the accessible equivalent is the data table + text summary
 * rendered next to it (BRIEF §6).
 */
export interface ChartSeries {
  label: string;
  points: readonly (readonly [number, number])[];
  tone: 'brand' | 'ink' | 'accent';
}

const TONE = {
  brand: 'var(--tok-brand)',
  ink: 'var(--tok-text)',
  accent: 'var(--tok-warning)',
} as const;
const W = 640;
const H = 260;
const PAD = { l: 64, r: 16, t: 16, b: 32 };

function niceTicks(max: number, count = 4): number[] {
  if (max <= 0) return [0];
  const raw = max / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? raw;
  const out: number[] = [];
  for (let v = 0; v <= max + step * 0.001; v += step) out.push(v);
  return out;
}

export function LineChart({
  series,
  xLabel,
  formatY,
  formatX = (x) => String(x),
}: {
  series: readonly ChartSeries[];
  xLabel: string;
  formatY: (n: number) => string;
  formatX?: (n: number) => string;
}) {
  const xs = series.flatMap((s) => s.points.map((p) => p[0]));
  const ys = series.flatMap((s) => s.points.map((p) => p[1]));
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const ticks = niceTicks(Math.max(...ys, 0));
  const yMax = ticks.at(-1) || 1;
  const sx = (x: number) => PAD.l + ((x - xMin) / (xMax - xMin || 1)) * (W - PAD.l - PAD.r);
  const sy = (y: number) => H - PAD.b - (y / yMax) * (H - PAD.t - PAD.b);
  const xTicks = niceTicks(xMax - xMin, 5)
    .map((t) => t + xMin)
    .filter((t) => t <= xMax);

  return (
    <figure>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" aria-hidden="true" focusable="false">
        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={PAD.l}
              x2={W - PAD.r}
              y1={sy(t)}
              y2={sy(t)}
              stroke="var(--tok-grid)"
              strokeWidth="1"
            />
            <text
              x={PAD.l - 8}
              y={sy(t) + 4}
              textAnchor="end"
              fontSize="11"
              fill="var(--tok-subtle)"
              className="num font-mono"
            >
              {formatY(t)}
            </text>
          </g>
        ))}
        {xTicks.map((t) => (
          <text
            key={t}
            x={sx(t)}
            y={H - 10}
            textAnchor="middle"
            fontSize="11"
            fill="var(--tok-subtle)"
            className="num font-mono"
          >
            {formatX(t)}
          </text>
        ))}
        {series.map((s) => (
          <polyline
            key={s.label}
            fill="none"
            stroke={TONE[s.tone]}
            strokeWidth="2"
            strokeLinejoin="round"
            points={s.points.map(([x, y]) => `${sx(x).toFixed(1)},${sy(y).toFixed(1)}`).join(' ')}
          />
        ))}
      </svg>
      <figcaption className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted">
        {series.map((s) => (
          <span key={s.label} className="inline-flex items-center gap-2">
            <span
              className="inline-block h-0.5 w-5"
              style={{ background: TONE[s.tone] }}
              aria-hidden="true"
            />
            {s.label}
          </span>
        ))}
        <span className="ms-auto text-subtle">{xLabel}</span>
      </figcaption>
    </figure>
  );
}
