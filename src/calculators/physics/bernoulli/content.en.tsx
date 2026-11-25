import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'result') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Bernoulli Equation Calculator',
  promise: 'Pressure or speed at one point of a flowing fluid from the other point.',
  title: 'Bernoulli Equation Calculator: Pressure, Speed and Height',
  description:
    'Solve Bernoulli’s equation for the pressure at either point or the downstream speed of a flowing liquid, with heights, density and the pressure drop.',
  summary:
    'Bernoulli’s equation says pressure, kinetic energy per volume and potential energy per volume add up to the same total along a streamline: P + ½ρv² + ρgh is constant. Where a fluid speeds up, its pressure falls; where it climbs, pressure falls too. It applies to steady flow of an incompressible fluid with negligible friction.',
  synonyms: [
    'Bernoulli principle calculator',
    'fluid pressure and velocity calculator',
    'pressure drop calculator',
    'Torricelli’s law calculator',
    'pipe pressure calculator',
    'P + ½ρv² + ρgh',
  ],
  ui: {
    find: 'Solve for',
    'find.p1': 'Pressure 1',
    'find.p2': 'Pressure 2',
    'find.v2': 'Speed 2',
    pt1Row: 'Point 1 (upstream)',
    pt2Row: 'Point 2 (downstream)',
    p1: 'Pressure (kPa)',
    v1: 'Speed (m/s)',
    h1: 'Height (m)',
    p2: 'Pressure (kPa)',
    v2: 'Speed (m/s)',
    h2: 'Height (m)',
    rho: 'Fluid density (kg/m³)',
    'rho.help': 'Water is about 1000 kg/m³.',
    g: 'Gravity, g (m/s²)',
    'g.help': '9.80665 is standard gravity; OpenStax uses 9.80.',
    'out.result': 'Result',
    'out.result.p1': 'Pressure at point 1 (kPa)',
    'out.result.p2': 'Pressure at point 2 (kPa)',
    'out.result.v2': 'Speed at point 2 (m/s)',
    'out.p1': 'Pressure at point 1 (kPa)',
    'out.p2': 'Pressure at point 2 (kPa)',
    'out.v2': 'Speed at point 2 (m/s)',
    'out.dp': 'Pressure drop P₁ − P₂ (kPa)',
    'out.total': 'Bernoulli constant P + ½ρv² + ρgh (kPa)',
    'explain.p': 'Pressure is {p1} kPa at point 1 and {p2} kPa at point 2.',
    'explain.v': 'The fluid reaches point 2 at {v} m/s.',
    'step.terms': 'Kinetic term ½ρv² and height term ρgh at point 1, in pascals.',
    'step.p2': 'P₂ = P₁ + ½ρv₁² − ½ρv₂² + ρgh₁ − ρgh₂.',
    'step.p1': 'P₁ = P₂ + ½ρv₂² − ½ρv₁² + ρgh₂ − ρgh₁.',
    'step.v2': 'Solve the equation for v₂.',
    'warn.rho': 'Density and gravity must be above zero.',
    'warn.speed': 'Speeds cannot be negative.',
    'warn.noFlow':
      'Point 2 has more energy than point 1 can supply, so the fluid cannot flow from 1 to 2 with these values.',
    'warn.vacuum':
      'A pressure more than 101.325 kPa below atmospheric means a vacuum; if you entered gauge pressures, the liquid would boil or the flow would break up.',
    rounding:
      'Results are shown to 6 significant figures; enter gauge or absolute pressures consistently.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Bernoulli’s equation">{'P₁ + ½ρv₁² + ρgh₁ = P₂ + ½ρv₂² + ρgh₂'}</Formula>
      <Formula label="Torricelli (open tank, P₁ = P₂, v₁ ≈ 0)">{'v₂ = √(2g(h₁ − h₂))'}</Formula>
      <p>
        Each term is energy per unit volume, in pascals: pressure, kinetic energy ½ρv² and potential
        energy ρgh. Use the flow rate calculator to get the speeds from pipe diameters through
        continuity, A₁v₁ = A₂v₂.
      </p>
      <p>
        Real pipes lose some pressure to friction, which this ideal equation leaves out, so long
        pipes deliver less pressure than it predicts.
      </p>
    </>
  ),
  examples: [
    {
      id: 'hose',
      title: 'A garden hose: 1.96 m/s in the hose, 25.5 m/s out of the nozzle at 101 kPa',
      body: (r, fmt) => (
        <p>
          P₁ = 101 kPa + ½ × 1000 × (25.5² − 1.96²) = <strong>{fmt.sig(o(r), 3)} kPa</strong>, 4.24
          × 10⁵ N/m², as in OpenStax <em>College Physics</em> Example 12.4.
        </p>
      ),
    },
    {
      id: 'fire',
      title: 'A fire hose: 1620 kPa gauge at the base, nozzle 10 m up the ladder',
      body: (r, fmt) => (
        <p>
          With 12.4 m/s in the hose and 56.6 m/s at the nozzle, P₂ ={' '}
          <strong>{fmt.sig(o(r), 2)} kPa</strong> gauge: essentially atmospheric, as in OpenStax{' '}
          <em>University Physics</em> Example 14.7.
        </p>
      ),
    },
    {
      id: 'tank',
      title: 'Water draining from a tank, 5.0 m below the surface',
      body: (r, fmt) => (
        <p>
          With both points open to the air and the surface barely moving, v₂ = √(2 × 9.8 × 5.0) ={' '}
          <strong>{fmt.sig(o(r), 3)} m/s</strong>: Torricelli’s theorem, the speed of a free fall
          from the same height.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Same reference for pressure:</strong> use gauge pressure (relative to the air) at
        both points, or absolute pressure at both.
      </li>
      <li>
        <strong>Speeds from diameters:</strong> the speed changes with the inverse square of the
        pipe diameter, so get v₁ and v₂ from the flow rate first.
      </li>
      <li>
        <strong>Pumps add energy:</strong> a pump between the points raises the total, which the
        equation alone does not include; OpenStax computes pump power as pressure rise × flow rate.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'What does Bernoulli’s equation say?',
      a: 'Along a streamline of a steady, incompressible, frictionless flow, P + ½ρv² + ρgh is the same everywhere. A fluid that speeds up or rises must lose pressure, and one that slows or descends gains it.',
    },
    {
      q: 'How do I find the pressure in a hose before the nozzle?',
      a: 'Add the kinetic-energy difference to the nozzle pressure: P₁ = P₂ + ½ρ(v₂² − v₁²). Water at 1.96 m/s in a hose leaving a nozzle at 25.5 m/s into 101 kPa air needs 101 + 0.5 × 1000 × (650 − 3.8) Pa ≈ 424 kPa in the hose.',
    },
    {
      q: 'What is Torricelli’s theorem?',
      a: 'For liquid flowing from an opening a depth h below the free surface of a large open tank, the outflow speed is √(2gh), the same as an object falling h. Five metres of water gives about 9.9 m/s.',
    },
    {
      q: 'When does Bernoulli’s equation not apply?',
      a: 'It assumes steady flow, constant density, no friction and no pumps or turbines between the points. It is a good approximation for short pipes and nozzles, but long pipes lose pressure to friction and gases at high speed compress.',
    },
  ],
  ogSample: (r, fmt) => `Hose 1.96 → nozzle 25.5 m/s → ${fmt.sig(o(r), 3)} kPa in the hose`,
};
