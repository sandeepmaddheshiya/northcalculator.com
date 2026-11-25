import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'result') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Nernst Equation Calculator',
  promise: 'Cell potential under real conditions, plus ΔG and the equilibrium constant.',
  title: 'Nernst Equation Calculator: Cell Potential, ΔG and K',
  description:
    'Find a galvanic cell’s potential at any concentrations and temperature with the Nernst equation, with ΔG, ΔG° and the equilibrium constant from E°.',
  summary:
    'A cell’s standard potential E° applies only when every concentration is 1 M. The Nernst equation corrects it for real conditions: E = E° − (RT/nF) ln Q, which at 25 °C is E° − (0.0592 V/n) log Q. A positive E means the reaction runs forward on its own; E° also fixes the equilibrium constant through ln K = nFE°/RT.',
  synonyms: [
    'cell potential calculator',
    'Nernst equation 0.0592',
    'electrochemical cell calculator',
    'E cell from E standard',
    'equilibrium constant from cell potential',
    'concentration cell calculator',
  ],
  ui: {
    mode: 'Find',
    'mode.e': 'Cell potential E',
    'mode.k': 'K and ΔG°',
    e0: 'Standard cell potential E° (V)',
    'e0.help': 'E°cathode − E°anode from a table of standard reduction potentials.',
    n: 'Electrons transferred, n',
    q: 'Reaction quotient Q',
    'q.help': 'Products over reactants, each to its coefficient; solids and liquids count as 1.',
    t: 'Temperature (°C)',
    'out.result': 'Result',
    'out.result.e': 'Cell potential E (V)',
    'out.result.k': 'Equilibrium constant K',
    'out.verdict': 'Reaction as written',
    'out.dG': 'ΔG (kJ/mol)',
    'out.dG0': 'ΔG° (kJ/mol)',
    'out.log10K': 'log₁₀ K',
    'verdict.yes': 'Spontaneous',
    'verdict.no': 'Not spontaneous',
    'verdict.eq': 'At equilibrium',
    'explain.yes': 'E = {e} V is positive, so the cell reaction runs forward on its own.',
    'explain.no': 'E = {e} V is negative, so the reaction runs in reverse on its own.',
    'explain.k': 'K is about 10 to the power {k}.',
    'step.slope': 'RT ÷ nF; at 25 °C and n = 1 this is 0.025693 V (× ln 10 = 0.05916 V).',
    'step.e': 'E = E° − (RT/nF) ln Q.',
    'step.g': 'ΔG = −nFE.',
    'step.k': 'ln K = nFE° ÷ RT.',
    'step.g0': 'ΔG° = −nFE°.',
    'warn.n': 'n must be a whole number of 1 or more.',
    'warn.kelvin': 'The temperature must be above absolute zero.',
    'warn.q': 'Q must be above zero.',
    'warn.huge': 'K is about 10^{k}, too large to write out; log₁₀ K is shown instead.',
    rounding:
      'F = 96,485.33212 C/mol and R = 8.314462618 J/(mol·K). Textbooks using 0.0592 V can differ in the third digit of K.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Nernst equation">{'E = E° − (RT ÷ nF) × ln Q'}</Formula>
      <Formula label="At 25 °C">{'E = E° − (0.05916 V ÷ n) × log₁₀ Q'}</Formula>
      <Formula label="Free energy and equilibrium">
        {'ΔG = −nFE,  ΔG° = −nFE°\nln K = nFE° ÷ RT'}
      </Formula>
      <p>
        Q has the same form as the equilibrium constant but uses the current concentrations (or
        partial pressures). As the cell runs, Q rises until E reaches zero, where Q = K and the
        battery is dead.
      </p>
    </>
  ),
  examples: [
    {
      id: 'cobalt',
      title: 'Co | Co²⁺ (0.15 M) ‖ Fe²⁺ (1.94 M) | Fe: E° = −0.17 V, n = 2',
      body: (r, fmt) => (
        <p>
          Q = 0.15 ÷ 1.94 = 0.077, so E = −0.17 − (0.0592 ÷ 2) log 0.077 ={' '}
          <strong>{fmt.sig(o(r), 2)} V</strong>: still not spontaneous, as in OpenStax{' '}
          <em>Chemistry 2e</em> Example 17.7.
        </p>
      ),
    },
    {
      id: 'daniell',
      title: 'A zinc–copper cell after a minute: [Zn²⁺] 1.95 M, [Cu²⁺] 0.05 M',
      body: (r, fmt) => (
        <p>
          Q = 1.95 ÷ 0.05 = 39, so E = 1.10 − 0.0296 log 39 = <strong>{fmt.sig(o(r), 3)} V</strong>,
          as in the LibreTexts Nernst equation example.
        </p>
      ),
    },
    {
      id: 'silver',
      title: 'Silver ions and iron: E° = +1.247 V, n = 2',
      body: (r, fmt) => (
        <p>
          ΔG° = −2 × 96,485 × 1.247 = <strong>{fmt.sig(o(r, 'dG0'), 4)} kJ/mol</strong>, and K is
          about 10^{fmt.sig(o(r, 'log10K'), 4)} (OpenStax Example 17.6, which prints 1.3 × 10⁴²
          using 0.0592 V).
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Concentration cells:</strong> the same electrode in two concentrations has E° = 0,
        yet still produces a small voltage: 0.10 M and 0.50 M zinc give 0.021 V.
      </li>
      <li>
        <strong>Every factor of 10 in Q</strong> shifts E by 0.0592 V ÷ n at 25 °C.
      </li>
      <li>
        <strong>Spontaneous is not fast:</strong> a positive E shows the direction of the reaction,
        not how quickly current can flow.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do I use the Nernst equation?',
      a: 'Find E° from standard reduction potentials, count the electrons transferred, n, and write Q from the current concentrations. Then E = E° − (0.0592 V/n) log Q at 25 °C. For E° = −0.17 V, n = 2 and Q = 0.077, E = −0.14 V.',
    },
    {
      q: 'How is the equilibrium constant related to E°?',
      a: 'ln K = nFE° ÷ RT, or log K = nE° ÷ 0.0592 V at 25 °C. E° = +1.247 V with n = 2 gives log K ≈ 42, an enormous equilibrium constant: the reaction goes essentially to completion.',
    },
    {
      q: 'How do I find ΔG from a cell potential?',
      a: 'ΔG = −nFE, with F = 96,485 C/mol and E in volts, giving joules per mole of reaction. For n = 2 and E° = 1.247 V, ΔG° = −240.6 kJ/mol. A positive cell potential always means a negative ΔG.',
    },
    {
      q: 'What is a concentration cell?',
      a: 'A cell with the same metal and ion on both sides at different concentrations. E° is zero, so the voltage comes entirely from the Nernst term: zinc at 0.10 M and 0.50 M gives +0.021 V until both reach 0.30 M.',
    },
  ],
  ogSample: (r, fmt) => `E° −0.17 V, n 2, Q 0.077 → E = ${fmt.sig(o(r), 2)} V`,
};
