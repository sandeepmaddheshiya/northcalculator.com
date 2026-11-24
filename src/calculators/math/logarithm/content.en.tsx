import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'result') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Logarithm Calculator',
  promise: 'Logarithms in base 10, base e, base 2 or any base you choose.',
  title: 'Log Calculator: Logarithm in Base 10, e (ln), 2 or Any Base',
  description:
    'Calculate the logarithm of a number in base 10, the natural log (ln), log base 2 or any custom base, with the change-of-base working shown and a check.',
  summary:
    'A logarithm answers the question “what power do I raise the base to, to get this number?” log₁₀ 1000 = 3 because 10³ = 1000. The common logarithm uses base 10, the natural logarithm (ln) uses e ≈ 2.71828, and computer science often uses base 2. Any base can be computed from natural logs with the change-of-base formula.',
  synonyms: [
    'log calculator',
    'natural log calculator',
    'ln calculator',
    'log base 2 calculator',
    'change of base calculator',
    'antilog',
  ],
  ui: {
    x: 'Number (x)',
    baseKind: 'Base',
    'baseKind.10': '10 (log)',
    'baseKind.e': 'e (ln)',
    'baseKind.2': '2',
    'baseKind.custom': 'Other',
    b: 'Base (b)',
    'out.result': 'Logarithm',
    'out.ln': 'Natural log, ln x',
    'out.log10': 'Common log, log₁₀ x',
    'out.log2': 'Binary log, log₂ x',
    explain: 'log base {b} of {x} is {r}: raising {b} to that power gives {x}.',
    'step.change': 'Change of base: divide the natural log of x by the natural log of the base.',
    'step.check': 'Check by raising the base to the result.',
    'warn.x': 'Logarithms are only defined for numbers greater than zero.',
    'warn.base': 'The base must be positive and not equal to 1.',
    'warn.negative': 'For numbers between 0 and 1 the logarithm is negative (with a base above 1).',
    rounding: 'Computed in double precision and shown to 12 significant digits.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Definition">{'y = log_b x   ⇔   bʸ = x      (x > 0, b > 0, b ≠ 1)'}</Formula>
      <p>
        Evaluating a logarithm means finding an exponent. OpenStax <em>Intermediate Algebra</em>{' '}
        works examples like log₅ 25 = 2 because 5² = 25, log₉ 3 = 1/2 because 9^(1/2) = 3, and log₂
        (1/16) = −4 because 2⁻⁴ = 1/16.
      </p>
      <Formula label="Change of base">{'log_b x = ln x ÷ ln b = log₁₀ x ÷ log₁₀ b'}</Formula>
      <p>
        Calculators only have keys for log (base 10) and ln (base e), so other bases are computed by
        change of base, which is what this calculator does too.
      </p>
      <Formula label="Useful properties">
        {
          'log_b (MN) = log_b M + log_b N\nlog_b (M/N) = log_b M − log_b N\nlog_b (Mᵖ) = p × log_b M'
        }
      </Formula>
    </>
  ),
  examples: [
    {
      id: 'common',
      title: 'log 1000',
      body: (r) => (
        <p>
          1000 = 10³, so log₁₀ 1000 = <strong>{o(r)}</strong>. Base-10 logarithms count powers of
          ten, which is why they are used for scales like decibels and the Richter scale.
        </p>
      ),
    },
    {
      id: 'custom',
      title: 'log base 5 of 25',
      body: (r, fmt) => (
        <p>
          Choose Other and enter 5. Change of base gives ln 25 ÷ ln 5 = 3.2189 ÷ 1.6094 ={' '}
          <strong>{fmt.sig(o(r), 12)}</strong>, matching OpenStax’s Example 10.21. A raw computer
          division gives 2.0000000000000004; the calculator trims that floating-point noise.
        </p>
      ),
    },
    {
      id: 'doubling',
      title: 'How many years to double at 7% a year?',
      body: (r, fmt) => (
        <p>
          Money growing 7% a year is multiplied by 1.07ᵗ. It doubles when 1.07ᵗ = 2, so t = log base
          1.07 of 2 = <strong>{fmt.sig(o(r), 6)} years</strong>. The rule of 72 estimates 72 ÷ 7 ≈
          10.3.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>“log” can mean different bases.</strong> In school maths and engineering log means
        base 10; in many programming languages and higher maths it means the natural log. Check the
        convention before using a result.
      </li>
      <li>
        <strong>Antilog is the reverse.</strong> If log x = 2.5, then x = 10^2.5 ≈ 316.2. Use the
        exponent calculator for antilogs.
      </li>
      <li>
        <strong>Logs turn multiplication into addition.</strong> That is why they appear in
        decibels, pH and earthquake magnitudes: each step of 1 multiplies the quantity by the base.
      </li>
      <li>
        <strong>No logarithm of zero or negatives.</strong> No power of a positive base is zero or
        negative, so log x is undefined for x ≤ 0.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'What is the difference between log and ln?',
      a: 'log usually means the common logarithm, base 10, and ln is the natural logarithm, base e ≈ 2.71828. They differ by a constant factor: ln x = log x × ln 10 ≈ 2.302585 × log x. So log 100 = 2 while ln 100 ≈ 4.60517.',
    },
    {
      q: 'How do I calculate log base 2?',
      a: 'Divide the natural log (or common log) of the number by that of 2. log₂ 1024 = ln 1024 ÷ ln 2 = 10, because 2¹⁰ = 1024. Choose base 2 in the calculator to get it directly; it is used for bits, binary trees and halving problems.',
    },
    {
      q: 'Why is the log of 1 equal to 0 in every base?',
      a: 'Any non-zero base raised to the power 0 equals 1, so the exponent that turns the base into 1 is always 0. Similarly log_b b = 1, because b¹ = b, whatever the base is.',
    },
    {
      q: 'Can a logarithm be negative?',
      a: 'Yes. With a base above 1, numbers between 0 and 1 have negative logarithms: log 0.01 = −2 because 10⁻² = 0.01. What cannot happen is taking the logarithm of zero or of a negative number.',
    },
  ],
  ogSample: (r) => `log 1000 = ${o(r)}`,
};
