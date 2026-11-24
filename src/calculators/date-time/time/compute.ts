import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { roundTo } from '@/engine/money';

/**
 * Adds or subtracts two durations (OpenStax Prealgebra 2e Table 7.2; BIPM SI Brochure Table 8:
 * 1 min = 60 s, 1 h = 3600 s, 1 d = 86 400 s). Both durations become whole milliseconds, so the
 * arithmetic is exact, and the result is split back into days, hours, minutes and seconds.
 * A "day" here is always 24 hours; calendar days that include a DST change are not.
 */
const MS = { D: 86_400_000, H: 3_600_000, M: 60_000, S: 1000 } as const;

export const compute: ComputeFn = (inputs, ctx) => {
  const { fmt } = ctx;
  const t = ctx.t ?? ((k: string, v?: Record<string, string | number>) => `${v?.n ?? ''}${k}`);
  const val = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : 0);
  const toMs = (side: 'a' | 'b') =>
    Math.round(
      val(`${side}D`) * MS.D +
        val(`${side}H`) * MS.H +
        val(`${side}M`) * MS.M +
        val(`${side}S`) * MS.S,
    );
  const a = toMs('a');
  const b = toMs('b');
  const sub = inputs.op === 'sub';
  const total = sub ? a - b : a + b;

  const neg = total < 0;
  let rest = Math.abs(total);
  const d = Math.floor(rest / MS.D);
  rest -= d * MS.D;
  const h = Math.floor(rest / MS.H);
  rest -= h * MS.H;
  const m = Math.floor(rest / MS.M);
  rest -= m * MS.M;
  const s = rest / 1000;
  const parts = [
    d ? t('fmt.d', { n: fmt.int(d) }) : '',
    h ? t('fmt.h', { n: fmt.int(h) }) : '',
    m ? t('fmt.m', { n: fmt.int(m) }) : '',
    s ? t('fmt.s', { n: fmt.num(s, 3) }) : '',
  ].filter(Boolean);
  const text = parts.length ? `${neg ? '−' : ''}${parts.join(' ')}` : t('fmt.s', { n: '0' });

  const hms = (ms: number) => {
    const x = Math.abs(ms);
    const hh = Math.floor(x / MS.H);
    const mm = Math.floor((x % MS.H) / MS.M);
    const ss = (x % MS.M) / 1000;
    const pad = (n: number) => String(n).padStart(2, '0');
    const sec = Number.isInteger(ss) ? pad(ss) : ss.toFixed(3).padStart(6, '0');
    return `${ms < 0 ? '−' : ''}${hh}:${pad(mm)}:${sec}`;
  };
  const warnings: ComputeResult['warnings'] = [];
  if (neg) warnings.push({ key: 'warn.negative', level: 'info' });

  return {
    outputs: {
      result: text,
      hours: roundTo(total / MS.H, 6),
      minutes: roundTo(total / MS.M, 4),
      seconds: total / 1000,
      days: roundTo(total / MS.D, 6),
    },
    explain: { key: sub ? 'explain.sub' : 'explain.add', values: { r: text, hms: hms(total) } },
    steps: [
      {
        key: 'step.seconds',
        math: `${fmt.num(a / 1000, 3)} s ${sub ? '−' : '+'} ${fmt.num(b / 1000, 3)} s = ${fmt.num(total / 1000, 3)} s`,
      },
      {
        key: 'step.split',
        math: `${fmt.num(Math.abs(total) / 1000, 3)} s = ${fmt.int(d)} × ${fmt.int(86400)} + ${fmt.int(h)} × ${fmt.int(3600)} + ${fmt.int(m)} × 60 + ${fmt.num(s, 3)}`,
      },
    ],
    warnings,
  };
};
