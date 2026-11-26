import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'ev') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Photon Energy Calculator',
  promise: 'Convert between a photon’s wavelength, frequency and energy in eV or joules.',
  title: 'Photon Energy Calculator: Wavelength, Frequency and eV',
  description:
    'Convert light’s wavelength, frequency or photon energy into the others with E = hf = hc/λ, in eV, joules and kJ/mol, plus photons per second from a lamp.',
  summary:
    'Light comes in photons whose energy is set by frequency: E = hf, or E = hc/λ in terms of wavelength. A handy shortcut is hc ≈ 1240 eV·nm, so 620 nm red light carries about 2 eV per photon and 124 nm ultraviolet about 10 eV. Shorter wavelengths mean more energetic photons.',
  synonyms: [
    'wavelength to energy calculator',
    'E = hf calculator',
    'frequency to wavelength calculator',
    'photon energy in eV',
    'hc/λ calculator',
    'photons per second calculator',
  ],
  ui: {
    from: 'Start from',
    'from.wavelength': 'Wavelength',
    'from.frequency': 'Frequency',
    'from.energy': 'Energy',
    inRow: 'Value',
    value: 'Value',
    'value.wavelength': 'Wavelength',
    'value.frequency': 'Frequency',
    'value.energy': 'Photon energy',
    unit: 'Unit',
    'unit.nm': 'nm',
    'unit.um': 'µm',
    'unit.m': 'm',
    'unit.Hz': 'Hz',
    'unit.MHz': 'MHz',
    'unit.THz': 'THz',
    'unit.eV': 'eV',
    'unit.keV': 'keV',
    'unit.J': 'J',
    power: 'Light power (W)',
    'power.help': 'Optional: the power emitted at this wavelength, to count photons per second.',
    'out.ev': 'Photon energy (eV)',
    'out.joules': 'Photon energy (J)',
    'out.nm': 'Wavelength (nm)',
    'out.hz': 'Frequency (Hz)',
    'out.kjmol': 'Energy per mole of photons (kJ/mol)',
    'out.rate': 'Photons per second',
    explain: 'Each photon carries {e} eV at a wavelength of {l} nm.',
    'step.fromL': 'E = hc ÷ λ.',
    'step.fromF': 'E = hf.',
    'step.fromE': 'λ = hc ÷ E.',
    'step.ev': '1 eV = 1.602176634 × 10⁻¹⁹ J.',
    'step.rate': 'Photons per second = power ÷ energy per photon.',
    'warn.positive': 'Enter a value above zero.',
    rounding:
      'Uses the exact SI values of h, c and e; textbooks rounding to 6.63 × 10⁻³⁴ J·s or 1240 eV·nm can differ in the third digit.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Photon energy">{'E = h × f = h × c ÷ λ'}</Formula>
      <Formula label="Shortcut">{'E (eV) ≈ 1240 ÷ λ (nm)'}</Formula>
      <p>
        h = 6.62607015 × 10⁻³⁴ J·s is Planck’s constant and c = 299,792,458 m/s the speed of light
        in vacuum; both are exact by definition of the SI. In a material light slows and its
        wavelength shortens, but its frequency and photon energy do not change.
      </p>
      <p>
        Multiplying by the Avogadro constant gives the energy per mole of photons, useful for
        comparing light with chemical bond energies.
      </p>
    </>
  ),
  examples: [
    {
      id: 'yellow',
      title: 'Yellow light at 580 nm from a 100 W bulb giving 10 W of visible light',
      body: (r, fmt) => (
        <p>
          Each photon has <strong>{fmt.sig(o(r, 'joules'), 3)} J</strong> ({fmt.sig(o(r), 3)} eV),
          so 10 W is {fmt.sig(o(r, 'rate'), 3)} photons a second, as in OpenStax{' '}
          <em>College Physics</em> Example 29.4 (which prints 3.43 × 10⁻¹⁹ J using rounded h and c).
        </p>
      ),
    },
    {
      id: 'uv',
      title: 'Vacuum ultraviolet at 100 nm',
      body: (r, fmt) => (
        <p>
          E = 1240 eV·nm ÷ 100 nm = <strong>{fmt.sig(o(r), 3)} eV</strong>, enough to break tightly
          bound molecules (Example 29.3).
        </p>
      ),
    },
    {
      id: 'gamma',
      title: 'A gamma ray at 10²¹ Hz',
      body: (r, fmt) => (
        <p>
          E = hf = <strong>{fmt.sig(o(r, 'joules'), 3)} J</strong>, or {fmt.sig(o(r) / 1e6, 3)} MeV.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Visible light</strong> spans roughly 1.6 eV (red) to 3.3 eV (violet) per photon.
      </li>
      <li>
        <strong>Photoelectric threshold:</strong> light ejects electrons only if one photon’s energy
        exceeds the metal’s work function: silver (4.73 eV) needs wavelengths below 262 nm.
      </li>
      <li>
        <strong>Brightness is photon count,</strong> not photon energy: a dim blue light has more
        energetic photons than a bright red one, just fewer of them.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do I convert wavelength to photon energy?',
      a: 'Divide hc by the wavelength. In convenient units, E (eV) = 1240 ÷ λ (nm), so 100 nm gives 12.4 eV. In joules, E = 6.626 × 10⁻³⁴ × 2.998 × 10⁸ ÷ λ in metres: 580 nm gives 3.42 × 10⁻¹⁹ J.',
    },
    {
      q: 'What is an electronvolt?',
      a: 'The energy an electron gains crossing one volt: exactly 1.602176634 × 10⁻¹⁹ J. It is a convenient size for photons and atoms; visible photons carry a few eV, X-rays thousands.',
    },
    {
      q: 'How do I convert frequency to wavelength?',
      a: 'Divide the speed of light by the frequency: λ = c ÷ f. A 10²¹ Hz gamma ray has a wavelength of about 3 × 10⁻¹³ m, and its photon energy is hf = 6.63 × 10⁻¹³ J, about 4.14 MeV.',
    },
    {
      q: 'How many photons does a light source emit?',
      a: 'Divide its power in watts by the energy per photon in joules. Ten watts of 580 nm yellow light is 10 ÷ 3.42 × 10⁻¹⁹ ≈ 2.92 × 10¹⁹ photons every second.',
    },
  ],
  ogSample: (r, fmt) => `580 nm → ${fmt.sig(o(r), 3)} eV per photon`,
};
