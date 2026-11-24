import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'result') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Dilution Calculator',
  promise: 'Solve C1V1 = C2V2 for any one of the four values when diluting a stock solution.',
  title: 'Dilution Calculator: C1V1 = C2V2 for Stock Solutions',
  description:
    'Find how much stock solution to use, the final volume or the new concentration when diluting, with C1V1 = C2V2 and the amount of solvent to add.',
  summary:
    'Adding solvent spreads the same amount of solute through a larger volume, so concentration times volume stays the same: C₁V₁ = C₂V₂. Here C₁ and V₁ are the stock solution and C₂ and V₂ the diluted one. Know any three and the fourth follows. V₂ is the final total volume, not the water you add.',
  synonyms: [
    'C1V1 = C2V2 calculator',
    'M1V1 = M2V2 calculator',
    'stock solution calculator',
    'dilution factor calculator',
    'molarity dilution calculator',
    'serial dilution calculator',
  ],
  ui: {
    find: 'Find',
    'find.c1': 'Stock concentration (C₁)',
    'find.v1': 'Volume of stock (V₁)',
    'find.c2': 'Final concentration (C₂)',
    'find.v2': 'Final volume (V₂)',
    c1: 'Stock concentration (C₁)',
    v1: 'Volume of stock (V₁)',
    c2: 'Final concentration (C₂)',
    v2: 'Final volume (V₂)',
    'out.result': 'Volume of stock (V₁)',
    'out.result.c1': 'Stock concentration (C₁)',
    'out.result.v1': 'Volume of stock (V₁)',
    'out.result.c2': 'Final concentration (C₂)',
    'out.result.v2': 'Final volume (V₂)',
    'out.solvent': 'Solvent to add (V₂ − V₁)',
    'out.factor': 'Dilution factor (C₁ ÷ C₂)',
    explain:
      'Dilute {v1} of the {c1} stock to a total of {v2} to get {c2}: add about {add} of solvent.',
    'step.rearrange': 'Rearrange C₁V₁ = C₂V₂ for the unknown.',
    'step.solvent': 'Solvent to add = final volume − volume of stock.',
    'warn.zero': 'All known values must be greater than zero.',
    'warn.concentrating':
      'The final concentration is higher than the stock. Adding solvent can only dilute, so check which value is which.',
    rounding:
      'Results keep 12 significant digits and are shown to 8. Use the same unit for both concentrations and for both volumes.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Dilution equation">{'C₁ × V₁ = C₂ × V₂\nsolvent to add = V₂ − V₁'}</Formula>
      <p>
        Moles of solute = concentration × volume, and dilution does not change the moles, so the two
        products are equal. The units cancel, so you can use mol/L, mg/mL or percent for
        concentration and mL or L for volume, as long as each pair matches. Volumes of some mixtures
        are not strictly additive, so make up to the final volume rather than adding a measured
        amount of water when precision matters.
      </p>
    </>
  ),
  examples: [
    {
      id: 'stock',
      title: '8.00 L of 0.50 M nitric acid from a 16 M stock',
      body: (r, fmt) => (
        <p>
          V₁ = 0.50 × 8.00 ÷ 16 = <strong>{fmt.sig(o(r), 6)} L</strong> (250 mL) of stock, made up
          to 8.00 L with {fmt.sig(o(r, 'solvent'), 6)} L of water (LibreTexts Example 13.7.1).
        </p>
      ),
    },
    {
      id: 'diluted',
      title: '0.850 L of 5.00 M copper nitrate diluted to 1.80 L',
      body: (r, fmt) => (
        <p>
          C₂ = 5.00 × 0.850 ÷ 1.80 = <strong>{fmt.sig(o(r), 6)} M</strong>, which OpenStax{' '}
          <em>Chemistry</em> Example 3.19 gives as 2.36 M.
        </p>
      ),
    },
    {
      id: 'final',
      title: '76.5 mL of 0.885 M KBr diluted to 0.500 M',
      body: (r, fmt) => (
        <p>
          V₂ = 0.885 × 76.5 ÷ 0.500 = <strong>{fmt.sig(o(r), 6)} mL</strong>, the 135.4 mL in
          LibreTexts Exercise 13.7.1.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>V₂ is the total.</strong> To make 500 mL from 100 mL of stock, add solvent until the
        total reaches 500 mL; that is about 400 mL more.
      </li>
      <li>
        <strong>Acids: add acid to water,</strong> slowly and with stirring, never water to
        concentrated acid, because the heat released can make it spatter.
      </li>
      <li>
        <strong>Large dilutions</strong> are more accurate in steps, such as two 1:10 dilutions
        instead of one 1:100.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'What does C1V1 = C2V2 mean?',
      a: 'C₁ and V₁ are the concentration and volume of the solution you start with, and C₂ and V₂ those of the diluted solution. Since dilution adds only solvent, the amount of solute, concentration times volume, is the same before and after.',
    },
    {
      q: 'How much stock solution do I need?',
      a: 'Multiply the final concentration by the final volume and divide by the stock concentration: V₁ = C₂V₂ ÷ C₁. For 2.5 L of 0.400 M glucose from a 3.00 M stock, use 0.400 × 2.5 ÷ 3.00 = 0.333 L, about 333 mL.',
    },
    {
      q: 'What is a dilution factor?',
      a: 'It is how many times weaker the diluted solution is: C₁ ÷ C₂, which equals V₂ ÷ V₁. Diluting 100 mL of 2.0 M acid to 500 mL is a dilution factor of 5, giving 0.40 M. A 1:10 dilution is one part stock in ten parts total.',
    },
    {
      q: 'Can I use percent or mg/mL instead of molarity?',
      a: 'Yes. The equation only needs the same unit on both sides. Diluting 50 mL of a 10% solution to 200 mL gives 2.5%, and 5 mL of 20 mg/mL made up to 100 mL gives 1 mg/mL.',
    },
  ],
  ogSample: (r, fmt) => `0.50 M × 8.00 L ÷ 16 M → V₁ = ${fmt.sig(o(r), 6)} L`,
};
