import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'radius') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Magnetic Force Calculator',
  promise: 'Force, orbit radius and period of a charged particle in a magnetic field.',
  title: 'Magnetic Force Calculator: F = qvB, Radius and Period',
  description:
    'Find the magnetic force on a moving charge, the radius of its circular path, its period, cyclotron frequency and helix pitch, for electrons, protons and more.',
  summary:
    'A magnetic field pushes on a moving charge at right angles to its velocity with force F = qvB sin θ. Because the push is always sideways, the particle moves in a circle of radius r = mv/(qB), taking a time T = 2πm/(qB) per orbit regardless of its speed. That fixed period is what makes cyclotrons and mass spectrometers work.',
  synonyms: [
    'Lorentz force calculator',
    'cyclotron radius calculator',
    'radius of charged particle in magnetic field',
    'cyclotron frequency calculator',
    'qvB calculator',
    'gyroradius calculator',
  ],
  ui: {
    particle: 'Particle',
    'particle.electron': 'Electron',
    'particle.proton': 'Proton',
    'particle.alpha': 'Alpha particle',
    'particle.custom': 'Other: enter mass and charge',
    mass: 'Mass (kg)',
    chRow: 'Charge',
    charge: 'Charge',
    unit: 'Unit',
    'unit.e': '× e',
    'unit.C': 'C',
    v: 'Speed (m/s)',
    b: 'Magnetic field B (tesla)',
    angle: 'Angle between velocity and field (°)',
    'angle.help': '90° means moving straight across the field.',
    'out.radius': 'Radius of the circular path (m)',
    'out.force': 'Magnetic force (N)',
    'out.period': 'Period of one orbit (s)',
    'out.freq': 'Cyclotron frequency (Hz)',
    'out.pitch': 'Helix pitch (m)',
    explain: 'The particle feels {f} N and circles with radius {r} m, once every {t} s.',
    'step.f': 'F = |q| v B sin θ.',
    'step.r': 'r = m v sin θ ÷ (|q| B).',
    'step.t': 'T = 2πm ÷ (|q| B), independent of speed.',
    'warn.mass': 'Enter a mass above zero.',
    'warn.charge': 'A neutral particle feels no magnetic force.',
    'warn.positive': 'Speed cannot be negative and the field must be above zero.',
    'warn.fast':
      'Above about 10% of light speed relativity starts to matter; textbooks still use these formulas, but the true radius is larger.',
    'warn.light': 'Nothing with mass reaches the speed of light; enter a slower speed.',
    rounding: 'Particle masses are CODATA 2022 values; e = 1.602176634 × 10⁻¹⁹ C exactly.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Force">{'F = |q| × v × B × sin θ'}</Formula>
      <Formula label="Circular motion">{'r = m v sin θ ÷ (|q| B)\nT = 2π m ÷ (|q| B)'}</Formula>
      <Formula label="Helix">{'pitch = v cos θ × T'}</Formula>
      <p>
        Only the velocity component across the field is affected; the component along the field
        carries on unchanged, so a particle entering at an angle spirals in a helix. The magnetic
        force does no work, so the speed never changes.
      </p>
    </>
  ),
  examples: [
    {
      id: 'electron',
      title: 'An electron at 6.00 × 10⁷ m/s near a 0.500 T magnet',
      body: (r, fmt) => (
        <p>
          r = mv ÷ qB = <strong>{fmt.sig(o(r) * 1000, 3)} mm</strong>, a tight curve that deflects a
          TV picture tube’s beam, as in OpenStax <em>College Physics</em> Example 22.2 (which prints
          0.683 mm using 9.11 × 10⁻³¹ kg and 1.60 × 10⁻¹⁹ C).
        </p>
      ),
    },
    {
      id: 'alpha',
      title: 'An alpha particle in a 0.050 T beam deflector',
      body: (r, fmt) => (
        <p>
          T = 2π × 6.64 × 10⁻²⁷ ÷ (3.2 × 10⁻¹⁹ × 0.050) ={' '}
          <strong>{fmt.sig(o(r, 'period'), 3)} s</strong>, so a 90° bend takes a quarter of that, as
          in OpenStax <em>University Physics</em> Example 11.2.
        </p>
      ),
    },
    {
      id: 'rod',
      title: 'A glass rod with 20 nC moving at 10 m/s across Earth’s 5 × 10⁻⁵ T field',
      body: (r, fmt) => (
        <p>
          F = 20 × 10⁻⁹ × 10 × 5 × 10⁻⁵ = <strong>{fmt.sig(o(r, 'force'), 1)} N</strong>, far too
          small to notice (College Physics Example 22.1).
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Direction:</strong> use the right-hand rule for positive charges; the force on an
        electron points the opposite way.
      </li>
      <li>
        <strong>Mass spectrometers</strong> separate ions by radius: at the same speed and field,
        heavier ions curve less.
      </li>
      <li>
        <strong>Speed-independent period:</strong> faster particles circle wider but take the same
        time, the principle of the cyclotron.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do I calculate the magnetic force on a moving charge?',
      a: 'Multiply the charge, speed, field strength and the sine of the angle between velocity and field: F = qvB sin θ. A 20 nC charge moving at 10 m/s across a 5 × 10⁻⁵ T field feels 1 × 10⁻¹¹ N.',
    },
    {
      q: 'What is the radius of a charged particle’s path?',
      a: 'r = mv/(qB), from setting the magnetic force equal to the centripetal force. An electron at 6.00 × 10⁷ m/s in a 0.500 T field circles with a radius of about 0.68 mm.',
    },
    {
      q: 'What is the cyclotron frequency?',
      a: 'The number of orbits per second, f = qB/(2πm). It does not depend on speed, so in a fixed field every particle of the same kind circles at the same rate, which is the basis of the cyclotron accelerator.',
    },
    {
      q: 'What happens if the particle moves at an angle to the field?',
      a: 'The velocity across the field produces circular motion while the part along the field is unaffected, so the path is a helix. Its pitch, the distance advanced per turn, is v cos θ times the period.',
    },
  ],
  ogSample: (r, fmt) => `Electron at 6 × 10⁷ m/s in 0.5 T → r = ${fmt.sig(o(r) * 1000, 3)} mm`,
};
