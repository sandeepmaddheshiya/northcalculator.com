import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'result') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Flow Rate Calculator',
  promise: 'Flow speed in a pipe from the flow rate, or flow rate from speed, with continuity.',
  title: 'Flow Rate Calculator: Pipe Velocity, Q = Av and Continuity',
  description:
    'Find the speed of fluid in a pipe from its flow rate and diameter, or the flow rate from the speed, and the faster speed where the pipe narrows to a nozzle.',
  summary:
    'Volume flow rate is the cross-sectional area of a pipe times the fluid’s average speed: Q = Av. Because a liquid cannot pile up, the same flow passes every section, so A₁v₁ = A₂v₂. Squeeze water from a hose into a nozzle a third the width and it leaves about nine times faster.',
  synonyms: [
    'pipe flow velocity calculator',
    'Q = Av calculator',
    'continuity equation calculator',
    'water velocity in a pipe',
    'gallons per minute to velocity',
    'nozzle velocity calculator',
  ],
  ui: {
    find: 'Solve for',
    'find.speed': 'Speed',
    'find.flow': 'Flow rate',
    flowRow: 'Flow rate',
    q: 'Flow rate',
    qu: 'Unit',
    'qu.ls': 'L/s',
    'qu.lmin': 'L/min',
    'qu.m3s': 'm³/s',
    'qu.gpm': 'US gal/min',
    v1: 'Speed in the pipe (m/s)',
    d1: 'Pipe inside diameter (cm)',
    d2: 'Narrow section diameter (cm)',
    'd2.help': 'Optional: a nozzle or second pipe. Leave 0 to skip.',
    n2: 'Number of parallel branches',
    'n2.help': 'If the flow splits into several equal pipes, as in a sprinkler head.',
    'out.result': 'Result',
    'out.result.speed': 'Speed in the pipe (m/s)',
    'out.result.flow': 'Flow rate (chosen unit)',
    'out.v1': 'Speed in the pipe (m/s)',
    'out.v2': 'Speed in the narrow section (m/s)',
    'out.ls': 'Flow rate (L/s)',
    'out.lmin': 'Flow rate (L/min)',
    'out.gpm': 'Flow rate (US gal/min)',
    'out.m3s': 'Flow rate (m³/s)',
    'out.a1': 'Pipe cross-section (cm²)',
    explain: 'The fluid moves at {v1} m/s, carrying {q} litres every second.',
    'explain.two':
      'The fluid moves at {v1} m/s in the pipe and {v2} m/s in the narrow section; {q} litres pass every second.',
    'step.area': 'Cross-sectional area A = πd²/4.',
    'step.speed': 'Average speed v = Q ÷ A.',
    'step.flow': 'Flow rate Q = A × v.',
    'step.continuity': 'Continuity: v₂ = Q ÷ (n₂ × A₂).',
    'warn.d': 'Enter a pipe diameter above zero.',
    'warn.n': 'Branches must be a whole number of 1 or more.',
    'warn.v': 'Speed cannot be negative.',
    'warn.q': 'Flow rate cannot be negative.',
    rounding:
      'Speeds are averages over the cross-section; real flow is faster at the centre and slower at the walls.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Flow rate">{'Q = A × v,  A = π × d² ÷ 4'}</Formula>
      <Formula label="Continuity">{'A₁ × v₁ = n₂ × A₂ × v₂'}</Formula>
      <p>
        Speed varies with the inverse square of diameter: halve the diameter and the area falls to a
        quarter, so the speed quadruples. This holds for liquids and for gases at low speed, where
        density barely changes.
      </p>
      <p>
        Use the inside diameter. Nominal pipe sizes are not the bore: a “½-inch” pipe can have an
        inside diameter well away from 1.27 cm, depending on the material and schedule.
      </p>
    </>
  ),
  examples: [
    {
      id: 'hose',
      title: 'A garden hose: 0.500 L/s through 1.80 cm, then a 0.500 cm nozzle',
      body: (r, fmt) => (
        <p>
          In the hose v = 0.0005 ÷ (π × 0.009²) = <strong>{fmt.sig(o(r, 'v1'), 3)} m/s</strong>; in
          the nozzle {fmt.sig(o(r, 'v2'), 3)} m/s, as in OpenStax <em>College Physics</em> Example
          12.2 and <em>University Physics</em> Example 14.5.
        </p>
      ),
    },
    {
      id: 'aorta',
      title: 'Blood leaving the heart: 5.0 L/min through a 2.0 cm aorta',
      body: (r, fmt) => (
        <p>
          v = <strong>{fmt.sig(o(r, 'v1'), 2)} m/s</strong>, the 0.27 m/s of OpenStax Example 12.3.
        </p>
      ),
    },
    {
      id: 'tap',
      title: 'Water at 2 m/s through a 1.27 cm bore',
      body: (r, fmt) => (
        <p>
          Q = π × 0.00635² × 2 = <strong>{fmt.sig(o(r, 'ls'), 3)} L/s</strong>, about{' '}
          {fmt.sig(o(r, 'gpm'), 3)} US gallons a minute.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Volume over time:</strong> multiply the flow rate by the time. A heart pumping 5.0
        L/min moves about 2.0 × 10⁵ m³ of blood in 75 years (OpenStax Example 12.1).
      </li>
      <li>
        <strong>Branches slow the flow:</strong> blood moves at 0.27 m/s in the aorta but only about
        0.33 mm/s in the billions of capillaries, whose total area is far larger.
      </li>
      <li>
        <strong>Speed is not pressure:</strong> a faster section has lower pressure (Bernoulli’s
        principle), which this calculator does not compute.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do I calculate the velocity of water in a pipe?',
      a: 'Divide the flow rate in cubic metres per second by the pipe’s cross-sectional area, πd²/4. For 0.500 L/s (0.0005 m³/s) in a hose of 1.80 cm inside diameter, v = 0.0005 ÷ 0.000254 ≈ 1.96 m/s.',
    },
    {
      q: 'What is the equation of continuity?',
      a: 'For an incompressible fluid the flow rate is the same everywhere along a pipe, so A₁v₁ = A₂v₂. A nozzle with a third of the hose diameter has a ninth of the area, so water leaves it about nine times faster: 1.96 m/s becomes 25.5 m/s.',
    },
    {
      q: 'How do I convert flow rate to gallons per minute?',
      a: 'One US gallon is 3.785 litres, so multiply litres per second by 60 ÷ 3.785 ≈ 15.85. A flow of 0.253 L/s is about 4.0 US gallons per minute. The calculator shows L/s, L/min, m³/s and gal/min together.',
    },
    {
      q: 'Why does narrowing a pipe make water faster?',
      a: 'The same volume must pass every point each second, and a narrower section has less area, so the water has to move faster through it. Speed scales with the inverse square of diameter.',
    },
  ],
  ogSample: (r, fmt) => `0.5 L/s, 1.8 cm hose → ${fmt.sig(o(r, 'v1'), 3)} m/s`,
};
