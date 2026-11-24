import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'result') => r.outputs[k];

export const content: CalculatorContent = {
  name: 'Wavelength and Frequency Calculator',
  promise: 'Wavelength, frequency or wave speed from the other two, for any wave.',
  title: 'Wavelength Calculator: Frequency, Wavelength and Wave Speed',
  description:
    'Convert between wavelength and frequency for light, radio, sound or water waves with v = fλ, and find the wave speed and period, from nm to km and Hz to THz.',
  summary:
    'For any wave, speed equals frequency times wavelength: v = fλ. Light and radio waves in a vacuum travel at c = 299,792,458 m/s, so a 100 MHz FM signal has a wavelength of about 3 metres. The period, the time between crests, is 1 ÷ f. Know two of speed, frequency and wavelength and the third follows.',
  synonyms: [
    'frequency to wavelength calculator',
    'wavelength to frequency calculator',
    'v = f lambda calculator',
    'wave speed calculator',
    'radio wavelength calculator',
    'light frequency calculator',
  ],
  ui: {
    find: 'Find',
    'find.speed': 'Speed',
    'find.frequency': 'Frequency',
    'find.wavelength': 'Wavelength',
    speedRow: 'Wave speed',
    speed: 'Speed',
    vu: 'Speed unit',
    frequencyRow: 'Frequency',
    frequency: 'Frequency',
    fu: 'Frequency unit',
    wavelengthRow: 'Wavelength',
    wavelength: 'Wavelength',
    lu: 'Wavelength unit',
    'unit.ms': 'm/s',
    'unit.kms': 'km/s',
    'unit.c': '× speed of light',
    'unit.Hz': 'Hz',
    'unit.kHz': 'kHz',
    'unit.MHz': 'MHz',
    'unit.GHz': 'GHz',
    'unit.THz': 'THz',
    'unit.km': 'km',
    'unit.m': 'm',
    'unit.cm': 'cm',
    'unit.mm': 'mm',
    'unit.um': 'µm',
    'unit.nm': 'nm',
    'sym.ms': 'm/s',
    'sym.kms': 'km/s',
    'sym.c': 'c',
    'sym.Hz': 'Hz',
    'sym.kHz': 'kHz',
    'sym.MHz': 'MHz',
    'sym.GHz': 'GHz',
    'sym.THz': 'THz',
    'sym.km': 'km',
    'sym.m': 'm',
    'sym.cm': 'cm',
    'sym.mm': 'mm',
    'sym.um': 'µm',
    'sym.nm': 'nm',
    'out.result': 'Wavelength',
    'out.result.speed': 'Wave speed',
    'out.result.frequency': 'Frequency',
    'out.result.wavelength': 'Wavelength',
    'out.ms': 'Speed (m/s)',
    'out.hz': 'Frequency (Hz)',
    'out.m': 'Wavelength (m)',
    'out.period': 'Period (s)',
    explain: 'A wave at {v} m/s and {f} Hz has crests {l} m apart.',
    'step.speed': 'Speed = frequency × wavelength.',
    'step.frequency': 'Frequency = speed ÷ wavelength.',
    'step.wavelength': 'Wavelength = speed ÷ frequency.',
    'warn.zero': 'Enter a value greater than zero.',
    'warn.fast':
      'This is faster than light in a vacuum, which no wave carrying energy or information can be.',
    rounding:
      'Uses c = 299,792,458 m/s exactly. Results keep 12 significant digits and are shown to 10.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Wave equation">{'v = f × λ\nT = 1 ÷ f'}</Formula>
      <p>
        v is the wave speed, f the frequency in hertz (cycles per second), λ the wavelength and T
        the period. The speed depends on the medium, not on the frequency: light in a vacuum always
        travels at c, while sound in air and waves on a string are much slower. In glass or water,
        light slows and its wavelength shortens, but its frequency stays the same.
      </p>
    </>
  ),
  examples: [
    {
      id: 'radio',
      title: 'An FM station at 100 MHz',
      body: (r) => (
        <p>
          λ = 299,792,458 ÷ 100,000,000 = <strong>{String(o(r))}</strong>, which is why FM aerials
          are around a metre long.
        </p>
      ),
    },
    {
      id: 'string',
      title: 'A string wave at 5.00 m/s driven at 2.00 Hz',
      body: (r, fmt) => (
        <p>
          λ = 5 ÷ 2 = <strong>{String(o(r))}</strong> with a period of{' '}
          {fmt.sig(o(r, 'period') as number, 3)} s, as in OpenStax <em>University Physics</em>{' '}
          Example 16.1.
        </p>
      ),
    },
    {
      id: 'gull',
      title: 'Ocean waves 10.0 m apart passing every 5.00 s',
      body: (r) => (
        <p>
          f = 1 ÷ 5 = 0.2 Hz, so v = 0.2 × 10 = <strong>{String(o(r))}</strong>, the speed of the
          waves under the gull in OpenStax <em>College Physics</em> Example 16.8.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Light:</strong> enter the wavelength in nm and set the speed to 1 × the speed of
        light to get its frequency in THz.
      </li>
      <li>
        <strong>Sound:</strong> enter the speed of sound in your medium, which depends on the
        material and its temperature, to turn a frequency into a wavelength.
      </li>
      <li>
        <strong>Period or frequency?</strong> If you know the time between crests, frequency is 1
        divided by it.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do I convert frequency to wavelength?',
      a: 'Divide the wave speed by the frequency: λ = v ÷ f. For radio and light in a vacuum, use 299,792,458 m/s. A 2.4 GHz Wi-Fi signal has a wavelength of about 0.125 m, or 12.5 cm.',
    },
    {
      q: 'How do I convert wavelength to frequency?',
      a: 'Divide the speed by the wavelength: f = v ÷ λ. Green light at 532 nm has a frequency of 299,792,458 ÷ (532 × 10⁻⁹) ≈ 5.64 × 10¹⁴ Hz, or about 564 THz.',
    },
    {
      q: 'What is the relationship between frequency and period?',
      a: 'They are reciprocals: T = 1 ÷ f. A wave at 50 Hz repeats every 0.02 s, and one with a period of 4.00 s has a frequency of 0.25 Hz, as in OpenStax’s spring-wave example.',
    },
    {
      q: 'Does the wave speed change with frequency?',
      a: 'Usually not much: the medium sets the speed. Doubling a sound’s frequency halves its wavelength while the speed stays about the same. Some media are dispersive, where speed varies a little with frequency, which is how a prism splits light.',
    },
  ],
  ogSample: (r) => `100 MHz → λ = ${String(o(r))}`,
};
