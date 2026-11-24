import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { roundHalfUp } from '@/engine/money';
import { KJ_PER_KCAL, mifflin, readBody, schofield } from '../energy';

/**
 * Total daily energy requirement = PAL × BMR (FAO/WHO/UNU 2004, §5.3). The three lifestyles use
 * the PAL of the report's Table 5.1 example days (1.53, 1.76, 2.25), and the range shown spans the
 * Table 5.3 class (1.40–1.69, 1.70–1.99, 2.00–2.40). BMR by Mifflin–St Jeor or Schofield.
 */
export const PALS = {
  sedentary: { pal: 1.53, lo: 1.4, hi: 1.69 },
  active: { pal: 1.76, lo: 1.7, hi: 1.99 },
  vigorous: { pal: 2.25, lo: 2.0, hi: 2.4 },
} as const;

export const compute: ComputeFn = (inputs, { fmt }) => {
  const body = readBody(inputs);
  const activity = String(inputs.activity ?? 'sedentary');
  const preset = PALS[activity as keyof typeof PALS];
  const pal = preset ? preset.pal : typeof inputs.pal === 'number' ? inputs.pal : null;
  if (!body || pal === null || pal <= 0) {
    const none: ComputeResult = { outputs: { tdee: null }, steps: [], warnings: [] };
    return none;
  }
  const useSchofield = inputs.equation === 'schofield';
  const bmr = useSchofield ? schofield(body) : mifflin(body);
  const tdee = roundHalfUp(bmr * pal);
  const range = preset
    ? `${fmt.int(roundHalfUp(bmr * preset.lo))}–${fmt.int(roundHalfUp(bmr * preset.hi))} kcal`
    : null;
  const warnings: ComputeResult['warnings'] = [];
  if (pal > 2.4) warnings.push({ key: 'warn.highPal', level: 'info' });
  if (pal < 1.4) warnings.push({ key: 'warn.lowPal', level: 'info' });
  return {
    outputs: {
      tdee,
      range,
      kj: roundHalfUp(bmr * pal * KJ_PER_KCAL),
      bmr: roundHalfUp(bmr),
      palUsed: pal,
    },
    explain: {
      key: 'explain',
      values: { tdee: fmt.int(tdee), pal: fmt.num(pal, 2), bmr: fmt.int(roundHalfUp(bmr)) },
    },
    steps: [
      {
        key: useSchofield ? 'step.bmrSchofield' : 'step.bmrMifflin',
        math: `BMR = ${fmt.num(bmr, 2)} kcal/day`,
      },
      {
        key: 'step.pal',
        math: `${fmt.num(bmr, 2)} × ${fmt.num(pal, 2)} = ${fmt.num(bmr * pal, 2)} ≈ ${fmt.int(tdee)} kcal/day`,
      },
    ],
    warnings,
  };
};
