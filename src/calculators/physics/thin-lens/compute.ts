import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean } from '@/engine/money';

/**
 * Thin lens equation 1/d_o + 1/d_i = 1/f and magnification m = −d_i/d_o (OpenStax College
 * Physics 2e §25.6; University Physics Vol. 3 §2.4), solved for any one distance. Signs as in
 * OpenStax: f > 0 converging, f < 0 diverging; d_i > 0 real image, d_i < 0 virtual. Power
 * P = 1/f with f in metres gives diopters. Products are rearranged (d_i = f d_o ÷ (d_o − f)) to
 * avoid reciprocal round-off.
 */
const M = { m: 1, cm: 0.01, mm: 0.001 } as const;

export const compute: ComputeFn = (inputs, ctx) => {
  const { fmt } = ctx;
  const t = ctx.t ?? ((k: string) => k);
  const val = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const find = inputs.find === 'focal' || inputs.find === 'object' ? inputs.find : 'image';
  const unit = inputs.unit === 'cm' || inputs.unit === 'mm' ? inputs.unit : 'm';
  const none = (key?: string): ComputeResult => ({
    outputs: { result: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  let o: number;
  let i: number;
  let f: number;
  const s = (x: number) => fmt.sig(clean(x), 8);
  if (find === 'image') {
    const a = val('object');
    const b = val('focal');
    if (a === null || b === null) return none();
    if (a === 0 || b === 0) return none('warn.zero');
    if (a === b) return none('warn.infinity');
    [o, f] = [a, b];
    i = (f * o) / (o - f);
  } else if (find === 'focal') {
    const a = val('object');
    const b = val('image');
    if (a === null || b === null) return none();
    if (a === 0 || b === 0) return none('warn.zero');
    if (a + b === 0) return none('warn.infinity');
    [o, i] = [a, b];
    f = (o * i) / (o + i);
  } else {
    const a = val('image');
    const b = val('focal');
    if (a === null || b === null) return none();
    if (a === 0 || b === 0) return none('warn.zero');
    if (a === b) return none('warn.infinity');
    [i, f] = [a, b];
    o = (f * i) / (i - f);
  }
  const m = -i / o;
  const kind = [
    t(i > 0 ? 'kind.real' : 'kind.virtual'),
    t(m < 0 ? 'kind.inverted' : 'kind.upright'),
    t(
      Math.abs(m) > 1 + 1e-12
        ? 'kind.larger'
        : Math.abs(m) < 1 - 1e-12
          ? 'kind.smaller'
          : 'kind.same',
    ),
  ].join(', ');
  return {
    outputs: {
      result: clean(find === 'image' ? i : find === 'focal' ? f : o),
      magnification: clean(m),
      kind,
      power: clean(1 / (f * M[unit])),
    },
    explain: { key: 'explain', values: { i: s(i), m: s(m), kind: kind.toLowerCase() } },
    steps: [
      find === 'image'
        ? { key: 'step.image', math: `d_i = ${s(f)} × ${s(o)} ÷ (${s(o)} − ${s(f)}) = ${s(i)}` }
        : find === 'focal'
          ? { key: 'step.focal', math: `f = ${s(o)} × ${s(i)} ÷ (${s(o)} + ${s(i)}) = ${s(f)}` }
          : { key: 'step.object', math: `d_o = ${s(f)} × ${s(i)} ÷ (${s(i)} − ${s(f)}) = ${s(o)}` },
      { key: 'step.m', math: `m = −${s(i)} ÷ ${s(o)} = ${s(m)}` },
    ],
    warnings: [],
  };
};
