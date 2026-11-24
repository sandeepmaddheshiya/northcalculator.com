import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'result') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Percent Yield Calculator',
  promise: 'Percent yield of a reaction, or the actual or theoretical yield from it.',
  title: 'Percent Yield Calculator: Actual vs Theoretical Yield',
  description:
    'Find the percent yield of a chemical reaction from the actual and theoretical yields, or work back to the actual or theoretical yield from a percent yield.',
  summary:
    'Percent yield compares what a reaction actually produced with the most it could produce: actual yield ÷ theoretical yield × 100%. The theoretical yield comes from stoichiometry, using the limiting reactant. Real yields are lower because of side reactions, incomplete reactions and losses during purification, so 100% is the ceiling for a pure product.',
  synonyms: [
    'theoretical yield calculator',
    'actual yield calculator',
    'reaction yield calculator',
    'yield percentage chemistry',
    'how to calculate percent yield',
    'percentage yield formula',
  ],
  ui: {
    find: 'Find the',
    'find.percent': 'Percent',
    'find.actual': 'Actual',
    'find.theoretical': 'Theoretical',
    actual: 'Actual yield (g, mol, …)',
    theoretical: 'Theoretical yield (same unit)',
    percent: 'Percent yield (%)',
    'out.result': 'Percent yield (%)',
    'out.result.percent': 'Percent yield (%)',
    'out.result.actual': 'Actual yield',
    'out.result.theoretical': 'Theoretical yield',
    'out.lost': 'Shortfall (theoretical − actual)',
    explain: 'Getting {a} out of a possible {th} is a {p}% yield.',
    'step.percent': 'Percent yield = actual ÷ theoretical × 100.',
    'step.actual': 'Actual yield = percent ÷ 100 × theoretical.',
    'step.theoretical': 'Theoretical yield = actual ÷ (percent ÷ 100).',
    'warn.theoretical': 'The theoretical yield must be greater than zero.',
    'warn.percent': 'The percent yield must be greater than zero.',
    'warn.over':
      'Over 100% usually means the product is still wet or impure, or the theoretical yield was worked out wrongly.',
    rounding:
      'Results keep 12 significant digits and are shown to 8. Round to your data’s significant figures.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Percent yield">{'percent yield = actual ÷ theoretical × 100%'}</Formula>
      <p>
        The theoretical yield is found from the balanced equation: convert the limiting reactant’s
        mass to moles, use the mole ratio to get moles of product, and convert back to mass. Both
        yields must be in the same unit. LibreTexts Example 8.7.1 divides by the rounded theoretical
        yield of 15.7 g, giving 94.9%; with the unrounded 15.67 g it would be 95.1%.
      </p>
    </>
  ),
  examples: [
    {
      id: 'copper',
      title: '0.392 g of copper from a possible 0.5072 g',
      body: (r, fmt) => (
        <p>
          0.392 ÷ 0.5072 × 100 = <strong>{fmt.sig(o(r), 4)}%</strong>, the 77.3% of OpenStax{' '}
          <em>Chemistry</em> Example 4.13.
        </p>
      ),
    },
    {
      id: 'oxygen',
      title: '14.9 g of oxygen from a possible 15.7 g',
      body: (r, fmt) => (
        <p>
          14.9 ÷ 15.7 × 100 = <strong>{fmt.sig(o(r), 4)}%</strong>, matching LibreTexts Example
          8.7.1.
        </p>
      ),
    },
    {
      id: 'expected',
      title: 'What to expect from an 80% yield of 25 g',
      body: (r, fmt) => (
        <p>
          0.80 × 25 = <strong>{fmt.sig(o(r), 4)} g</strong> is the actual yield to plan for.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Dry the product first.</strong> Leftover solvent adds mass and can push the yield
        over 100%.
      </li>
      <li>
        <strong>Use the limiting reactant</strong> for the theoretical yield; the reactant in excess
        would give a figure that is too high.
      </li>
      <li>
        <strong>Multi-step syntheses multiply:</strong> three steps at 80% each give 0.8³ = 51.2%
        overall.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do you calculate percent yield?',
      a: 'Divide the actual yield by the theoretical yield and multiply by 100. If a reaction could make 20.0 g of product and you collect 17.0 g, the percent yield is 17.0 ÷ 20.0 × 100 = 85.0%.',
    },
    {
      q: 'What is theoretical yield?',
      a: 'The amount of product the balanced equation predicts if the limiting reactant reacts completely and nothing is lost. It is found by stoichiometry: grams of limiting reactant to moles, the mole ratio to moles of product, then moles to grams.',
    },
    {
      q: 'Why is the percent yield less than 100%?',
      a: 'Reactions may not go to completion, side reactions can make other products, and some product is lost when it is filtered, transferred or purified. Industrial processes are tuned to raise the yield because lost product is wasted material.',
    },
    {
      q: 'Can percent yield be over 100%?',
      a: 'Not for a pure, dry product. A figure above 100% usually means water or solvent is still present, the product contains impurities, or the theoretical yield was calculated from the wrong reactant.',
    },
  ],
  ogSample: (r, fmt) => `0.392 g of 0.5072 g → ${fmt.sig(o(r), 4)}%`,
};
