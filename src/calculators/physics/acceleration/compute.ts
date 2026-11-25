import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean } from '@/engine/money';

/**
 * Average acceleration ā = (v − v₀) ÷ t (OpenStax College Physics 2e Eq. 2.10; University Physics
 * Vol. 1 Eq. 3.8), solved for v = v₀ + at or t = (v − v₀) ÷ a (College Physics Eq. 2.35). The
 * distance covered assumes constant acceleration: x = (v₀ + v) ÷ 2 × t (Eqs. 2.28–2.29). Speeds
 * convert with the exact NIST SP 811 factors; g-force uses standard gravity 9.80665 m/s².
 * Signs give direction: a negative acceleration opposes the positive direction.
 */
const MS = { ms: 1, kmh: 1 / 3.6, mph: 0.44704 } as const;
const UNIT = { ms: 'm/s', kmh: 'km/h', mph: 'mph' } as const;
export const G0 = 9.80665;

export const compute: ComputeFn = (inputs, { fmt }) => {
  const val = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const find = inputs.find === 'v' || inputs.find === 't' ? inputs.find : 'a';
  const su = inputs.su === 'ms' || inputs.su === 'mph' ? inputs.su : 'kmh';
  const none = (key?: string): ComputeResult => ({
    outputs: { result: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  const v0In = val('v0');
  if (v0In === null) return none();
  const v0 = v0In * MS[su];
  let a: number;
  let v: number;
  let t: number;
  if (find === 'a') {
    const vIn = val('v');
    t = val('t') ?? NaN;
    if (vIn === null || Number.isNaN(t)) return none();
    if (!(t > 0)) return none('warn.time');
    v = vIn * MS[su];
    a = (v - v0) / t;
  } else if (find === 'v') {
    const aIn = val('a');
    t = val('t') ?? NaN;
    if (aIn === null || Number.isNaN(t)) return none();
    a = aIn;
    v = v0 + a * t;
  } else {
    const vIn = val('v');
    const aIn = val('a');
    if (vIn === null || aIn === null) return none();
    v = vIn * MS[su];
    a = aIn;
    if (a === 0) return none(v === v0 ? 'warn.same' : 'warn.zero');
    t = (v - v0) / a;
    if (t < 0) return none('warn.never');
  }
  const s = (x: number) => fmt.sig(clean(x), 8);
  const vShown = v / MS[su];
  const distance = ((v0 + v) / 2) * t;
  const result =
    find === 'a' ? `${s(a)} m/s²` : find === 'v' ? `${s(vShown)} ${UNIT[su]}` : `${s(t)} s`;
  const steps: ComputeResult['steps'] = [];
  if (su !== 'ms')
    steps.push({
      key: 'step.convert',
      math: `${s(v0In)} ${UNIT[su]} = ${s(v0)} m/s${find !== 'v' ? `; ${s(vShown)} ${UNIT[su]} = ${s(v)} m/s` : ''}`,
    });
  steps.push(
    find === 'a'
      ? { key: 'step.a', math: `(${s(v)} − ${s(v0)}) ÷ ${s(t)} = ${s(a)} m/s²` }
      : find === 'v'
        ? { key: 'step.v', math: `${s(v0)} + ${s(a)} × ${s(t)} = ${s(v)} m/s` }
        : { key: 'step.t', math: `(${s(v)} − ${s(v0)}) ÷ ${s(a)} = ${s(t)} s` },
    { key: 'step.distance', math: `(${s(v0)} + ${s(v)}) ÷ 2 × ${s(t)} = ${s(distance)} m` },
  );
  const warnings: ComputeResult['warnings'] = [];
  if (Math.abs(v) > 3e7 || Math.abs(v0) > 3e7)
    warnings.push({ key: 'warn.relativistic', level: 'info' });
  if (Math.sign(v) * Math.sign(v0) < 0) warnings.push({ key: 'warn.reverse', level: 'info' });
  return {
    outputs: {
      result,
      accel: clean(a),
      vf: clean(v),
      time: clean(t),
      distance: clean(distance),
      gs: clean(a / G0),
    },
    explain: {
      key: a > 0 ? 'explain.up' : a < 0 ? 'explain.down' : 'explain.none',
      values: { a: s(Math.abs(a)), g: s(Math.abs(a / G0)), t: s(t) },
    },
    steps,
    warnings,
  };
};
