import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'result') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Combined Gas Law Calculator',
  promise: 'New pressure, volume or temperature of a gas after its conditions change.',
  title: 'Combined Gas Law Calculator: P1V1/T1 = P2V2/T2 Solver',
  description:
    'Find a gas’s new pressure, volume or temperature after a change with P1V1/T1 = P2V2/T2, covering Boyle’s, Charles’s and Gay-Lussac’s laws.',
  summary:
    'For a fixed amount of gas, pressure times volume divided by absolute temperature stays constant: P₁V₁/T₁ = P₂V₂/T₂. Keep the temperature fixed and it becomes Boyle’s law; keep the pressure fixed and it is Charles’s law. Temperatures must be in kelvin, so add 273.15 to Celsius. Pressure and volume can use any units, as long as both states match.',
  synonyms: [
    'P1V1/T1 = P2V2/T2 calculator',
    'Boyle’s law calculator',
    'Charles’s law calculator',
    'Gay-Lussac’s law calculator',
    'gas law calculator',
    'final volume of gas',
  ],
  ui: {
    find: 'Find',
    'find.p2': 'P₂',
    'find.v2': 'V₂',
    'find.t2': 'T₂',
    before: 'Before',
    after: 'After',
    p1: 'Pressure P₁',
    v1: 'Volume V₁',
    t1: 'Temperature T₁',
    p2: 'Pressure P₂',
    v2: 'Volume V₂',
    t2: 'Temperature T₂',
    tu: 'Temperatures in',
    'tu.K': 'Kelvin',
    'tu.C': '°C',
    'out.result': 'New pressure P₂',
    'out.result.p2': 'New pressure P₂',
    'out.result.v2': 'New volume V₂',
    'out.result.t2': 'New temperature T₂',
    'out.t1k': 'T₁ in kelvin',
    'out.t2k': 'T₂ in kelvin',
    'out.constant': 'PV ÷ T (stays constant)',
    explain: 'After the change: P₂ = {p2}, V₂ = {v2}, T₂ = {t2} K.',
    'step.kelvin': 'Convert temperatures to kelvin: K = °C + 273.15.',
    'step.p2': 'P₂ = P₁V₁T₂ ÷ (T₁V₂).',
    'step.v2': 'V₂ = P₁V₁T₂ ÷ (T₁P₂).',
    'step.t2': 'T₂ = P₂V₂T₁ ÷ (P₁V₁).',
    'warn.kelvin': 'Temperatures must be above absolute zero.',
    'warn.zero': 'Pressures and volumes must be greater than zero.',
    rounding: 'Uses 273.15 for °C. Results keep 12 significant digits and are shown to 8.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Combined gas law">{'P₁V₁ ÷ T₁ = P₂V₂ ÷ T₂'}</Formula>
      <Formula label="Special cases">
        {
          'T constant: P₁V₁ = P₂V₂ (Boyle)\nP constant: V₁ ÷ T₁ = V₂ ÷ T₂ (Charles)\nV constant: P₁ ÷ T₁ = P₂ ÷ T₂ (Gay-Lussac)'
        }
      </Formula>
      <p>
        It follows from the ideal gas law with a fixed number of moles. LibreTexts converts with 273
        instead of 273.15, which can change the last digit. Its Example 11.6.1 prints 3.22 atm, but
        its own numbers give 3.29 atm.
      </p>
    </>
  ),
  examples: [
    {
      id: 'pressure',
      title: '8.33 L at 1.82 atm and 286 K, squeezed to 5.72 L at 355 K',
      body: (r, fmt) => (
        <p>
          P₂ = 1.82 × 8.33 × 355 ÷ (286 × 5.72) = <strong>{fmt.sig(o(r), 3)} atm</strong>.
          LibreTexts Example 11.6.1 prints 3.22 atm for these values.
        </p>
      ),
    },
    {
      id: 'scuba',
      title: 'A 13.2 L scuba tank at 153 atm and 300 K, breathed at 3.13 atm and 310 K',
      body: (r, fmt) => (
        <p>
          V₂ = 153 × 13.2 × 310 ÷ (300 × 3.13) = <strong>{fmt.sig(o(r), 3)} L</strong> of air, as in
          OpenStax <em>Chemistry</em> Example 9.10.
        </p>
      ),
    },
    {
      id: 'boyle',
      title: 'Boyle’s law: 4.01 L at 2.44 atm expanded to 1.93 atm',
      body: (r, fmt) => (
        <p>
          With the temperature unchanged, V₂ = 2.44 × 4.01 ÷ 1.93 ={' '}
          <strong>{fmt.sig(o(r), 3)} L</strong>, the 5.07 L of LibreTexts Example 11.4.1.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Kelvin only.</strong> Using °C directly gives wrong answers and can divide by zero
        at 0 °C.
      </li>
      <li>
        <strong>Match the units:</strong> if P₁ is in torr, P₂ comes out in torr; if V₁ is in mL, so
        is V₂.
      </li>
      <li>
        <strong>Fixed amount of gas:</strong> if gas escapes or is added, use the ideal gas law
        instead.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'What is the combined gas law?',
      a: 'P₁V₁/T₁ = P₂V₂/T₂, linking the pressure, volume and absolute temperature of a fixed amount of gas before and after a change. It combines Boyle’s, Charles’s and Gay-Lussac’s laws into one equation.',
    },
    {
      q: 'How do I use Boyle’s law?',
      a: 'At constant temperature, P₁V₁ = P₂V₂, so V₂ = P₁V₁ ÷ P₂. 4.01 L of gas at 2.44 atm expands to 5.07 L when the pressure drops to 1.93 atm. Halving the pressure doubles the volume.',
    },
    {
      q: 'How do I use Charles’s law?',
      a: 'At constant pressure, V₁/T₁ = V₂/T₂ with temperatures in kelvin. 2.20 L of gas at 22 °C (295.15 K) heated to 71 °C (344.15 K) grows to 2.20 × 344.15 ÷ 295.15 ≈ 2.57 L.',
    },
    {
      q: 'Why must temperature be in kelvin?',
      a: 'Gas volume and pressure are proportional to absolute temperature, which starts at absolute zero. On the Celsius scale, doubling 10 °C to 20 °C does not double the volume; doubling 283 K to 566 K does.',
    },
  ],
  ogSample: (r, fmt) => `8.33 L, 1.82 atm, 286 K → P₂ = ${fmt.sig(o(r), 3)} atm`,
};
