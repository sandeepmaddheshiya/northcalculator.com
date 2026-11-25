import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'force') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Coulomb’s Law Calculator',
  promise: 'The electric force between two point charges, and whether they attract or repel.',
  title: 'Coulomb’s Law Calculator: Electric Force Between Charges',
  description:
    'Find the electrostatic force between two point charges with Coulomb’s law, using the CODATA constant, with charges in coulombs, µC, nC or elementary charges.',
  summary:
    'Coulomb’s law gives the force between two charges: F = k|q₁q₂| ÷ r², where k ≈ 8.99 × 10⁹ N·m²/C². Like charges repel and opposite charges attract. Like gravity, the force falls with the square of the distance, but it is vastly stronger: between an electron and a proton it is about 10³⁹ times their gravitational pull.',
  synonyms: [
    'electric force calculator',
    'electrostatic force calculator',
    'Coulomb force formula',
    'force between two charges',
    'Coulomb constant k',
    'point charge calculator',
  ],
  ui: {
    q1Row: 'Charge 1',
    q1: 'Charge q₁',
    q2Row: 'Charge 2',
    q2: 'Charge q₂',
    cu: 'Unit',
    'unit.C': 'C',
    'unit.mC': 'mC',
    'unit.uC': 'µC',
    'unit.nC': 'nC',
    'unit.e': 'e',
    r: 'Distance between charges r (m)',
    'r.help':
      'Scientific notation works: 5.3e-11 is 0.53 × 10⁻¹⁰ m. The unit e is the elementary charge.',
    'out.force': 'Force (N)',
    'out.kind': 'Charges',
    'out.field': 'Field of charge 1 at that distance (N/C)',
    'kind.attract': 'Attract',
    'kind.repel': 'Repel',
    'kind.none': 'No force',
    'explain.attract': 'The opposite charges attract each other with {f} N.',
    'explain.repel': 'The like charges repel each other with {f} N.',
    'explain.none': 'A charge of zero feels no electric force.',
    'step.charges': 'Convert both charges to coulombs.',
    'step.force': 'F = k|q₁q₂| ÷ r².',
    'warn.r': 'The distance must be greater than zero.',
    rounding:
      'Uses k = 1/(4πε₀) with the 2022 CODATA ε₀ and the exact elementary charge. Results keep 12 significant digits and are shown to 8.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Coulomb’s law">
        {'F = k × |q₁ × q₂| ÷ r²\nk = 1 ÷ (4πε₀) ≈ 8.98755 × 10⁹ N·m²/C²'}
      </Formula>
      <p>
        The charges are point charges, or spheres measured between centres. OpenStax uses k = 8.99 ×
        10⁹ and e = 1.60 × 10⁻¹⁹ C, so its answers can differ in the third digit from these, which
        use the exact elementary charge and NIST’s ε₀.
      </p>
    </>
  ),
  examples: [
    {
      id: 'hydrogen',
      title: 'The electron and proton in hydrogen, 0.530 × 10⁻¹⁰ m apart',
      body: (r, fmt) => (
        <p>
          F = k e² ÷ r² = <strong>{fmt.sig(o(r), 3)} N</strong>, attractive; OpenStax{' '}
          <em>College Physics</em> Example 18.1 gets 8.19 × 10⁻⁸ N with rounded constants.
        </p>
      ),
    },
    {
      id: 'bohr',
      title: 'The same pair at the Bohr radius, 5.29 × 10⁻¹¹ m',
      body: (r, fmt) => (
        <p>
          F = <strong>{fmt.sig(o(r), 3)} N</strong>, which OpenStax <em>University Physics</em>{' '}
          Example 5.1 gives as 8.25 × 10⁻⁸ N.
        </p>
      ),
    },
    {
      id: 'microcoulombs',
      title: 'Two 1 µC charges 1 m apart',
      body: (r, fmt) => (
        <p>
          F = 8.99 × 10⁹ × 10⁻¹² ÷ 1 = <strong>{fmt.sig(o(r), 4)} N</strong>, repulsive, about the
          weight of a gram.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Signs show direction:</strong> the force is shown as a size; opposite signs attract,
        like signs repel.
      </li>
      <li>
        <strong>Several charges:</strong> work out each pair separately and add the forces as
        vectors.
      </li>
      <li>
        <strong>Other materials:</strong> in a medium such as water, divide by its dielectric
        constant.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'What is Coulomb’s law?',
      a: 'The electric force between two charges is proportional to the product of the charges and inversely proportional to the square of the distance between them: F = k|q₁q₂| ÷ r². Doubling the distance quarters the force.',
    },
    {
      q: 'What is the value of k?',
      a: 'k = 1 ÷ (4πε₀) ≈ 8.98755 × 10⁹ N·m²/C², usually rounded to 8.99 × 10⁹. ε₀, the vacuum permittivity, is 8.8541878188 × 10⁻¹² F/m in the 2022 CODATA values from NIST.',
    },
    {
      q: 'How does the electric force compare with gravity?',
      a: 'It is enormously stronger. For an electron and a proton the ratio is about 2.27 × 10³⁹, the same at any distance because both forces fall as 1/r². Gravity dominates large objects only because their charges almost exactly cancel.',
    },
    {
      q: 'What is an elementary charge?',
      a: 'The charge of a proton, or minus the charge of an electron: exactly 1.602176634 × 10⁻¹⁹ C since the 2019 SI redefinition. Choosing the e unit lets you enter ion charges such as +2 directly.',
    },
  ],
  ogSample: (r, fmt) => `e and −e at 0.53 Å → ${fmt.sig(o(r), 3)} N`,
};
