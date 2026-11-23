import { clean } from '@/engine/money';
import type { ComputeFn, ComputeResult } from '@/calculators/types';
import type { PercentMode } from './definition';

/**
 * Percentage calculations (NIST SP 811 §7.10.2: % means 0.01). No intermediate rounding;
 * the result is cleaned to 12 significant digits to remove binary noise.
 */
export const compute: ComputeFn = (inputs, { fmt }) => {
  const mode = inputs.mode as PercentMode;
  const a = typeof inputs.a === 'number' ? inputs.a : null;
  const b = typeof inputs.b === 'number' ? inputs.b : null;
  const none = (key?: string): ComputeResult => ({
    outputs: { result: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  if (a === null || b === null) return none();
  const n = (x: number) => fmt.num(clean(x), 6);

  switch (mode) {
    case 'of': {
      const r = clean((a / 100) * b);
      return {
        outputs: { result: r },
        explain: { key: 'explain.of', values: { a: n(a), b: n(b), r: n(r) } },
        steps: [
          { key: 'step.toDecimal', values: { a: n(a) }, math: `${n(a)} ÷ 100 = ${n(a / 100)}` },
          { key: 'step.multiply', values: { b: n(b) }, math: `${n(a / 100)} × ${n(b)} = ${n(r)}` },
        ],
        warnings: [],
      };
    }
    case 'is': {
      if (b === 0) return none('warn.zeroWhole');
      const r = clean((a / b) * 100);
      return {
        outputs: { result: r },
        explain: { key: 'explain.is', values: { a: n(a), b: n(b), r: n(r) } },
        steps: [
          {
            key: 'step.divide',
            values: { a: n(a), b: n(b) },
            math: `${n(a)} ÷ ${n(b)} = ${n(a / b)}`,
          },
          { key: 'step.toPercent', math: `${n(a / b)} × 100 = ${n(r)}%` },
        ],
        warnings: [],
      };
    }
    case 'whole': {
      if (b === 0) return none('warn.zeroPercent');
      const r = clean((a * 100) / b);
      return {
        outputs: { result: r },
        explain: { key: 'explain.whole', values: { a: n(a), b: n(b), r: n(r) } },
        steps: [
          { key: 'step.toDecimal', values: { a: n(b) }, math: `${n(b)} ÷ 100 = ${n(b / 100)}` },
          { key: 'step.divideBy', values: { a: n(a) }, math: `${n(a)} ÷ ${n(b / 100)} = ${n(r)}` },
        ],
        warnings: [],
      };
    }
    case 'change': {
      if (a === 0) return none('warn.zeroStart');
      const diff = b - a;
      const r = clean((diff / Math.abs(a)) * 100);
      return {
        outputs: { result: r },
        explain: {
          key: r >= 0 ? 'explain.increase' : 'explain.decrease',
          values: { a: n(a), b: n(b), r: n(Math.abs(r)) },
        },
        steps: [
          { key: 'step.difference', math: `${n(b)} − ${n(a)} = ${n(diff)}` },
          {
            key: 'step.divideStart',
            values: { a: n(a) },
            math: `${n(diff)} ÷ ${n(Math.abs(a))} = ${n(diff / Math.abs(a))}`,
          },
          { key: 'step.toPercent', math: `${n(diff / Math.abs(a))} × 100 = ${n(r)}%` },
        ],
        warnings: a < 0 ? [{ key: 'warn.negativeStart', level: 'info' }] : [],
      };
    }
    case 'diff': {
      const mean = (a + b) / 2;
      if (mean === 0) return none('warn.zeroMean');
      const r = clean((Math.abs(a - b) / Math.abs(mean)) * 100);
      return {
        outputs: { result: r },
        explain: { key: 'explain.diff', values: { a: n(a), b: n(b), r: n(r) } },
        steps: [
          { key: 'step.absDifference', math: `|${n(a)} − ${n(b)}| = ${n(Math.abs(a - b))}` },
          { key: 'step.mean', math: `(${n(a)} + ${n(b)}) ÷ 2 = ${n(mean)}` },
          {
            key: 'step.divideMean',
            math: `${n(Math.abs(a - b))} ÷ ${n(Math.abs(mean))} × 100 = ${n(r)}%`,
          },
        ],
        warnings: a < 0 || b < 0 ? [{ key: 'warn.negativeDiff', level: 'info' }] : [],
      };
    }
    case 'increase':
    case 'decrease': {
      const sign = mode === 'increase' ? 1 : -1;
      const factor = 1 + (sign * b) / 100;
      const r = clean(a * factor);
      return {
        outputs: { result: r },
        explain: { key: `explain.${mode}By`, values: { a: n(a), b: n(b), r: n(r) } },
        steps: [
          {
            key: `step.factor.${mode}`,
            values: { b: n(b) },
            math: `1 ${sign > 0 ? '+' : '−'} ${n(b)} ÷ 100 = ${n(factor)}`,
          },
          {
            key: 'step.multiply',
            values: { b: n(factor) },
            math: `${n(a)} × ${n(factor)} = ${n(r)}`,
          },
        ],
        warnings: mode === 'decrease' && b > 100 ? [{ key: 'warn.over100', level: 'info' }] : [],
      };
    }
    case 'original': {
      const factor = 1 + b / 100;
      if (factor === 0) return none('warn.minus100');
      const r = clean(a / factor);
      return {
        outputs: { result: r },
        explain: { key: 'explain.original', values: { a: n(a), b: n(b), r: n(r) } },
        steps: [
          {
            key: 'step.factor.original',
            values: { b: n(b) },
            math: `1 + (${n(b)}) ÷ 100 = ${n(factor)}`,
          },
          { key: 'step.divideFactor', math: `${n(a)} ÷ ${n(factor)} = ${n(r)}` },
        ],
        warnings: [],
      };
    }
  }
  return none();
};
