import type { CalculatorContent } from '@/calculators/content-types';
import { currencyUi } from '@/calculators/currencies';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'boardFeet') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Board Foot Calculator',
  promise: 'Board feet and cost of lumber from its thickness, width and length.',
  title: 'Board Foot Calculator: Lumber Volume and Board Foot Price',
  description:
    'Work out the board feet in a board or a stack of lumber from thickness and width in inches and length in feet, with the total cost at a price per board foot.',
  summary:
    'A board foot is a volume of wood 12 inches wide, 12 inches long and 1 inch thick, or 144 cubic inches. Multiply thickness in inches by width in inches by length in feet and divide by 12. A 10-foot 2×6 is 2 × 6 × 10 ÷ 12 = 10 board feet. Hardwood and rough lumber are usually priced per board foot.',
  synonyms: [
    'board feet calculator',
    'lumber calculator',
    'bd ft calculator',
    'hardwood board feet',
    'lumber cost calculator',
    'how to calculate board feet',
  ],
  ui: {
    currency: 'Currency',
    ...currencyUi('en'),
    thickness: 'Thickness (inches)',
    width: 'Width (inches)',
    length: 'Length (feet)',
    count: 'Number of boards',
    price: 'Price per board foot',
    'price.help': 'Optional, for the total cost.',
    'out.boardFeet': 'Total board feet',
    'out.each': 'Board feet per piece',
    'out.cost': 'Total cost',
    'out.cubicFeet': 'Cubic feet',
    'out.m3': 'Cubic metres',
    explain: 'This board holds {bf} board feet of lumber.',
    'explain.many': '{n} boards at {each} board feet each make {bf} board feet.',
    'step.each': 'Board feet = thickness × width × length ÷ 12.',
    'step.count': 'Multiply by the number of boards.',
    'step.cost': 'Cost = board feet × price per board foot.',
    'warn.zero': 'Enter dimensions greater than zero.',
    rounding:
      'Board feet keep 12 significant digits and are shown to 8. The cost is rounded half-up to the smallest unit of the currency.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Board feet">
        {'BF = thickness (in) × width (in) × length (ft) ÷ 12\n1 BF = 144 in³, 12 BF = 1 ft³'}
      </Formula>
      <p>
        Lumber is sold by its nominal size, so a 2×6 counts as 2 by 6 inches even though a surfaced
        2×6 measures 1½ by 5½ inches. Enter nominal sizes to match a price list, or actual sizes for
        the true volume: the UW–Extension fact sheet notes a 10-foot 2×6 is 10 board feet nominally
        but 6.875 by actual measure.
      </p>
    </>
  ),
  examples: [
    {
      id: 'twoBySix',
      title: 'A 10-foot 2×6',
      body: (r, fmt) => (
        <p>
          2 × 6 × 10 ÷ 12 = <strong>{fmt.sig(o(r), 6)} board feet</strong>, the UW–Extension
          example.
        </p>
      ),
    },
    {
      id: 'plank',
      title: 'A plank 2 in × 8 in × 24 ft',
      body: (r, fmt) => (
        <p>
          (2 × 8 × 24) ÷ 12 = <strong>{fmt.sig(o(r), 6)} board feet</strong>, as in Oregon State
          University Extension’s EC 1127.
        </p>
      ),
    },
    {
      id: 'priced',
      title: 'Six 8-foot 1×8s at $4.50 a board foot',
      body: (r, fmt) => (
        <p>
          Each is 1 × 8 × 8 ÷ 12 = 5⅓ board feet, so six make {fmt.sig(o(r), 6)} board feet costing{' '}
          <strong>{fmt.money(o(r, 'cost'))}</strong>.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Rough hardwood</strong> is sold by thickness in quarters: 4/4 is 1 inch, 8/4 is 2
        inches. Enter the quarter thickness as inches.
      </li>
      <li>
        <strong>Buy extra.</strong> Allow for defects, knots and offcuts when turning board feet
        into a shopping list.
      </li>
      <li>
        <strong>Stacks:</strong> for boards of equal length, measure the stack’s height and width in
        inches and treat it as one piece.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do you calculate board feet?',
      a: 'Multiply the thickness in inches by the width in inches by the length in feet, then divide by 12. An 8-foot 2×4 is 2 × 4 × 8 ÷ 12 ≈ 5.33 board feet. If you measure the length in inches too, divide by 144 instead.',
    },
    {
      q: 'Do I use nominal or actual dimensions?',
      a: 'Lumber yards price softwood dimension lumber by nominal size, so use nominal sizes to check a bill. For the actual amount of wood, use measured sizes: a surfaced 2×4 is really 1½ × 3½ inches, about 34% less than its nominal volume.',
    },
    {
      q: 'How many board feet are in a cubic foot?',
      a: 'Twelve, because a cubic foot is 12 inches thick and a board foot is 1 inch thick. In practice sawing a log loses wood to the saw kerf and slabs; UW–Extension puts the yield at about 5 to 7 board feet per cubic foot of log.',
    },
    {
      q: 'How much does lumber cost per board foot?',
      a: 'It varies widely by species, grade and region. Multiply the board feet by your supplier’s price per board foot to get the total; for example, 32 board feet at $4.50 is $144.00.',
    },
  ],
  ogSample: (r, fmt) => `10 ft 2×6 → ${fmt.sig(o(r), 6)} board feet`,
};
