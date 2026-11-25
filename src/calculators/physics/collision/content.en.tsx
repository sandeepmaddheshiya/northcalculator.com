import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k: string) => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Collision Calculator',
  promise: 'Final velocities and kinetic energy for elastic and inelastic 1D collisions.',
  title: 'Collision Calculator: Elastic and Inelastic Final Velocity',
  description:
    'Find the velocities of two objects after an elastic or perfectly inelastic collision in one dimension, with total momentum and the kinetic energy lost.',
  summary:
    'In every collision the total momentum, mass times velocity, is the same before and after. In an elastic collision kinetic energy is also conserved, so the objects bounce apart. In a perfectly inelastic collision they stick together and the most kinetic energy is lost, turned into heat, sound and deformation. Velocities have signs: pick a positive direction.',
  synonyms: [
    'elastic collision calculator',
    'inelastic collision calculator',
    'conservation of momentum calculator',
    'final velocity after collision',
    'perfectly inelastic collision',
    'kinetic energy lost in collision',
  ],
  ui: {
    kind: 'Collision',
    'kind.elastic': 'Elastic',
    'kind.inelastic': 'Stick together',
    'kind.known': 'Know v₁ after',
    b1Row: 'Object 1',
    b2Row: 'Object 2',
    m1: 'Mass (kg)',
    v1: 'Velocity (m/s)',
    m2: 'Mass (kg)',
    v2: 'Velocity (m/s)',
    v1f: 'Object 1 velocity after (m/s)',
    'v1f.help': 'Measured final velocity of object 1; the calculator finds object 2’s.',
    'out.result': 'Velocities after',
    'out.result.elastic': 'Velocities after (object 1, object 2)',
    'out.result.inelastic': 'Common velocity after',
    'out.result.known': 'Velocities after (object 1, object 2)',
    'out.v1f': 'Object 1 after (m/s)',
    'out.v2f': 'Object 2 after (m/s)',
    'out.keBefore': 'Kinetic energy before (J)',
    'out.keAfter': 'Kinetic energy after (J)',
    'out.keChange': 'Change in kinetic energy (J)',
    'out.lostPct': 'Kinetic energy lost (%)',
    'out.momentum': 'Total momentum (kg·m/s)',
    'explain.two': 'Afterwards object 1 moves at {a} m/s and object 2 at {b} m/s.',
    'explain.stick':
      'The objects move off together at {a} m/s, and {ke} J of kinetic energy is lost.',
    'step.p': 'Total momentum before = m₁v₁ + m₂v₂, and it is the same after.',
    'step.elastic': 'Elastic: momentum and kinetic energy both conserved.',
    'step.inelastic': 'Stuck together: v′ = total momentum ÷ total mass.',
    'step.known': 'v₂′ = (total momentum − m₁v₁′) ÷ m₂.',
    'step.ke': 'Kinetic energy ½mv² summed for both objects, before and after.',
    'warn.mass': 'Both masses must be above zero.',
    'warn.gain':
      'Kinetic energy increases, so energy was released, as when a spring or explosion pushes the objects apart.',
    'warn.pass':
      'With these velocities the objects would still be approaching after the collision, which is not possible. Check the signs.',
    rounding: 'Results keep 12 significant digits and are shown to 8.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Momentum (always)">{'m₁v₁ + m₂v₂ = m₁v₁′ + m₂v₂′'}</Formula>
      <Formula label="Elastic">
        {'v₁′ = ((m₁ − m₂)v₁ + 2m₂v₂) ÷ (m₁ + m₂)\nv₂′ = ((m₂ − m₁)v₂ + 2m₁v₁) ÷ (m₁ + m₂)'}
      </Formula>
      <Formula label="Perfectly inelastic">{'v′ = (m₁v₁ + m₂v₂) ÷ (m₁ + m₂)'}</Formula>
      <p>
        Real collisions lie between the two extremes: some kinetic energy is lost but the objects
        separate. If you measure one object’s final velocity, the third option finds the other from
        momentum alone and reports how much kinetic energy changed.
      </p>
    </>
  ),
  examples: [
    {
      id: 'elastic',
      title: 'A 0.500 kg object at 4.00 m/s hits a 3.50 kg object at rest, elastically',
      body: (r, fmt) => (
        <p>
          The light object bounces back at <strong>{fmt.sig(o(r, 'v1f'), 3)} m/s</strong> and the
          heavy one moves off at {fmt.sig(o(r, 'v2f'), 3)} m/s; the kinetic energy stays{' '}
          {fmt.sig(o(r, 'keBefore'), 3)} J, as in OpenStax <em>College Physics</em> Example 8.4.
        </p>
      ),
    },
    {
      id: 'puck',
      title: 'A 0.150 kg puck at 35.0 m/s caught by a 70.0 kg goalie',
      body: (r, fmt) => (
        <p>
          Together they move at {fmt.sig(o(r, 'v1f'), 3)} m/s, and the kinetic energy drops from{' '}
          {fmt.sig(o(r, 'keBefore'), 3)} J to {fmt.sig(o(r, 'keAfter'), 3)} J:{' '}
          <strong>{fmt.sig(o(r, 'lostPct'), 3)}%</strong> lost (Example 8.5).
        </p>
      ),
    },
    {
      id: 'carts',
      title: 'Two carts pushed apart by a spring: cart 1 ends at −4.00 m/s',
      body: (r, fmt) => (
        <p>
          Momentum gives cart 2 <strong>{fmt.sig(o(r, 'v2f'), 3)} m/s</strong>, and the kinetic
          energy rises from {fmt.sig(o(r, 'keBefore'), 3)} J to {fmt.sig(o(r, 'keAfter'), 3)} J,
          supplied by the spring (Example 8.6).
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Equal masses, elastic:</strong> the objects swap velocities, as in Newton’s cradle
        or a pool ball stopping dead.
      </li>
      <li>
        <strong>Heavy hits light:</strong> in an elastic collision the light object can leave at up
        to twice the heavy one’s speed.
      </li>
      <li>
        <strong>Car crashes</strong> are close to perfectly inelastic; crumple zones absorb the lost
        kinetic energy over a longer time, reducing the force.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do I find the final velocities in an elastic collision?',
      a: 'Use v₁′ = ((m₁ − m₂)v₁ + 2m₂v₂) ÷ (m₁ + m₂) and the matching formula for v₂′. A 0.500 kg object at 4.00 m/s hitting 3.50 kg at rest rebounds at −3.00 m/s while the other moves at 1.00 m/s, as in OpenStax College Physics Example 8.4.',
    },
    {
      q: 'What is a perfectly inelastic collision?',
      a: 'One where the objects stick together and move with a common velocity, total momentum ÷ total mass. It loses the most kinetic energy allowed by momentum conservation. A 0.150 kg puck at 35.0 m/s caught by a 70.0 kg goalie leaves them moving at 0.0748 m/s.',
    },
    {
      q: 'Where does the lost kinetic energy go?',
      a: 'Into deforming the objects, heat and sound. Momentum is still conserved because the forces between the objects are equal and opposite, but kinetic energy is not. In the puck example 91.7 of the 91.9 joules, about 99.8%, are lost.',
    },
    {
      q: 'Why do I need negative velocities?',
      a: 'Momentum depends on direction. Choose one direction as positive and give anything moving the other way a negative velocity. A proton at +7.0 × 10⁶ m/s meeting a neutron at −4.0 × 10⁶ m/s forms a deuteron moving at +1.5 × 10⁶ m/s.',
    },
  ],
  ogSample: (r, fmt) =>
    `0.5 kg at 4 m/s hits 3.5 kg → ${fmt.sig(o(r, 'v1f'), 3)} and ${fmt.sig(o(r, 'v2f'), 3)} m/s`,
};
