import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';
import { content as unit } from '../unit-converter/content.en';

const o = (r: { outputs: Record<string, unknown> }) => r.outputs.result as number;

export const content: CalculatorContent = {
  name: 'Temperature Converter',
  promise: 'Convert between Fahrenheit, Celsius, Kelvin and Rankine with the exact formulas.',
  title: 'Temperature Converter: Fahrenheit, Celsius and Kelvin',
  description:
    'Convert temperatures between Fahrenheit, Celsius, Kelvin and Rankine with the exact formulas, for weather, cooking, science and body temperature.',
  summary:
    'Temperature scales start at different points, so converting needs a formula rather than a single multiplier. To turn Fahrenheit into Celsius, subtract 32 and multiply by 5/9; to go back, multiply by 9/5 and add 32. Kelvin is Celsius plus 273.15 and starts at absolute zero. The two everyday scales meet at −40, where both read the same.',
  synonyms: [
    'Fahrenheit to Celsius',
    'Celsius to Fahrenheit',
    'F to C',
    'C to F',
    'Celsius to Kelvin',
    'temperature conversion',
  ],
  ui: { ...unit.ui },
  HowItWorks: () => (
    <>
      <Formula label="Fahrenheit and Celsius">{'°C = (°F − 32) × 5/9\n°F = °C × 9/5 + 32'}</Formula>
      <Formula label="Absolute scales">{'K = °C + 273.15\n°R = °F + 459.67'}</Formula>
      <p>
        A degree Fahrenheit is 5/9 of a degree Celsius, and the scales are offset because water
        freezes at 32 °F but 0 °C. Kelvin uses Celsius-sized degrees counted from absolute zero,
        −273.15 °C; Rankine does the same with Fahrenheit-sized degrees. These relations are given
        in NIST’s guide to the SI.
      </p>
      <p>
        <strong>Temperature differences convert differently.</strong> A rise of 10 °C is a rise of
        18 °F, with no 32 added, because only the size of the degree matters.
      </p>
    </>
  ),
  examples: [
    {
      id: 'body',
      title: '98.6 °F in Celsius',
      body: (r, fmt) => (
        <p>
          (98.6 − 32) × 5/9 = 66.6 × 5/9 = <strong>{fmt.sig(o(r))} °C</strong>, the traditional
          figure for normal body temperature.
        </p>
      ),
    },
    {
      id: 'minus40',
      title: 'Where Celsius and Fahrenheit meet',
      body: (r, fmt) => (
        <p>
          −40 × 9/5 + 32 = −72 + 32 = <strong>{fmt.sig(o(r))} °F</strong>. At −40 the two scales
          read the same, a handy check that a conversion formula is the right way round.
        </p>
      ),
    },
    {
      id: 'kelvin',
      title: 'The freezing point of water in kelvin',
      body: (r, fmt) => (
        <p>
          0 °C + 273.15 = <strong>{fmt.sig(o(r))} K</strong>. Kelvin is written without a degree
          sign, and no temperature can go below 0 K.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Oven temperatures:</strong> 350 °F is 176.7 °C, usually written as 180 °C on metric
        recipes, and 425 °F is about 220 °C.
      </li>
      <li>
        <strong>Quick estimate:</strong> double the Celsius figure and add 30 to get roughly the
        Fahrenheit. It is close for weather temperatures but drifts at high values.
      </li>
      <li>
        <strong>Fever thresholds</strong> are given in both scales by health services; use the exact
        figure your doctor or thermometer instructions state.
      </li>
      <li>
        <strong>Below absolute zero</strong> is impossible. The calculator warns if a value is under
        0 K (−459.67 °F).
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do I convert Fahrenheit to Celsius?',
      a: 'Subtract 32, then multiply by 5 and divide by 9. For 68 °F: 68 − 32 = 36, and 36 × 5 ÷ 9 = 20 °C. For a quick mental estimate, subtract 30 and halve, which gives 19.',
    },
    {
      q: 'How do I convert Celsius to Fahrenheit?',
      a: 'Multiply by 9, divide by 5, then add 32. For 25 °C: 25 × 9 ÷ 5 = 45, and 45 + 32 = 77 °F. Doubling and adding 30 gives 80, a rough estimate.',
    },
    {
      q: 'What is absolute zero in Celsius and Fahrenheit?',
      a: 'Absolute zero, 0 K, is −273.15 °C and −459.67 °F. It is the lowest possible temperature, where the thermal motion of particles is at its minimum. The Kelvin and Rankine scales both start there.',
    },
    {
      q: 'Why do you add 32 when converting to Fahrenheit?',
      a: 'Because the scales have different zero points: water freezes at 0 °C and at 32 °F. After scaling the degrees by 9/5, adding 32 shifts the result to Fahrenheit’s starting point.',
    },
  ],
  ogSample: (r, fmt) => `98.6 °F = ${fmt.sig(o(r))} °C`,
};
