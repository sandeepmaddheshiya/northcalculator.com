import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'arc') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Arc Length and Sector Area Calculator',
  promise: 'Arc length, sector area, segment area and chord from a radius and angle.',
  title: 'Arc Length Calculator: Sector Area, Segment and Chord',
  description:
    'Find the arc length, sector area, segment area and chord of a circle from its radius and central angle, in degrees or radians, with the angle in radians.',
  summary:
    'An arc is part of a circle’s edge and a sector is the pizza-slice region it bounds with two radii. With the central angle θ in radians, the arc length is rθ and the sector area is ½r²θ. In degrees, first multiply by π ÷ 180. A 30° slice of a 20 ft circle, like a lawn sprinkler’s spray, covers about 104.72 ft².',
  synonyms: [
    'sector area calculator',
    'arc length formula',
    'segment area calculator',
    'chord length calculator',
    'area of a slice of a circle',
    's = r theta calculator',
  ],
  ui: {
    radius: 'Radius r',
    angle: 'Central angle',
    'angle.deg': 'Central angle (°)',
    'angle.rad': 'Central angle (radians)',
    unit: 'Angle in',
    'unit.deg': 'Degrees',
    'unit.rad': 'Radians',
    'out.arc': 'Arc length',
    'out.sector': 'Sector area',
    'out.segment': 'Segment area (between chord and arc)',
    'out.chord': 'Chord length',
    'out.radians': 'Angle in radians',
    'out.fraction': 'Share of the full circle',
    explain: 'The arc is {s} long and the sector covers {a} square units.',
    'step.rad': 'Convert the angle to radians.',
    'step.arc': 'Arc length s = r × θ.',
    'step.sector': 'Sector area = ½ × r² × θ.',
    'warn.negative': 'The radius and angle cannot be negative.',
    'warn.full': 'The angle cannot exceed a full turn (360° or 2π).',
    rounding: 'Uses the full value of π. Results keep 12 significant digits and are shown to 10.',
  },
  HowItWorks: () => (
    <>
      <Formula label="θ in radians">{'s = r θ\nA = ½ r² θ = ½ r s'}</Formula>
      <Formula label="Segment and chord">
        {'segment = ½ r² (θ − sin θ)\nchord = 2 r sin(θ ÷ 2)'}
      </Formula>
      <p>
        These formulas need θ in radians, which is why degrees are converted first: 30° is π/6. The
        sector is a fraction θ ÷ 2π of the whole circle, so its area is that fraction of πr². The
        segment is the sector minus the triangle formed by the two radii and the chord.
      </p>
    </>
  ),
  examples: [
    {
      id: 'sprinkler',
      title: 'A sprinkler spraying 20 ft over 30°',
      body: (r, fmt) => (
        <p>
          A = ½ × (π/6) × 20² = <strong>{fmt.sig(o(r, 'sector'), 5)} ft²</strong>, the 104.72 ft² of
          OpenStax <em>Algebra and Trigonometry</em> Example 9; the edge of the spray is{' '}
          {fmt.sig(o(r), 4)} ft long.
        </p>
      ),
    },
    {
      id: 'radians',
      title: 'A 1.2 radian arc on a 2 cm circle',
      body: (r, fmt) => (
        <p>
          s = 2 × 1.2 = <strong>{fmt.sig(o(r), 3)} cm</strong> (Corral, Example 4.3), and the sector
          area is ½ × 2² × 1.2 = {fmt.sig(o(r, 'sector'), 3)} cm².
        </p>
      ),
    },
    {
      id: 'sector',
      title: 'A 117° sector of radius 3.5 m',
      body: (r, fmt) => (
        <p>
          117° = {fmt.sig(o(r, 'radians'), 4)} rad, so A = ½ × 3.5² × 2.042 ={' '}
          <strong>{fmt.sig(o(r, 'sector'), 4)} m²</strong>, as in Corral’s Example 4.9.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Radians make it simple:</strong> s = rθ and A = ½r²θ only work with θ in radians;
        that is the most common source of wrong answers.
      </li>
      <li>
        <strong>Pizza check:</strong> a quarter circle (90°) has an area of πr² ÷ 4.
      </li>
      <li>
        <strong>Belts and roads:</strong> the length of a belt wrapped round a pulley or a curved
        road edge is an arc length.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do I find the arc length?',
      a: 'Multiply the radius by the angle in radians: s = rθ. In degrees, s = 2πr × θ ÷ 360. A 41° arc of a 10 ft circle is 10 × 41 × π ÷ 180 ≈ 7.16 ft, as in Corral’s Example 4.4.',
    },
    {
      q: 'How do I find the area of a sector?',
      a: 'Use A = ½r²θ with θ in radians, or A = πr² × θ ÷ 360 with θ in degrees. If you know the arc length s instead, A = ½rs: a 6 cm arc of a 9 cm circle bounds a 27 cm² sector.',
    },
    {
      q: 'What is the difference between a sector and a segment?',
      a: 'A sector is bounded by two radii and the arc, like a slice of pizza. A segment is bounded by a chord and the arc, like the cap cut off by a straight line. The segment’s area is the sector’s minus the triangle: ½r²(θ − sin θ).',
    },
    {
      q: 'How do I convert degrees to radians?',
      a: 'Multiply by π and divide by 180. So 30° = π/6 ≈ 0.5236, 90° = π/2 ≈ 1.5708 and 180° = π. One radian is the angle whose arc equals the radius, about 57.3°.',
    },
  ],
  ogSample: (r, fmt) => `r = 20 ft, 30° → sector ${fmt.sig(o(r, 'sector'), 5)} ft²`,
};
