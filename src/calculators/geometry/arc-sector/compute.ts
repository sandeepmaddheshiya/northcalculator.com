import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean } from '@/engine/money';

/**
 * Arc and sector of a circle with radius r and central angle θ in radians (OpenStax Algebra and
 * Trigonometry 2e §7.1; Corral, Elementary Trigonometry §4.2–4.3):
 *   arc s = rθ, sector A = ½r²θ, segment (between chord and arc) ½r²(θ − sin θ),
 *   chord 2r sin(θ/2) (the side of the isosceles triangle with apex angle θ).
 * Degrees convert with θ = deg × π ÷ 180.
 */
export const compute: ComputeFn = (inputs, { fmt }) => {
  const val = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const none = (key?: string): ComputeResult => ({
    outputs: { arc: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  const r = val('radius');
  const a = val('angle');
  if (r === null || a === null) return none();
  if (!(r >= 0 && a >= 0)) return none('warn.negative');
  const th = inputs.unit === 'rad' ? a : (a * Math.PI) / 180;
  if (th > 2 * Math.PI * (1 + 1e-12)) return none('warn.full');
  const s = r * th;
  const sector = 0.5 * r * r * th;
  const segment = 0.5 * r * r * (th - Math.sin(th));
  const chord = 2 * r * Math.sin(th / 2);
  const f = (x: number) => fmt.sig(clean(x), 10);
  return {
    outputs: {
      arc: clean(s),
      sector: clean(sector),
      segment: clean(Math.max(0, segment)),
      chord: clean(Math.abs(chord)),
      radians: clean(th),
      fraction: clean((th / (2 * Math.PI)) * 100),
    },
    explain: { key: 'explain', values: { s: f(s), a: f(sector) } },
    steps: [
      ...(inputs.unit === 'rad'
        ? []
        : [{ key: 'step.rad', math: `${f(a)} × π ÷ 180 = ${f(th)} rad` }]),
      { key: 'step.arc', math: `${f(r)} × ${f(th)} = ${f(s)}` },
      { key: 'step.sector', math: `½ × ${f(r)}² × ${f(th)} = ${f(sector)}` },
    ],
    warnings: [],
  };
};
