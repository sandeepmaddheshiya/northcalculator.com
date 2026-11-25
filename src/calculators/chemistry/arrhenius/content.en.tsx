import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'result') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Arrhenius Equation Calculator',
  promise: 'Activation energy from two rates, or a rate constant at a new temperature.',
  title: 'Arrhenius Equation Calculator: Activation Energy and k',
  description:
    'Find the activation energy from rate constants at two temperatures, predict the rate constant at a new temperature, or get k from the frequency factor A.',
  summary:
    'The Arrhenius equation, k = A e^(−Ea/RT), describes how a reaction speeds up with temperature. Measure the rate constant at two temperatures and the two-point form gives the activation energy, Ea, the energy barrier the reaction must cross. Knowing Ea, you can predict the rate at any other temperature.',
  synonyms: [
    'activation energy calculator',
    'two-point Arrhenius equation',
    'rate constant at different temperature',
    'Ea calculator',
    'frequency factor calculator',
    'reaction rate temperature calculator',
  ],
  ui: {
    find: 'Solve for',
    'find.ea': 'Activation energy',
    'find.k2': 'k at a new T',
    'find.k': 'k from A',
    tu: 'Temperature unit',
    'tu.K': 'K',
    'tu.C': '°C',
    p1Row: 'First measurement',
    p2Row: 'Second measurement',
    k1: 'Rate constant k₁',
    T1: 'Temperature T₁',
    'T1.ea': 'Temperature T₁',
    'T1.k2': 'Temperature T₁',
    'T1.k': 'Temperature',
    k2: 'Rate constant k₂',
    T2: 'Temperature T₂',
    ea: 'Activation energy Ea (kJ/mol)',
    A: 'Frequency factor A',
    'out.result': 'Result',
    'out.result.ea': 'Activation energy Ea (kJ/mol)',
    'out.result.k2': 'Rate constant k₂ at T₂',
    'out.result.k': 'Rate constant k',
    'out.ea': 'Activation energy (kJ/mol)',
    'out.k2': 'Rate constant',
    'out.A': 'Frequency factor A (same units as k)',
    'out.ratio': 'Rate ratio k₂ ÷ k₁',
    'explain.ea': 'The reaction has an activation energy of about {ea} kJ/mol.',
    'explain.k2': 'At the new temperature k = {k}, {r} times the first rate.',
    'explain.k': 'At this temperature k = {k}.',
    'step.ln': 'Take the natural log of the rate ratio.',
    'step.ea': 'Ea = R ln(k₂/k₁) ÷ (1/T₁ − 1/T₂), with T in kelvin.',
    'step.A': 'A follows from k₁ = A e^(−Ea/RT₁).',
    'step.k2': 'k₂ = k₁ e^(−(Ea/R)(1/T₂ − 1/T₁)).',
    'step.k': 'k = A e^(−Ea/RT).',
    'warn.kelvin': 'Temperatures must be above absolute zero.',
    'warn.k': 'Rate constants and A must be above zero.',
    'warn.sameT': 'The two temperatures must differ.',
    'warn.negative':
      'The rate falls as temperature rises, giving a negative Ea; check that k₂ belongs to T₂.',
    rounding: 'R = 8.314462618 J/(mol·K). Results are shown to 6 significant figures.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Arrhenius equation">{'k = A × e^(−Ea ÷ (R × T))'}</Formula>
      <Formula label="Two-point form">{'ln(k₂ ÷ k₁) = (Ea ÷ R) × (1/T₁ − 1/T₂)'}</Formula>
      <p>
        Temperatures must be in kelvin, and Ea is converted to joules so that R = 8.314 J/(mol·K)
        fits. The units of k cancel in the ratio, so any consistent units work. A plot of ln k
        against 1/T is a straight line with slope −Ea/R, the graphical method textbooks use with
        several measurements.
      </p>
      <p>
        Rounding 1/T to three figures, as worked examples often do, shifts Ea noticeably because it
        depends on the small difference between two reciprocals. The calculator keeps full
        precision.
      </p>
    </>
  ),
  examples: [
    {
      id: 'n2o5',
      title: 'N₂O₅ decomposition: k = 1.66 at 650 K and 7.39 at 700 K',
      body: (r, fmt) => (
        <p>
          Ea = 8.314 × ln(7.39 ÷ 1.66) ÷ (1/650 − 1/700) ={' '}
          <strong>{fmt.sig(o(r), 3)} kJ/mol</strong>, the 1.1 × 10⁵ J/mol of OpenStax{' '}
          <em>Chemistry 2e</em> §12.5.
        </p>
      ),
    },
    {
      id: 'cooler',
      title: 'k = 7 at 370 K with Ea = 900 kJ/mol: what is k at 310 K?',
      body: (r, fmt) => (
        <p>
          k₂ = 7 × e^(−(900,000 ÷ R)(1/310 − 1/370)) = <strong>{fmt.sig(o(r), 4)}</strong>. The
          LibreTexts problem set, using R = 8.314, gets 1.788 × 10⁻²⁴: with an exponent this large,
          the fourth digit of R matters.
        </p>
      ),
    },
    {
      id: 'fromA',
      title: 'A = 9, Ea = 200 kJ/mol at 289 K',
      body: (r, fmt) => (
        <p>
          k = 9 × e^(−200,000 ÷ (R × 289)) = <strong>{fmt.sig(o(r), 3)}</strong> (6.37 × 10⁻³⁶ in
          the same problem set with R = 8.314): a huge barrier makes the reaction effectively stop.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>The ten-degree rule:</strong> an activation energy near 50 kJ/mol doubles the rate
        for every 10 K rise around room temperature.
      </li>
      <li>
        <strong>Cooking at altitude:</strong> water boils at about 92 °C in Denver, so an egg takes
        about 4.5 minutes instead of 3, an Ea of about 57 kJ/mol.
      </li>
      <li>
        <strong>Catalysts</strong> lower Ea, which raises k at every temperature without changing
        the equilibrium.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do I calculate activation energy from two temperatures?',
      a: 'Use Ea = R ln(k₂/k₁) ÷ (1/T₁ − 1/T₂) with temperatures in kelvin. For N₂O₅ with k = 1.66 at 650 K and 7.39 at 700 K, Ea = 8.314 × 1.493 ÷ 0.000110 ≈ 113,000 J/mol, or 113 kJ/mol.',
    },
    {
      q: 'How do I find the rate constant at another temperature?',
      a: 'Rearrange the two-point form: k₂ = k₁ e^(−(Ea/R)(1/T₂ − 1/T₁)). With k₁ = 7 at 370 K and Ea = 900 kJ/mol, cooling to 310 K gives k₂ ≈ 1.79 × 10⁻²⁴, a drop of about 25 orders of magnitude.',
    },
    {
      q: 'What is the frequency factor A?',
      a: 'It is the rate constant the reaction would have with no energy barrier, reflecting how often molecules collide in the right orientation. It has the same units as k. The calculator finds A from k₁ and Ea in the activation-energy mode.',
    },
    {
      q: 'Why does my answer differ from the textbook?',
      a: 'Usually because the book rounded 1/T or ln k before dividing. OpenStax Example 12.13 gives 180 kJ/mol for HI from rounded reciprocals; the same data at full precision give about 185 kJ/mol. Both agree to the two figures the data support.',
    },
  ],
  ogSample: (r, fmt) => `k 1.66 → 7.39 from 650 K to 700 K → Ea = ${fmt.sig(o(r), 3)} kJ/mol`,
};
