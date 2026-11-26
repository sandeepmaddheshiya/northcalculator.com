import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'result') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Clausius–Clapeyron Calculator',
  promise: 'Heat of vaporization, vapor pressure at a new temperature, or boiling point.',
  title: 'Clausius–Clapeyron Calculator: Vapor Pressure and ΔH_vap',
  description:
    'Use the Clausius–Clapeyron equation to get a liquid’s heat of vaporization from two vapor pressures, its vapor pressure at a new temperature, or boiling point.',
  summary:
    'A liquid’s vapor pressure rises steeply with temperature, and the Clausius–Clapeyron equation captures how: ln(P₂/P₁) = (ΔH_vap/R)(1/T₁ − 1/T₂). Measure vapor pressure at two temperatures and you get the heat of vaporization. Know that heat and you can predict the boiling point at any pressure, such as at altitude.',
  synonyms: [
    'vapor pressure calculator',
    'enthalpy of vaporization calculator',
    'boiling point at altitude calculator',
    'two-point Clausius-Clapeyron',
    'heat of vaporization from vapor pressure',
    'vapor pressure at temperature',
  ],
  ui: {
    find: 'Solve for',
    'find.dh': 'ΔH_vap',
    'find.p2': 'Vapor pressure',
    'find.t2': 'Temperature',
    tu: 'Temperature unit',
    'tu.C': '°C',
    'tu.K': 'K',
    pt1Row: 'Known point',
    p1: 'Pressure P₁',
    t1: 'Temperature T₁',
    pt2Row: 'Second point',
    p2: 'Pressure P₂',
    t2: 'Temperature T₂',
    dh: 'Enthalpy of vaporization ΔH_vap (kJ/mol)',
    'out.result': 'Result',
    'out.result.dh': 'ΔH_vap (kJ/mol)',
    'out.result.p2': 'Vapor pressure P₂ (same unit as P₁)',
    'out.result.t2': 'Temperature T₂ (chosen unit)',
    'out.dh': 'ΔH_vap (kJ/mol)',
    'out.p2': 'Vapor pressure P₂',
    'out.t2K': 'Temperature T₂ (K)',
    'explain.dh': 'The enthalpy of vaporization is about {dh} kJ/mol.',
    'explain.p2': 'At the new temperature the vapor pressure is {p}, in the same unit as P₁.',
    'explain.t2': 'The vapor pressure reaches P₂ at {t} {u}.',
    'step.dh': 'ΔH_vap = R ln(P₂/P₁) ÷ (1/T₁ − 1/T₂).',
    'step.p2': 'P₂ = P₁ e^((ΔH_vap/R)(1/T₁ − 1/T₂)).',
    'step.t2': 'T₂ = 1 ÷ (1/T₁ − R ln(P₂/P₁) ÷ ΔH_vap).',
    'warn.p': 'Pressures must be above zero.',
    'warn.t': 'Temperatures must be above absolute zero.',
    'warn.same': 'The two temperatures must differ.',
    'warn.dh': 'Enter an enthalpy of vaporization above zero.',
    'warn.range': 'No real temperature reaches that pressure with this ΔH_vap; check the values.',
    'warn.negative':
      'Vapor pressure should rise with temperature; check that each pressure is paired with its temperature.',
    rounding: 'R = 8.314462618 J/(mol·K). ΔH_vap is assumed constant between the two temperatures.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Two-point form">{'ln(P₂ ÷ P₁) = (ΔH_vap ÷ R) × (1/T₁ − 1/T₂)'}</Formula>
      <Formula label="Rearranged">
        {'ΔH_vap = R ln(P₂/P₁) ÷ (1/T₁ − 1/T₂)\nT₂ = 1 ÷ (1/T₁ − R ln(P₂/P₁) ÷ ΔH_vap)'}
      </Formula>
      <p>
        Temperatures must be in kelvin inside the formula; the calculator converts °C for you.
        Pressures can be in any unit, since only their ratio appears. A liquid boils when its vapor
        pressure equals the surrounding pressure, so solving for T₂ at a lower pressure gives the
        boiling point at altitude.
      </p>
    </>
  ),
  examples: [
    {
      id: 'isooctane',
      title: 'Isooctane: 10.0 kPa at 34.0 °C and 100 kPa at 98.8 °C',
      body: (r, fmt) => (
        <p>
          ΔH_vap = 8.314 × ln 10 ÷ (1/307.15 − 1/371.95) ={' '}
          <strong>{fmt.sig(o(r), 3)} kJ/mol</strong>, as in OpenStax <em>Chemistry 2e</em> Example
          10.7.
        </p>
      ),
    },
    {
      id: 'water',
      title: 'Water boiling at 373 K (1.0 atm), ΔH_vap 40.7 kJ/mol: vapor pressure at 363 K',
      body: (r, fmt) => (
        <p>
          P = <strong>{fmt.sig(o(r), 3)} atm</strong> at 90 °C, as in the LibreTexts
          Clausius–Clapeyron example.
        </p>
      ),
    },
    {
      id: 'denver',
      title: 'Benzene boiling in Denver at 83.4 kPa (normal boiling point 80.1 °C, 30.8 kJ/mol)',
      body: (r, fmt) => (
        <p>
          It boils at <strong>{fmt.sig(o(r), 3)} °C</strong>; OpenStax Example 10.8 rounds the steps
          and gets 73.8 °C.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Water at altitude:</strong> at about 68 kPa water boils near 90 °C, which is why
        cooking takes longer in the mountains.
      </li>
      <li>
        <strong>Stronger attractions, higher ΔH_vap:</strong> liquids with strong intermolecular
        forces, like water, have lower vapor pressures and higher boiling points.
      </li>
      <li>
        <strong>Sublimation too:</strong> the same equation with ΔH_sub describes a solid’s vapor
        pressure, as LibreTexts shows for ice.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do I find the enthalpy of vaporization from vapor pressures?',
      a: 'Measure the vapor pressure at two temperatures, convert the temperatures to kelvin, and use ΔH_vap = R ln(P₂/P₁) ÷ (1/T₁ − 1/T₂). For ethanol, 5.95 kPa at 20.0 °C and 53.3 kPa at 63.5 °C give about 41.4 kJ/mol.',
    },
    {
      q: 'How do I find the boiling point at a different pressure?',
      a: 'Start from the normal boiling point at 101.325 kPa, enter ΔH_vap and the new pressure, and solve for T₂. Benzene, boiling at 80.1 °C at sea level, boils at about 73.7 °C at Denver’s 83.4 kPa.',
    },
    {
      q: 'What units should I use?',
      a: 'Any pressure unit works as long as both pressures use it, because only their ratio matters. Temperatures must be absolute inside the formula; enter °C and the calculator adds 273.15. ΔH_vap is in kJ/mol.',
    },
    {
      q: 'Why does the answer differ slightly from my textbook?',
      a: 'Books often round temperatures to 0.1 K or use R = 8.314. Small differences in the reciprocals 1/T₁ − 1/T₂ change the third digit; the calculator keeps full precision with R = 8.314462618 J/(mol·K).',
    },
  ],
  ogSample: (r, fmt) => `Isooctane 10 → 100 kPa from 34 to 98.8 °C → ${fmt.sig(o(r), 3)} kJ/mol`,
};
