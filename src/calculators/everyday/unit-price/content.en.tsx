import type { CalculatorContent } from '@/calculators/content-types';
import { currencyUi } from '@/calculators/currencies';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k: string) => r.outputs[k];

export const content: CalculatorContent = {
  name: 'Unit Price Calculator',
  promise: 'Compare package sizes by price per unit and find the better buy.',
  title: 'Unit Price Calculator: Compare Price per Unit, Find Best Buy',
  description:
    'Compare up to 10 products by price per unit, such as per ounce, per gram or per load, to see which package is the better buy and how much cheaper it is.',
  summary:
    'The unit price is the price divided by the number of units in the package: dollars per ounce, cents per gram or cost per load. Comparing unit prices shows which size gives more for the money, as long as every quantity is in the same unit. Bigger packages are often cheaper per unit, but not always.',
  synonyms: [
    'price per unit calculator',
    'price per ounce calculator',
    'better buy calculator',
    'compare prices',
    'cost per unit',
    'grocery price comparison',
  ],
  ui: {
    currency: 'Currency',
    ...currencyUi('en'),
    items: 'Products to compare',
    'items.help':
      'Use the same unit for every quantity: all in ounces, all in grams, all in loads.',
    'items.row': 'item {n}',
    'items.add': 'Add a product',
    'items.remove': 'Remove item {n}',
    'col.price': 'Price',
    'col.qty': 'Quantity',
    'out.best': 'Better buy',
    'out.unit': 'Lowest price per unit',
    'out.saving': 'Cheaper per unit than the most expensive',
    'out.worst': 'Highest price per unit',
    'fmt.item': 'Item {n}',
    'fmt.tie': 'Tie: items {list}',
    explain: '{best} costs {unit} per unit, against {worst} for the most expensive option.',
    'explain.one': 'This product costs {unit} per unit.',
    'step.divide': 'Divide each price by its quantity.',
    'step.compare': 'The lowest price per unit is the better buy.',
    'table.caption': 'Price per unit for each product',
    'table.item': 'Item',
    'table.unit': 'Price per unit',
    'table.vsBest': 'Extra vs best (%)',
    'warn.empty': 'Enter a price and a quantity above zero for at least one product.',
    'warn.skipped': '{n} row(s) without a price or a quantity above zero were left out.',
    'warn.close':
      'The unit prices are within 1% of each other. Other things, like how much you will actually use, matter more here.',
    rounding:
      'Unit prices are rounded half-up to 4 decimal places, finer than shelf labels, so close comparisons are not decided by rounding to the cent.',
  },
  HowItWorks: () => (
    <>
      <p>A unit price is a rate: what one unit of the product costs.</p>
      <Formula label="Unit price">{'unit price = price ÷ quantity'}</Formula>
      <p>
        OpenStax <em>Prealgebra</em> uses it to decide the better buy: divide each package’s price
        by its quantity, and pick the smaller result. The calculator also shows how much more each
        option costs per unit than the best one:
      </p>
      <Formula label="Premium over the best">
        {'premium = (unit price − lowest) ÷ lowest × 100'}
      </Formula>
      <p>
        Many shelf labels already show a unit price. The US National Institute of Standards and
        Technology publishes a best-practice guide for them, which recommends using the same unit
        across a product category so shoppers can compare. Labels round to the cent or a tenth of a
        cent, so two products can look identical on the shelf when one is slightly cheaper.
      </p>
    </>
  ),
  examples: [
    {
      id: 'detergent',
      title: 'Liquid or powder detergent',
      body: (r, fmt) => (
        <p>
          Liquid costs $14.99 for 64 loads and powder $15.99 for 80 loads. Per load, that is $0.2342
          and {fmt.money(o(r, 'unit') as number, 4)}, so the better buy is{' '}
          <strong>{String(o(r, 'best'))}</strong>, the powder, even though its package price is
          higher. This is OpenStax’s Example 5.67.
        </p>
      ),
    },
    {
      id: 'ketchup',
      title: 'When the bigger bottle costs more per ounce',
      body: (r, fmt) => (
        <p>
          NIST’s example: a 64-ounce bottle of ketchup at $4.49 and a 38-ounce bottle at $2.29. The
          large bottle works out at $0.0702 an ounce, and the small one at{' '}
          {fmt.money(o(r, 'unit') as number, 4)}. <strong>{String(o(r, 'best'))}</strong>, the
          smaller bottle, is the better deal, because the store charged extra for the large size.
        </p>
      ),
    },
    {
      id: 'bulk',
      title: 'Three sizes of coffee',
      body: (r, fmt) => (
        <p>
          16 oz for $4.29, 32 oz for $6.99 and 48 oz for $12.49. Per ounce: $0.2681, $0.2184 and
          $0.2602. The middle size, <strong>{String(o(r, 'best'))}</strong>, is{' '}
          {fmt.pct(o(r, 'saving') as number, 1)} cheaper per ounce than the small bag, while the
          largest bag costs more per ounce than the 32 oz one.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Convert to one unit first.</strong> If one package is in grams and another in
        ounces, convert before comparing (1 oz = 28.349523125 g). The unit converter can help.
      </li>
      <li>
        <strong>Check multi-buy offers.</strong> For “3 for $5”, enter the total price and the total
        quantity of all three packages, not the price of one.
      </li>
      <li>
        <strong>Cheapest per unit isn’t always best.</strong> A larger pack is no saving if part of
        it spoils or goes unused. Compare what you will actually use.
      </li>
      <li>
        <strong>Watch for shrinking packages.</strong> When a product gets smaller but keeps its
        price, the unit price rises. Comparing unit prices over time makes this visible.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do you calculate unit price?',
      a: 'Divide the price by the number of units. A 24-pack of bottles for $3.99 costs $3.99 ÷ 24 = $0.166 per bottle, about 17 cents. Use whatever unit makes sense, such as ounces, grams, sheets or loads, as long as you use the same one for every product.',
    },
    {
      q: 'Is the bigger package always cheaper?',
      a: 'Usually, but not always. Stores sometimes charge more per unit for large sizes, and sales on small sizes can reverse the usual pattern. NIST’s ketchup example shows a 64-ounce bottle costing more per ounce than a 38-ounce bottle. Checking the unit price is the only reliable way to know.',
    },
    {
      q: 'How do I compare products sold in different units?',
      a: 'Convert one quantity to the other’s unit first. To compare 500 g with 16 oz, convert 16 oz to 453.6 g, then divide each price by its grams. Comparing $ per gram with $ per ounce directly gives a meaningless result.',
    },
    {
      q: 'Why does the shelf label show a different unit price?',
      a: 'Shelf labels round the unit price, often to the nearest cent or tenth of a cent, and may use a different unit, such as per 100 g or per pound. This calculator keeps four decimal places. Small differences can also come from a price change that the label hasn’t caught up with.',
    },
  ],
  ogSample: (r) => `Better buy: ${String(o(r, 'best'))}`,
};
