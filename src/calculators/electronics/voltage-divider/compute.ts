import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean } from '@/engine/money';

/**
 * Two-resistor voltage divider (unloaded): the same current I = V_in ÷ (R1 + R2) flows through
 * both, so V_out = I·R2 = V_in·R2 ÷ (R1 + R2) (series resistors divide the source voltage,
 * Vᵢ = IRᵢ: OpenStax College Physics 2e §21.1; University Physics Vol. 2 §10.2). Solving for R2
 * gives R2 = R1·V_out ÷ (V_in − V_out). A load connected across R2 lowers V_out.
 */
export const compute: ComputeFn = (inputs, { fmt }) => {
  const val = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const none = (key?: string): ComputeResult => ({
    outputs: { result: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  const vin = val('vin');
  const r1 = val('r1');
  if (vin === null || r1 === null) return none();
  let r2: number;
  let vout: number;
  const findR2 = inputs.find === 'r2';
  if (findR2) {
    const vo = val('vout');
    if (vo === null) return none();
    if (!(r1 > 0)) return none('warn.r1');
    if (vin === 0 || vo / vin <= 0 || vo / vin >= 1) return none('warn.vout');
    vout = vo;
    r2 = (r1 * vout) / (vin - vout);
  } else {
    const b = val('r2');
    if (b === null) return none();
    if (!(r1 + b > 0)) return none('warn.r1');
    r2 = b;
    vout = (vin * r2) / (r1 + r2);
  }
  const i = vin / (r1 + r2);
  const s = (x: number) => fmt.sig(clean(x), 8);
  return {
    outputs: {
      result: clean(findR2 ? r2 : vout),
      v1: clean(vin - vout),
      current: clean(i),
      p1: clean(i * i * r1),
      p2: clean(i * i * r2),
      ratio: clean(r2 / (r1 + r2)),
    },
    explain: { key: 'explain', values: { vout: s(vout), r2: s(r2), i: s(i) } },
    steps: findR2
      ? [{ key: 'step.r2', math: `${s(r1)} × ${s(vout)} ÷ (${s(vin)} − ${s(vout)}) = ${s(r2)} Ω` }]
      : [
          { key: 'step.current', math: `${s(vin)} ÷ (${s(r1)} + ${s(r2)}) = ${s(i)} A` },
          { key: 'step.vout', math: `${s(vin)} × ${s(r2)} ÷ (${s(r1)} + ${s(r2)}) = ${s(vout)} V` },
        ],
    warnings: [],
  };
};
