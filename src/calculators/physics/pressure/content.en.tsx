import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'pa') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Pressure Calculator',
  promise: 'Pressure from force over area, or from depth in a liquid.',
  title: 'Pressure Calculator: P = F/A and Pressure at Depth (ρgh)',
  description:
    'Calculate pressure from a force spread over an area, or the pressure at a depth in water or another liquid, in pascals, kilopascals, atmospheres and psi.',
  summary:
    'Pressure is force per unit area: P = F ÷ A, in pascals, where one pascal is one newton per square metre. In a liquid, the weight of the liquid above adds pressure that grows steadily with depth: P = ρgh. In water each 10.3 metres adds about one atmosphere, so a diver at that depth feels twice the pressure at the surface.',
  synonyms: [
    'P = F/A calculator',
    'hydrostatic pressure calculator',
    'water pressure at depth',
    'pressure in pascals',
    'fluid pressure calculator',
    'rho g h calculator',
  ],
  ui: {
    mode: 'Pressure from',
    'mode.force': 'Force and area',
    'mode.depth': 'Depth in a liquid',
    force: 'Force (N)',
    area: 'Area (m²)',
    depth: 'Depth (m)',
    density: 'Liquid density (kg/m³)',
    'density.help': 'Fresh water 1,000; sea water about 1,030.',
    g: 'Gravity, g (m/s²)',
    'out.pa': 'Pressure (Pa)',
    'out.pa.force': 'Pressure (Pa)',
    'out.pa.depth': 'Gauge pressure from the liquid (Pa)',
    'out.kpa': 'Pressure (kPa)',
    'out.atm': 'Pressure (atm)',
    'out.psi': 'Pressure (psi)',
    'out.absolute': 'Absolute pressure with 1 atm above (Pa)',
    'explain.force': 'The force produces {p} kPa, or {atm} atmospheres.',
    'explain.depth': 'The liquid adds {p} kPa, or {atm} atmospheres, on top of the air pressure.',
    'step.force': 'Pressure = force ÷ area.',
    'step.depth': 'Pressure = density × g × depth.',
    'warn.area': 'The area must be greater than zero.',
    'warn.g': 'Gravity must be greater than zero.',
    rounding:
      'Uses 1 atm = 101,325 Pa and 1 psi = 6,894.757 Pa. Results keep 12 significant digits and are shown to 8.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Pressure">{'P = F ÷ A\n1 Pa = 1 N/m²'}</Formula>
      <Formula label="In a liquid">{'P = ρ × g × h\nabsolute = P + 101,325 Pa'}</Formula>
      <p>
        ρ is the liquid’s density and h the depth below the surface. ρgh is gauge pressure, what a
        tyre gauge or depth gauge reads; adding atmospheric pressure gives absolute pressure.
        Pressure at a depth does not depend on the shape or width of the container, only on how deep
        it is.
      </p>
    </>
  ),
  examples: [
    {
      id: 'dam',
      title: 'The average pressure on a dam 80 m deep (g = 9.80)',
      body: (r, fmt) => (
        <p>
          At the average depth of 40.0 m, P = 1,000 × 9.80 × 40.0 ={' '}
          <strong>{fmt.sig(o(r, 'kpa'), 3)} kPa</strong>, as in OpenStax <em>College Physics</em>{' '}
          Example 11.3 and <em>University Physics</em> Example 14.1.
        </p>
      ),
    },
    {
      id: 'pool',
      title: 'Water pressure 10.3 m down',
      body: (r, fmt) => (
        <p>
          1,000 × 9.80 × 10.3 = <strong>{fmt.sig(o(r), 5)} Pa</strong>, about{' '}
          {fmt.sig(o(r, 'atm'), 3)} atm, which is why OpenStax Example 11.5 finds one atmosphere of
          water pressure at 10.3 m.
        </p>
      ),
    },
    {
      id: 'tank',
      title: '122,000 N on a disk 0.150 m across',
      body: (r, fmt) => (
        <p>
          The area is π × 0.075² = 0.01767 m², so P = <strong>{fmt.sig(o(r), 3)} Pa</strong>, the
          6.90 × 10⁶ Pa tank pressure of Example 11.2 worked backwards.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Convert areas to m².</strong> 1 cm² = 0.0001 m², so a force on a small area gives a
        very large pressure in pascals.
      </li>
      <li>
        <strong>Sharp points concentrate force:</strong> the same push on a much smaller area makes
        a much larger pressure.
      </li>
      <li>
        <strong>Gauge or absolute?</strong> Tyre and depth gauges read pressure above atmospheric;
        scientific formulas such as the gas laws need absolute pressure.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'What is the formula for pressure?',
      a: 'P = F ÷ A: force in newtons divided by area in square metres gives pascals. A 600 N person standing on 0.04 m² of shoe sole exerts 15,000 Pa, or 15 kPa; on one stiletto heel of 0.0001 m² it would be 6,000,000 Pa.',
    },
    {
      q: 'How does water pressure change with depth?',
      a: 'It rises steadily by ρgh: about 9.8 kPa per metre in fresh water and a little more in sea water. At 10 m the water adds about 98 kPa, almost one atmosphere, so the total pressure is roughly double that at the surface.',
    },
    {
      q: 'How many pascals are in an atmosphere?',
      a: 'One standard atmosphere is exactly 101,325 Pa, or 101.325 kPa, about 14.7 psi. Weather reports use hectopascals or millibars instead, and a reading of 1013 hPa is close to one standard atmosphere.',
    },
    {
      q: 'What is the difference between gauge and absolute pressure?',
      a: 'Gauge pressure is measured relative to the surrounding air, so an open tyre reads zero. Absolute pressure is measured from a vacuum, so it adds atmospheric pressure, about 101 kPa at sea level, to the gauge reading.',
    },
  ],
  ogSample: (r, fmt) => `10.3 m of water → ${fmt.sig(o(r, 'kpa'), 4)} kPa`,
};
