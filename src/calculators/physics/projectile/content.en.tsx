import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'range') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Projectile Motion Calculator',
  promise: 'Range, flight time, peak height and landing speed of a launched object.',
  title: 'Projectile Motion Calculator: Range, Height and Flight Time',
  description:
    'Enter launch speed, angle and height to get the range, time of flight, maximum height and landing speed and angle of a projectile, ignoring air resistance.',
  summary:
    'A projectile moves sideways at a steady speed while gravity pulls it down. Split the launch velocity into horizontal and vertical parts, v cos θ and v sin θ. On level ground the range is v² sin 2θ ÷ g, greatest at 45°, and angles that add up to 90°, such as 30° and 60°, land at the same spot. A launch height adds time and distance.',
  synonyms: [
    'projectile range calculator',
    'time of flight calculator',
    'maximum height calculator',
    'trajectory calculator',
    'launch angle calculator',
    'kinematics projectile',
  ],
  ui: {
    vRow: 'Launch speed',
    speed: 'Speed',
    su: 'Unit',
    'unit.ms': 'm/s',
    'unit.kmh': 'km/h',
    'unit.mph': 'mph',
    angle: 'Launch angle above horizontal (°)',
    height: 'Launch height above landing (m)',
    'height.help': '0 for level ground.',
    g: 'Gravity, g (m/s²)',
    'g.help': '9.80665 is standard gravity; OpenStax uses 9.80.',
    'out.range': 'Range (m)',
    'out.time': 'Time of flight (s)',
    'out.maxHeight': 'Maximum height above landing (m)',
    'out.apexTime': 'Time to the top (s)',
    'out.impactSpeed': 'Landing speed (m/s)',
    'out.impactAngle': 'Landing angle below horizontal (°)',
    explain: 'The projectile lands {r} m away after {t} s, rising to {h} m.',
    'step.components': 'Split the launch velocity into horizontal and vertical parts.',
    'step.time': 'Solve the vertical motion for the time to reach the ground.',
    'step.range': 'Range = horizontal speed × flight time.',
    'warn.g': 'Gravity must be greater than zero.',
    'warn.angle': 'The angle must be between −90° and 90°.',
    rounding:
      'Ignores air resistance, which shortens real flights. Results keep 12 significant digits and are shown to 8.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Components">{'vₓ = v₀ cos θ, v_y = v₀ sin θ'}</Formula>
      <Formula label="Level ground">
        {'T = 2v₀ sin θ ÷ g\nR = v₀² sin 2θ ÷ g\nH = (v₀ sin θ)² ÷ 2g'}
      </Formula>
      <Formula label="From a height h">
        {'h + v_y t − ½gt² = 0\nT = (v_y + √(v_y² + 2gh)) ÷ g'}
      </Formula>
      <p>
        Horizontal and vertical motion are independent: the horizontal speed never changes, and the
        vertical motion is free fall. OpenStax notes that with air resistance the best angle for
        range drops to about 38°.
      </p>
    </>
  ),
  examples: [
    {
      id: 'level',
      title: '50 m/s at 45° on level ground (g = 9.8)',
      body: (r, fmt) => (
        <p>
          R = 50² × sin 90° ÷ 9.8 = <strong>{fmt.sig(o(r), 6)} m</strong>, the 255 m in OpenStax{' '}
          <em>University Physics</em> Figure 4.15. At 15° or 75° the same speed reaches 128 m.
        </p>
      ),
    },
    {
      id: 'fireworks',
      title: 'A firework shell at 70.0 m/s and 75°',
      body: (r, fmt) => (
        <p>
          It peaks at (70 sin 75°)² ÷ 19.6 = <strong>{fmt.sig(o(r, 'maxHeight'), 6)} m</strong>{' '}
          after {fmt.sig(o(r, 'apexTime'), 4)} s, where it explodes (Example 4.7: 233 m, 6.90 s).
        </p>
      ),
    },
    {
      id: 'volcano',
      title: 'A volcanic rock at 25.0 m/s and 35°, landing 20.0 m lower',
      body: (r, fmt) => (
        <p>
          It flies for <strong>{fmt.sig(o(r, 'time'), 6)} s</strong> and lands at{' '}
          {fmt.sig(o(r, 'impactSpeed'), 4)} m/s, {fmt.sig(o(r, 'impactAngle'), 4)}° below horizontal
          (OpenStax <em>College Physics</em> Example 3.5: 3.96 s, 31.9 m/s and 50.1°, from rounded
          components).
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>45° is best only on level ground.</strong> From a height, a lower angle goes
        farther.
      </li>
      <li>
        <strong>Complementary angles pair up:</strong> 30° and 60° give the same range, but the
        higher one stays up longer.
      </li>
      <li>
        <strong>Real balls fall short.</strong> Drag and spin matter for anything fast or light,
        such as a golf ball or a shuttlecock.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'What angle gives the maximum range?',
      a: 'On level ground without air resistance, 45°, because sin 2θ is largest at θ = 45°. Launching from a height or with air resistance lowers the best angle; OpenStax gives about 38° for typical air resistance.',
    },
    {
      q: 'How do I calculate the time of flight?',
      a: 'On level ground, T = 2v₀ sin θ ÷ g. A ball launched at 20 m/s and 30° stays up 2 × 20 × 0.5 ÷ 9.81 ≈ 2.04 s. From a height, solve h + v₀ sin θ · t − ½gt² = 0 for the positive t.',
    },
    {
      q: 'How high does a projectile go?',
      a: 'The peak is (v₀ sin θ)² ÷ 2g above the launch point, depending only on the vertical part of the speed. A ball thrown at 20 m/s straight up rises 20² ÷ (2 × 9.81) ≈ 20.4 m.',
    },
    {
      q: 'Does the horizontal speed change during flight?',
      a: 'Not without air resistance. Gravity acts only vertically, pulling straight down, so the horizontal component v₀ cos θ stays constant. That is why the range is simply horizontal speed times flight time.',
    },
  ],
  ogSample: (r, fmt) => `50 m/s at 45° → ${fmt.sig(o(r), 5)} m`,
};
