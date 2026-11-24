import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';
import { content as unit } from '../unit-converter/content.en';

const o = (r: { outputs: Record<string, unknown> }) => r.outputs.result as number;

export const content: CalculatorContent = {
  name: 'Volume Converter',
  promise: 'Convert gallons, litres, cups, fluid ounces and spoons, US and imperial.',
  title: 'Volume Converter: Gallons to Litres, Cups to mL and More',
  description:
    'Convert volume between US and imperial gallons, quarts, pints, cups, fluid ounces, tablespoons and teaspoons, litres, millilitres and cubic units.',
  summary:
    'US and imperial measures share names but not sizes. A US gallon is defined as 231 cubic inches, exactly 3.785411784 litres; an imperial gallon is exactly 4.54609 litres, about 20% more. Smaller US units divide the gallon: 4 quarts, 8 pints, 16 cups or 128 fluid ounces, so a US cup is 236.5882365 mL.',
  synonyms: [
    'gallons to liters',
    'liters to gallons',
    'cups to ml',
    'ml to cups',
    'fluid ounces to ml',
    'teaspoons to ml',
    'imperial gallons',
  ],
  ui: { ...unit.ui },
  HowItWorks: () => (
    <>
      <Formula label="US customary (exact)">
        {
          '1 US gal = 231 in³ = 3.785 411 784 L\n1 US gal = 4 qt = 8 pt = 16 cups = 128 fl oz\n1 US fl oz = 2 tbsp = 6 tsp'
        }
      </Formula>
      <Formula label="Imperial (exact)">
        {'1 imp gal = 4.546 09 L = 8 imp pt = 160 imp fl oz'}
      </Formula>
      <p>
        NIST Handbook 44 defines the US gallon through the cubic inch, so every US volume converts
        exactly to litres. The imperial gallon is defined directly in litres. An imperial pint (20
        imperial fluid ounces) is larger than a US pint (16 US fluid ounces).
      </p>
    </>
  ),
  examples: [
    {
      id: 'gallon',
      title: 'One US gallon in litres',
      body: (r, fmt) => (
        <p>
          231 cubic inches × 16.387064 cm³ = <strong>{fmt.sig(o(r))} L</strong>. A 15-gallon fuel
          tank holds about 56.8 litres.
        </p>
      ),
    },
    {
      id: 'imperial',
      title: 'One imperial gallon in litres',
      body: (r, fmt) => (
        <p>
          An imperial gallon is defined as <strong>{fmt.sig(o(r))} L</strong>, so it is 1.2 US
          gallons. UK fuel economy in miles per gallon uses this larger gallon.
        </p>
      ),
    },
    {
      id: 'cup',
      title: 'One US cup in millilitres',
      body: (r, fmt) => (
        <p>
          A US cup is 1/16 of a US gallon: <strong>{fmt.sig(o(r))} mL</strong>. Cup sizes differ
          between countries, so check which cup a recipe was written with.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Check whether a recipe is US or UK.</strong> Pints, quarts and gallons differ by
        about 20% between the two systems; teaspoons and tablespoons differ less.
      </li>
      <li>
        <strong>Volume is not weight.</strong> A cup of flour and a cup of water weigh very
        different amounts. Convert by weight when a recipe gives grams.
      </li>
      <li>
        <strong>Litres and cubic units:</strong> 1 L is exactly 1,000 cm³, and 1 m³ is 1,000 L.
      </li>
      <li>
        <strong>Fluid ounces:</strong> a US fluid ounce is 29.57 mL and an imperial one 28.41 mL.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How many litres are in a gallon?',
      a: 'A US gallon is exactly 3.785411784 litres and an imperial (UK) gallon exactly 4.54609 litres. Five US gallons are 18.93 L; five imperial gallons are 22.73 L. Check which gallon a label or recipe means.',
    },
    {
      q: 'How many millilitres are in a cup?',
      a: 'A US customary cup is exactly 236.5882365 mL, one sixteenth of a US gallon. Other countries’ cups differ, so for baking follow the cup size your recipe was written with, or better, weigh the ingredients.',
    },
    {
      q: 'How many fluid ounces are in a litre?',
      a: 'One litre is 33.814 US fluid ounces, or 35.195 imperial fluid ounces. A 500 mL bottle holds 16.9 US fluid ounces. The imperial fluid ounce is smaller, which is why a litre contains more of them.',
    },
    {
      q: 'How many teaspoons are in a tablespoon?',
      a: 'Three. In US measures a teaspoon is 4.93 mL and a tablespoon 14.79 mL; two tablespoons make one fluid ounce. Spoon sizes elsewhere can differ slightly, so check the recipe’s origin.',
    },
  ],
  ogSample: (r, fmt) => `1 US gal = ${fmt.sig(o(r))} L`,
};
