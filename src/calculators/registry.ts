import type { CalculatorDefinition } from './types';
import type { CalculatorModule } from './module';
import { CATEGORIES, type CategoryDefinition } from './categories';
import { mortgage } from './finance/mortgage';
import { loan } from './finance/loan';
import { compoundInterest } from './finance/compound-interest';
import { percentage } from './math/percentage';
import { bmi } from './health/bmi';
import { age } from './date-time/age';
import { gpa } from './education/gpa';
import { unitConverter } from './conversion/unit-converter';
import { currencyConverter } from './conversion/currency-converter';
import { scientific } from './math/scientific';
import { tip } from './everyday/tip';
import { discount } from './everyday/discount';
import { salesTax } from './finance/sales-tax';
import { simpleInterest } from './finance/simple-interest';
import { dateDifference } from './date-time/date-difference';
import { dateAdd } from './date-time/date-add';
import { fraction } from './math/fraction';
import { average } from './math/average';
import { lcmGcf } from './math/lcm-gcf';
import { cagr } from './finance/cagr';
import { margin } from './finance/margin';
import { salary } from './finance/salary';
import { grade } from './education/grade';
import { finalGrade } from './education/final-grade';
import { time } from './date-time/time';
import { percentageChange } from './math/percentage-change';
import { ratio } from './math/ratio';
import { rounding } from './math/rounding';
import { unitPrice } from './everyday/unit-price';
import { weekNumber } from './date-time/week-number';
import { businessDays } from './date-time/business-days';
import { percentDifference } from './math/percent-difference';
import { fuelCost } from './everyday/fuel-cost';
import { bmr } from './health/bmr';
import { calorie } from './health/calorie';
import { heartRate } from './health/heart-rate';
import { runningPace } from './health/running-pace';
import { exponent } from './math/exponent';
import { root } from './math/root';
import { logarithm } from './math/logarithm';
import { scientificNotation } from './math/scientific-notation';
import { roi } from './finance/roi';
import { savingsGoal } from './finance/savings-goal';
import { daysUntil } from './date-time/days-until';
import { randomNumber } from './math/random-number';
import { dice } from './math/dice';
import { autoLoan } from './finance/auto-loan';
import { dti } from './finance/dti';
import { testScore } from './education/test-score';
import { cgpa } from './education/cgpa';
import { billSplit } from './everyday/bill-split';
import { lengthConverter } from './conversion/length-converter';
import { weightConverter } from './conversion/weight-converter';
import { temperatureConverter } from './conversion/temperature-converter';
import { volumeConverter } from './conversion/volume-converter';
import { areaConverter } from './conversion/area-converter';
import { speedConverter } from './conversion/speed-converter';
import { pressureConverter } from './conversion/pressure-converter';
import { energyConverter } from './conversion/energy-converter';
import { dataConverter } from './conversion/data-converter';
import { fuelEconomyConverter } from './conversion/fuel-economy-converter';
import { powerConverter } from './conversion/power-converter';
import { timeConverter } from './conversion/time-converter';
import { percentGpa } from './education/percent-gpa';
import { hoursWorked } from './date-time/hours-worked';
import { timeDuration } from './date-time/time-duration';

/**
 * Central registry: one line per calculator module (each folder's index.ts).
 * Order here is the default order within a category. Each module also needs a client island
 * entry in islands.tsx (checked by the content gate).
 */
export const MODULES: readonly CalculatorModule[] = [
  mortgage,
  loan,
  autoLoan,
  dti,
  compoundInterest,
  simpleInterest,
  salesTax,
  salary,
  margin,
  cagr,
  roi,
  savingsGoal,
  percentage,
  percentageChange,
  percentDifference,
  fraction,
  ratio,
  rounding,
  exponent,
  root,
  logarithm,
  scientificNotation,
  randomNumber,
  dice,
  average,
  lcmGcf,
  scientific,
  bmi,
  bmr,
  calorie,
  heartRate,
  runningPace,
  age,
  dateDifference,
  dateAdd,
  daysUntil,
  time,
  timeDuration,
  hoursWorked,
  businessDays,
  weekNumber,
  unitConverter,
  lengthConverter,
  weightConverter,
  temperatureConverter,
  volumeConverter,
  areaConverter,
  speedConverter,
  pressureConverter,
  energyConverter,
  dataConverter,
  fuelEconomyConverter,
  powerConverter,
  timeConverter,
  currencyConverter,
  gpa,
  grade,
  finalGrade,
  testScore,
  cgpa,
  percentGpa,
  tip,
  billSplit,
  discount,
  unitPrice,
  fuelCost,
];

export const CALCULATORS: readonly CalculatorDefinition[] = MODULES.map((m) => m.definition);

export function getModule(id: string): CalculatorModule | undefined {
  return MODULES.find((m) => m.definition.id === id);
}

export function calculatorsFor(locale: string): CalculatorDefinition[] {
  return CALCULATORS.filter((c) => c.locales.includes(locale));
}

/** Categories that have at least one calculator in this locale. Empty hubs are never rendered (thin content). */
export function categoriesFor(locale: string): CategoryDefinition[] {
  const used = new Set(calculatorsFor(locale).map((c) => c.category));
  return CATEGORIES.filter((c) => used.has(c.key) && c.slug[locale]).sort(
    (a, b) => a.order - b.order,
  );
}
