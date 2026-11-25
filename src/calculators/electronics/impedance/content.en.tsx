import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'z') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'RLC Impedance Calculator',
  promise: 'Impedance, phase angle, power factor and power of a series AC circuit.',
  title: 'RLC Impedance Calculator: Phase Angle and Power Factor',
  description:
    'Find the impedance of a series RLC, RL or RC circuit at any frequency, with the phase angle, power factor, current and average power at a given voltage.',
  summary:
    'Impedance is the total opposition a circuit offers to alternating current: resistance combined with the difference between inductive and capacitive reactance, Z = √(R² + (X_L − X_C)²). It sets the current, I = V ÷ Z. The phase angle shows whether current lags or leads the voltage, and its cosine, the power factor, is the share of power actually used.',
  synonyms: [
    'impedance calculator',
    'series RLC circuit calculator',
    'power factor calculator',
    'phase angle calculator',
    'RC circuit impedance',
    'RL circuit impedance',
  ],
  ui: {
    comp: 'Circuit',
    'comp.RLC': 'R, L and C',
    'comp.RL': 'R and L',
    'comp.RC': 'R and C',
    R: 'Resistance (Ω)',
    freqRow: 'Frequency',
    f: 'Frequency',
    unit: 'Unit',
    'unit.Hz': 'Hz',
    'unit.kHz': 'kHz',
    'unit.MHz': 'MHz',
    indRow: 'Inductance',
    L: 'Inductance',
    'unit.H': 'H',
    'unit.mH': 'mH',
    'unit.uH': 'µH',
    capRow: 'Capacitance',
    C: 'Capacitance',
    'unit.F': 'F',
    'unit.uF': 'µF',
    'unit.nF': 'nF',
    'unit.pF': 'pF',
    V: 'Source voltage, rms (V)',
    'V.help': 'Mains voltages such as 120 V or 230 V are rms values.',
    'out.z': 'Impedance Z (Ω)',
    'out.phi': 'Phase angle φ (°)',
    'out.pf': 'Power factor (cos φ)',
    'out.current': 'Current, rms (A)',
    'out.power': 'Average power (W)',
    'out.xl': 'Inductive reactance X_L (Ω)',
    'out.xc': 'Capacitive reactance X_C (Ω)',
    'out.f0': 'Resonant frequency f₀ (Hz)',
    'explain.lag': 'The circuit is inductive: {z} Ω, with current lagging the voltage by {phi}°.',
    'explain.lead': 'The circuit is capacitive: {z} Ω, with current leading the voltage by {phi}°.',
    'explain.resonant':
      'The reactances cancel, so the circuit is purely resistive at {z} Ω and current is in phase.',
    'step.xl': 'X_L = 2πfL.',
    'step.xc': 'X_C = 1 ÷ (2πfC).',
    'step.z': 'Z = √(R² + (X_L − X_C)²).',
    'step.phi': 'Phase angle φ = tan⁻¹((X_L − X_C) ÷ R); power factor = cos φ = R ÷ Z.',
    'step.i': 'I = V ÷ Z.',
    'step.p': 'Average power P = I × V × cos φ.',
    'warn.zero': 'Enter an inductance or capacitance above zero.',
    'warn.dc': 'Enter a frequency above zero. At DC a capacitor blocks current entirely.',
    'warn.r': 'Resistance cannot be negative.',
    'warn.short':
      'With no resistance at resonance the impedance is zero: the current is unlimited.',
    rounding: 'Results keep 12 significant digits and are shown to 6–8.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Impedance">{'Z = √(R² + (X_L − X_C)²)'}</Formula>
      <Formula label="Phase and power factor">
        {'φ = tan⁻¹((X_L − X_C) ÷ R)\ncos φ = R ÷ Z'}
      </Formula>
      <Formula label="Current and power">{'I = V ÷ Z\nP = I × V × cos φ = I² × R'}</Formula>
      <p>
        In a series circuit the inductor and capacitor voltages are opposite in phase, so their
        reactances subtract. Only the resistor uses power; the inductor and capacitor store energy
        and hand it back each cycle. A positive phase angle means current lags the voltage, a
        negative one that it leads.
      </p>
      <p>
        At the resonant frequency f₀ = 1 ÷ (2π√(LC)) the reactances cancel, the impedance falls to
        R, and the current and power reach their maximum.
      </p>
    </>
  ),
  examples: [
    {
      id: 'mains',
      title: '40.0 Ω, 3.00 mH and 5.00 µF in series on 120 V, 60 Hz',
      body: (r, fmt) => (
        <p>
          X_L is only 1.13 Ω while X_C is 531 Ω, so Z = <strong>{fmt.sig(o(r), 3)} Ω</strong>. The
          current is {fmt.sig(o(r, 'current'), 3)} A, the power factor {fmt.sig(o(r, 'pf'), 3)}, and
          the circuit uses just {fmt.sig(o(r, 'power'), 3)} W, as in OpenStax{' '}
          <em>College Physics</em> Examples 23.12 and 23.14.
        </p>
      ),
    },
    {
      id: 'audio',
      title: 'The same circuit at 10.0 kHz',
      body: (r, fmt) => (
        <p>
          Now X_L = 188 Ω dominates and Z = <strong>{fmt.sig(o(r), 3)} Ω</strong>, so the current
          rises to {fmt.sig(o(r, 'current'), 3)} A (Example 23.12).
        </p>
      ),
    },
    {
      id: 'small',
      title: '4.00 Ω, 3.00 mH and 800 µF at 200 Hz',
      body: (r, fmt) => (
        <p>
          X_L = 3.77 Ω and X_C = 0.995 Ω give Z = <strong>{fmt.sig(o(r), 3)} Ω</strong> and a phase
          angle of {fmt.sig(o(r, 'phi'), 3)}°, 0.607 rad, as in OpenStax <em>University Physics</em>{' '}
          Example 15.2.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Power factor near 1</strong> means the circuit behaves like a resistor and draws
        little wasted current. Motors are inductive, which is why factories add capacitors to
        correct their power factor.
      </li>
      <li>
        <strong>Leave a component out</strong> with the R and L or R and C options, for a coil with
        resistance or an RC filter.
      </li>
      <li>
        <strong>Peak or rms:</strong> enter rms voltage for average power. A peak voltage gives peak
        current, but the power figure would then be doubled.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do I calculate the impedance of an RLC circuit?',
      a: 'Find X_L = 2πfL and X_C = 1/(2πfC), subtract them, and combine with R: Z = √(R² + (X_L − X_C)²). With 40.0 Ω, 3.00 mH and 5.00 µF at 60 Hz, X_L is 1.13 Ω and X_C 531 Ω, giving Z ≈ 531 Ω.',
    },
    {
      q: 'What is the power factor?',
      a: 'It is cos φ = R ÷ Z, the fraction of the apparent power V × I that the circuit actually uses. It ranges from 0 for a pure inductor or capacitor to 1 at resonance or for a pure resistor. The 60 Hz example above has a power factor of only 0.0753.',
    },
    {
      q: 'What does the phase angle tell me?',
      a: 'It is how far the current is shifted from the voltage. A positive angle means the inductor dominates and current lags; a negative angle means the capacitor dominates and current leads. OpenStax Example 15.2 finds 0.607 rad, about 34.8°, lagging.',
    },
    {
      q: 'How do I find the average power in an AC circuit?',
      a: 'Multiply rms current, rms voltage and the power factor: P = I V cos φ, which equals I²R. The 60 Hz circuit above draws 0.226 A at 120 V with cos φ = 0.0753, so it uses about 2.04 W. At resonance it would use 360 W.',
    },
  ],
  ogSample: (r, fmt) => `40 Ω, 3 mH, 5 µF at 60 Hz → Z = ${fmt.sig(o(r), 3)} Ω`,
};
