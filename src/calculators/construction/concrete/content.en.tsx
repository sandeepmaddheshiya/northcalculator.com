import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'result') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Concrete Calculator',
  promise: 'How much concrete a slab, footing or post hole needs, in cubic yards or m³.',
  title: 'Concrete Calculator: Cubic Yards for Slabs and Post Holes',
  description:
    'Work out the concrete for a slab, path, footing or post hole in cubic yards or cubic metres, with an order quantity rounded up and an optional waste margin.',
  summary:
    'Concrete volume is length times width times thickness for a slab, or π times the radius squared times the depth for a round hole. Convert the thickness to feet first, multiply, and divide the cubic feet by 27 to get cubic yards. A 125 ft path that is 4 ft wide and 3½ inches deep needs 5.40 cubic yards.',
  synonyms: [
    'concrete slab calculator',
    'cubic yards of concrete',
    'how much concrete do I need',
    'concrete volume calculator',
    'post hole concrete calculator',
    'cement calculator',
  ],
  ui: {
    units: 'Units',
    'units.imperial': 'Feet and inches',
    'units.metric': 'Metres and cm',
    shape: 'Shape',
    'shape.slab': 'Slab or footing',
    'shape.round': 'Round hole or column',
    length: 'Length',
    'length.imperial': 'Length (ft)',
    'length.metric': 'Length (m)',
    width: 'Width',
    'width.imperial': 'Width (ft)',
    'width.metric': 'Width (m)',
    thickness: 'Thickness',
    'thickness.imperial': 'Thickness (in)',
    'thickness.metric': 'Thickness (cm)',
    diameter: 'Diameter',
    'diameter.imperial': 'Diameter (in)',
    'diameter.metric': 'Diameter (cm)',
    depth: 'Depth',
    'depth.imperial': 'Depth (ft)',
    'depth.metric': 'Depth (m)',
    count: 'How many',
    waste: 'Extra for waste (%)',
    'waste.help': 'A margin for spillage, uneven ground and forms that bulge.',
    'out.result': 'Concrete needed (yd³)',
    'out.result.imperial': 'Concrete needed (yd³)',
    'out.result.metric': 'Concrete needed (m³)',
    'out.order': 'Order (yd³)',
    'out.order.imperial': 'Order, rounded up to ¼ yd³',
    'out.order.metric': 'Order, rounded up to 0.1 m³',
    'out.yd3': 'Cubic yards',
    'out.ft3': 'Cubic feet',
    'out.m3': 'Cubic metres',
    'explain.imperial': 'You need {v} cubic yards of concrete; order {order} yd³.',
    'explain.metric': 'You need {v} m³ of concrete; order {order} m³.',
    'step.slab':
      'Volume = length × width × thickness, with the thickness converted to feet or metres.',
    'step.round': 'Volume = π × radius² × depth, with the diameter converted to feet or metres.',
    'step.total': 'Multiply by the number of pours and add the waste allowance.',
    'step.yards': 'Divide cubic feet by 27 to get cubic yards.',
    'warn.zero': 'Enter dimensions greater than zero.',
    rounding:
      'Volumes are shown to 2 decimals. The order quantity rounds up, never down, so you do not run short.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Volume">{'slab: V = L × W × T\nround: V = π × (D ÷ 2)² × H'}</Formula>
      <Formula label="Cubic yards">{'yd³ = ft³ ÷ 27\n1 yd³ = 0.764554857984 m³'}</Formula>
      <p>
        Put every measurement in the same unit before multiplying: 3½ inches is 3.5 ÷ 12 = 0.2917
        ft. A cubic yard is 3 ft × 3 ft × 3 ft, so it holds 27 cubic feet. PennDOT’s guide notes
        that ready-mix is usually ordered to the nearest ¼ to ½ cubic yard, so the order figure
        rounds up to the next quarter.
      </p>
    </>
  ),
  examples: [
    {
      id: 'sidewalk',
      title: 'A 125 ft sidewalk, 4 ft wide, in 2×4 forms',
      body: (r, fmt) => (
        <p>
          A 2×4 is really 3½ in deep, so 125 × 4 × (3.5 ÷ 12) = 145.83 ft³ ÷ 27 ={' '}
          <strong>{fmt.num(o(r), 2)} yd³</strong>; order {fmt.num(o(r, 'order'), 2)}. PennDOT rounds
          the thickness to 0.29 ft and gets 5.37 yd³, also ordered as 5.5.
        </p>
      ),
    },
    {
      id: 'patio',
      title: 'A 4 m × 3 m patio, 10 cm thick, plus 10%',
      body: (r, fmt) => (
        <p>
          4 × 3 × 0.10 = 1.2 m³, and 10% extra makes <strong>{fmt.num(o(r), 2)} m³</strong>.
        </p>
      ),
    },
    {
      id: 'posts',
      title: 'Eight fence-post holes, 12 in wide and 4 ft deep',
      body: (r, fmt) => (
        <p>
          Each hole is π × 0.5² × 4 = 3.14 ft³, so eight take 25.13 ft³ ={' '}
          <strong>{fmt.num(o(r), 2)} yd³</strong>, less the volume of the posts themselves.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Measure the real form depth.</strong> Dimensional lumber is smaller than its name: a
        2×4 is 1½ × 3½ inches and a 2×6 is 1½ × 5½ inches.
      </li>
      <li>
        <strong>Uneven ground uses more.</strong> Take several depth measurements and use the
        average, or add a waste allowance.
      </li>
      <li>
        <strong>Small jobs:</strong> check the yield printed on bagged concrete to see how many bags
        make your volume; it varies by product and bag size.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do I calculate cubic yards of concrete?',
      a: 'Multiply length × width × thickness, all in feet, to get cubic feet, then divide by 27. A 10 ft × 10 ft slab 4 inches thick is 10 × 10 × 0.333 = 33.33 ft³, which is 1.23 cubic yards.',
    },
    {
      q: 'How thick should a concrete slab be?',
      a: 'It depends on the load and local building codes. Paths and patios are commonly about 4 inches (10 cm) thick and driveways thicker. Check your local code or an engineer for anything structural; this calculator only works out the volume for the thickness you choose.',
    },
    {
      q: 'Should I order extra concrete?',
      a: 'Yes, a little. Running short in the middle of a pour leaves a weak joint, while a small surplus is cheap. Ready-mix is usually ordered to the nearest quarter or half yard, and a margin for spillage and uneven ground is worth adding.',
    },
    {
      q: 'How do I convert cubic yards to cubic metres?',
      a: 'Multiply by 0.764554857984, since a yard is exactly 0.9144 m. 5 cubic yards is about 3.82 m³. To go the other way, divide cubic metres by 0.7646, so 2 m³ is about 2.62 cubic yards.',
    },
  ],
  ogSample: (r, fmt) => `125 ft × 4 ft × 3½ in → ${fmt.num(o(r), 2)} yd³`,
};
