import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { roundTo } from '@/engine/money';

/**
 * Pace = time ÷ distance; time = pace × distance; distance = time ÷ pace (unit rates, OpenStax
 * Prealgebra 2e §5.6). Race distances from World Athletics Technical Rules (Road Mile 1609.344 m,
 * Marathon 42.195 km; the half marathon is half of that). Paces and times are rounded to the
 * nearest second for display; speeds and distances keep more precision.
 */
const MI = 1.609344;
export const RACES: Record<string, number> = {
  mile: MI,
  '5k': 5,
  '10k': 10,
  half: 42.195 / 2,
  marathon: 42.195,
};

export function clock(totalSeconds: number, forceHours = false): string {
  const t = Math.round(totalSeconds);
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = t % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 || forceHours ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

export const compute: ComputeFn = (inputs, ctx) => {
  const { fmt } = ctx;
  const t = ctx.t ?? ((k: string, v?: Record<string, string | number>) => `${v?.v ?? ''} ${k}`);
  const val = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : 0);
  const mode = inputs.mode === 'time' || inputs.mode === 'distance' ? inputs.mode : 'pace';
  const distUnit = inputs.distUnit === 'mi' ? 'mi' : 'km';
  const paceUnit = inputs.paceUnit === 'mi' ? 'mi' : 'km';
  const none = (key?: string): ComputeResult => ({
    outputs: { result: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });

  const race = String(inputs.race ?? 'custom');
  const enteredKm =
    mode !== 'distance' && race in RACES
      ? RACES[race]!
      : val('distance') * (distUnit === 'mi' ? MI : 1);
  const timeS = val('h') * 3600 + val('min') * 60 + val('sec');
  const paceS = val('pmin') * 60 + val('psec'); // per paceUnit
  const pacePerKm = paceUnit === 'mi' ? paceS / MI : paceS;

  let km: number;
  let seconds: number;
  if (mode === 'pace') {
    if (!(enteredKm > 0)) return none('warn.distance');
    if (!(timeS > 0)) return none('warn.time');
    km = enteredKm;
    seconds = timeS;
  } else if (mode === 'time') {
    if (!(enteredKm > 0)) return none('warn.distance');
    if (!(paceS > 0)) return none('warn.pace');
    km = enteredKm;
    seconds = pacePerKm * km;
  } else {
    if (!(timeS > 0)) return none('warn.time');
    if (!(paceS > 0)) return none('warn.pace');
    seconds = timeS;
    km = timeS / pacePerKm;
  }

  const perKm = seconds / km;
  const perMi = perKm * MI;
  const kmh = km / (seconds / 3600);
  const paceText = (s: number, u: 'km' | 'mi') => `${clock(s)} ${t(`per.${u}`)}`;
  const result =
    mode === 'pace'
      ? paceText(paceUnit === 'mi' ? perMi : perKm, paceUnit)
      : mode === 'time'
        ? clock(seconds)
        : t(`dist.${distUnit}`, {
            v: new Intl.NumberFormat(fmt.locale, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(distUnit === 'mi' ? km / MI : km),
          });

  const warnings: ComputeResult['warnings'] = [];
  if (perKm < 150) warnings.push({ key: 'warn.fast', level: 'info' });
  return {
    outputs: {
      result,
      perKm: mode === 'pace' && paceUnit === 'km' ? null : paceText(perKm, 'km'),
      perMi: mode === 'pace' && paceUnit === 'mi' ? null : paceText(perMi, 'mi'),
      kmh: roundTo(kmh, 4),
      mph: roundTo(kmh / MI, 4),
      km: mode === 'distance' ? null : roundTo(km, 4),
    },
    explain: {
      key: `explain.${mode}`,
      values: {
        pace: paceText(paceUnit === 'mi' ? perMi : perKm, paceUnit),
        time: clock(seconds),
        km: fmt.num(km, 2),
        mi: fmt.num(km / MI, 2),
      },
    },
    steps: [
      {
        key: `step.${mode}`,
        math:
          mode === 'pace'
            ? `${clock(seconds, true)} ÷ ${fmt.num(km, 3)} km = ${fmt.num(perKm, 1)} s/km`
            : mode === 'time'
              ? `${fmt.num(perKm, 1)} s/km × ${fmt.num(km, 3)} km = ${fmt.num(seconds, 0)} s`
              : `${fmt.num(seconds, 0)} s ÷ ${fmt.num(perKm, 1)} s/km = ${fmt.num(km, 3)} km`,
      },
      {
        key: 'step.speed',
        math: `${fmt.num(km, 3)} km ÷ ${fmt.num(seconds / 3600, 4)} h = ${fmt.num(kmh, 2)} km/h`,
      },
    ],
    warnings,
  };
};
