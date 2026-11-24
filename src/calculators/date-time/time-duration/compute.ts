import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { minutesBetween, parseClock } from '@/engine/clock';
import { roundTo } from '@/engine/money';

/**
 * Elapsed time between two clock times (1 h = 60 min, 1 d = 24 h; OpenStax Prealgebra 2e
 * Table 7.2, BIPM SI Brochure Table 8). An end time earlier than the start is on the next day; with
 * "ends the next day" ticked, equal times mean a full 24 hours.
 */
export const compute: ComputeFn = (inputs, ctx) => {
  const { fmt } = ctx;
  const t = ctx.t ?? ((k: string, v?: Record<string, string | number>) => `${v?.n ?? ''}${k}`);
  const s = parseClock(String(inputs.start ?? ''));
  const e = parseClock(String(inputs.end ?? ''));
  if (s === null || e === null) {
    const none: ComputeResult = { outputs: { hm: null }, steps: [], warnings: [] };
    return none;
  }
  const next = inputs.nextDay === true;
  let minutes = minutesBetween(s, e, next);
  if (next && e > s) minutes += 1440;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes - h * 60);
  const hm =
    [h ? t('fmt.h', { n: fmt.int(h) }) : '', m ? t('fmt.m', { n: fmt.int(m) }) : '']
      .filter(Boolean)
      .join(' ') || t('fmt.m', { n: '0' });
  const overnight = e < s || next;
  return {
    outputs: {
      hm,
      hours: roundTo(minutes / 60, 4),
      minutes: Math.round(minutes),
      seconds: Math.round(minutes * 60),
    },
    explain: {
      key: overnight ? 'explain.overnight' : 'explain',
      values: { hm, a: String(inputs.start), b: String(inputs.end) },
    },
    steps: [
      {
        key: 'step.minutes',
        math: `${String(inputs.end)} − ${String(inputs.start)}${overnight ? ' + 24 h' : ''} = ${fmt.int(Math.round(minutes))} min`,
      },
      {
        key: 'step.hours',
        math: `${fmt.int(Math.round(minutes))} ÷ 60 = ${fmt.num(minutes / 60, 4)} h`,
      },
    ],
    warnings: overnight ? [{ key: 'warn.overnight', level: 'info' }] : [],
  };
};
