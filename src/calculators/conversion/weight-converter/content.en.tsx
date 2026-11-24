import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';
import { content as unit } from '../unit-converter/content.en';

const o = (r: { outputs: Record<string, unknown> }) => r.outputs.result as number;

export const content: CalculatorContent = {
  name: 'Weight Converter',
  promise: 'Convert pounds, ounces, stone, grams, kilograms and tons exactly.',
  title: 'Weight Converter: Pounds to Kilograms, Ounces to Grams',
  description:
    'Convert weight and mass between pounds, ounces, stone, US and UK tons, milligrams, grams, kilograms and tonnes, using the exact definition of the pound.',
  summary:
    'The avoirdupois pound used in everyday life is defined as exactly 0.45359237 kilograms. An ounce is one sixteenth of a pound, 28.349523125 grams, and a stone is 14 pounds. A US short ton is 2,000 pounds, a UK long ton 2,240 pounds, and a metric tonne 1,000 kilograms. Every conversion between them is therefore exact.',
  synonyms: [
    'kg to lbs',
    'lbs to kg',
    'ounces to grams',
    'grams to ounces',
    'stone to kg',
    'pounds to kilograms',
    'tonnes to tons',
  ],
  ui: { ...unit.ui },
  HowItWorks: () => (
    <>
      <Formula label="Exact definitions">
        {
          '1 lb = 0.453 592 37 kg\n1 oz = 1/16 lb = 28.349 523 125 g\n1 st = 14 lb\n1 short ton = 2,000 lb    1 long ton = 2,240 lb\n1 t (tonne) = 1,000 kg'
        }
      </Formula>
      <p>
        NIST Handbook 44 gives the pound in these terms. To go from kilograms to pounds, divide by
        0.45359237, which is the same as multiplying by about 2.20462.
      </p>
      <p>
        Strictly, kilograms measure mass and pounds can mean mass or force, but in everyday use, and
        on this page, both measure how heavy something is.
      </p>
    </>
  ),
  examples: [
    {
      id: 'pound',
      title: 'One pound in kilograms',
      body: (r, fmt) => (
        <p>
          1 lb = <strong>{fmt.sig(o(r))} kg</strong> exactly. A 5 lb bag of flour is 2.268 kg.
        </p>
      ),
    },
    {
      id: 'ounce',
      title: 'One ounce in grams',
      body: (r, fmt) => (
        <p>
          0.45359237 kg ÷ 16 = <strong>{fmt.sig(o(r))} g</strong>. Recipes often round this to 28 g
          or 30 g, which is fine for cooking but not for precise measurement.
        </p>
      ),
    },
    {
      id: 'stone',
      title: 'A weight of 11 stone in kilograms',
      body: (r, fmt) => (
        <p>
          11 stone is 154 pounds, and 154 × 0.45359237 = <strong>{fmt.sig(o(r))} kg</strong>, about
          69.9 kg. Body weight is still often given in stone in the UK and Ireland.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Fluid ounces are not ounces.</strong> A fluid ounce measures volume; an ounce
        measures weight. Use the volume converter for fluid ounces.
      </li>
      <li>
        <strong>Check which ton.</strong> A US ton is 907.2 kg, a UK ton 1,016 kg and a metric tonne
        1,000 kg. Shipping and trade documents usually state which.
      </li>
      <li>
        <strong>Precious metals use troy units.</strong> Gold and silver are weighed in troy ounces
        (31.1 g), which are heavier than everyday ounces.
      </li>
      <li>
        <strong>Stone and pounds:</strong> 10 st 6 lb is 146 lb, which is 66.22 kg.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do I convert kilograms to pounds?',
      a: 'Divide by 0.45359237, or multiply by about 2.20462. 70 kg is 154.32 lb and 1 kg is 2.2046 lb. To go the other way, multiply pounds by 0.45359237: 150 lb is 68.04 kg.',
    },
    {
      q: 'How many grams are in an ounce?',
      a: 'An avoirdupois ounce is exactly 28.349523125 grams, one sixteenth of a pound. A 16 oz steak is 453.6 g. A troy ounce, used for precious metals, is larger at 31.1034768 g.',
    },
    {
      q: 'How many pounds are in a stone?',
      a: 'Fourteen. A stone is 14 × 0.45359237 = 6.35029318 kg. Someone weighing 12 stone weighs 168 lb, or 76.2 kg. Weights such as 12 st 4 lb add the extra pounds: 172 lb, or 78.02 kg.',
    },
    {
      q: 'Is a tonne the same as a ton?',
      a: 'No. A metric tonne is 1,000 kg. A US short ton is 2,000 lb (907.18474 kg) and a UK long ton is 2,240 lb (1,016.0469088 kg). The long ton is closest to the tonne, about 1.6% heavier.',
    },
  ],
  ogSample: (r, fmt) => `1 lb = ${fmt.sig(o(r))} kg`,
};
