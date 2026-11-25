import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'torque') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Torque Calculator',
  promise: 'The turning effect of a force about a pivot, in N·m and lbf·ft.',
  title: 'Torque Calculator: τ = rF sin θ, Lever Arm, N·m and lbf·ft',
  description:
    'Find the torque of a force applied at a distance from a pivot and at any angle, with the lever arm, in newton-metres and pound-force feet.',
  summary:
    'Torque measures how strongly a force turns something about a pivot: τ = rF sin θ, where r is the distance from the pivot and θ the angle between the force and the line to the pivot. Pushing at right angles gives the most torque. Pushing a door near the hinges, or straight toward them, makes it hard to open because the lever arm is small.',
  synonyms: [
    'moment of force calculator',
    'lever arm calculator',
    'newton metre calculator',
    'wrench torque calculator',
    'rotational force calculator',
    'torque formula',
  ],
  ui: {
    force: 'Force (N)',
    distance: 'Distance from the pivot (m)',
    angle: 'Angle between force and lever (°)',
    'angle.help': '90 when pushing at right angles to the lever.',
    'out.torque': 'Torque (N·m)',
    'out.lever': 'Lever arm r sin θ (m)',
    'out.lbft': 'Torque (lbf·ft)',
    explain: 'The force produces {t} N·m of torque through a lever arm of {l} m.',
    'step.lever': 'Lever arm = r × sin θ.',
    'step.torque': 'Torque = force × lever arm.',
    'warn.angle': 'The angle must be between 0° and 180°.',
    'warn.parallel': 'A force along the lever, toward or away from the pivot, produces no torque.',
    rounding:
      'Uses 1 lbf·ft = 1.3558179 N·m. Results keep 12 significant digits and are shown to 8.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Torque">{'τ = r × F × sin θ = r⊥ × F\nr⊥ = r sin θ'}</Formula>
      <p>
        r is measured from the pivot to where the force acts. The lever arm r⊥ is the perpendicular
        distance from the pivot to the force’s line of action. For balance, the torques turning one
        way must equal those turning the other, as on a seesaw.
      </p>
    </>
  ),
  examples: [
    {
      id: 'door',
      title: 'Pushing a door with 40 N at 0.800 m from the hinges',
      body: (r, fmt) => (
        <p>
          At right angles, τ = 0.800 × 40 = <strong>{fmt.sig(o(r), 3)} N·m</strong>, as in OpenStax{' '}
          <em>College Physics</em> §9.2; half the force gives half the torque.
        </p>
      ),
    },
    {
      id: 'angled',
      title: '30 N applied 5 m out, at 53° to the lever',
      body: (r, fmt) => (
        <p>
          τ = 5 × 30 × sin 53° = <strong>{fmt.sig(o(r), 4)} N·m</strong>, which OpenStax{' '}
          <em>University Physics</em> Example 10.14 rounds to 120 N·m.
        </p>
      ),
    },
    {
      id: 'flywheel',
      title: '20 N on a 0.5 m flywheel at 150°',
      body: (r, fmt) => (
        <p>
          τ = 0.5 × 20 × sin 150° = <strong>{fmt.sig(o(r), 3)} N·m</strong> (Example 10.15).
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Longer wrenches help:</strong> doubling the handle length doubles the torque for the
        same push.
      </li>
      <li>
        <strong>Balance a seesaw:</strong> the heavier person sits closer. OpenStax’s 26.0 kg child
        at 1.60 m balances a 32.0 kg child at 1.30 m.
      </li>
      <li>
        <strong>Torque specs</strong> for bolts are often in lbf·ft or N·m; the calculator shows
        both.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'What is the formula for torque?',
      a: 'τ = rF sin θ: the distance from the pivot times the force times the sine of the angle between them. At right angles sin θ = 1, so τ = rF: 50 N on a 0.3 m wrench gives 15 N·m.',
    },
    {
      q: 'Why does the angle matter?',
      a: 'Only the part of the force perpendicular to the lever turns it. Pushing at 30° to a wrench gives half the torque of pushing at 90°, because sin 30° = 0.5; pushing straight along it gives none.',
    },
    {
      q: 'How do I convert N·m to lbf·ft?',
      a: 'Divide by 1.3558. 100 N·m is about 73.76 lbf·ft, and 50 lbf·ft is about 67.79 N·m. A newton-metre of torque is the same unit as a joule of energy, but the two mean different things.',
    },
    {
      q: 'How do torques balance?',
      a: 'An object stays still, not rotating, when the clockwise torques equal the counterclockwise ones. On a seesaw, weight times distance must match on both sides: 26.0 kg × 1.60 m = 32.0 kg × 1.30 m.',
    },
  ],
  ogSample: (r, fmt) => `40 N at 0.8 m → ${fmt.sig(o(r), 3)} N·m`,
};
