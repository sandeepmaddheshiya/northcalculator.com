import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'dG') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Gibbs Free Energy Calculator',
  promise: 'ΔG from enthalpy, entropy and temperature, with spontaneity and K.',
  title: 'Gibbs Free Energy Calculator: ΔG = ΔH − TΔS and Spontaneity',
  description:
    'Find the Gibbs free energy change from ΔH, ΔS and temperature: whether a reaction is spontaneous, the temperature where that flips, and the equilibrium K.',
  summary:
    'Gibbs free energy combines enthalpy and entropy to predict whether a process happens on its own: ΔG = ΔH − TΔS. A negative ΔG means spontaneous, positive means not, and zero means equilibrium. Because temperature multiplies the entropy term, many reactions switch at a crossover temperature, T = ΔH ÷ ΔS, such as water boiling near 100 °C.',
  synonyms: [
    'delta G calculator',
    'ΔG = ΔH − TΔS calculator',
    'spontaneity calculator',
    'free energy to equilibrium constant',
    'is a reaction spontaneous',
    'crossover temperature calculator',
  ],
  ui: {
    dH: 'Enthalpy change ΔH (kJ/mol)',
    dS: 'Entropy change ΔS (J/(mol·K))',
    'dS.help': 'Entropy is usually listed in joules, not kilojoules; the calculator converts.',
    tRow: 'Temperature',
    T: 'Temperature',
    tu: 'Unit',
    'tu.K': 'K',
    'tu.C': '°C',
    'out.dG': 'Gibbs free energy change ΔG (kJ/mol)',
    'out.verdict': 'At this temperature',
    'out.tdS': 'Entropy term TΔS (kJ/mol)',
    'out.crossK': 'Crossover temperature (K)',
    'out.crossC': 'Crossover temperature (°C)',
    'out.K': 'Equilibrium constant K (standard values)',
    'verdict.yes': 'Spontaneous',
    'verdict.no': 'Not spontaneous',
    'verdict.eq': 'At equilibrium',
    'explain.yes': 'ΔG = {g} kJ/mol is negative, so the process is spontaneous at {t} K.',
    'explain.no': 'ΔG = {g} kJ/mol is positive, so the process is not spontaneous at {t} K.',
    'explain.eq': 'ΔG is zero: at {t} K the process is at equilibrium.',
    'step.kelvin': 'Convert to kelvin.',
    'step.tds': 'TΔS in kJ: multiply and divide by 1000.',
    'step.dg': 'ΔG = ΔH − TΔS.',
    'step.cross': 'Crossover where ΔG = 0: T = ΔH ÷ ΔS.',
    'step.k': 'K = e^(−ΔG°/RT), with ΔG° in J.',
    'case.np': 'ΔH negative, ΔS positive: spontaneous at every temperature.',
    'case.pn': 'ΔH positive, ΔS negative: not spontaneous at any temperature.',
    'case.pp': 'ΔH and ΔS both positive: spontaneous above the crossover temperature.',
    'case.nn': 'ΔH and ΔS both negative: spontaneous below the crossover temperature.',
    'warn.kelvin': 'The temperature must be above absolute zero.',
    rounding:
      'R = 8.314462618 J/(mol·K). ΔH and ΔS are treated as constant with temperature, a good approximation over modest ranges.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Gibbs free energy">{'ΔG = ΔH − T × ΔS ÷ 1000'}</Formula>
      <Formula label="Crossover temperature">{'T = ΔH × 1000 ÷ ΔS'}</Formula>
      <Formula label="Equilibrium constant">{'K = e^(−ΔG° × 1000 ÷ (R × T))'}</Formula>
      <p>
        Temperature must be in kelvin. ΔH is in kJ/mol and ΔS in J/(mol·K), so the entropy term is
        divided by 1000 to match units, the most common slip in these calculations.
      </p>
      <p>
        K is meaningful only when ΔH and ΔS are standard values (ΔH°, ΔS°). Spontaneous means
        thermodynamically favourable, not fast: diamond turning into graphite is spontaneous but
        immeasurably slow.
      </p>
    </>
  ),
  examples: [
    {
      id: 'boiling',
      title: 'Boiling water at 25 °C: ΔH° 44.01 kJ, ΔS° 118.8 J/K',
      body: (r, fmt) => (
        <p>
          ΔG° = 44.01 − 298 × 0.1188 = <strong>{fmt.sig(o(r), 2)} kJ</strong>, positive, so water
          does not boil at room temperature. The crossover, 44,010 ÷ 118.8 ={' '}
          {fmt.sig(o(r, 'crossK'), 4)} K, estimates the boiling point, as in OpenStax{' '}
          <em>Chemistry 2e</em> Examples 16.7 and 16.11.
        </p>
      ),
    },
    {
      id: 'dissolving',
      title: 'Ammonium nitrate dissolving: ΔH° 28.05 kJ, ΔS° 108.7 J/K at 298.15 K',
      body: (r, fmt) => (
        <p>
          ΔG° = 28.05 − 32.41 = <strong>{fmt.sig(o(r), 2)} kJ</strong>: spontaneous even though it
          absorbs heat, which is why it powers instant cold packs (Lower, Example 1.2).
        </p>
      ),
    },
    {
      id: 'ammonium',
      title: 'NH₃ + HCl → NH₄Cl at 25 °C: ΔH −176.0 kJ, ΔS −284.8 J/K',
      body: (r, fmt) => (
        <p>
          ΔG = −176.0 + 84.9 = <strong>{fmt.sig(o(r), 3)} kJ</strong>, spontaneous. Both terms are
          negative, so it stops being spontaneous above {fmt.sig(o(r, 'crossK'), 3)} K.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Units first:</strong> ΔS in J/(mol·K) must be divided by 1000 before subtracting
        from ΔH in kJ/mol.
      </li>
      <li>
        <strong>Kelvin only:</strong> using 25 instead of 298 for room temperature gives a wildly
        wrong entropy term.
      </li>
      <li>
        <strong>Large K, large magnitude:</strong> every 5.7 kJ/mol of −ΔG° at 25 °C multiplies K by
        about 10.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do I calculate ΔG from ΔH and ΔS?',
      a: 'Convert ΔS to kJ by dividing by 1000, multiply by the kelvin temperature and subtract from ΔH. For water boiling at 298 K, 44.01 − 298 × 0.1188 = 8.6 kJ, so it is not spontaneous at 25 °C, as in OpenStax Chemistry 2e.',
    },
    {
      q: 'What does a negative ΔG mean?',
      a: 'The process can happen on its own at that temperature and pressure, without outside energy. Positive ΔG means the reverse process is the spontaneous one, and ΔG = 0 means the system is at equilibrium.',
    },
    {
      q: 'At what temperature does a reaction become spontaneous?',
      a: 'When ΔH and ΔS have the same sign, set ΔG = 0 and solve T = ΔH ÷ ΔS. For water, 44,010 J ÷ 118.8 J/K = 370.5 K, close to the real boiling point of 373 K. If the signs differ, the answer is the same at every temperature.',
    },
    {
      q: 'How is ΔG° related to the equilibrium constant?',
      a: 'ΔG° = −RT ln K, so K = e^(−ΔG°/RT). A ΔG° of 55.7 kJ/mol for silver chloride dissolving at 298.15 K gives K = 1.74 × 10⁻¹⁰, its solubility product, as in OpenStax Example 16.13.',
    },
  ],
  ogSample: (r, fmt) => `ΔH 44.01 kJ, ΔS 118.8 J/K, 298 K → ΔG = ${fmt.sig(o(r), 2)} kJ`,
};
