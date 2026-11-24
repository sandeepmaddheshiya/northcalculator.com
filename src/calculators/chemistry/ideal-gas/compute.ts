import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean } from '@/engine/money';

/**
 * PV = nRT (OpenStax Chemistry 2e §9.2) with the exact CODATA R = 8.314462618 J/(mol·K), i.e.
 * kPa·L/(mol·K). Pressures convert through kPa (NIST SP 811: 1 atm = 101.325 kPa, 1 bar = 100 kPa,
 * 1 torr = 101.325/760 kPa, 1 psi = 6.894757293168 kPa), volumes through litres and temperatures
 * through kelvin (K = °C + 273.15).
 */
export const R = 8.314462618;
const KPA = {
  atm: 101.325,
  kPa: 1,
  bar: 100,
  torr: 101.325 / 760,
  psi: 6.894757293168361,
} as const;
const LITRE = { L: 1, mL: 0.001, m3: 1000 } as const;
const pick = <T extends object>(map: T, v: unknown, d: keyof T): keyof T =>
  typeof v === 'string' && v in map ? (v as keyof T) : d;
const toK = (t: number, u: string) =>
  u === 'K' ? t : u === 'F' ? ((t - 32) * 5) / 9 + 273.15 : t + 273.15;
const fromK = (k: number, u: string) =>
  u === 'K' ? k : u === 'F' ? ((k - 273.15) * 9) / 5 + 32 : k - 273.15;

export const compute: ComputeFn = (inputs, ctx) => {
  const { fmt } = ctx;
  const tr = ctx.t ?? ((k: string) => k);
  const val = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const find = ['p', 'v', 'n', 't'].includes(String(inputs.find)) ? String(inputs.find) : 'v';
  const pu = pick(KPA, inputs.pu, 'atm');
  const vu = pick(LITRE, inputs.vu, 'L');
  const tu = inputs.tu === 'K' || inputs.tu === 'F' ? inputs.tu : 'C';
  const none = (key?: string): ComputeResult => ({
    outputs: { result: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });

  let p = 0; // kPa
  let v = 0; // L
  let n = 0;
  let k = 0;
  if (find !== 'p') {
    const x = val('p');
    if (x === null) return none();
    p = x * KPA[pu];
  }
  if (find !== 'v') {
    const x = val('v');
    if (x === null) return none();
    v = x * LITRE[vu];
  }
  if (find !== 'n') {
    const x = val('n');
    if (x === null) return none();
    n = x;
  }
  if (find !== 't') {
    const x = val('t');
    if (x === null) return none();
    k = toK(x, String(tu));
    if (!(k > 0)) return none('warn.kelvin');
  }
  for (const [key, x] of [
    ['p', p],
    ['v', v],
    ['n', n],
  ] as const)
    if (find !== key && !(x > 0)) return none('warn.zero');
  if (find === 'p') p = (n * R * k) / v;
  else if (find === 'v') v = (n * R * k) / p;
  else if (find === 'n') n = (p * v) / (R * k);
  else k = (p * v) / (n * R);
  const s = (x: number) => fmt.sig(clean(x), 8);
  const result =
    find === 'p'
      ? `${s(p / KPA[pu])} ${tr(`sym.${String(pu)}`)}`
      : find === 'v'
        ? `${s(v / LITRE[vu])} ${tr(`sym.${String(vu)}`)}`
        : find === 'n'
          ? `${s(n)} mol`
          : `${s(fromK(k, String(tu)))} ${tr(`sym.${String(tu)}`)}`;
  return {
    outputs: {
      result,
      atm: clean(p / KPA.atm),
      kPa: clean(p),
      L: clean(v),
      mol: clean(n),
      K: clean(k),
    },
    explain: { key: 'explain', values: { n: s(n), p: s(p / KPA.atm), v: s(v), k: s(k) } },
    steps: [
      { key: 'step.si', math: `P = ${s(p)} kPa, V = ${s(v)} L, n = ${s(n)} mol, T = ${s(k)} K` },
      {
        key: `step.${find}`,
        math:
          { p: 'P = nRT ÷ V', v: 'V = nRT ÷ P', n: 'n = PV ÷ RT', t: 'T = PV ÷ nR' }[find]! +
          `, R = ${R} kPa·L/(mol·K)`,
      },
    ],
    warnings: [],
  };
};
