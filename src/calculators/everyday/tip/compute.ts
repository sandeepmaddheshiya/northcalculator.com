import type { ComputeFn, ComputeResult, Step } from '@/calculators/types';
import { fromMinor, minorDigits, roundHalfUp, toMinor } from '@/engine/money';

/**
 * Tip = bill × percentage ÷ 100, rounded half-up to the smallest currency unit. Split evenly; with
 * "round up", each share is rounded up to a whole currency unit and the tip absorbs the difference.
 */
export const compute: ComputeFn = (inputs, { fmt }) => {
  const num = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const bill = num('bill');
  const pct = num('pct');
  const people = Math.max(1, Math.round(num('people') ?? 1));
  if (bill === null || pct === null) {
    const none: ComputeResult = { outputs: { tip: null }, steps: [], warnings: [] };
    return none;
  }
  const d = minorDigits(fmt.currency);
  const unit = 10 ** d; // minor units per whole currency unit
  const m = (x: number) => fromMinor(x, d);
  const billMinor = toMinor(bill, d);
  let tipMinor = roundHalfUp((billMinor * pct) / 100);
  let totalMinor = billMinor + tipMinor;
  let eachMinor = Math.ceil(totalMinor / people); // never short: any leftover cent goes to the shares
  const steps: Step[] = [
    {
      key: 'step.tip',
      math: `${fmt.money(bill)} × ${fmt.pct(pct, 2)} = ${fmt.money(m(tipMinor))}`,
    },
    {
      key: 'step.total',
      math: `${fmt.money(bill)} + ${fmt.money(m(tipMinor))} = ${fmt.money(m(totalMinor))}`,
    },
  ];
  if (inputs.round === 'up') {
    eachMinor = Math.ceil(totalMinor / people / unit) * unit;
    totalMinor = eachMinor * people;
    tipMinor = totalMinor - billMinor;
    steps.push({
      key: 'step.roundUp',
      math: `${fmt.money(m(eachMinor))} × ${fmt.int(people)} = ${fmt.money(m(totalMinor))}`,
    });
  } else if (people > 1) {
    steps.push({
      key: 'step.split',
      math: `${fmt.money(m(billMinor + roundHalfUp((billMinor * pct) / 100)))} ÷ ${fmt.int(people)} = ${fmt.money(m(eachMinor))}`,
    });
  }
  const split = people > 1;
  const effective = billMinor > 0 ? (tipMinor / billMinor) * 100 : null;
  return {
    outputs: {
      tip: m(tipMinor),
      total: m(totalMinor),
      each: split || inputs.round === 'up' ? m(eachMinor) : null,
      tipEach: split ? m(Math.round(tipMinor / people)) : null,
      effective: inputs.round === 'up' ? effective : null,
    },
    explain: {
      key: split ? 'explain.split' : 'explain',
      values: {
        tip: fmt.money(m(tipMinor)),
        total: fmt.money(m(totalMinor)),
        each: fmt.money(m(eachMinor)),
        n: fmt.int(people),
      },
    },
    steps,
    warnings: pct > 30 ? [{ key: 'warn.high', level: 'info' }] : [],
  };
};
