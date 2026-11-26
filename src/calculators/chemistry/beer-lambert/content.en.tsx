import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'result') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Beer–Lambert Law Calculator',
  promise: 'Absorbance, concentration or molar absorptivity from A = εbc, with transmittance.',
  title: 'Beer–Lambert Law Calculator: Absorbance and Concentration',
  description:
    'Use Beer’s law, A = εbc, to find absorbance, concentration or molar absorptivity, and convert between absorbance and percent transmittance.',
  summary:
    'The Beer–Lambert law links how much light a solution absorbs to how much of the absorbing substance it contains. Absorbance equals the molar absorptivity times the path length times the concentration. Enter a reading as absorbance or percent transmittance, and solve for the concentration of a sample, the molar absorptivity of a standard, or the absorbance you should expect.',
  synonyms: [
    "Beer's law calculator",
    'absorbance calculator',
    'concentration from absorbance',
    'molar absorptivity calculator',
    'transmittance to absorbance',
    'extinction coefficient calculator',
  ],
  ui: {
    find: 'Solve for',
    'find.a': 'Absorbance',
    'find.c': 'Concentration',
    'find.e': 'ε',
    measure: 'Reading given as',
    'measure.A': 'Absorbance (A)',
    'measure.T': 'Percent transmittance (%T)',
    reading: 'Reading',
    'reading.A': 'Absorbance A',
    'reading.T': 'Transmittance (%)',
    eps: 'Molar absorptivity ε (L mol⁻¹ cm⁻¹)',
    path: 'Path length b (cm)',
    cRow: 'Concentration',
    conc: 'Concentration c',
    cu: 'Unit',
    'cu.M': 'mol/L (M)',
    'cu.mM': 'mmol/L (mM)',
    'cu.uM': 'µmol/L (µM)',
    'out.result': 'Result',
    'out.result.a': 'Absorbance A',
    'out.result.c': 'Concentration (chosen unit)',
    'out.result.e': 'Molar absorptivity ε (L mol⁻¹ cm⁻¹)',
    'out.a': 'Absorbance A',
    'out.t': 'Transmittance (%)',
    'out.absorbed': 'Light absorbed (%)',
    'out.molar': 'Concentration (mol/L)',
    'explain.a': 'Expect an absorbance of {r}, so {t}% of the light gets through.',
    'explain.c': 'The concentration is {r} {u}.',
    'explain.e': 'The molar absorptivity is {r} L mol⁻¹ cm⁻¹ at this wavelength.',
    'step.a': 'A = ε × b × c, with c in mol/L.',
    'step.fromT': 'Convert transmittance to absorbance: A = −log(%T ÷ 100).',
    'step.c': 'c = A ÷ (ε × b).',
    'step.e': 'ε = A ÷ (b × c).',
    'step.t': 'Transmittance: T = 10^−A.',
    'warn.path': 'Enter a path length above zero.',
    'warn.eps': 'Enter a molar absorptivity above zero.',
    'warn.conc': 'Enter a concentration above zero.',
    'warn.t': 'Percent transmittance must be above 0 and at most 100.',
    'warn.a': 'Absorbance cannot be negative.',
    rounding:
      'Absorbance is base-10 and has no units. ε depends on the substance and the wavelength, so use a value measured at the wavelength you read.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Beer–Lambert law">{'A = ε × b × c'}</Formula>
      <Formula label="Absorbance and transmittance">
        {'T = P ÷ P₀,  %T = 100 T\nA = −log₁₀ T'}
      </Formula>
      <p>
        P₀ is the light power entering the sample and P the power leaving it. ε is the molar
        absorptivity in L mol⁻¹ cm⁻¹, b the path length through the sample in cm, and c the
        concentration in mol/L. Because absorbance is proportional to concentration, a sample with
        twice the concentration absorbs twice as much in absorbance units.
      </p>
    </>
  ),
  examples: [
    {
      id: 'guanosine',
      title: 'Guanosine with absorbance 0.70 at 275 nm, ε = 8400, in a 1 cm cell',
      body: (r, fmt) => (
        <p>
          c = 0.70 ÷ (8400 × 1) = <strong>{fmt.sig(o(r), 3)} µmol/L</strong>, or 8.33 × 10⁻⁵ mol/L,
          as in the LibreTexts Beer–Lambert example.
        </p>
      ),
    },
    {
      id: 'epsilon',
      title: 'A 5.00 × 10⁻⁴ M standard reading 0.338 in a 1.00 cm cell',
      body: (r, fmt) => (
        <p>
          ε = 0.338 ÷ (1.00 × 5.00 × 10⁻⁴) = <strong>{fmt.sig(o(r), 3)} L mol⁻¹ cm⁻¹</strong>, as in
          Harvey’s <em>Analytical Chemistry 2.1</em> Example 10.2.2.
        </p>
      ),
    },
    {
      id: 'percentT',
      title: 'A sample that transmits 50% of the light',
      body: (r, fmt) => (
        <p>
          A = −log 0.500 = <strong>{fmt.sig(o(r, 'a'), 3)}</strong> (Harvey, Example 10.2.1).
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Absorbance 1 means 10% gets through:</strong> each unit of absorbance cuts the
        transmitted light by a factor of ten, so A = 2 lets through only 1%.
      </li>
      <li>
        <strong>Use a standard to find ε:</strong> measure a solution of known concentration, solve
        for ε, then use that ε to find unknown concentrations at the same wavelength.
      </li>
      <li>
        <strong>Mixtures add:</strong> when two absorbing substances are present, the total
        absorbance is the sum of εbc for each one.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do I find concentration from absorbance?',
      a: 'Divide the absorbance by the molar absorptivity times the path length: c = A ÷ (εb). For guanosine with A = 0.70, ε = 8400 L mol⁻¹ cm⁻¹ and a 1 cm cell, c = 8.33 × 10⁻⁵ mol/L.',
    },
    {
      q: 'How do I convert percent transmittance to absorbance?',
      a: 'Divide %T by 100 to get the transmittance T, then take the negative base-10 logarithm: A = −log T. A sample transmitting 50.0% has A = −log 0.500 = 0.301, and A = 1.27 corresponds to 5.4% transmittance.',
    },
    {
      q: 'What are the units of molar absorptivity?',
      a: 'With concentration in mol/L and path length in cm, ε is in L mol⁻¹ cm⁻¹, often written M⁻¹ cm⁻¹. Absorbance itself has no units, so ε is sometimes reported without them.',
    },
    {
      q: 'What is the difference between absorbance and transmittance?',
      a: 'Transmittance is the fraction of light that passes through the sample, P ÷ P₀. Absorbance is its negative logarithm. Absorbance is used for calculations because, unlike transmittance, it rises in direct proportion to concentration.',
    },
  ],
  ogSample: (r, fmt) => `Guanosine, A 0.70, ε 8400 → c = ${fmt.sig(o(r), 3)} µmol/L`,
};
