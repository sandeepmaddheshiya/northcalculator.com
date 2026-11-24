import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { roundHalfUp } from '@/engine/money';
import { KJ_PER_KCAL, mifflin, readBody, schofield } from '../energy';

/**
 * Basal metabolic rate (resting energy expenditure), kcal/day, by Mifflin–St Jeor (default) or
 * Schofield/FAO–WHO–UNU (see ../energy.ts for the equations and sources). Rounded to whole kcal;
 * kJ = kcal × 4.184 (thermochemical calorie).
 */
export const compute: ComputeFn = (inputs, { fmt }) => {
  const body = readBody(inputs);
  if (!body) {
    const none: ComputeResult = { outputs: { bmr: null }, steps: [], warnings: [] };
    return none;
  }
  const useSchofield = inputs.equation === 'schofield';
  const m = mifflin(body);
  const s = schofield(body);
  const raw = useSchofield ? s : m;
  const bmr = roundHalfUp(raw);
  const warnings: ComputeResult['warnings'] = [];
  if (!useSchofield && (body.age < 19 || body.age > 78))
    warnings.push({ key: 'warn.ageRange', level: 'info' });
  if (raw < 800) warnings.push({ key: 'warn.low', level: 'warn' });
  const n = (x: number, d = 2) => fmt.num(x, d);
  return {
    outputs: {
      bmr,
      kj: roundHalfUp(raw * KJ_PER_KCAL),
      perHour: Math.round((raw / 24) * 10) / 10,
      other: roundHalfUp(useSchofield ? m : s),
    },
    explain: {
      key: 'explain',
      values: { bmr: fmt.int(bmr), eq: useSchofield ? 'Schofield' : 'Mifflin–St Jeor' },
    },
    steps: useSchofield
      ? [{ key: 'step.schofield', math: `${n(body.kg)} kg → ${fmt.int(bmr)} kcal/day` }]
      : [
          {
            key: body.male ? 'step.mifflinMale' : 'step.mifflinFemale',
            math: `10 × ${n(body.kg)} + 6.25 × ${n(body.cm)} − 5 × ${fmt.int(body.age)} ${body.male ? '+ 5' : '− 161'} = ${n(m)}`,
          },
        ],
    warnings,
  };
};
