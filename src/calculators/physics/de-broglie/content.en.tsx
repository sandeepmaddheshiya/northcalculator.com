import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'lambda') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'De Broglie Wavelength Calculator',
  promise: 'The wavelength of a moving electron, proton or any object, λ = h/p.',
  title: 'De Broglie Wavelength Calculator: Electrons and Particles',
  description:
    'Find the de Broglie wavelength λ = h/p of an electron, proton, neutron or any object from its speed or kinetic energy, with relativistic momentum included.',
  summary:
    'Every moving object has a wavelength, λ = h/p, where p is its momentum and h is Planck’s constant. Because h is tiny, a thrown ball’s wavelength is far too small to notice, but a 1 eV electron’s is about 1.2 nm, comparable to the spacing of atoms. That is why electron beams diffract from crystals, the basis of electron microscopes.',
  synonyms: [
    'matter wave calculator',
    'electron wavelength calculator',
    'λ = h/p calculator',
    'de Broglie wavelength of electron',
    'wavelength from kinetic energy',
    'particle wavelength calculator',
  ],
  ui: {
    particle: 'Particle',
    'particle.electron': 'Electron',
    'particle.proton': 'Proton',
    'particle.neutron': 'Neutron',
    'particle.custom': 'Other: enter the mass',
    mass: 'Mass (kg)',
    from: 'Given',
    'from.energy': 'Kinetic energy',
    'from.speed': 'Speed',
    keRow: 'Kinetic energy',
    energy: 'Kinetic energy',
    unit: 'Unit',
    'unit.eV': 'eV',
    'unit.keV': 'keV',
    'unit.MeV': 'MeV',
    spRow: 'Speed',
    speed: 'Speed',
    'unit.ms': 'm/s',
    'unit.c': '× c',
    'out.lambda': 'Wavelength λ (m)',
    'out.nm': 'Wavelength (nm)',
    'out.p': 'Momentum p (kg·m/s)',
    'out.kEv': 'Kinetic energy (eV)',
    'out.speed': 'Speed (m/s)',
    'out.beta': 'Speed as a fraction of c',
    explain: 'The de Broglie wavelength is {l} m ({nm} nm).',
    'step.pFromK': 'Relativistic momentum from kinetic energy.',
    'step.pFromV': 'Relativistic momentum p = γmv.',
    'step.lambda': 'λ = h ÷ p.',
    'warn.mass': 'Enter a mass above zero.',
    'warn.positive': 'Enter a value above zero.',
    'warn.light': 'Nothing with mass can reach the speed of light; enter a speed below c.',
    'warn.relativistic':
      'This is fast enough that relativity matters: the non-relativistic √(2mK) would be off by more than 1%.',
    rounding:
      'Exact SI constants and CODATA 2022 particle masses; results shown to 6 significant figures.',
  },
  HowItWorks: () => (
    <>
      <Formula label="De Broglie wavelength">{'λ = h ÷ p'}</Formula>
      <Formula label="Momentum">
        {'from speed: p = γmv\nfrom kinetic energy: p = √(K(K + 2mc²)) ÷ c'}
      </Formula>
      <p>
        At everyday speeds these reduce to p = mv and p = √(2mK). The relativistic forms are used
        throughout, so the answer is right for a slow electron and for one accelerated through 100
        kV, where the simple formula would be about 5% off.
      </p>
    </>
  ),
  examples: [
    {
      id: 'slow',
      title: 'An electron with 1.0 eV of kinetic energy',
      body: (r, fmt) => (
        <p>
          λ = <strong>{fmt.sig(o(r, 'nm'), 3)} nm</strong>, about the size of a few atoms, as in
          OpenStax <em>University Physics</em> Example 6.11.
        </p>
      ),
    },
    {
      id: 'fast',
      title: 'An electron accelerated to 108 keV',
      body: (r, fmt) => (
        <p>
          With relativistic momentum λ = <strong>{fmt.sig(o(r) * 1e12, 3)} pm</strong>, the 3.55 pm
          of Example 6.11, short enough for electron microscopy.
        </p>
      ),
    },
    {
      id: 'ball',
      title: 'A 0.65 kg basketball at 10 m/s',
      body: (r, fmt) => (
        <p>
          λ = 6.626 × 10⁻³⁴ ÷ 6.5 = <strong>{fmt.sig(o(r), 3)} m</strong>, hopelessly small to
          detect, which is why everyday objects show no wave behaviour.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Diffraction needs a matching scale:</strong> waves bend noticeably only around
        objects comparable to their wavelength, so electrons of tens of eV diffract from crystals
        with atom spacings near 0.2 nm.
      </li>
      <li>
        <strong>Accelerating voltage:</strong> an electron accelerated through V volts gains V eV,
        so enter the voltage as the kinetic energy in eV.
      </li>
      <li>
        <strong>Heavier particles, shorter waves:</strong> a proton at the same energy has a
        wavelength about 43 times shorter than an electron’s, the square root of their mass ratio.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do I calculate the de Broglie wavelength?',
      a: 'Divide Planck’s constant by the momentum: λ = h/p. For a 0.65 kg ball at 10 m/s, p = 6.5 kg·m/s and λ = 6.626 × 10⁻³⁴ ÷ 6.5 ≈ 1.02 × 10⁻³⁴ m. For an electron, p = mv or, from its energy, √(2mK).',
    },
    {
      q: 'What is the wavelength of an electron?',
      a: 'It depends on its energy: about 1.23 nm at 1 eV, 0.167 nm at 54 eV (the Davisson–Germer energy), and 3.55 pm at 108 keV. Doubling the energy shortens the wavelength by a factor of √2 at low speeds.',
    },
    {
      q: 'Why don’t everyday objects behave like waves?',
      a: 'Their momenta are enormous compared with h, so their wavelengths are around 10⁻³⁴ m, far smaller than an atomic nucleus. No slit or obstacle is small enough to make such a wave diffract measurably.',
    },
    {
      q: 'When do I need the relativistic formula?',
      a: 'When the kinetic energy is not much smaller than the rest energy mc², which is 511 keV for an electron. Above a few keV the simple √(2mK) starts to drift; this calculator always uses the exact relativistic momentum.',
    },
  ],
  ogSample: (r, fmt) => `Electron at 1 eV → λ = ${fmt.sig(o(r, 'nm'), 3)} nm`,
};
