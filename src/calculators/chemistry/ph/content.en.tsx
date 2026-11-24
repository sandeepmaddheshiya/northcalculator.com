import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'ph') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'pH Calculator',
  promise: 'pH, pOH and ion concentrations from any one of them, at 25 °C.',
  title: 'pH Calculator: pH, pOH, [H3O+] and [OH−] Conversions',
  description:
    'Convert between pH, pOH, hydronium concentration and hydroxide concentration at 25 °C, and see whether a solution is acidic, neutral or basic.',
  summary:
    'pH is the negative base-10 logarithm of the hydronium ion concentration: pH = −log[H₃O⁺]. pOH is the same for hydroxide, and at 25 °C the two add up to 14. A pH below 7 is acidic, 7 is neutral and above 7 is basic. Each step of 1 in pH is a tenfold change in concentration.',
  synonyms: [
    'pOH calculator',
    'hydrogen ion concentration calculator',
    'H+ concentration from pH',
    'pH from molarity',
    'hydroxide concentration calculator',
    'acid or base calculator',
  ],
  ui: {
    known: 'I know the',
    'known.h': 'Hydronium concentration [H₃O⁺]',
    'known.oh': 'Hydroxide concentration [OH⁻]',
    'known.ph': 'pH',
    'known.poh': 'pOH',
    value: 'Value',
    'value.h': '[H₃O⁺] (mol/L)',
    'value.oh': '[OH⁻] (mol/L)',
    'value.ph': 'pH',
    'value.poh': 'pOH',
    'value.help': 'Concentrations accept scientific notation, e.g. 1.2e-3.',
    'out.ph': 'pH',
    'out.poh': 'pOH',
    'out.h': '[H₃O⁺] (mol/L)',
    'out.oh': '[OH⁻] (mol/L)',
    'out.nature': 'Solution is',
    'nature.acidic': 'Acidic',
    'nature.neutral': 'Neutral',
    'nature.basic': 'Basic',
    explain: 'A pH of {ph} means the solution is {nature} at 25 °C.',
    'step.ph': 'pH = −log[H₃O⁺].',
    'step.poh': 'pOH = −log[OH⁻].',
    'step.h': '[H₃O⁺] = 10^−pH.',
    'step.ohFromPoh': '[OH⁻] = 10^−pOH.',
    'step.sum': 'At 25 °C, pH + pOH = 14.',
    'warn.conc': 'A concentration must be greater than zero.',
    'warn.range':
      'pH outside 0–14 is possible for very concentrated acids or bases, but the simple formulas become less accurate there.',
    rounding:
      'Assumes 25 °C (pK_w = 14.00). pH and pOH are shown to 4 decimals; report as many decimals as your concentration has significant figures.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Definitions">
        {'pH = −log[H₃O⁺]\npOH = −log[OH⁻]\npH + pOH = 14 (25 °C)'}
      </Formula>
      <Formula label="Back to concentration">{'[H₃O⁺] = 10^−pH\n[OH⁻] = 10^−pOH'}</Formula>
      <p>
        Water’s ion product K_w = [H₃O⁺][OH⁻] is 1.0 × 10⁻¹⁴ at 25 °C, which is where the 14 comes
        from. K_w grows with temperature: at 80 °C pure water has a pH of 6.31 and is still neutral,
        so this calculator’s 25 °C assumption matters for hot solutions.
      </p>
    </>
  ),
  examples: [
    {
      id: 'stomach',
      title: 'Stomach acid with [H₃O⁺] = 1.2 × 10⁻³ M',
      body: (r, fmt) => (
        <p>
          pH = −log(0.0012) = <strong>{fmt.num(o(r), 4)}</strong>, reported as 2.92 in OpenStax{' '}
          <em>Chemistry</em> Example 14.4.
        </p>
      ),
    },
    {
      id: 'base',
      title: 'A 0.0125 M solution of KOH',
      body: (r, fmt) => (
        <p>
          [OH⁻] = 0.0125 M, so pOH = {fmt.num(o(r, 'poh'), 4)} and pH = 14 − pOH ={' '}
          <strong>{fmt.num(o(r), 4)}</strong>; Example 14.6 gives 12.10.
        </p>
      ),
    },
    {
      id: 'blood',
      title: 'Blood at pH 7.3',
      body: (r, fmt) => (
        <p>
          [H₃O⁺] = 10⁻⁷·³ = <strong>{fmt.sig(o(r, 'h'), 3)} M</strong>, which Example 14.5 gives as
          5 × 10⁻⁸ M to one significant figure.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Significant figures:</strong> a concentration of 1.2 × 10⁻³ (two figures) gives a pH
        with two decimals, 2.92.
      </li>
      <li>
        <strong>Strong acids and bases</strong> dissociate fully, so 0.01 M HCl has [H₃O⁺] = 0.01 M
        and pH 2. Weak acids need their K_a.
      </li>
      <li>
        <strong>Logarithmic scale:</strong> pH 3 is ten times more acidic than pH 4 and a hundred
        times more than pH 5.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do I calculate pH from concentration?',
      a: 'Take the negative base-10 log of the hydronium concentration in mol/L. For 2.5 × 10⁻¹¹ M, pH = −log(2.5 × 10⁻¹¹) = 10.60, a basic solution. On most calculators, enter the number, press log and change the sign.',
    },
    {
      q: 'How do I find [H⁺] from pH?',
      a: 'Raise 10 to the power of minus the pH: [H₃O⁺] = 10^−pH. A pH of 12.6 gives 10^−12.6 ≈ 2.5 × 10⁻¹³ M. [H⁺] and [H₃O⁺] mean the same thing in these problems.',
    },
    {
      q: 'What is pOH?',
      a: 'pOH is −log[OH⁻], the same idea for hydroxide ions. At 25 °C, pH + pOH = 14, so a solution with pH 4.42 has pOH 9.58. A low pOH means a basic solution.',
    },
    {
      q: 'Can pH be negative or above 14?',
      a: 'Yes. Concentrated strong acids above 1 M have negative pH, and concentrated strong bases can exceed 14. At those concentrations activities differ from concentrations, so the simple −log formula is only approximate.',
    },
  ],
  ogSample: (r, fmt) => `[H₃O⁺] = 1.2 × 10⁻³ M → pH ${fmt.num(o(r), 2)}`,
};
