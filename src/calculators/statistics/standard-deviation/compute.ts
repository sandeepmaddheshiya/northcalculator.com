import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean } from '@/engine/money';
import { parseList, sum } from '@/calculators/math/average/compute';

/**
 * Sample and population standard deviation (OpenStax Introductory Statistics 2e §2.7):
 * s = √(Σ(x − x̄)² ÷ (n − 1)), σ = √(Σ(x − μ)² ÷ N). The mean is found first and the squared
 * deviations summed in a second pass (compensated summation), which keeps large values that differ
 * only in their last digits exact (NIST StRD NumAcc1). Standard error of the mean = s ÷ √n;
 * coefficient of variation = SD ÷ |mean| × 100.
 */
const MAX = 10000;

export const compute: ComputeFn = (inputs, { fmt }) => {
  const population = inputs.kind === 'population';
  const { values, bad } = parseList(
    typeof inputs.values === 'string' ? inputs.values : '',
    fmt.locale,
  );
  const warnings: ComputeResult['warnings'] = [];
  if (bad.length)
    warnings.push({
      key: 'warn.ignored',
      values: { list: bad.slice(0, 5).join(', '), n: bad.length },
      level: 'info',
    });
  if (values.length > MAX)
    warnings.push({ key: 'warn.tooMany', values: { max: MAX }, level: 'warn' });
  const xs = values.slice(0, MAX);
  const n = xs.length;
  const need = population ? 1 : 2;
  if (n < need) {
    const empty: ComputeResult = {
      outputs: { sd: null },
      steps: [],
      warnings: [...warnings, { key: population ? 'warn.empty' : 'warn.one', level: 'warn' }],
    };
    return empty;
  }

  const mean = sum(xs) / n;
  const ss = sum(xs.map((x) => (x - mean) ** 2));
  const variance = ss / (population ? n : n - 1);
  const sd = Math.sqrt(variance);
  const other = n > 1 ? Math.sqrt(ss / (population ? n - 1 : n)) : null;
  const s = (x: number) => fmt.sig(clean(x), 10);
  const sampleSd = n > 1 ? Math.sqrt(ss / (n - 1)) : null;

  return {
    outputs: {
      sd: clean(sd),
      variance: clean(variance),
      mean: clean(mean),
      count: n,
      ss: clean(ss),
      other: other === null ? null : clean(other),
      se: sampleSd === null ? null : clean(sampleSd / Math.sqrt(n)),
      cv: mean === 0 ? null : clean((sd / Math.abs(mean)) * 100),
    },
    explain: {
      key: population ? 'explain.population' : 'explain.sample',
      values: { sd: s(sd), mean: s(mean), n },
    },
    steps: [
      { key: 'step.mean', math: `${s(sum(xs))} ÷ ${n} = ${s(mean)}` },
      { key: 'step.ss', math: `Σ (x − ${s(mean)})² = ${s(ss)}` },
      {
        key: population ? 'step.varPop' : 'step.varSample',
        math: `${s(ss)} ÷ ${population ? n : n - 1} = ${s(variance)}`,
      },
      { key: 'step.sd', math: `√${s(variance)} = ${s(sd)}` },
    ],
    warnings,
  };
};
