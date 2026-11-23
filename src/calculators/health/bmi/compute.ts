import type { ComputeFn, ComputeResult, Step } from '@/calculators/types';
import { roundTo } from '@/engine/money';

/**
 * Body mass index = weight (kg) ÷ height (m)² (WHO). Imperial inputs are converted with the exact
 * international definitions (1 in = 0.0254 m, 1 lb = 0.45359237 kg) rather than the rounded 703
 * factor. The category is taken from the BMI rounded to one decimal, the value shown, so the
 * label always matches the number on screen.
 */
const LB = 0.45359237;
const IN = 0.0254;

export const WHO = [
  { max: 18.5, key: 'cat.under' },
  { max: 25, key: 'cat.normal' },
  { max: 30, key: 'cat.overweight' },
  { max: 35, key: 'cat.obese1' },
  { max: 40, key: 'cat.obese2' },
  { max: Infinity, key: 'cat.obese3' },
] as const;

/** WHO expert consultation (Lancet 2004): public health action points for Asian populations. */
export const ASIAN = [
  { max: 18.5, key: 'cat.under' },
  { max: 23, key: 'cat.asianLow' },
  { max: 27.5, key: 'cat.asian23' },
  { max: 32.5, key: 'cat.asian275' },
  { max: 37.5, key: 'cat.asian325' },
  { max: Infinity, key: 'cat.asian375' },
] as const;

export const compute: ComputeFn = (inputs, { fmt }) => {
  const num = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const imperial = inputs.system === 'imperial';
  const none = (key?: string): ComputeResult => ({
    outputs: { bmi: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });

  let m: number;
  let kg: number;
  const steps: Step[] = [];
  if (imperial) {
    const ft = num('ft');
    const inch = num('in') ?? 0;
    const lb = num('lb');
    if (ft === null || lb === null) return none();
    const totalIn = ft * 12 + inch;
    if (totalIn <= 0) return none();
    m = totalIn * IN;
    kg = lb * LB;
    steps.push({
      key: 'step.inches',
      math: `${fmt.int(ft)} × 12 + ${fmt.num(inch, 2)} = ${fmt.num(totalIn, 2)} in`,
    });
    steps.push({
      key: 'step.toMetric',
      math: `${fmt.num(totalIn, 2)} in × 0.0254 = ${fmt.num(m, 4)} m · ${fmt.num(lb, 1)} lb × 0.45359237 = ${fmt.num(kg, 3)} kg`,
    });
  } else {
    const cm = num('cm');
    const w = num('kg');
    if (cm === null || w === null || cm <= 0) return none();
    m = cm / 100;
    kg = w;
    steps.push({ key: 'step.meters', math: `${fmt.num(cm, 1)} ÷ 100 = ${fmt.num(m, 3)} m` });
  }
  const raw = kg / (m * m);
  const bmi = roundTo(raw, 1);
  steps.push({
    key: 'step.bmi',
    math: `${fmt.num(kg, 3)} ÷ ${fmt.num(m, 4)}² = ${fmt.num(kg, 3)} ÷ ${fmt.num(m * m, 4)} = ${fmt.num(bmi, 1)}`,
  });
  if (imperial)
    steps.push({
      key: 'step.703',
      math: `703 × ${fmt.num(num('lb')!, 1)} ÷ ${fmt.num(m / IN, 2)}² = ${fmt.num(roundTo((703 * num('lb')!) / (m / IN) ** 2, 1), 1)}`,
    });

  const asian = inputs.cutoffs === 'asian';
  const scale = asian ? ASIAN : WHO;
  const category = scale.find((c) => bmi < c.max)!.key;

  // Healthy range for this height: BMI 18.5 up to the weight that still rounds below 25 (WHO) or
  // below the first Asian action point, 23.0.
  const upper = asian ? 23 : 25;
  const toUnit = (k: number) => (imperial ? k / LB : k);
  const unit = imperial ? 'lb' : 'kg';
  const lo = 18.5 * m * m;
  const hi = (upper - 0.05) * m * m;
  const range = `${fmt.num(toUnit(lo), 1)}–${fmt.num(toUnit(hi), 1)} ${unit}`;
  let change: string | null = null;
  if (kg < lo) change = `+${fmt.num(toUnit(lo - kg), 1)} ${unit}`;
  else if (kg > hi) change = `−${fmt.num(toUnit(kg - hi), 1)} ${unit}`;
  steps.push({
    key: 'step.range',
    values: { upper: fmt.num(upper, 1) },
    math: `18.5 × ${fmt.num(m * m, 4)} = ${fmt.num(lo, 1)} kg · ${fmt.num(upper - 0.05, 2)} × ${fmt.num(m * m, 4)} = ${fmt.num(hi, 1)} kg`,
  });

  const warnings: ComputeResult['warnings'] = [];
  const age = num('age');
  if (age !== null && age < 20) warnings.push({ key: 'warn.child', level: 'warn' });
  if (bmi < 16 || bmi >= 40) warnings.push({ key: 'warn.extreme', level: 'warn' });

  const tableRows = scale.map((c, idx) => {
    const min = idx === 0 ? 0 : scale[idx - 1]!.max;
    const bmiRange =
      idx === 0
        ? `< ${fmt.num(c.max, 1)}`
        : c.max === Infinity
          ? `≥ ${fmt.num(min, 1)}`
          : `${fmt.num(min, 1)}–${fmt.num(c.max - 0.1, 1)}`;
    const wLo = toUnit(min * m * m);
    const wHi = toUnit((c.max - 0.05) * m * m);
    const wRange =
      idx === 0
        ? `< ${fmt.num(toUnit(c.max * m * m), 1)} ${unit}`
        : c.max === Infinity
          ? `≥ ${fmt.num(wLo, 1)} ${unit}`
          : `${fmt.num(wLo, 1)}–${fmt.num(wHi, 1)} ${unit}`;
    return [c.key, bmiRange, wRange] as const;
  });

  return {
    outputs: { bmi, category, range, change, prime: roundTo(bmi / 25, 2) },
    explain: { key: asian ? 'explain.asian' : 'explain', values: { bmi: fmt.num(bmi, 1), range } },
    steps,
    table: {
      captionKey: 'table.caption',
      columns: [
        { key: 'table.category', format: 'text' },
        { key: 'table.bmi', format: 'text' },
        { key: 'table.weight', format: 'text' },
      ],
      rows: tableRows,
    },
    warnings,
  };
};
