import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'fo') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Doppler Effect Calculator',
  promise: 'The frequency you hear when a sound source or listener is moving.',
  title: 'Doppler Effect Calculator: Observed Frequency of Sound',
  description:
    'Find the frequency heard when a sound source, the listener or both are moving toward or away from each other, with the size of the pitch shift.',
  summary:
    'When a sound source moves toward you, its waves bunch up and you hear a higher pitch; moving away, they spread out and the pitch drops. A train horn of 150 Hz at 35 m/s sounds like 167 Hz approaching and 136 Hz receding. Moving toward the source raises the pitch too. Only motion along the line between source and listener counts.',
  synonyms: [
    'Doppler shift calculator',
    'observed frequency calculator',
    'moving source frequency',
    'siren pitch change',
    'Doppler formula',
    'frequency shift calculator',
  ],
  ui: {
    fs: 'Source frequency (Hz)',
    vw: 'Speed of sound (m/s)',
    'vw.help': '340 in the OpenStax examples; it varies with the medium and temperature.',
    vs: 'Source speed (m/s)',
    sdir: 'Source is moving',
    vo: 'Listener speed (m/s)',
    odir: 'Listener is moving',
    'dir.toward': 'Toward the other',
    'dir.away': 'Away from the other',
    'out.fo': 'Frequency heard (Hz)',
    'out.shift': 'Shift (Hz)',
    'out.ratio': 'Frequency ratio',
    'explain.higher': 'The listener hears {fo} Hz, {d} Hz higher than the source.',
    'explain.lower': 'The listener hears {fo} Hz, {d} Hz lower than the source.',
    'step.f': 'f = f_s × (v ± v_o) ÷ (v ∓ v_s), upper signs for moving toward.',
    'warn.sound': 'The speed of sound must be greater than zero.',
    'warn.supersonic':
      'A source moving toward you at or above the speed of sound arrives with its own shock wave, a sonic boom; this formula no longer applies.',
    'warn.outrun': 'The listener is moving away faster than the sound, so it never reaches them.',
    rounding: 'Results keep 12 significant digits and are shown to 8.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Doppler effect">{'f = f_s × (v ± v_o) ÷ (v ∓ v_s)'}</Formula>
      <p>
        v is the speed of sound, v_o the listener’s speed and v_s the source’s, all relative to the
        air. Use + on top and − below when they move toward each other, and the opposite when they
        move apart. The shift is not symmetric: a source approaching raises the pitch more than the
        same speed receding lowers it.
      </p>
    </>
  ),
  examples: [
    {
      id: 'approach',
      title: 'A 150 Hz train horn approaching at 35.0 m/s',
      body: (r, fmt) => (
        <p>
          f = 150 × 340 ÷ (340 − 35) = <strong>{fmt.sig(o(r), 3)} Hz</strong>, as in OpenStax{' '}
          <em>College Physics</em> Example 17.4 and <em>University Physics</em> Example 17.8.
        </p>
      ),
    },
    {
      id: 'recede',
      title: 'The same train moving away',
      body: (r, fmt) => (
        <p>
          f = 150 × 340 ÷ (340 + 35) = <strong>{fmt.sig(o(r), 3)} Hz</strong>, a drop of{' '}
          {fmt.sig(-o(r, 'shift'), 3)} Hz compared with a rise of 17 Hz on approach.
        </p>
      ),
    },
    {
      id: 'engineer',
      title: 'The engineer riding on the train',
      body: (r, fmt) => (
        <p>
          Moving with the horn, the shifts cancel and the engineer hears{' '}
          <strong>{fmt.sig(o(r), 3)} Hz</strong>.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Use speeds relative to the air.</strong> Wind changes the effective speeds.
      </li>
      <li>
        <strong>Sideways motion</strong> causes no shift; only the part of the velocity along the
        line between source and listener counts.
      </li>
      <li>
        <strong>Light</strong> needs the relativistic Doppler formula, not this one.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'What is the Doppler effect?',
      a: 'The change in frequency you hear when the source of a sound and the listener move relative to each other. An ambulance siren sounds higher as it approaches and lower as it moves away, even though the siren itself never changes pitch.',
    },
    {
      q: 'What is the Doppler effect formula?',
      a: 'f = f_s (v ± v_o) ÷ (v ∓ v_s), with the upper signs for motion toward. For a stationary listener and a source approaching at 35 m/s, a 150 Hz tone becomes 150 × 340 ÷ 305 ≈ 167 Hz with sound at 340 m/s.',
    },
    {
      q: 'Why is the shift bigger when approaching?',
      a: 'The source speed is subtracted from the speed of sound when approaching and added when receding, and dividing by a smaller number changes the result more. At 35 m/s the 150 Hz horn rises by 17 Hz but falls by only 14 Hz.',
    },
    {
      q: 'What happens at the speed of sound?',
      a: 'A source moving at or above the speed of sound outruns its own waves, which pile up into a shock wave heard as a sonic boom. The simple Doppler formula breaks down there because the denominator reaches zero.',
    },
  ],
  ogSample: (r, fmt) => `150 Hz at 35 m/s approaching → ${fmt.sig(o(r), 3)} Hz`,
};
