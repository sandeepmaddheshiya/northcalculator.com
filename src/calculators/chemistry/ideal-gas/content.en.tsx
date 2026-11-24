import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'result') => r.outputs[k];

export const content: CalculatorContent = {
  name: 'Ideal Gas Law Calculator',
  promise: 'Solve PV = nRT for pressure, volume, moles or temperature in common units.',
  title: 'Ideal Gas Law Calculator: PV = nRT for P, V, n or T',
  description:
    'Solve the ideal gas law PV = nRT for pressure, volume, amount of gas or temperature, in atm, kPa, bar, torr or psi, litres or m³, and °C, K or °F.',
  summary:
    'The ideal gas law links the pressure P, volume V, amount n and absolute temperature T of a gas: PV = nRT, where R is the gas constant, 8.314 kPa·L per mole per kelvin. Temperature must be in kelvin, so 25 °C is 298.15 K. At 0 °C and 1 atm one mole of ideal gas fills about 22.4 litres.',
  synonyms: [
    'PV = nRT calculator',
    'gas law calculator',
    'moles of gas calculator',
    'gas pressure calculator',
    'gas volume at STP',
    'universal gas constant',
  ],
  ui: {
    find: 'Find',
    'find.p': 'Pressure (P)',
    'find.v': 'Volume (V)',
    'find.n': 'Amount (n, moles)',
    'find.t': 'Temperature (T)',
    pRow: 'Pressure',
    p: 'Pressure',
    pu: 'Pressure unit',
    vRow: 'Volume',
    v: 'Volume',
    vu: 'Volume unit',
    nRow: 'Amount',
    n: 'Amount of gas (mol)',
    tRow: 'Temperature',
    t: 'Temperature',
    tu: 'Temperature unit',
    'unit.atm': 'atm',
    'unit.kPa': 'kPa',
    'unit.bar': 'bar',
    'unit.torr': 'torr (mmHg)',
    'unit.psi': 'psi',
    'unit.L': 'litres',
    'unit.mL': 'mL',
    'unit.m3': 'm³',
    'unit.C': '°C',
    'unit.K': 'K',
    'unit.F': '°F',
    'sym.atm': 'atm',
    'sym.kPa': 'kPa',
    'sym.bar': 'bar',
    'sym.torr': 'torr',
    'sym.psi': 'psi',
    'sym.L': 'L',
    'sym.mL': 'mL',
    'sym.m3': 'm³',
    'sym.C': '°C',
    'sym.K': 'K',
    'sym.F': '°F',
    'out.result': 'Volume',
    'out.result.p': 'Pressure',
    'out.result.v': 'Volume',
    'out.result.n': 'Amount of gas',
    'out.result.t': 'Temperature',
    'out.atm': 'Pressure (atm)',
    'out.kPa': 'Pressure (kPa)',
    'out.L': 'Volume (L)',
    'out.mol': 'Amount (mol)',
    'out.K': 'Temperature (K)',
    explain: '{n} mol of an ideal gas at {k} K and {p} atm takes up {v} litres.',
    'step.si': 'Convert to kPa, litres and kelvin.',
    'step.p': 'Rearrange for pressure.',
    'step.v': 'Rearrange for volume.',
    'step.n': 'Rearrange for the amount of gas.',
    'step.t': 'Rearrange for temperature.',
    'warn.kelvin': 'The temperature must be above absolute zero (−273.15 °C).',
    'warn.zero': 'Pressure, volume and amount must be greater than zero.',
    rounding:
      'Uses the exact gas constant R = 8.314462618 J/(mol·K). Results keep 12 significant digits and are shown to 8.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Ideal gas law">
        {'PV = nRT\nR = 8.314462618 kPa·L/(mol·K) = 0.0820574 L·atm/(mol·K)'}
      </Formula>
      <p>
        T is the absolute temperature: K = °C + 273.15. Real gases follow this law closely at
        ordinary temperatures and pressures; at high pressure or near condensation, molecules’ size
        and attraction make them deviate. OpenStax <em>Chemistry</em> uses R = 0.08206 and rounds
        temperatures to whole kelvins, so its answers can differ slightly in the last digit.
      </p>
    </>
  ),
  examples: [
    {
      id: 'methane',
      title: '655 g of methane (40.8 mol) at 25 °C and 745 torr',
      body: (r) => (
        <p>
          V = nRT ÷ P = <strong>{String(o(r))}</strong>, about 269 US gallons. OpenStax Example 9.9
          gives 1.02 × 10³ L.
        </p>
      ),
    },
    {
      id: 'tank',
      title: '2,520 mol of hydrogen in a 180 L tank at 27 °C',
      body: (r) => (
        <p>
          P = nRT ÷ V = <strong>{String(o(r))}</strong>, which OpenStax rounds to 350 bar.
        </p>
      ),
    },
    {
      id: 'stp',
      title: 'One mole at 0 °C and 1 atm',
      body: (r) => (
        <p>
          V = 1 × 8.314 × 273.15 ÷ 101.325 = <strong>{String(o(r))}</strong>, the standard molar
          volume of about 22.4 L.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Always use kelvin</strong> inside the formula. Using °C directly gives nonsense, and
        at 0 °C would mean zero volume.
      </li>
      <li>
        <strong>Grams to moles:</strong> divide the mass by the molar mass first, e.g. 655 g of CH₄
        ÷ 16.04 g/mol = 40.8 mol.
      </li>
      <li>
        <strong>Gauge pressure</strong> from a tyre or tank gauge reads above atmospheric; add about
        1 atm (14.7 psi) to get the absolute pressure the law needs.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'What is R in PV = nRT?',
      a: 'R is the gas constant, 8.314462618 J per mole per kelvin, exact since the 2019 SI redefinition. Its numerical value depends on the units: 8.314 kPa·L/(mol·K), 0.08206 L·atm/(mol·K) or 62.36 L·torr/(mol·K).',
    },
    {
      q: 'What volume does one mole of gas occupy?',
      a: 'At 0 °C and 1 atm, about 22.414 litres. At 0 °C and 1 bar, the newer IUPAC standard pressure, it is about 22.711 litres, and at 25 °C and 1 atm about 24.465 litres.',
    },
    {
      q: 'Why must temperature be in kelvin?',
      a: 'The law needs a scale that starts at absolute zero, where an ideal gas would have no pressure. The Celsius and Fahrenheit zeros are arbitrary, so doubling a Celsius temperature does not double the volume, but doubling a kelvin temperature does.',
    },
    {
      q: 'When is the ideal gas law not accurate?',
      a: 'At high pressures and low temperatures, when molecules are close together. Their own volume and the attractions between them then matter, and equations such as van der Waals’ are used instead. Near room temperature and atmospheric pressure, most common gases behave very nearly ideally.',
    },
  ],
  ogSample: (r) => `40.8 mol, 25 °C, 745 torr → ${String(o(r))}`,
};
