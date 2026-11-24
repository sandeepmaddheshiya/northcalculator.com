import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean } from '@/engine/money';
import { clock } from '@/calculators/health/running-pace/compute';

/**
 * Distance = speed × time (OpenStax College Physics 2e §2.3; Elementary Algebra 2e §3.5).
 * Everything runs through metres and seconds with the exact NIST SP 811 factors
 * (1 mi = 1609.344 m, so 1 mph = 0.44704 m/s; 1 km/h = 1/3.6 m/s).
 */
const M_PER = { km: 1000, mi: 1609.344, m: 1 } as const;
const MS_PER = { kmh: 1 / 3.6, mph: 0.44704, ms: 1 } as const;
type DU = keyof typeof M_PER;
type SU = keyof typeof MS_PER;

export const compute: ComputeFn = (inputs, ctx) => {
  const { fmt } = ctx;
  const t = ctx.t ?? ((k: string) => k.replace(/^sym\./, ''));
  const val = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const find = inputs.find === 'distance' || inputs.find === 'time' ? inputs.find : 'speed';
  const du: DU = inputs.distUnit === 'mi' || inputs.distUnit === 'm' ? inputs.distUnit : 'km';
  const su: SU = inputs.speedUnit === 'mph' || inputs.speedUnit === 'ms' ? inputs.speedUnit : 'kmh';
  const none = (key?: string): ComputeResult => ({
    outputs: { result: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  const seconds = (val('h') ?? 0) * 3600 + (val('min') ?? 0) * 60 + (val('sec') ?? 0);
  const d = val('distance');
  const s = val('speed');

  let m: number; // metres
  let sec: number; // seconds
  if (find === 'speed') {
    if (d === null) return none();
    if (!(seconds > 0)) return none('warn.time');
    m = d * M_PER[du];
    sec = seconds;
  } else if (find === 'distance') {
    if (s === null) return none();
    if (!(seconds > 0)) return none('warn.time');
    sec = seconds;
    m = s * MS_PER[su] * sec;
  } else {
    if (d === null || s === null) return none();
    if (!(s > 0)) return none('warn.speed');
    m = d * M_PER[du];
    sec = m / (s * MS_PER[su]);
  }
  const ms = m / sec;
  const sig = (x: number) => fmt.sig(clean(x), 8);
  const speedIn = clean(ms / MS_PER[su]);
  const distIn = clean(m / M_PER[du]);
  const result =
    find === 'speed'
      ? `${sig(speedIn)} ${t(`sym.${su}`)}`
      : find === 'distance'
        ? `${sig(distIn)} ${t(`sym.${du}`)}`
        : clock(sec, true);
  return {
    outputs: {
      result,
      kmh: clean(ms * 3.6),
      mph: clean(ms / MS_PER.mph),
      ms: clean(ms),
      km: clean(m / 1000),
      mi: clean(m / M_PER.mi),
      hours: clean(sec / 3600),
    },
    explain: {
      key: 'explain',
      values: {
        d: `${sig(distIn)} ${t(`sym.${du}`)}`,
        s: `${sig(speedIn)} ${t(`sym.${su}`)}`,
        t: clock(sec, true),
      },
    },
    steps: [
      find === 'speed'
        ? { key: 'step.speed', math: `${sig(distIn)} ${t(`sym.${du}`)} ÷ ${sig(sec / 3600)} h` }
        : find === 'distance'
          ? {
              key: 'step.distance',
              math: `${sig(speedIn)} ${t(`sym.${su}`)} × ${sig(sec / 3600)} h`,
            }
          : {
              key: 'step.time',
              math: `${sig(distIn)} ${t(`sym.${du}`)} ÷ ${sig(speedIn)} ${t(`sym.${su}`)}`,
            },
    ],
    warnings: [],
  };
};
