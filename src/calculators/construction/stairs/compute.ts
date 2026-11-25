import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean } from '@/engine/money';

/**
 * Straight-stair layout. Risers n = ⌈total rise ÷ maximum riser⌉, so every riser is equal (both
 * the IRC and OSHA require uniform risers within a flight); riser height = total rise ÷ n; treads
 * = n − 1 (the upper floor is the last step); total run = treads × tread depth; angle =
 * tan⁻¹(riser ÷ tread); stringer length ≈ √(total rise² + total run²).
 * Limits: IRC R311.7.5 (residential) riser ≤ 7¾ in, tread ≥ 10 in (City of Boise IRC handout #437);
 * OSHA 29 CFR 1910.25(c) (workplaces) riser ≤ 9.5 in, tread ≥ 9.5 in, angle 30°–50°.
 * 1 in = 2.54 cm exactly (NIST SP 811).
 */
export type Code = 'irc' | 'osha' | 'custom';
export const LIMITS: Record<Exclude<Code, 'custom'>, { riser: number; tread: number }> = {
  irc: { riser: 7.75, tread: 10 },
  osha: { riser: 9.5, tread: 9.5 },
};
const CM = 2.54;

export const stairAngle = (riser: number, tread: number) =>
  (Math.atan2(riser, tread) * 180) / Math.PI;

export function layout(totalRise: number, maxRiser: number, tread: number) {
  // Guard against 108 ÷ 7.75 style ratios landing a hair above an integer from binary rounding.
  const n = Math.max(1, Math.ceil(totalRise / maxRiser - 1e-9));
  const riser = totalRise / n;
  const treads = n - 1;
  const run = treads * tread;
  return {
    n,
    riser,
    treads,
    run,
    angle: stairAngle(riser, tread),
    stringer: Math.hypot(totalRise, run),
  };
}

export const compute: ComputeFn = (inputs, { fmt }) => {
  const num = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const none = (key?: string): ComputeResult => ({
    outputs: { riser: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  const code: Code = inputs.code === 'osha' || inputs.code === 'custom' ? inputs.code : 'irc';
  const metric = inputs.unit === 'cm';
  const k = metric ? CM : 1;
  const rise = num('rise');
  const tread = num('tread');
  const maxIn = code === 'custom' ? num('maxRiser') : LIMITS[code].riser * k;
  if (rise === null || tread === null || maxIn === null) return none();
  if (!(rise > 0)) return none('warn.rise');
  if (!(tread > 0)) return none('warn.tread');
  if (!(maxIn > 0)) return none('warn.max');
  const L = layout(rise, maxIn, tread);
  const u = metric ? 'cm' : 'in';
  const s = (x: number) => fmt.sig(clean(x), 6);
  const warnings: ComputeResult['warnings'] = [];
  if (code !== 'custom') {
    const lim = LIMITS[code];
    if (tread / k < lim.tread - 1e-9)
      warnings.push({
        key: `warn.tread.${code}`,
        level: 'warn',
        values: { min: s(lim.tread * k), u },
      });
    if (code === 'osha' && (L.angle < 30 || L.angle > 50))
      warnings.push({ key: 'warn.angle', level: 'warn', values: { a: s(L.angle) } });
    if (code === 'irc' && tread / k < 11) warnings.push({ key: 'warn.nosing', level: 'info' });
  }
  if (L.n === 1) warnings.push({ key: 'warn.single', level: 'info' });

  return {
    outputs: {
      riser: clean(L.riser),
      risers: L.n,
      treads: L.treads,
      run: clean(L.run),
      angle: clean(L.angle),
      stringer: clean(L.stringer),
      runFt: metric ? null : clean(L.run / 12),
    },
    explain: {
      key: 'explain',
      values: { n: L.n, r: s(L.riser), t: L.treads, run: s(L.run), u },
    },
    steps: [
      {
        key: 'step.n',
        math: `⌈${s(rise)} ÷ ${s(maxIn)}⌉ = ${L.n}`,
      },
      { key: 'step.riser', math: `${s(rise)} ÷ ${L.n} = ${s(L.riser)} ${u}` },
      { key: 'step.run', math: `${L.treads} × ${s(tread)} = ${s(L.run)} ${u}` },
      { key: 'step.angle', math: `tan⁻¹(${s(L.riser)} ÷ ${s(tread)}) = ${s(L.angle)}°` },
      { key: 'step.stringer', math: `√(${s(rise)}² + ${s(L.run)}²) = ${s(L.stringer)} ${u}` },
    ],
    warnings,
  };
};
