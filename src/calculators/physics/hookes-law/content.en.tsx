import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'result') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Hooke’s Law Calculator',
  promise: 'Spring force, spring constant or stretch, with stored energy and period.',
  title: 'Hooke’s Law Calculator: Spring Constant, Force and Energy',
  description:
    'Use Hooke’s law F = kx to find a spring’s force, spring constant or stretch, plus the stored elastic energy and the period with a mass attached.',
  summary:
    'Hooke’s law says the force a spring exerts is proportional to how far it is stretched or compressed: F = kx, where k is the spring constant in newtons per metre. A stiff spring has a large k. The energy stored is ½kx², so doubling the stretch stores four times the energy. A mass m on the spring bounces with period 2π√(m/k).',
  synonyms: [
    'spring constant calculator',
    'spring force calculator',
    'F = kx calculator',
    'elastic potential energy calculator',
    'spring period calculator',
    'spring stiffness calculator',
  ],
  ui: {
    find: 'Find',
    'find.force': 'Force',
    'find.k': 'Spring constant',
    'find.x': 'Stretch',
    force: 'Force (N)',
    k: 'Spring constant k (N/m)',
    x: 'Stretch or compression x (m)',
    mass: 'Mass on the spring (kg)',
    'mass.help': 'Optional, for the oscillation period.',
    'out.result': 'Spring constant k (N/m)',
    'out.result.force': 'Force (N)',
    'out.result.k': 'Spring constant k (N/m)',
    'out.result.x': 'Stretch or compression (m)',
    'out.energy': 'Stored energy (J)',
    'out.period': 'Oscillation period (s)',
    'out.frequency': 'Frequency (Hz)',
    explain: 'A spring with k = {k} N/m stretched {x} m pulls back with {f} N and stores {e} J.',
    'step.force': 'Force = k × x.',
    'step.k': 'Spring constant = force ÷ stretch.',
    'step.x': 'Stretch = force ÷ k.',
    'step.energy': 'Stored energy = ½kx².',
    'step.period': 'Period = 2π√(m ÷ k).',
    'warn.x': 'The stretch must be greater than zero.',
    'warn.k': 'The spring constant must be greater than zero.',
    rounding:
      'Valid within the spring’s elastic limit. Results keep 12 significant digits and are shown to 8.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Hooke’s law">{'F = k × x\nk = F ÷ x'}</Formula>
      <Formula label="Energy and motion">{'PE = ½ k x²\nT = 2π √(m ÷ k)'}</Formula>
      <p>
        x is measured from the spring’s natural length, in metres. The restoring force always points
        back toward that position, which is why textbooks write F = −kx; this calculator works with
        sizes. The law holds only while the spring is not stretched past its elastic limit.
      </p>
    </>
  ),
  examples: [
    {
      id: 'suspension',
      title: 'A car that settles 1.20 cm when an 80 kg person gets in',
      body: (r, fmt) => (
        <p>
          The person’s weight, 80 × 9.80 = 784 N, compresses the springs 0.012 m, so k ={' '}
          <strong>{fmt.sig(o(r), 3)} N/m</strong>, the 6.53 × 10⁴ N/m of OpenStax{' '}
          <em>College Physics</em> Example 16.1.
        </p>
      ),
    },
    {
      id: 'toyGun',
      title: 'A toy gun spring, k = 50.0 N/m, compressed 0.150 m',
      body: (r, fmt) => (
        <p>
          It pushes with {fmt.sig(o(r), 3)} N and stores ½ × 50 × 0.15² ={' '}
          <strong>{fmt.sig(o(r, 'energy'), 4)} J</strong> (Example 16.2: 0.563 J).
        </p>
      ),
    },
    {
      id: 'oscillator',
      title: 'A 2.00 kg block on a 32.0 N/m spring',
      body: (r, fmt) => (
        <p>
          T = 2π√(2 ÷ 32) = <strong>{fmt.sig(o(r, 'period'), 4)} s</strong>, matching OpenStax{' '}
          <em>University Physics</em> Example 15.2 (1.57 s).
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Measure k yourself:</strong> hang a known weight, measure the stretch, and divide
        the weight in newtons by the stretch in metres.
      </li>
      <li>
        <strong>Convert to metres:</strong> 1.2 cm is 0.012 m; using centimetres gives k in N/cm, a
        hundred times smaller.
      </li>
      <li>
        <strong>Springs in series</strong> are softer and springs side by side are stiffer, like
        resistors the other way round.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'What is Hooke’s law?',
      a: 'The force needed to stretch or compress a spring is proportional to the distance: F = kx. Double the force and the stretch doubles. It works for springs and many solids as long as they are not deformed past the point where they stop springing back.',
    },
    {
      q: 'How do I find the spring constant?',
      a: 'Divide the force by the stretch: k = F ÷ x. If a 9.8 N weight stretches a spring 0.05 m, k = 196 N/m. You can also use energy: a spring that took 0.54 J to stretch 6 cm has k = 2 × 0.54 ÷ 0.06² = 300 N/m.',
    },
    {
      q: 'How much energy does a spring store?',
      a: 'Half the spring constant times the stretch squared: ½kx². A 300 N/m spring stretched 6 cm stores 0.54 J; stretched 12 cm it stores 2.16 J, four times as much, so the extra 6 cm takes 1.62 J.',
    },
    {
      q: 'What sets how fast a mass bounces on a spring?',
      a: 'Only the mass and the spring constant: T = 2π√(m ÷ k), not how far you pull it. A heavier mass bounces more slowly and a stiffer spring more quickly. A 2 kg mass on a 32 N/m spring takes about 1.57 s per bounce.',
    },
  ],
  ogSample: (r, fmt) => `784 N compressing 1.2 cm → k = ${fmt.sig(o(r), 3)} N/m`,
};
