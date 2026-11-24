import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';
import { content as unit } from '../unit-converter/content.en';

const o = (r: { outputs: Record<string, unknown> }) => r.outputs.result as number;

export const content: CalculatorContent = {
  name: 'Pressure Converter',
  promise: 'Convert psi, bar, kPa, atmospheres, mmHg and inches of mercury.',
  title: 'Pressure Converter: psi to bar, kPa, atm and mmHg Units',
  description:
    'Convert pressure between psi, bar, millibar, pascals, kPa, MPa, atmospheres, torr, millimetres and inches of mercury, for tyres, weather and engineering.',
  summary:
    'Pressure is force per area, and its SI unit is the pascal, one newton per square metre. A bar is exactly 100,000 Pa and a standard atmosphere exactly 101,325 Pa. A pound per square inch (psi) is about 6,894.76 Pa, so 1 bar is about 14.5 psi. Tyre gauges usually show psi, bar or kPa, depending on the country.',
  synonyms: [
    'psi to bar',
    'bar to psi',
    'psi to kpa',
    'kpa to psi',
    'atm to psi',
    'mmHg to kPa',
    'tire pressure converter',
  ],
  ui: { ...unit.ui },
  HowItWorks: () => (
    <>
      <Formula label="Pressure units in pascals">
        {
          '1 bar = 100,000 Pa      1 mbar = 100 Pa\n1 atm = 101,325 Pa      1 torr = 101,325/760 Pa\n1 psi = 6,894.757 Pa    1 mmHg = 133.322 387 415 Pa'
        }
      </Formula>
      <p>
        The psi is the force of one pound (0.45359237 kg under standard gravity, 9.80665 m/s²)
        spread over one square inch, which works out to 6,894.757 Pa. The bar, atmosphere and torr
        are defined directly in pascals, and NIST’s guide to the SI lists the conventional values
        for the millimetre and inch of mercury.
      </p>
      <p>
        A torr and a millimetre of mercury differ by less than one part in seven million; for
        everyday use they are interchangeable.
      </p>
    </>
  ),
  examples: [
    {
      id: 'tyre',
      title: 'A tyre pressure of 32 psi in kPa',
      body: (r, fmt) => (
        <p>
          32 × 6.894757 = <strong>{fmt.sig(o(r), 6)} kPa</strong>, often printed as 220 kPa or 2.2
          bar on metric tyre placards.
        </p>
      ),
    },
    {
      id: 'atm',
      title: 'One atmosphere in psi',
      body: (r, fmt) => (
        <p>
          101,325 Pa ÷ 6,894.757 Pa = <strong>{fmt.sig(o(r), 6)} psi</strong>, the average air
          pressure at sea level used as the standard atmosphere.
        </p>
      ),
    },
    {
      id: 'bar',
      title: 'One bar in psi',
      body: (r, fmt) => (
        <p>
          100,000 Pa ÷ 6,894.757 Pa = <strong>{fmt.sig(o(r), 6)} psi</strong>. A bar is 1.3% less
          than an atmosphere.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Gauge versus absolute pressure.</strong> Tyre gauges show pressure above the
        surrounding air (gauge pressure). Absolute pressure adds about one atmosphere.
      </li>
      <li>
        <strong>Weather maps</strong> use hectopascals or millibars, which are the same size: 1 hPa
        = 1 mbar = 100 Pa.
      </li>
      <li>
        <strong>Blood pressure</strong> is measured in mmHg. Readings are a medical measurement, so
        discuss them with a health professional rather than converting them for diagnosis.
      </li>
      <li>
        <strong>Inches of mercury</strong> appear in US weather reports and aviation altimeter
        settings; 29.92 inHg is about one standard atmosphere.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do I convert psi to bar?',
      a: 'Divide by 14.5038, or multiply by 0.0689476. 35 psi is 2.41 bar and 100 psi is 6.89 bar. To convert bar to psi, multiply by 14.5038, so 2.5 bar is 36.26 psi.',
    },
    {
      q: 'How many kPa are in a psi?',
      a: 'One psi is 6.894757 kPa. A tyre at 30 psi is at 206.8 kPa. To convert kPa to psi, divide by 6.894757 or multiply by 0.145038, so 250 kPa is 36.26 psi.',
    },
    {
      q: 'What is standard atmospheric pressure?',
      a: 'The standard atmosphere is defined as exactly 101,325 Pa, which is 1.01325 bar, 760 torr, 14.696 psi or 29.92 inches of mercury. Actual air pressure varies with weather and altitude.',
    },
    {
      q: 'Is a bar the same as an atmosphere?',
      a: 'Nearly but not exactly. A bar is 100,000 Pa and an atmosphere is 101,325 Pa, so an atmosphere is about 1.3% larger. For rough work they are often treated as equal.',
    },
  ],
  ogSample: (r, fmt) => `32 psi = ${fmt.sig(o(r), 6)} kPa`,
};
