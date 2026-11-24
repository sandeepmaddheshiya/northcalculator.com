import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { roundHalfUp } from '@/engine/money';
import { ACTIVITIES } from './definition';

/**
 * Energy spent in an activity from its MET value (2024 Adult Compendium of Physical Activities):
 * one MET is defined as 1 kcal per kg of body weight per hour, so
 *   kcal = MET × weight (kg) × hours.
 * "Net" calories subtract the 1 MET you would burn at rest anyway. Rounded to whole kcal.
 */
const LB = 0.45359237;

export const compute: ComputeFn = (inputs, { fmt }) => {
  const minutes = typeof inputs.minutes === 'number' ? inputs.minutes : null;
  const w = typeof inputs.weight === 'number' ? inputs.weight : null;
  const act = String(inputs.activity ?? '17190');
  const met =
    act === 'custom'
      ? typeof inputs.met === 'number'
        ? inputs.met
        : null
      : (ACTIVITIES.find(([c]) => c === act)?.[1] ?? null);
  if (minutes === null || w === null || met === null || minutes <= 0 || w <= 0) {
    const none: ComputeResult = { outputs: { kcal: null }, steps: [], warnings: [] };
    return none;
  }
  const kg = inputs.unit === 'lb' ? w * LB : w;
  const hours = minutes / 60;
  const kcal = met * kg * hours;
  return {
    outputs: {
      kcal: roundHalfUp(kcal),
      net: roundHalfUp(Math.max(0, met - 1) * kg * hours),
      perHour: roundHalfUp(met * kg),
      metUsed: met,
    },
    explain: {
      key: 'explain',
      values: { kcal: fmt.int(roundHalfUp(kcal)), min: fmt.num(minutes, 1), met: fmt.num(met, 1) },
    },
    steps: [
      ...(inputs.unit === 'lb'
        ? [{ key: 'step.kg', math: `${fmt.num(w, 2)} lb × 0.45359237 = ${fmt.num(kg, 2)} kg` }]
        : []),
      {
        key: 'step.kcal',
        math: `${fmt.num(met, 1)} × ${fmt.num(kg, 2)} kg × ${fmt.num(hours, 4)} h = ${fmt.num(kcal, 1)} kcal`,
      },
    ],
    warnings: [{ key: 'warn.estimate', level: 'info' }],
  };
};
