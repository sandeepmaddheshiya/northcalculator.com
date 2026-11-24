import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { roundHalfUp } from '@/engine/money';

/**
 * Maximum heart rate: 220 − age (American Heart Association) or 208 − 0.7 × age (Tanaka, Monahan
 * & Seals 2001). Target zones are percentages of the maximum: moderate 50–70%, vigorous 70–85%
 * (AHA). Beats per minute are rounded half-up, which reproduces the AHA chart.
 */
export const compute: ComputeFn = (inputs, { fmt }) => {
  const age = typeof inputs.age === 'number' ? inputs.age : null;
  if (age === null || age <= 0) {
    const none: ComputeResult = { outputs: { max: null }, steps: [], warnings: [] };
    return none;
  }
  const tanaka = inputs.formula === 'tanaka';
  const exact = tanaka ? 208 - 0.7 * age : 220 - age;
  const max = roundHalfUp(exact);
  const bpm = (p: number) => roundHalfUp((exact * p) / 100);
  const range = (a: number, b: number) => `${fmt.int(bpm(a))}–${fmt.int(bpm(b))} bpm`;
  const warnings: ComputeResult['warnings'] = [{ key: 'warn.medication', level: 'info' }];
  if (age < 18) warnings.push({ key: 'warn.young', level: 'info' });
  return {
    outputs: {
      max,
      moderate: range(50, 70),
      vigorous: range(70, 85),
      target: range(50, 85),
    },
    explain: {
      key: 'explain',
      values: { max: fmt.int(max), mod: range(50, 70), vig: range(70, 85) },
    },
    steps: [
      {
        key: tanaka ? 'step.tanaka' : 'step.aha',
        math: tanaka
          ? `208 − 0.7 × ${fmt.int(age)} = ${fmt.num(exact, 1)}`
          : `220 − ${fmt.int(age)} = ${fmt.int(exact)}`,
      },
      {
        key: 'step.percent',
        math: `${fmt.num(exact, 1)} × 0.50 = ${fmt.num(exact * 0.5, 2)} → ${fmt.int(bpm(50))}`,
      },
    ],
    table: {
      captionKey: 'table.caption',
      columns: [
        { key: 'table.pct', format: 'percent' },
        { key: 'table.bpm', format: 'integer' },
        { key: 'table.zone', format: 'text' },
      ],
      rows: [50, 60, 70, 80, 85, 90, 100].map((p) => [
        p,
        bpm(p),
        p < 50 ? '' : p < 70 ? 'zone.moderate' : p <= 85 ? 'zone.vigorous' : 'zone.above',
      ]),
    },
    warnings,
  };
};
