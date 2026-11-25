import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'result') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: "Snell's Law Calculator",
  promise: 'The angle of refraction, an unknown index, or the critical angle for light.',
  title: "Snell's Law Calculator: Refraction and Critical Angle",
  description:
    "Use Snell's law to find the angle of refraction between two materials, an unknown index of refraction, the critical angle and the speed of light in each.",
  summary:
    "When light crosses from one material into another it changes speed and bends. Snell's law, n₁ sin θ₁ = n₂ sin θ₂, gives the new angle, measured from the normal. Entering a denser material such as water or glass bends light toward the normal. Going the other way, beyond the critical angle the light cannot escape and is totally internally reflected.",
  synonyms: [
    'angle of refraction calculator',
    'index of refraction calculator',
    'critical angle calculator',
    'total internal reflection calculator',
    'refraction calculator',
    'n1 sin theta1 = n2 sin theta2',
  ],
  ui: {
    find: 'Solve for',
    'find.angle': 'Refracted angle',
    'find.n2': 'Unknown index',
    m1: 'Light travels from',
    m2: 'Into',
    'medium.vacuum': 'Vacuum (1)',
    'medium.air': 'Air (1.000293)',
    'medium.water': 'Water (1.333)',
    'medium.ice': 'Ice (1.309)',
    'medium.ethanol': 'Ethanol (1.361)',
    'medium.glycerine': 'Glycerine (1.473)',
    'medium.crown': 'Crown glass (1.52)',
    'medium.flint': 'Flint glass (1.66)',
    'medium.plexiglas': 'Plexiglas (1.51)',
    'medium.polystyrene': 'Polystyrene (1.49)',
    'medium.quartz': 'Fused quartz (1.458)',
    'medium.zircon': 'Zircon (1.923)',
    'medium.diamond': 'Diamond (2.419)',
    'medium.custom': 'Other: enter the index',
    n1: 'Index of the first material (n₁)',
    n2: 'Index of the second material (n₂)',
    theta1: 'Angle of incidence (°)',
    'theta1.help': 'Measured from the normal, the line at right angles to the surface.',
    theta2: 'Angle of refraction (°)',
    'out.result': 'Result',
    'out.result.angle': 'Angle of refraction θ₂ (°)',
    'out.result.n2': 'Index of refraction n₂',
    'out.theta2': 'Angle of refraction (°)',
    'out.bend': 'Change in direction (°)',
    'out.critical': 'Critical angle in the first material (°)',
    'out.v1': 'Speed of light in the first material (m/s)',
    'out.v2': 'Speed of light in the second material (m/s)',
    'explain.toward': 'The light bends {d}° toward the normal, leaving at {t2}°.',
    'explain.away': 'The light bends {d}° away from the normal, leaving at {t2}°.',
    'explain.straight': 'The light passes straight through without bending.',
    'explain.index': 'The second material has an index of refraction of {n}.',
    'step.sin': "Snell's law rearranged: sin θ₂ = n₁ sin θ₁ ÷ n₂.",
    'step.angle': 'Take the inverse sine.',
    'step.critical': 'Critical angle θc = sin⁻¹(n₂ ÷ n₁), only when n₁ > n₂.',
    'step.index': 'n₂ = n₁ sin θ₁ ÷ sin θ₂.',
    'warn.tir':
      'Total internal reflection: the angle is above the {c}° critical angle, so no light passes into the second material.',
    'warn.index': 'An index of refraction is at least 1.',
    'warn.angle': 'Angles must be from 0° up to, but not including, 90°.',
    'warn.normal': 'At 0° the light does not bend, so the index cannot be found from the angles.',
    'warn.below1': 'An index below 1 is not physical for ordinary materials. Check the angles.',
    rounding:
      'Indices are OpenStax College Physics Table 25.1 values; they vary slightly with wavelength and temperature.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Snell's law">{'n₁ × sin θ₁ = n₂ × sin θ₂'}</Formula>
      <Formula label="Critical angle (n₁ > n₂)">{'θc = sin⁻¹(n₂ ÷ n₁)'}</Formula>
      <Formula label="Speed in a material">{'v = c ÷ n, c = 299,792,458 m/s'}</Formula>
      <p>
        Angles are measured from the normal, not from the surface. The index n says how many times
        slower light travels in the material than in a vacuum. Light slows going into a higher index
        and bends toward the normal; it speeds up going into a lower index and bends away.
      </p>
      <p>
        The index depends a little on colour, which is why a prism splits white light. The table
        values are typical for yellow light.
      </p>
    </>
  ),
  examples: [
    {
      id: 'diamond',
      title: 'Light entering diamond at 30.0°',
      body: (r, fmt) => (
        <p>
          sin θ₂ = (1.00 ÷ 2.419) × sin 30.0° = 0.207, so θ₂ = <strong>{fmt.sig(o(r), 3)}°</strong>,
          a much larger bend than water gives, as in OpenStax <em>College Physics</em> Example 25.3.
        </p>
      ),
    },
    {
      id: 'water',
      title: 'Finding the index: 30.0° in air becomes 22.0° in the liquid',
      body: (r, fmt) => (
        <p>
          n₂ = 1.00 × sin 30.0° ÷ sin 22.0° = <strong>{fmt.sig(o(r), 3)}</strong>, the index of
          water (Example 25.2).
        </p>
      ),
    },
    {
      id: 'fibre',
      title: 'Critical angle of a polystyrene light pipe in air',
      body: (r, fmt) => (
        <p>
          θc = sin⁻¹(1.00 ÷ 1.49) = <strong>{fmt.sig(o(r, 'critical'), 3)}°</strong>: light hitting
          the wall at more than that stays inside the pipe (Example 25.4).
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Why a straw looks bent:</strong> light from the underwater part bends away from the
        normal as it leaves the water, so the straw appears higher than it is.
      </li>
      <li>
        <strong>Diamonds sparkle</strong> because their critical angle, about 24.4°, is small: most
        light that enters is reflected around inside before escaping through the top.
      </li>
      <li>
        <strong>Optical fibres</strong> keep light inside by total internal reflection, with a
        lower-index cladding around the core.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do I calculate the angle of refraction?',
      a: "Multiply the first material's index by the sine of the incident angle, divide by the second material's index and take the inverse sine. From air into diamond at 30.0°: (1.00 ÷ 2.419) × 0.500 = 0.207, so the light travels at 11.9° from the normal.",
    },
    {
      q: 'What is the critical angle?',
      a: 'It is the incident angle at which the refracted light would skim along the surface, at 90°. It only exists going from a higher to a lower index: θc = sin⁻¹(n₂ ÷ n₁). From water into air it is 48.6°, and from diamond into air 24.4°.',
    },
    {
      q: 'What is total internal reflection?',
      a: 'Beyond the critical angle, no light passes into the second material and all of it reflects back. It is used in optical fibres, binoculars and endoscopes, and it is why a diamond can look so bright.',
    },
    {
      q: 'How do I find an unknown index of refraction?',
      a: 'Measure both angles and use n₂ = n₁ sin θ₁ ÷ sin θ₂. Light entering a liquid from air at 30.0° and refracting to 22.0° gives n₂ = 0.500 ÷ 0.375 = 1.33, the index of water.',
    },
  ],
  ogSample: (r, fmt) => `Air to diamond at 30° → ${fmt.sig(o(r), 3)}°`,
};
