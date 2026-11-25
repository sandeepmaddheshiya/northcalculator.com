import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'result') => r.outputs[k] as string;

export const content: CalculatorContent = {
  name: 'Percent Composition Calculator',
  promise: 'The mass percent of each element, from a chemical formula or measured masses.',
  title: 'Percent Composition Calculator: Mass Percent by Element',
  description:
    'Enter a chemical formula or the measured mass of each element to get the percent composition by mass, the molar mass and the grams of each element in a sample.',
  summary:
    'Percent composition is the share of a compound’s mass that comes from each element. From a formula, multiply each element’s atom count by its atomic weight, divide by the molar mass and multiply by 100. From a lab analysis, divide each element’s measured mass by the total. The percentages always add up to 100%.',
  synonyms: [
    'mass percent calculator',
    'percent by mass of an element',
    'elemental composition calculator',
    'how to find percent composition',
    'mass percentage of each element',
    'percent composition from formula',
  ],
  ui: {
    mode: 'Start from',
    'mode.formula': 'A formula',
    'mode.masses': 'Measured masses',
    formula: 'Chemical formula',
    'formula.help': 'Case matters: Co is cobalt, CO is carbon monoxide. Groups and hydrates work.',
    sample: 'Sample mass (g)',
    'sample.help': 'Optional: shows how many grams of each element the sample contains.',
    masses: 'Element masses (g)',
    'masses.help': 'Element symbol and mass, separated by commas: C 7.34, H 1.85, N 2.85.',
    'out.result': 'Percent composition by mass',
    'out.molarMass': 'Molar mass (g/mol)',
    'out.total': 'Total mass (g)',
    'out.elements': 'Elements',
    'explain.formula':
      '{el} makes up the largest share of the mass, {pct}, of a compound weighing {m} g/mol.',
    'explain.masses': '{el} makes up the largest share, {pct}, of the {m} g analysed.',
    'table.caption': 'Composition by element',
    'table.element': 'Element',
    'table.atoms': 'Atoms',
    'table.molar': 'Mass (g/mol)',
    'table.mass': 'Mass (g)',
    'table.pct': 'Mass percent (%)',
    'table.grams': 'Grams in the sample',
    'step.element': '{el}: its mass ÷ the total × 100.',
    'warn.syntax': 'That formula could not be read. Use element symbols and numbers, e.g. H2SO4.',
    'warn.element': '“{at}” is not an element symbol. Check the capital letters.',
    'warn.paren': 'The brackets in the formula do not match.',
    'warn.unstable':
      '{at} has no standard atomic weight because it has no stable isotopes, so the percentages cannot be found.',
    'warn.noMasses': 'Enter at least one element symbol and its mass, e.g. C 7.34.',
    'warn.bad': '{n} entries were not an element symbol and a mass and were skipped.',
    rounding:
      'Atomic weights are the CIAAW abridged 2024 values. Percentages are shown to 4 significant figures.',
  },
  HowItWorks: () => (
    <>
      <Formula label="From a formula">
        {'% element = (atoms × atomic weight) ÷ molar mass × 100'}
      </Formula>
      <Formula label="From measured masses">
        {'% element = mass of element ÷ total mass × 100'}
      </Formula>
      <p>
        Textbooks often round atomic weights to two decimals (N 14.01, O 16.00), so their last digit
        can differ from this calculator’s, which uses the current IUPAC values. For ammonia that is
        82.27% N in OpenStax and 82.24% here.
      </p>
      <p>
        Percent composition is the starting point for an empirical formula: treat the percentages as
        grams in a 100 g sample, convert each to moles and find the smallest whole-number ratio.
      </p>
    </>
  ),
  examples: [
    {
      id: 'aspirin',
      title: 'Aspirin, C₉H₈O₄',
      body: (r) => (
        <p>
          Carbon contributes 9 × 12.011 = 108.099 g of the 180.159 g/mol, giving{' '}
          <strong>{o(r)}</strong>, as in OpenStax <em>Chemistry 2e</em> Example 3.10.
        </p>
      ),
    },
    {
      id: 'analysis',
      title: 'A 12.04 g sample containing 7.34 g C, 1.85 g H and 2.85 g N',
      body: (r) => (
        <p>
          Dividing each mass by 12.04 g gives <strong>{o(r)}</strong>, which OpenStax Example 3.9
          rounds to 61.0% C, 15.4% H and 23.7% N.
        </p>
      ),
    },
    {
      id: 'rust',
      title: 'Iron(III) oxide, Fe₂O₃',
      body: (r) => (
        <p>
          2 × 55.845 = 111.69 g of iron in 159.687 g/mol gives <strong>{o(r)}</strong>, about 69.9%
          iron, the OpenStax check answer.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Check the total:</strong> the percentages should add to 100%. A small difference
        comes only from rounding each value.
      </li>
      <li>
        <strong>Hydrates count their water:</strong> CuSO4·5H2O includes the five waters in the
        molar mass, so its copper percentage is lower than in anhydrous CuSO4.
      </li>
      <li>
        <strong>Same percent, different compounds:</strong> C₂H₂ and C₆H₆ have identical percent
        composition, because they share the empirical formula CH.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do I calculate percent composition from a formula?',
      a: 'Find the molar mass, then for each element multiply its atom count by its atomic weight, divide by the molar mass and multiply by 100. For aspirin, C₉H₈O₄, carbon is 108.099 ÷ 180.159 × 100 = 60.00%, hydrogen 4.476% and oxygen 35.52%.',
    },
    {
      q: 'How do I find percent composition from experimental masses?',
      a: 'Divide each element’s measured mass by the total sample mass and multiply by 100. A 12.04 g sample with 7.34 g of carbon is 7.34 ÷ 12.04 × 100 ≈ 61.0% carbon, as in OpenStax Chemistry 2e Example 3.9.',
    },
    {
      q: 'How many grams of an element are in a sample?',
      a: 'Multiply the sample mass by the element’s mass percent. LibreTexts finds that 12.50 g of Cl₂O₇, which is 38.76% chlorine by its figures, contains 12.50 × 0.3876 ≈ 4.845 g of chlorine. Enter a sample mass to see this for every element.',
    },
    {
      q: 'Why do my answers differ slightly from the textbook?',
      a: 'Textbooks usually round atomic weights, such as oxygen to 16.00 instead of 15.999. That can shift the last digit: Cl₂O₇ is 38.76% chlorine with 16.00 and 38.77% with 15.999. Both are correct to the precision of the weights used.',
    },
  ],
  ogSample: (r) => `C₉H₈O₄ → ${o(r)}`,
};
