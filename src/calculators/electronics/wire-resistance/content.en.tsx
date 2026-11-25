import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'result') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Wire Resistance Calculator',
  promise: 'Resistance of a wire from its material, length and diameter, at any temperature.',
  title: 'Wire Resistance Calculator: R = ρL/A, Voltage Drop and Heat',
  description:
    'Find a wire’s resistance from its material, length and diameter, or the diameter or length for a target resistance, at any temperature, with voltage drop.',
  summary:
    'A wire’s resistance grows with its length and falls with its cross-sectional area: R = ρL/A, where ρ is the material’s resistivity. Doubling the diameter quarters the resistance. Metals also resist more when hot, by about 0.4% per degree for copper, which is why a light bulb filament has ten times its cold resistance when glowing.',
  synonyms: [
    'resistivity calculator',
    'cable resistance calculator',
    'voltage drop calculator',
    'copper wire resistance',
    'R = rho L / A calculator',
    'resistance at temperature calculator',
  ],
  ui: {
    find: 'Solve for',
    'find.r': 'Resistance',
    'find.d': 'Diameter',
    'find.l': 'Length',
    material: 'Material',
    'material.silver': 'Silver',
    'material.copper': 'Copper',
    'material.gold': 'Gold',
    'material.aluminum': 'Aluminum',
    'material.tungsten': 'Tungsten',
    'material.iron': 'Iron',
    'material.platinum': 'Platinum',
    'material.constantan': 'Constantan',
    'material.nichrome': 'Nichrome',
    'material.custom': 'Other: enter ρ and α',
    matRow: 'Material constants at 20 °C',
    rho: 'ρ (× 10⁻⁸ Ω·m)',
    alpha: 'α (per °C)',
    length: 'Length (m)',
    diameter: 'Diameter (mm)',
    target: 'Target resistance (Ω)',
    temp: 'Wire temperature (°C)',
    'temp.help': 'Resistivities are given at 20 °C; other temperatures use R = R₀(1 + αΔT).',
    current: 'Current (A), optional',
    'out.result': 'Result',
    'out.result.r': 'Resistance (Ω)',
    'out.result.d': 'Diameter needed (mm)',
    'out.result.l': 'Length needed (m)',
    'out.r': 'Resistance at that temperature (Ω)',
    'out.r20': 'Resistance at 20 °C (Ω)',
    'out.area': 'Cross-section (mm²)',
    'out.perM': 'Resistance per metre (Ω/m)',
    'out.vdrop': 'Voltage drop at that current (V)',
    'out.loss': 'Power lost as heat (W)',
    explain: '{l} m of {d} mm wire at {t} °C has a resistance of {r} Ω.',
    'step.area': 'Cross-sectional area A = πd²/4.',
    'step.temp': 'Resistivity at temperature: ρ = ρ₂₀(1 + α(T − 20)).',
    'step.r': 'R = ρL ÷ A.',
    'step.d': 'A = ρL ÷ R, then d = √(4A/π).',
    'step.l': 'L = RA ÷ ρ.',
    'warn.rho': 'Resistivity must be above zero.',
    'warn.temp':
      'That temperature gives a negative resistance with this α; the linear model fails there.',
    'warn.size': 'Length and diameter must be above zero.',
    'warn.target': 'Enter a target resistance above zero.',
    rounding:
      'Constants are typical values from OpenStax; real wire varies with alloy and annealing. The temperature formula is linear and best within a few hundred degrees of 20 °C.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Resistance">{'R = ρ × L ÷ A,  A = π × d² ÷ 4'}</Formula>
      <Formula label="Temperature">{'R = R₂₀ × (1 + α × (T − 20 °C))'}</Formula>
      <Formula label="With a current">{'V = I × R,  P = I² × R'}</Formula>
      <p>
        A round trip in a cable uses twice the run length: a load 10 m away is fed through 20 m of
        conductor. Alloys such as constantan barely change with temperature, which is why they are
        used in precision resistors.
      </p>
    </>
  ),
  examples: [
    {
      id: 'copper',
      title: '5.00 m of copper wire 2.053 mm across',
      body: (r, fmt) => (
        <p>
          A = 3.31 mm², so R = 1.68 × 10⁻⁸ × 5.00 ÷ 3.31 × 10⁻⁶ ={' '}
          <strong>{fmt.sig(o(r), 3)} Ω</strong>, as in OpenStax <em>University Physics</em> Example
          9.5.
        </p>
      ),
    },
    {
      id: 'filament',
      title: 'A tungsten headlight filament: 0.350 Ω in 4.00 cm',
      body: (r, fmt) => (
        <p>
          The diameter must be <strong>{fmt.sig(o(r), 2)} mm</strong>, 9.0 × 10⁻⁵ m, as in OpenStax{' '}
          <em>College Physics</em> Example 20.5.
        </p>
      ),
    },
    {
      id: 'hot',
      title: 'The same filament glowing at 2850 °C',
      body: (r, fmt) => (
        <p>
          R = 0.350 × (1 + 0.0045 × 2830) = <strong>{fmt.sig(o(r, 'r'), 2)} Ω</strong>, more than
          ten times its cold value (Example 20.6).
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Voltage drop:</strong> enter the current to see how many volts are lost in the wire;
        long, thin runs at high current lose the most.
      </li>
      <li>
        <strong>Aluminum vs copper:</strong> aluminum has about 1.6 times the resistivity, so it
        needs a larger cross-section for the same resistance.
      </li>
      <li>
        <strong>Heating elements</strong> use nichrome, with about 60 times copper’s resistivity, so
        a short coil has useful resistance.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do I calculate the resistance of a wire?',
      a: 'Multiply the resistivity by the length and divide by the cross-sectional area: R = ρL/A. For 5.00 m of copper (1.68 × 10⁻⁸ Ω·m) with a 2.053 mm diameter, A = 3.31 × 10⁻⁶ m² and R ≈ 0.025 Ω.',
    },
    {
      q: 'How does temperature change resistance?',
      a: 'For metals R = R₀(1 + αΔT), with α about 0.0039 per °C for copper. A tungsten filament with 0.350 Ω at 20 °C has about 4.8 Ω at 2850 °C. Semiconductors such as carbon have a negative α and resist less when hot.',
    },
    {
      q: 'What is resistivity?',
      a: 'It is a material’s intrinsic resistance, in ohm-metres: the resistance of a 1 m cube. Silver (1.59 × 10⁻⁸ Ω·m) and copper (1.68 × 10⁻⁸) are the best common conductors; nichrome is 100 × 10⁻⁸.',
    },
    {
      q: 'Why do textbooks give different values for copper?',
      a: 'Resistivity depends on purity and processing. OpenStax University Physics lists 1.68 × 10⁻⁸ Ω·m, while College Physics lists 1.72 × 10⁻⁸ Ω·m, a 2% difference. Use the value for your actual wire if you have it.',
    },
  ],
  ogSample: (r, fmt) => `5 m of 2.053 mm copper → ${fmt.sig(o(r), 3)} Ω`,
};
