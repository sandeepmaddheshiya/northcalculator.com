import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'empirical') => r.outputs[k] as string;

export const content: CalculatorContent = {
  name: 'Empirical Formula Calculator',
  promise: 'The simplest whole-number formula from percent composition or masses.',
  title: 'Empirical Formula Calculator: From Percent to Formula',
  description:
    'Turn percent composition or element masses into an empirical formula, with the mole ratio shown, and get the molecular formula from a molar mass.',
  summary:
    'An empirical formula gives the simplest whole-number ratio of atoms in a compound. Treat each percentage as grams in a 100 g sample, convert to moles, divide by the smallest number of moles, and multiply by a small whole number if a ratio ends in .5 or .33. Knowing the molar mass then gives the molecular formula.',
  synonyms: [
    'percent composition to empirical formula',
    'molecular formula calculator',
    'simplest formula calculator',
    'how to find empirical formula',
    'mole ratio calculator',
    'empirical formula from mass',
  ],
  ui: {
    amounts: 'Element percentages or masses',
    'amounts.help':
      'Element symbol and its percent or grams, separated by commas: C 74.02, H 8.710, N 17.27.',
    molar: 'Molar mass (g/mol), optional',
    'molar.help': 'Enter it to get the molecular formula; leave 0 for the empirical formula only.',
    'out.empirical': 'Empirical formula',
    'out.molecular': 'Molecular formula',
    'out.efm': 'Empirical formula mass (g/mol)',
    'out.n': 'Molecular ÷ empirical (n)',
    'out.multiplier': 'Ratio multiplied by',
    'explain.empirical': 'The simplest whole-number ratio of atoms is {e}.',
    'explain.molecular':
      'The simplest ratio is {e}; the molar mass is {n} times its mass, so the molecule is {m}.',
    'table.caption': 'Moles and mole ratio',
    'table.element': 'Element',
    'table.mass': 'Mass or %',
    'table.moles': 'Moles',
    'table.ratio': 'Ratio to smallest',
    'table.subscript': 'Subscript',
    'step.moles': 'Convert each mass to moles: mass ÷ atomic weight.',
    'step.ratio': 'Divide every amount by the smallest, {min} mol.',
    'step.multiply': 'Multiply by {k} to make every ratio a whole number.',
    'step.molecular': 'n = molar mass ÷ empirical formula mass; multiply every subscript by n.',
    'warn.none': 'Enter at least one element symbol and its percent or mass, e.g. C 40.0.',
    'warn.bad': '{n} entries were not an element symbol and an amount and were skipped.',
    'warn.unstable': '{at} has no standard atomic weight, so moles cannot be found.',
    'warn.noWhole':
      'No multiplier up to 10 gives whole numbers. Check the data: rounded percentages can blur the ratio.',
    'warn.molar':
      'The molar mass is {x} times the empirical formula mass, not close to a whole number. Check both values.',
    rounding:
      'Atomic weights are the CIAAW abridged 2024 values. A ratio counts as whole within 0.1.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Moles of each element">{'n = mass ÷ atomic weight'}</Formula>
      <Formula label="Mole ratio">{'ratio = n ÷ smallest n'}</Formula>
      <Formula label="Molecular formula">
        {'n = molar mass ÷ empirical formula mass\nmolecular = (empirical)ₙ'}
      </Formula>
      <p>
        Percentages and grams give the same answer, because only the ratio matters. A ratio such as
        1.5 means multiplying everything by 2, 1.33 or 1.67 by 3, and 1.25 by 4. The calculator
        tries multipliers 1 to 10 and uses the first that brings every ratio within 0.1 of a whole
        number, which allows for rounding in measured data.
      </p>
    </>
  ),
  examples: [
    {
      id: 'nicotine',
      title: 'Nicotine: 74.02% C, 8.710% H, 17.27% N, molar mass 162.3 g/mol',
      body: (r) => (
        <p>
          The moles come to about 6.16 C, 8.64 H and 1.23 N, a 5 : 7 : 1 ratio, so the empirical
          formula is <strong>{o(r)}</strong>. Its mass is about 81.1 g/mol, half of 162.3, giving{' '}
          {o(r, 'molecular')}, as in OpenStax <em>Chemistry 2e</em> Example 3.13.
        </p>
      ),
    },
    {
      id: 'rust',
      title: 'Iron oxide: 69.94% Fe, 30.06% O',
      body: (r) => (
        <p>
          1.252 mol Fe to 1.879 mol O is 1 : 1.5, which doubles to 2 : 3: <strong>{o(r)}</strong>,
          matching LibreTexts Example 6.8.1.
        </p>
      ),
    },
    {
      id: 'vitaminC',
      title: 'Vitamin C: 40.92% C, 4.58% H, 54.50% O, molar mass 176',
      body: (r) => (
        <p>
          The ratio 1 : 1.33 : 1 triples to <strong>{o(r)}</strong>, and 176 ÷ 88.06 = 2 gives{' '}
          {o(r, 'molecular')}, the LibreTexts answer.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Do not round early.</strong> A ratio of 1.48 should usually be read as 1.5, not 1;
        keep four significant figures until the last step.
      </li>
      <li>
        <strong>Missing oxygen:</strong> if an analysis lists only C and H and they do not add to
        100%, the remainder is often oxygen. Add it as O with the difference.
      </li>
      <li>
        <strong>Many compounds share one empirical formula:</strong> CH₂O is formaldehyde, acetic
        acid (×2) and glucose (×6), so a molar mass is needed to tell them apart.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do I find an empirical formula from percent composition?',
      a: 'Assume 100 g so each percent becomes grams, divide each by its atomic weight to get moles, then divide all by the smallest. For 27.29% C and 72.71% O that gives 2.272 and 4.544 mol, a 1 : 2 ratio, so the formula is CO₂.',
    },
    {
      q: 'What if the ratio is not a whole number?',
      a: 'Multiply every ratio by the smallest whole number that clears the fraction. Iron oxide gives Fe₁O₁.₅, and doubling gives Fe₂O₃. A ratio near 1.33 or 1.67 needs ×3, near 1.25 or 1.75 needs ×4. Do not simply round 1.5 to 2.',
    },
    {
      q: 'How do I get the molecular formula from the empirical formula?',
      a: 'Divide the molar mass by the empirical formula mass and multiply every subscript by the result. Nicotine’s empirical formula C₅H₇N weighs 81.13 g/mol; 162.3 ÷ 81.13 = 2, so the molecular formula is C₁₀H₁₄N₂.',
    },
    {
      q: 'What is the difference between an empirical and a molecular formula?',
      a: 'The empirical formula is the simplest whole-number ratio of atoms; the molecular formula is the actual number of each atom in one molecule. Glucose is C₆H₁₂O₆, but its empirical formula is CH₂O. For many compounds, like water or CO₂, the two are the same.',
    },
  ],
  ogSample: (r) => `74.02% C, 8.710% H, 17.27% N → ${o(r)}`,
};
