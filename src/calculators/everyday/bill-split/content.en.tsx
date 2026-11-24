import type { CalculatorContent } from '@/calculators/content-types';
import { currencyUi } from '@/calculators/currencies';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'total') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Split Bill Calculator',
  promise: 'Who owes what, with tax and tip shared fairly by what each person ordered.',
  title: 'Split Bill Calculator: Who Owes What With Tax and Tip',
  description:
    'Split a restaurant or group bill by what each person ordered, with sales tax and tip shared in proportion, so every share is fair and the shares add up exactly.',
  summary:
    'When people order different amounts, splitting the bill evenly is unfair to the light eaters. A fair split adds tax and tip to the whole bill, then gives each person the same share of it as their share of the food. In practice everyone multiplies what they ordered by one factor: the total bill divided by the subtotal.',
  synonyms: [
    'bill splitter',
    'split the check calculator',
    'who owes what calculator',
    'restaurant bill split',
    'split bill with tax and tip',
    'group dinner calculator',
  ],
  ui: {
    currency: 'Currency',
    ...currencyUi('en'),
    people: 'What each person ordered',
    'people.help':
      'One row per person, before tax and tip. Shared dishes can be divided between rows.',
    'people.row': 'person {n}',
    'people.add': 'Add a person',
    'people.remove': 'Remove person {n}',
    'col.amount': 'Ordered',
    taxRate: 'Sales tax (%)',
    tipRate: 'Tip (%)',
    tipOn: 'Tip is calculated on',
    'tipOn.subtotal': 'Food before tax',
    'tipOn.total': 'Total with tax',
    'out.total': 'Total bill',
    'out.subtotal': 'Subtotal',
    'out.tax': 'Tax',
    'out.tip': 'Tip',
    'out.factor': 'Multiply each order by',
    explain: 'The {total} bill is split between {n} people: each pays their order × {f}.',
    'step.tax': 'Tax on the subtotal.',
    'step.tip': 'Tip on the chosen base.',
    'step.share': 'Each person pays their order times the total ÷ subtotal.',
    'table.caption': 'What each person pays',
    'table.person': 'Person',
    'table.ordered': 'Ordered',
    'table.pays': 'Pays (with tax and tip)',
    'warn.empty': 'Enter at least one person’s order above zero.',
    rounding:
      'Money is handled in cents. Tax and tip are rounded half-up, and shares are rounded so they add up to the exact total (any leftover cent goes to the largest fraction).',
  },
  HowItWorks: () => (
    <>
      <Formula label="Bill">
        {
          'tax = subtotal × tax rate\ntip = subtotal (or subtotal + tax) × tip rate\ntotal = subtotal + tax + tip'
        }
      </Formula>
      <Formula label="Each person’s share">{'share = their order × (total ÷ subtotal)'}</Formula>
      <p>
        Tax and tip are percentages of the bill, as in OpenStax’s examples: an 18% tip on $68.50 is
        $12.33, and 8.25% sales tax on $34.88 is $2.88. Because both are a fixed percentage of the
        food, sharing them in proportion to what each person ordered is the same as charging each
        person their own tax and tip.
      </p>
      <p>
        <strong>Cents add up.</strong> Rounding every share separately can leave the group a cent
        short or over. The calculator rounds down first, then hands out the leftover cents to the
        shares with the largest dropped fractions, so the shares always total the bill.
      </p>
    </>
  ),
  examples: [
    {
      id: 'dinner',
      title: 'Three people, three different orders',
      body: (r, fmt) => (
        <p>
          Orders of $24.00, $31.50 and $18.75 make a $74.25 subtotal. With 8.875% tax ($6.59) and a
          20% tip on the food ($14.85), the bill is <strong>{fmt.money(o(r))}</strong>. Each order
          is multiplied by {fmt.num(o(r, 'factor'), 4)}, so the three pay $30.93, $40.60 and $24.16.
        </p>
      ),
    },
    {
      id: 'tip',
      title: 'An 18% tip on $68.50',
      body: (r, fmt) => (
        <p>
          With one diner and no tax, the tip is {fmt.money(o(r, 'tip'))}, OpenStax’s Example 6.20,
          and the bill is <strong>{fmt.money(o(r))}</strong>.
        </p>
      ),
    },
    {
      id: 'tax',
      title: '8.25% tax on $34.88',
      body: (r, fmt) => (
        <p>
          Tax is {fmt.money(o(r, 'tax'))}, so the total is <strong>{fmt.money(o(r))}</strong>, as in
          OpenStax Contemporary Mathematics Example 6.22.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Split shared dishes first.</strong> A $30 sharing plate between three adds $10 to
        each of those people’s orders.
      </li>
      <li>
        <strong>Decide on the tip base.</strong> Groups differ: some tip on the food before tax,
        others on the total. Pick one under More options.
      </li>
      <li>
        <strong>Even splits are fine when orders are similar.</strong> If everyone ordered about the
        same, dividing the total by the number of people is simpler and close enough.
      </li>
      <li>
        <strong>Share the result.</strong> The page link keeps every amount, so you can send it to
        the group to check.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do you split a bill fairly when people ordered different amounts?',
      a: 'Work out the total with tax and tip, divide it by the subtotal to get a factor, and multiply each person’s order by that factor. If the bill is $120 on $100 of food, the factor is 1.2, so someone who ordered $35 pays $42.',
    },
    {
      q: 'Should the tip be on the amount before or after tax?',
      a: 'It is a matter of local custom and preference. Tipping on the pre-tax amount is slightly cheaper. The calculator lets you choose; the difference is the tip rate times the tax, usually small.',
    },
    {
      q: 'Why do the shares add up exactly to the bill?',
      a: 'Each share is rounded down to the cent, then the cents left over go one each to the people whose shares lost the most in rounding. This largest-remainder method keeps every share within a cent of its exact value while making the total match.',
    },
    {
      q: 'How do I split a bill evenly?',
      a: 'Use the tip calculator’s split option, or enter the same amount for everyone here. Dividing the total by the number of people is the simplest split, and it is fair when everyone ordered roughly the same.',
    },
  ],
  ogSample: (r, fmt) => `Bill ${fmt.money(o(r))}, split fairly`,
};
