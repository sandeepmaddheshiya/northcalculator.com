import type { CalculatorInput, InputValues } from '@/calculators/types';

/**
 * Shared body inputs and resting-energy equations for the BMR and calorie calculators.
 *
 * Mifflin–St Jeor (Am J Clin Nutr 1990;51:241–7), simplified by sex as published in the abstract:
 *   men   REE = 10 W + 6.25 H − 5 A + 5
 *   women REE = 10 W + 6.25 H − 5 A − 161      (W kg, H cm, A years; kcal/day)
 * Schofield (1985), as adopted by FAO/WHO/UNU, Human Energy Requirements (2004), Table 5.2,
 * kcal/day from weight only, by sex and age band.
 * Imperial units use the international definitions 1 in = 2.54 cm, 1 lb = 0.45359237 kg.
 */
export const KJ_PER_KCAL = 4.184;
const LB = 0.45359237;

export function bodyInputs(): CalculatorInput[] {
  const metric = { input: 'system', in: ['metric'] } as const;
  const imperial = { input: 'system', in: ['imperial'] } as const;
  return [
    {
      id: 'system',
      param: 'u',
      type: 'segmented',
      labelKey: 'system',
      default: 'metric',
      options: [
        { value: 'metric', labelKey: 'system.metric' },
        { value: 'imperial', labelKey: 'system.imperial' },
      ],
    },
    {
      id: 'sex',
      param: 's',
      type: 'segmented',
      labelKey: 'sex',
      default: 'female',
      options: [
        { value: 'female', labelKey: 'sex.female' },
        { value: 'male', labelKey: 'sex.male' },
      ],
      helpKey: 'sex.help',
      sensitive: true,
    },
    {
      id: 'age',
      param: 'a',
      type: 'number',
      labelKey: 'age',
      default: 35,
      min: 18,
      max: 120,
      integer: true,
      sensitive: true,
    },
    {
      id: 'cm',
      param: 'h',
      type: 'number',
      labelKey: 'cm',
      suffixKey: 'unit.cm',
      default: 165,
      min: 100,
      max: 272,
      showIf: metric,
      sensitive: true,
    },
    {
      id: 'kg',
      param: 'w',
      type: 'number',
      labelKey: 'kg',
      suffixKey: 'unit.kg',
      default: 62,
      min: 25,
      max: 400,
      showIf: metric,
      sensitive: true,
    },
    {
      id: 'ft',
      param: 'ft',
      type: 'number',
      labelKey: 'ft',
      suffixKey: 'unit.ft',
      default: 5,
      min: 3,
      max: 8,
      integer: true,
      showIf: imperial,
      sensitive: true,
      row: { id: 'height', legendKey: 'height' },
    },
    {
      id: 'in',
      param: 'in',
      type: 'number',
      labelKey: 'in',
      suffixKey: 'unit.in',
      default: 5,
      min: 0,
      max: 11.99,
      showIf: imperial,
      sensitive: true,
      row: { id: 'height', legendKey: 'height' },
    },
    {
      id: 'lb',
      param: 'lb',
      type: 'number',
      labelKey: 'lb',
      suffixKey: 'unit.lb',
      default: 137,
      min: 55,
      max: 880,
      showIf: imperial,
      sensitive: true,
    },
  ];
}

export const BODY_UI = {
  system: 'Units',
  'system.metric': 'Metric (cm, kg)',
  'system.imperial': 'US (ft, in, lb)',
  sex: 'Sex',
  'sex.female': 'Female',
  'sex.male': 'Male',
  'sex.help':
    'The equations were fitted separately for men and women, based on sex recorded in the studies.',
  age: 'Age (years)',
  cm: 'Height',
  kg: 'Weight',
  height: 'Height',
  ft: 'Feet',
  in: 'Inches',
  lb: 'Weight',
  'unit.cm': 'cm',
  'unit.kg': 'kg',
  'unit.ft': 'ft',
  'unit.in': 'in',
  'unit.lb': 'lb',
} as const;

export interface Body {
  male: boolean;
  age: number;
  kg: number;
  cm: number;
}

export function readBody(inputs: InputValues): Body | null {
  const num = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const age = num('age');
  if (age === null) return null;
  let kg: number | null;
  let cm: number | null;
  if (inputs.system === 'imperial') {
    const ft = num('ft');
    const lb = num('lb');
    if (ft === null || lb === null) return null;
    cm = (ft * 12 + (num('in') ?? 0)) * 2.54;
    kg = lb * LB;
  } else {
    cm = num('cm');
    kg = num('kg');
  }
  if (kg === null || cm === null || kg <= 0 || cm <= 0) return null;
  return { male: inputs.sex === 'male', age, kg, cm };
}

export function mifflin({ male, age, kg, cm }: Body): number {
  return 10 * kg + 6.25 * cm - 5 * age + (male ? 5 : -161);
}

/** Schofield 1985 (FAO/WHO/UNU 2004 Table 5.2), adult bands, kcal/day. */
export function schofield({ male, age, kg }: Body): number {
  if (male)
    return age < 30 ? 15.057 * kg + 692.2 : age < 60 ? 11.472 * kg + 873.1 : 11.711 * kg + 587.7;
  return age < 30 ? 14.818 * kg + 486.6 : age < 60 ? 8.126 * kg + 845.6 : 9.082 * kg + 658.5;
}
