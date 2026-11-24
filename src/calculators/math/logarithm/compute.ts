import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean } from '@/engine/money';

/**
 * log_b x, defined by y = log_b x ⇔ bʸ = x (OpenStax Intermediate Algebra 2e §10.3), computed
 * with the change-of-base formula log_b x = ln x ÷ ln b (§10.4). x > 0; b > 0 and b ≠ 1.
 * Results keep 12 significant digits, which removes floating-point noise such as
 * log₅ 25 = 2.0000000000000004.
 */
export const compute: ComputeFn = (inputs, { fmt }) => {
  const x = typeof inputs.x === 'number' ? inputs.x : null;
  const kind = String(inputs.baseKind ?? '10');
  const b =
    kind === 'e'
      ? Math.E
      : kind === '2'
        ? 2
        : kind === 'custom'
          ? typeof inputs.b === 'number'
            ? inputs.b
            : null
          : 10;
  const none = (key?: string): ComputeResult => ({
    outputs: { result: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  if (x === null || b === null) return none();
  if (x <= 0) return none('warn.x');
  if (b <= 0 || b === 1) return none('warn.base');
  const ln = Math.log(x);
  const exact =
    kind === '10'
      ? Math.log10(x)
      : kind === '2'
        ? Math.log2(x)
        : kind === 'e'
          ? ln
          : ln / Math.log(b);
  const result = clean(exact);
  const bText = kind === 'e' ? 'e' : fmt.num(b, 10);
  return {
    outputs: { result, ln: clean(ln), log10: clean(Math.log10(x)), log2: clean(Math.log2(x)) },
    explain: { key: 'explain', values: { b: bText, x: fmt.num(x, 10), r: fmt.sig(result, 12) } },
    steps: [
      ...(kind === 'custom'
        ? [
            {
              key: 'step.change',
              math: `ln ${fmt.num(x, 10)} ÷ ln ${bText} = ${fmt.sig(ln, 12)} ÷ ${fmt.sig(Math.log(b), 12)} = ${fmt.sig(result, 12)}`,
            },
          ]
        : []),
      {
        key: 'step.check',
        math: `${bText}^${fmt.sig(result, 12)} = ${fmt.sig(clean(b ** result), 12)}`,
      },
    ],
    warnings: x < 1 ? [{ key: 'warn.negative', level: 'info' }] : [],
  };
};
