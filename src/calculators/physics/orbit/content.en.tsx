import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'result') => r.outputs[k] as string;
const n = (r: { outputs: Record<string, unknown> }, k: string) => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Orbital Period Calculator',
  promise: "Orbital period, speed or radius from Kepler's third law.",
  title: "Orbital Period Calculator: Kepler's Third Law and Speed",
  description:
    'Find the period and speed of a circular orbit from its altitude or radius, or the orbit size for a given period, around Earth, the Sun or any mass.',
  summary:
    "A satellite's orbital period depends only on the mass it circles and the size of its orbit: T = 2π√(r³ ÷ GM), Kepler's third law. Doubling the radius multiplies the period by about 2.8. The International Space Station, 400 km up, circles Earth in about 92 minutes at 7.7 km/s, while a geostationary satellite takes exactly one sidereal day.",
  synonyms: [
    "Kepler's third law calculator",
    'satellite orbit calculator',
    'orbital speed calculator',
    'orbital velocity calculator',
    'semi-major axis calculator',
    'how long does an orbit take',
  ],
  ui: {
    find: 'Solve for',
    'find.period': 'Period and speed',
    'find.radius': 'Orbit size',
    body: 'Orbiting around',
    'body.earth': 'Earth (5.98 × 10²⁴ kg)',
    'body.sun': 'The Sun (2.00 × 10³⁰ kg)',
    'body.custom': 'Another mass',
    mass: 'Central mass (kg)',
    'mass.help': 'Use e-notation, e.g. 6.42e23 for Mars.',
    measure: 'Distance measured',
    'measure.altitude': 'Above the surface',
    'measure.centre': 'From the centre',
    bodyRadius: 'Radius of the central body (km)',
    distRow: 'Orbit',
    distance: 'Orbit radius',
    'distance.altitude': 'Altitude',
    'distance.centre': 'Orbit radius (or semi-major axis)',
    unit: 'Unit',
    'unit.km': 'km',
    'unit.m': 'm',
    'unit.au': 'au',
    perRow: 'Orbital period',
    period: 'Period',
    'unit.min': 'minutes',
    'unit.h': 'hours',
    'unit.d': 'days',
    'unit.y': 'years',
    'out.result': 'Result',
    'out.result.period': 'Orbital period',
    'out.result.radius': 'Orbit size',
    'out.speed': 'Orbital speed (m/s)',
    'out.kmh': 'Orbital speed (km/h)',
    'out.hours': 'Period (hours)',
    'out.days': 'Period (days)',
    'out.seconds': 'Period (seconds)',
    'out.radiusKm': 'Orbit radius from the centre (km)',
    'out.altitudeKm': 'Altitude above the surface (km)',
    explain: 'The orbit takes {h} hours at {v} km/s.',
    'step.add': 'Orbit radius = altitude + the central body’s radius.',
    'step.period': 'T = 2π √(r³ ÷ GM).',
    'step.radius': 'r = ∛(GM T² ÷ 4π²).',
    'step.speed': 'Circular orbital speed v = √(GM ÷ r).',
    'warn.mass': 'Enter a central mass above zero.',
    'warn.noRadius':
      'No surface radius is set for this body. Measure the orbit from the centre instead.',
    'warn.period': 'Enter a period above zero.',
    'warn.distance': 'Enter a distance above zero.',
    'warn.inside': 'That period gives an orbit inside the central body.',
    'warn.air':
      'Below about 100 km the atmosphere is too thick for a lasting orbit; this is the ideal value.',
    rounding: 'G = 6.67430 × 10⁻¹¹ (CODATA 2022). Results are shown to 8 significant figures.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Period (Kepler's third law)">{'T = 2π × √(r³ ÷ (G × M))'}</Formula>
      <Formula label="Orbital speed">{'v = √(G × M ÷ r)'}</Formula>
      <Formula label="Orbit size for a period">{'r = ∛(G × M × T² ÷ 4π²)'}</Formula>
      <p>
        r is measured from the centre of the central body, so add the planet’s radius to an
        altitude. For an elliptical orbit, use the semi-major axis, half the longest diameter: the
        period is the same as a circular orbit of that radius, though the speed varies along the
        ellipse.
      </p>
      <p>
        The formulas assume the orbiting object is much lighter than the central body. For the Moon
        around Earth, which is about 1.2% of Earth’s mass, the result is close but not exact.
      </p>
    </>
  ),
  examples: [
    {
      id: 'iss',
      title: 'The International Space Station, 400 km above Earth',
      body: (r, fmt) => (
        <p>
          r = 6,380 + 400 = 6,780 km, so T = <strong>{o(r)}</strong> at {fmt.sig(n(r, 'speed'), 3)}{' '}
          m/s, matching OpenStax <em>University Physics</em> Example 13.9 (7.67 × 10³ m/s, 5.55 ×
          10³ s, just over 90 minutes).
        </p>
      ),
    },
    {
      id: 'low',
      title: 'A satellite 1,500 km above Earth',
      body: (r, fmt) => (
        <p>
          T = <strong>{o(r)}</strong>, or {fmt.sig(n(r, 'hours'), 3)} hours, as in OpenStax{' '}
          <em>College Physics</em> Example 6.7.
        </p>
      ),
    },
    {
      id: 'halley',
      title: "Halley's comet: period 75.3 years around the Sun",
      body: (r) => (
        <p>
          The semi-major axis is <strong>{o(r)}</strong>, 2.67 × 10¹² m. <em>University Physics</em>{' '}
          Example 13.13 rounds 1 au to 1.50 × 10¹¹ m and gets 17.8 au, then an aphelion of 2 × 17.8
          − 0.586 ≈ 35.0 au.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Higher is slower.</strong> A higher orbit has a lower speed and a much longer
        period: the Moon, about 384,000 km away, takes 27.3 days.
      </li>
      <li>
        <strong>Mass of the satellite does not matter.</strong> A small cubesat and the ISS at the
        same altitude have the same period.
      </li>
      <li>
        <strong>Geostationary orbit:</strong> enter a period of 23.93 hours (one sidereal day) to
        find the altitude where a satellite stays above one spot, about 35,800 km.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: "What is Kepler's third law?",
      a: "The square of an orbit's period is proportional to the cube of its size: T² = 4π²r³ ÷ GM. For planets around the Sun, with T in years and the semi-major axis in astronomical units, T² ≈ a³, so Mars at 1.52 au takes about 1.88 years.",
    },
    {
      q: 'How fast does a satellite orbit Earth?',
      a: 'In a circular orbit v = √(GM ÷ r). At 400 km up, about 6,780 km from the centre, that is roughly 7.67 km/s, or 17,000 mph. Higher satellites move more slowly: geostationary ones travel at about 3.1 km/s.',
    },
    {
      q: 'How long does it take to orbit Earth?',
      a: 'It depends on the altitude. Low Earth orbit at 400 km takes about 92 minutes; at 1,500 km about 1.93 hours; geostationary orbit takes one sidereal day, 23 hours 56 minutes. The Moon takes 27.3 days.',
    },
    {
      q: 'Does this work for elliptical orbits?',
      a: "Yes, for the period: use the semi-major axis, the average of the closest and farthest distances. Halley's comet, with a 75.3-year period, has a semi-major axis of about 17.9 au, 2.67 × 10¹² m. The speed shown is the circular-orbit speed, which an elliptical orbit only averages.",
    },
  ],
  ogSample: (r) => `ISS at 400 km → ${o(r)}`,
};
