import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { roundTo } from '@/engine/money';

/**
 * Volume = length × width × thickness (slab) or π × (diameter ÷ 2)² × depth (round column or post
 * hole), times the number of pours, plus an optional waste allowance. Imperial: feet and inches,
 * reported in cubic yards (27 ft³, PennDOT LTAP Tech Sheet #143), with an order quantity rounded up
 * to the next ¼ yd³. Metric: metres and centimetres, reported in m³ with the order rounded up to the
 * next 0.1 m³. Conversions use NIST SP 811 (1 ft = 0.3048 m exactly).
 */
const FT3_M3 = 0.3048 ** 3;

export const compute: ComputeFn = (inputs, { fmt }) => {
  const val = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const metric = inputs.units === 'metric';
  const round = inputs.shape === 'round';
  const none = (key?: string): ComputeResult => ({
    outputs: { result: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  const n = Math.max(1, Math.round(val('count') ?? 1));
  const waste = val('waste') ?? 0;
  // Long dimensions in ft or m; short ones (thickness, diameter) in inches or cm.
  const short = metric ? 100 : 12;
  let each: number; // in ft³ or m³
  if (round) {
    const d = val('diameter');
    const h = val('depth');
    if (d === null || h === null) return none();
    each = Math.PI * (d / short / 2) ** 2 * h;
  } else {
    const l = val('length');
    const w = val('width');
    const t = val('thickness');
    if (l === null || w === null || t === null) return none();
    each = l * w * (t / short);
  }
  if (!(each > 0)) return none('warn.zero');
  const native = each * n * (1 + waste / 100);
  const ft3 = metric ? native / FT3_M3 : native;
  const m3 = metric ? native : native * FT3_M3;
  const yd3 = ft3 / 27;
  const result = metric ? m3 : yd3;
  const step = metric ? 0.1 : 0.25;
  const order = roundTo(Math.ceil(roundTo(result / step, 9)) * step, 2);
  const u = metric ? 'm³' : 'ft³';
  return {
    outputs: {
      result: roundTo(result, 6),
      order,
      yd3: roundTo(yd3, 6),
      ft3: roundTo(ft3, 6),
      m3: roundTo(m3, 6),
    },
    explain: {
      key: metric ? 'explain.metric' : 'explain.imperial',
      values: { v: fmt.num(roundTo(result, 2), 2), order: fmt.num(order, 2), n },
    },
    steps: [
      {
        key: round ? 'step.round' : 'step.slab',
        math: round
          ? `π × (${fmt.num(val('diameter')!, 4)} ÷ ${short} ÷ 2)² × ${fmt.num(val('depth')!, 4)} = ${fmt.num(roundTo(each, 4), 4)} ${u}`
          : `${fmt.num(val('length')!, 4)} × ${fmt.num(val('width')!, 4)} × (${fmt.num(val('thickness')!, 4)} ÷ ${short}) = ${fmt.num(roundTo(each, 4), 4)} ${u}`,
      },
      ...(n > 1 || waste > 0
        ? [
            {
              key: 'step.total',
              math: `${fmt.num(roundTo(each, 4), 4)} × ${n} × ${fmt.num(1 + waste / 100, 4)} = ${fmt.num(roundTo(native, 4), 4)} ${u}`,
            },
          ]
        : []),
      ...(metric
        ? []
        : [
            {
              key: 'step.yards',
              math: `${fmt.num(roundTo(ft3, 4), 4)} ÷ 27 = ${fmt.num(roundTo(yd3, 4), 4)} yd³`,
            },
          ]),
    ],
    warnings: [],
  };
};
