import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'result') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Buoyancy Calculator',
  promise: 'Buoyant force, how much of an object floats below the surface, or density by weighing.',
  title: 'Buoyancy Calculator: Archimedes’ Principle and Floating',
  description:
    'Find the buoyant force on a submerged volume, the fraction of a floating object below the surface, or an object’s density from its weight in air and in water.',
  summary:
    'Archimedes’ principle says a fluid pushes up on an object with a force equal to the weight of the fluid it displaces. An object floats if it is less dense than the fluid, and then the fraction below the surface equals the ratio of the densities: ice at 917 kg/m³ floats about 92% submerged in fresh water. Weighing in air and in water reveals density.',
  synonyms: [
    'buoyant force calculator',
    'Archimedes principle calculator',
    'will it float calculator',
    'fraction submerged calculator',
    'specific gravity calculator',
    'density by water displacement',
  ],
  ui: {
    mode: 'Calculate',
    'mode.force': 'Buoyant force on a volume',
    'mode.float': 'How much of a floating object is submerged',
    'mode.weigh': 'Density from weighing in air and in a fluid',
    volume: 'Volume submerged (m³)',
    fluid: 'Fluid density (kg/m³)',
    'fluid.help': 'Fresh water 1,000; sea water about 1,025.',
    object: 'Object density (kg/m³)',
    air: 'Mass in air (any unit)',
    inFluid: 'Apparent mass in the fluid (same unit)',
    'out.result': 'Buoyant force (N)',
    'out.result.force': 'Buoyant force (N)',
    'out.result.float': 'Submerged (%)',
    'out.result.weigh': 'Object density (kg/m³)',
    'out.percent': 'Density ratio (object ÷ fluid)',
    'out.sg': 'Specific gravity',
    'out.kg': 'Mass of fluid displaced (kg)',
    'explain.force': 'The fluid pushes up with {f} N, the weight of {kg} kg of displaced fluid.',
    'explain.floats': 'The object floats with {pct} of its volume below the surface.',
    'explain.sinks': 'The object is at least as dense as the fluid, so it sinks.',
    'explain.weigh': 'The object’s density is {d} kg/m³, a specific gravity of {sg}.',
    'step.force': 'Buoyant force = fluid density × volume × g.',
    'step.float': 'Fraction submerged = object density ÷ fluid density.',
    'step.displaced': 'Mass of fluid displaced = mass in air − apparent mass.',
    'step.density': 'Density = mass in air ÷ displaced mass × fluid density.',
    'warn.fluid': 'The fluid density must be greater than zero.',
    'warn.sinks':
      'Denser than the fluid: it sinks unless shaped to displace more, like a steel ship.',
    'warn.weigh': 'The mass in air must be greater than the apparent mass in the fluid.',
    rounding: 'Uses g = 9.80665 m/s². Results keep 12 significant digits and are shown to 8.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Archimedes’ principle">{'F_B = ρ_fluid × V × g'}</Formula>
      <Formula label="Floating">{'fraction submerged = ρ_object ÷ ρ_fluid'}</Formula>
      <Formula label="Weighing">{'ρ_object = m_air ÷ (m_air − m_fluid) × ρ_fluid'}</Formula>
      <p>
        The weighing method works because the apparent loss of mass equals the mass of fluid
        displaced, which gives the object’s volume. A steel ship floats because its hull shape
        displaces far more water than the steel alone would.
      </p>
    </>
  ),
  examples: [
    {
      id: 'steel',
      title: '1.00 × 10⁷ kg of solid steel (1.28 × 10³ m³) underwater',
      body: (r, fmt) => (
        <p>
          F_B = 1,000 × 1,280 × 9.81 = <strong>{fmt.sig(o(r), 3)} N</strong>, far less than the
          steel’s 9.8 × 10⁷ N weight, so it sinks (OpenStax <em>College Physics</em> Example 11.8:
          1.3 × 10⁷ N).
        </p>
      ),
    },
    {
      id: 'swimmer',
      title: 'A swimmer with an average density of 970 kg/m³',
      body: (r, fmt) => (
        <p>
          970 ÷ 1,000 = <strong>{fmt.pct(o(r), 1)}</strong> submerged in fresh water, the 97.0% of
          OpenStax <em>University Physics</em> Example 14.4.
        </p>
      ),
    },
    {
      id: 'coin',
      title: 'A coin: 8.630 g in air, 7.800 g in water',
      body: (r, fmt) => (
        <p>
          It displaces 0.830 g of water, so its density is 8.630 ÷ 0.830 × 1,000 ={' '}
          <strong>{fmt.sig(o(r), 3)} kg/m³</strong>, close to silver (Example 11.10: 10.4 g/cm³).
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Sea water</strong> is denser than fresh water, so ships ride higher and people float
        more easily in the sea.
      </li>
      <li>
        <strong>Hanging scales:</strong> weigh the object in air, then fully submerged on a thin
        thread, without touching the container.
      </li>
      <li>
        <strong>Units:</strong> for the force, use m³ for volume and kg/m³ for density; 1 litre is
        0.001 m³.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'What is Archimedes’ principle?',
      a: 'An object in a fluid feels an upward buoyant force equal to the weight of the fluid it pushes aside. A 1-litre block fully under fresh water displaces 1 kg of water, so it feels about 9.81 N of buoyancy, whatever it is made of.',
    },
    {
      q: 'How do I know if something will float?',
      a: 'Compare densities. If the object’s average density is less than the fluid’s, it floats; if more, it sinks. Ice at 917 kg/m³ floats in water at 1,000 kg/m³ with about 92% below the surface; iron at about 7,800 kg/m³ sinks.',
    },
    {
      q: 'How can a steel ship float?',
      a: 'Its hull encloses a large volume of air, so its average density is far below that of steel. OpenStax’s example: 10⁷ kg of steel shaped to displace 10⁵ m³ of water feels a buoyant force about ten times its weight.',
    },
    {
      q: 'What is specific gravity?',
      a: 'An object’s density divided by the density of water. It has no units: a specific gravity below 1 means the object floats in water, and the fraction submerged equals the specific gravity. Silver’s is about 10.5.',
    },
  ],
  ogSample: (r, fmt) => `1,280 m³ of water displaced → ${fmt.sig(o(r), 3)} N`,
};
