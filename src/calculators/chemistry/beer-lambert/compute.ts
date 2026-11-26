import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean } from '@/engine/money';

/**
 * Beer–Lambert law (Harvey, Analytical Chemistry 2.1 §10.2, Eqs. 10.1, 10.2, 10.5; Clark,
 * LibreTexts “The Beer-Lambert Law”): A = εbC, A = −log₁₀ T, %T = 100T. Solves for absorbance,
 * concentration or molar absorptivity ε (L mol⁻¹ cm⁻¹); path length b in cm.
 */
const UNIT: Record<string, number> = { M: 1, mM: 1e-3, uM: 1e-6 };

export const compute: ComputeFn = (inputs, { fmt }) => {
  const num = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const none = (key?: string): ComputeResult => ({
    outputs: { result: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  const find = inputs.find === 'a' || inputs.find === 'e' ? inputs.find : 'c';
  const u = UNIT[String(inputs.cu)] ? String(inputs.cu) : 'M';
  const s = (x: number) => fmt.sig(clean(x), 6);
  const b = num('path');
  if (b === null) return none();
  if (!(b > 0)) return none('warn.path');

  let A: number;
  const steps: ComputeResult['steps'] = [];
  if (find === 'a') {
    const e = num('eps');
    const c = num('conc');
    if (e === null || c === null) return none();
    if (!(e > 0)) return none('warn.eps');
    if (!(c >= 0)) return none('warn.conc');
    A = e * b * c * UNIT[u]!;
    steps.push({ key: 'step.a', math: `A = ${s(e)} × ${s(b)} × ${s(c * UNIT[u]!)} = ${s(A)}` });
  } else {
    const r = num('reading');
    if (r === null) return none();
    if (inputs.measure === 'T') {
      if (!(r > 0 && r <= 100)) return none('warn.t');
      A = Math.log10(100 / r);
      steps.push({ key: 'step.fromT', math: `A = log(100 ÷ ${s(r)}) = ${s(A)}` });
    } else {
      if (!(r >= 0)) return none('warn.a');
      A = r;
    }
  }

  const T = 10 ** -A;
  let result: number;
  let molar: number;
  if (find === 'a') {
    result = A;
    molar = num('conc')! * UNIT[u]!;
  } else if (find === 'c') {
    const e = num('eps');
    if (e === null) return none();
    if (!(e > 0)) return none('warn.eps');
    molar = A / (e * b);
    result = molar / UNIT[u]!;
    steps.push({ key: 'step.c', math: `c = ${s(A)} ÷ (${s(e)} × ${s(b)}) = ${s(molar)} mol/L` });
  } else {
    const c = num('conc');
    if (c === null) return none();
    if (!(c > 0)) return none('warn.conc');
    molar = c * UNIT[u]!;
    result = A / (b * molar);
    steps.push({ key: 'step.e', math: `ε = ${s(A)} ÷ (${s(b)} × ${s(molar)}) = ${s(result)}` });
  }
  steps.push({ key: 'step.t', math: `T = 10^−${s(A)} = ${s(T * 100)}%` });

  return {
    outputs: {
      result: clean(result),
      a: clean(A),
      t: clean(T * 100),
      absorbed: clean((1 - T) * 100),
      molar: clean(molar),
    },
    explain: {
      key: `explain.${find}`,
      values: { r: s(result), u: inputs.cu === 'uM' ? 'µM' : u, t: s(T * 100) },
    },
    steps,
    warnings: [],
  };
};
