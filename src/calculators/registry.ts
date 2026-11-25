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
import { breakEven } from './finance/break-even';
import { timeZone } from './date-time/time-zone';
import { inflation } from './finance/inflation';
import { caloriesBurned } from './health/calories-burned';
import { debtPayoff } from './finance/debt-payoff';
import { area } from './geometry/area';
import { circle } from './geometry/circle';
import { pythagorean } from './geometry/pythagorean';
import { volume } from './geometry/volume';
import { combinations } from './statistics/combinations';
import { zScore } from './statistics/z-score';
import { probability } from './statistics/probability';
import { speedDistanceTime } from './physics/speed-distance-time';
import { kineticEnergy } from './physics/kinetic-energy';
import { ohmsLaw } from './electronics/ohms-law';
import { electricityCost } from './electronics/electricity-cost';
import { molarMass } from './chemistry/molar-mass';
import { concrete } from './construction/concrete';
import { quadratic } from './math/quadratic';
import { triangle } from './geometry/triangle';
import { slope } from './math/slope';
import { dilution } from './chemistry/dilution';
import { confidenceInterval } from './statistics/confidence-interval';
import { density } from './physics/density';
import { resistors } from './electronics/resistors';
import { trigonometry } from './math/trigonometry';
import { idealGas } from './chemistry/ideal-gas';
import { force } from './physics/force';
import { freeFall } from './physics/free-fall';
import { sampleSize } from './statistics/sample-size';
import { ph } from './chemistry/ph';
import { percentYield } from './chemistry/percent-yield';
import { projectile } from './physics/projectile';
import { linearRegression } from './statistics/linear-regression';
import { boardFeet } from './construction/board-feet';
import { rcTimeConstant } from './electronics/rc-time-constant';
import { workPower } from './physics/work-power';
import { wave } from './physics/wave';
import { vat } from './finance/vat';
import { momentum } from './physics/momentum';
import { pressure } from './physics/pressure';
import { hookesLaw } from './physics/hookes-law';
import { binomial } from './statistics/binomial';
import { specificHeat } from './physics/specific-heat';
import { halfLife } from './chemistry/half-life';
import { gravitation } from './physics/gravitation';
import { poisson } from './statistics/poisson';
import { pendulum } from './physics/pendulum';
import { centripetal } from './physics/centripetal';
import { thinLens } from './physics/thin-lens';
import { capacitor } from './electronics/capacitor';
import { voltageDivider } from './electronics/voltage-divider';
import { arcSector } from './geometry/arc-sector';
import { surfaceArea } from './geometry/surface-area';
import { combinedGas } from './chemistry/combined-gas';
import { linearSystem } from './math/linear-system';
import { doppler } from './physics/doppler';
import { buoyancy } from './physics/buoyancy';
import { primeFactorization } from './math/prime-factorization';
import { percentile } from './statistics/percentile';
import { coulomb } from './electronics/coulomb';
import { torque } from './physics/torque';
import { npv } from './finance/npv';
import { expectedValue } from './statistics/expected-value';
import { molarity } from './chemistry/molarity';
import { standardDeviation } from './statistics/standard-deviation';
import { depreciation } from './finance/depreciation';
import { potentialEnergy } from './physics/potential-energy';
import { percentComposition } from './chemistry/percent-composition';
import { acceleration } from './physics/acceleration';
import { reactance } from './electronics/reactance';
import { empiricalFormula } from './chemistry/empirical-formula';
import { refraction } from './physics/refraction';
import { impedance } from './electronics/impedance';
import { tTest } from './statistics/t-test';
import { orbit } from './physics/orbit';
import { buffer } from './chemistry/buffer';
import { twoSampleTTest } from './statistics/two-sample-t-test';
import { collision } from './physics/collision';
import { gibbs } from './chemistry/gibbs';
import { stairs } from './construction/stairs';

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
  breakEven,
  inflation,
  debtPayoff,
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
  caloriesBurned,
  runningPace,
  age,
  dateDifference,
  dateAdd,
  daysUntil,
  time,
  timeDuration,
  hoursWorked,
  timeZone,
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
  area,
  circle,
  pythagorean,
  volume,
  combinations,
  zScore,
  probability,
  speedDistanceTime,
  kineticEnergy,
  ohmsLaw,
  electricityCost,
  molarMass,
  concrete,
  quadratic,
  triangle,
  slope,
  dilution,
  confidenceInterval,
  density,
  resistors,
  trigonometry,
  idealGas,
  force,
  freeFall,
  sampleSize,
  ph,
  percentYield,
  projectile,
  linearRegression,
  boardFeet,
  rcTimeConstant,
  workPower,
  wave,
  vat,
  momentum,
  pressure,
  hookesLaw,
  binomial,
  specificHeat,
  halfLife,
  gravitation,
  poisson,
  pendulum,
  centripetal,
  thinLens,
  capacitor,
  voltageDivider,
  arcSector,
  surfaceArea,
  combinedGas,
  linearSystem,
  doppler,
  buoyancy,
  primeFactorization,
  percentile,
  coulomb,
  torque,
  npv,
  expectedValue,
  molarity,
  standardDeviation,
  depreciation,
  potentialEnergy,
  percentComposition,
  acceleration,
  reactance,
  empiricalFormula,
  refraction,
  impedance,
  tTest,
  orbit,
  buffer,
  twoSampleTTest,
  collision,
  gibbs,
  stairs,
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
