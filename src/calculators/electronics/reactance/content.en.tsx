import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'x') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Reactance Calculator',
  promise: 'Inductive and capacitive reactance at any frequency, plus LC resonance.',
  title: 'Reactance Calculator: Inductive, Capacitive and Resonance',
  description:
    'Find inductive reactance X_L = 2πfL or capacitive reactance X_C = 1/2πfC at any frequency, the current at a voltage, and the resonant frequency of an LC pair.',
  summary:
    'Reactance is how strongly an inductor or capacitor opposes alternating current, measured in ohms. An inductor’s reactance rises with frequency, so it passes low frequencies and blocks high ones. A capacitor does the opposite. At the resonant frequency the two are equal and cancel in a series circuit, leaving only the resistance to limit the current.',
  synonyms: [
    'inductive reactance calculator',
    'capacitive reactance calculator',
    'XL calculator',
    'XC calculator',
    'LC resonant frequency calculator',
    'impedance of a capacitor',
  ],
  ui: {
    comp: 'Component',
    'comp.L': 'Inductor',
    'comp.C': 'Capacitor',
    'comp.LC': 'Both (LC)',
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
    V: 'Voltage (V)',
    'V.help': 'Rms voltage gives rms current; peak voltage gives peak current.',
    'out.x': 'Reactance (Ω)',
    'out.x.L': 'Inductive reactance X_L (Ω)',
    'out.x.C': 'Capacitive reactance X_C (Ω)',
    'out.x.LC': 'Net series reactance X_L − X_C (Ω)',
    'out.xl': 'Inductive reactance X_L (Ω)',
    'out.xc': 'Capacitive reactance X_C (Ω)',
    'out.current': 'Current at that voltage (A)',
    'out.f0': 'Resonant frequency f₀ (Hz)',
    'out.omega': 'Angular frequency ω (rad/s)',
    'explain.single': 'At {f} Hz the component opposes AC with {x} Ω of reactance.',
    'explain.inductive': 'At {f} Hz the inductor dominates by {x} Ω; resonance is at {f0} Hz.',
    'explain.capacitive': 'At {f} Hz the capacitor dominates by {x} Ω; resonance is at {f0} Hz.',
    'explain.resonant': 'At {f} Hz the reactances cancel: this is the resonant frequency.',
    'step.omega': 'Angular frequency ω = 2πf.',
    'step.xl': 'X_L = ωL.',
    'step.xc': 'X_C = 1 ÷ (ωC).',
    'step.net': 'In series the reactances subtract.',
    'step.f0': 'Resonance, where X_L = X_C: f₀ = 1 ÷ (2π√(LC)).',
    'step.current': 'I = V ÷ |X|, ignoring resistance.',
    'warn.zero': 'Enter an inductance or capacitance above zero.',
    'warn.dc': 'At 0 Hz (direct current) a capacitor blocks current completely: X_C is infinite.',
    'warn.dcL': 'At 0 Hz (direct current) an ideal inductor has no reactance.',
    rounding: 'Results keep 12 significant digits and are shown to 8.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Inductor">{'X_L = 2π × f × L'}</Formula>
      <Formula label="Capacitor">{'X_C = 1 ÷ (2π × f × C)'}</Formula>
      <Formula label="Resonance">{'f₀ = 1 ÷ (2π × √(L × C))'}</Formula>
      <p>
        Reactance limits current the way resistance does, I = V ÷ X, but it stores and returns
        energy instead of turning it into heat, and it shifts the current’s timing: current lags the
        voltage by 90° in an inductor and leads it by 90° in a capacitor.
      </p>
      <p>
        These are ideal components. A real coil also has wire resistance, so the full impedance of a
        series circuit is Z = √(R² + (X_L − X_C)²).
      </p>
    </>
  ),
  examples: [
    {
      id: 'inductor',
      title: 'A 3.00 mH inductor on 60 Hz mains',
      body: (r, fmt) => (
        <p>
          X_L = 2π × 60 × 0.003 = <strong>{fmt.sig(o(r), 3)} Ω</strong>, so 120 V drives about{' '}
          {fmt.sig(o(r, 'current'), 3)} A, as in OpenStax <em>College Physics</em> Example 23.10. At
          10 kHz the same coil has 188 Ω.
        </p>
      ),
    },
    {
      id: 'capacitor',
      title: 'A 5.00 µF capacitor at 60 Hz',
      body: (r, fmt) => (
        <p>
          X_C = 1 ÷ (2π × 60 × 5.00 × 10⁻⁶) = <strong>{fmt.sig(o(r), 3)} Ω</strong>, letting only{' '}
          {fmt.sig(o(r, 'current'), 3)} A through at 120 V (Example 23.11).
        </p>
      ),
    },
    {
      id: 'resonance',
      title: 'The 3.00 mH coil and 5.00 µF capacitor together',
      body: (r, fmt) => (
        <p>
          f₀ = 1 ÷ (2π√(0.003 × 0.000005)) = <strong>{fmt.sig(o(r, 'f0'), 3)} Hz</strong>, the 1.30
          kHz of OpenStax Example 23.13. At 60 Hz the capacitor dominates.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Filters:</strong> a capacitor in series blocks bass and passes treble; an inductor
        does the reverse. That is how loudspeaker crossovers split sound between drivers.
      </li>
      <li>
        <strong>Ten times the frequency:</strong> X_L becomes ten times larger and X_C ten times
        smaller.
      </li>
      <li>
        <strong>Tuning:</strong> a radio tunes by changing C so that f₀ matches the station’s
        frequency.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do I calculate inductive reactance?',
      a: 'Multiply 2π by the frequency in hertz and the inductance in henries: X_L = 2πfL. A 3.00 mH inductor at 60 Hz has 2π × 60 × 0.003 ≈ 1.13 Ω, and at 10 kHz about 188 Ω, as in OpenStax College Physics Example 23.10.',
    },
    {
      q: 'How do I calculate capacitive reactance?',
      a: 'Divide 1 by 2π times the frequency times the capacitance in farads: X_C = 1/(2πfC). A 10 µF capacitor at 60 Hz has 1/(2π × 60 × 0.00001) ≈ 265 Ω, as in OpenStax University Physics Volume 2 Example 15.1.',
    },
    {
      q: 'What is the difference between reactance and resistance?',
      a: 'Both are in ohms and limit current, but resistance turns energy into heat while reactance stores it in a magnetic or electric field and returns it each cycle. Reactance also depends on frequency, and resistance does not.',
    },
    {
      q: 'What is the resonant frequency of an LC circuit?',
      a: 'It is the frequency at which the inductive and capacitive reactances are equal: f₀ = 1/(2π√(LC)). For 3.00 mH and 5.00 µF that is about 1.30 kHz. In a series circuit the current is then limited only by the resistance.',
    },
  ],
  ogSample: (r, fmt) => `3.00 mH at 60 Hz → X_L = ${fmt.sig(o(r), 3)} Ω`,
};
