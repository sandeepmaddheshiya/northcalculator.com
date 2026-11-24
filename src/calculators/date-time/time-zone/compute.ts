import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { parseClock } from '@/engine/clock';
import { parseISODate } from '@/engine/dates';

/**
 * Converts a wall-clock time in one IANA zone to another, using the runtime's tz database through
 * Intl.DateTimeFormat (IANA; NIST for the US daylight saving rules). The local time is turned into
 * a UTC instant by trying the zone's offset and correcting once; times that do not exist (skipped
 * when clocks go forward) or happen twice (when clocks go back) are flagged.
 */
const MIN = 60_000;

export function offsetMinutes(utcMs: number, zone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: zone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(new Date(utcMs));
  const n = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  const asUtc = Date.UTC(
    n('year'),
    n('month') - 1,
    n('day'),
    n('hour') % 24,
    n('minute'),
    n('second'),
  );
  return Math.round((asUtc - utcMs) / MIN);
}

const fmtOffset = (m: number) => {
  const s = m < 0 ? '−' : '+';
  const a = Math.abs(m);
  return `UTC${s}${String(Math.floor(a / 60)).padStart(2, '0')}:${String(a % 60).padStart(2, '0')}`;
};
const fmtDiff = (m: number) => {
  if (m === 0) return '0 h';
  const s = m < 0 ? '−' : '+';
  const a = Math.abs(m);
  const h = Math.floor(a / 60);
  const r = a % 60;
  return `${s}${h ? `${h} h` : ''}${h && r ? ' ' : ''}${r ? `${r} min` : ''}`;
};

export function wallToUtc(
  date: string,
  time: string,
  zone: string,
): { utc: number; status: 'ok' | 'gap' | 'repeat' } | null {
  const d = parseISODate(date);
  const t = parseClock(time);
  if (!d || t === null) return null;
  const wall = Date.UTC(d.y, d.m - 1, d.d) + t * MIN;
  const o1 = offsetMinutes(wall, zone);
  let utc = wall - o1 * MIN;
  const o2 = offsetMinutes(utc, zone);
  if (o2 !== o1) utc = wall - o2 * MIN;
  const back = utc + offsetMinutes(utc, zone) * MIN;
  if (back !== wall) return { utc, status: 'gap' };
  // Same wall time an hour (or the DST shift) earlier or later in UTC also maps here → repeated.
  const alt = [utc - 60 * MIN, utc + 60 * MIN].some(
    (u) => u + offsetMinutes(u, zone) * MIN === wall,
  );
  return { utc, status: alt ? 'repeat' : 'ok' };
}

export const compute: ComputeFn = (inputs, { fmt }) => {
  const from = String(inputs.from ?? 'UTC');
  const to = String(inputs.to ?? 'UTC');
  const conv = wallToUtc(String(inputs.date ?? ''), String(inputs.time ?? ''), from);
  if (!conv) {
    const none: ComputeResult = { outputs: { result: null }, steps: [], warnings: [] };
    return none;
  }
  const { utc, status } = conv;
  const of = offsetMinutes(utc, from);
  const ot = offsetMinutes(utc, to);
  const result = new Intl.DateTimeFormat(fmt.locale, {
    timeZone: to,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(utc));
  const iso = new Date(utc).toISOString();
  const warnings: ComputeResult['warnings'] = [];
  if (status === 'gap') warnings.push({ key: 'warn.gap', level: 'warn' });
  if (status === 'repeat') warnings.push({ key: 'warn.repeat', level: 'info' });
  return {
    outputs: {
      result,
      diff: fmtDiff(ot - of),
      fromOffset: fmtOffset(of),
      toOffset: fmtOffset(ot),
      utc: `${iso.slice(0, 10)} ${iso.slice(11, 16)}`,
    },
    explain: { key: 'explain', values: { r: result, diff: fmtDiff(ot - of) } },
    steps: [
      {
        key: 'step.toUtc',
        math: `${String(inputs.date)} ${String(inputs.time)} (${fmtOffset(of)}) = ${iso.slice(0, 10)} ${iso.slice(11, 16)} UTC`,
      },
      {
        key: 'step.fromUtc',
        math: `UTC ${ot >= 0 ? '+' : '−'} ${fmtDiff(Math.abs(ot)).replace(/^[+−]/, '')} → ${result}`,
      },
    ],
    warnings,
  };
};
