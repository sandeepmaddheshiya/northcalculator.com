import type { CalculatorContent } from '@/calculators/content-types';
import { currencyUi } from '@/calculators/currencies';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k: string) => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Margin and Markup Calculator',
  promise: 'Profit margin, markup and selling price from cost, price or a target percentage.',
  title: 'Margin Calculator: Profit Margin, Markup and Selling Price',
  description:
    'Find gross profit margin and markup from cost and selling price, or the price that hits a target margin or markup. Shows why a 50% markup is only a 33% margin.',
  summary:
    'Margin and markup both describe profit, the selling price minus the cost, but they divide it by different things. Markup divides the profit by the cost. Margin divides it by the selling price. So an item that costs $60 and sells for $100 has a $40 profit, a 40% margin and a 66.7% markup. Margin can never reach 100%, while markup has no upper limit.',
  synonyms: [
    'profit margin calculator',
    'markup calculator',
    'gross margin calculator',
    'margin vs markup',
    'selling price calculator',
    'markup percentage calculator',
    'gross profit calculator',
  ],
  ui: {
    currency: 'Currency',
    ...currencyUi('en'),
    calc: 'What do you know?',
    'calc.costPrice': 'Cost and selling price',
    'calc.costMargin': 'Cost and the margin I want',
    'calc.costMarkup': 'Cost and the markup I want',
    'calc.priceMargin': 'Selling price and margin',
    'calc.priceMarkup': 'Selling price and markup',
    cost: 'Cost',
    price: 'Selling price',
    marginPct: 'Margin (%)',
    markupPct: 'Markup (%)',
    'out.result.costPrice': 'Gross margin',
    'out.result.costMargin': 'Selling price',
    'out.result.costMarkup': 'Selling price',
    'out.result.priceMargin': 'Cost',
    'out.result.priceMarkup': 'Cost',
    'out.price': 'Selling price',
    'out.cost': 'Cost',
    'out.profit': 'Gross profit',
    'out.margin': 'Gross margin',
    'out.markup': 'Markup',
    explain:
      'Selling at {price} with a cost of {cost} makes {profit} profit: a {margin} margin on the price, or a {markup} markup on the cost.',
    'step.priceFromMargin': 'Price = cost ÷ (1 − margin).',
    'step.priceFromMarkup': 'Price = cost × (1 + markup).',
    'step.costFromMargin': 'Cost = price × (1 − margin).',
    'step.costFromMarkup': 'Cost = price ÷ (1 + markup).',
    'step.profit': 'Gross profit = selling price − cost.',
    'step.margin': 'Margin = profit ÷ selling price.',
    'step.markup': 'Markup = profit ÷ cost.',
    'warn.margin100':
      'A margin must be below 100%. At 100% the cost would have to be zero, so no price can reach it.',
    'warn.markup100': 'A markup of −100% or less would mean a cost of zero or below.',
    'warn.loss': 'The selling price is below the cost, so the item sells at a loss.',
    'warn.zeroPrice': 'With a selling price of zero, margin is undefined.',
    rounding:
      'Prices and costs are rounded half-up to the smallest unit of the currency (for example the cent). Percentages are rounded to 4 decimal places and shown to 2.',
  },
  HowItWorks: () => (
    <>
      <p>Everything starts from the gross profit on one item or one sale:</p>
      <Formula label="Gross profit">{'profit = selling price − cost'}</Formula>
      <p>
        <strong>Markup</strong> expresses the profit as a share of the cost. Retailers set prices
        this way: OpenStax <em>Contemporary Mathematics</em> defines the retail price as the cost
        times (1 + percent markup).
      </p>
      <Formula label="Markup">{'markup = profit ÷ cost\nprice  = cost × (1 + markup)'}</Formula>
      <p>
        <strong>Margin</strong> expresses the same profit as a share of the selling price. In
        accounting, the gross profit margin ratio is (net sales − cost of goods sold) ÷ net sales,
        the share of each sale left to pay operating costs and profit.
      </p>
      <Formula label="Margin">{'margin = profit ÷ price\nprice  = cost ÷ (1 − margin)'}</Formula>
      <p>
        Because the price is always larger than the cost when there is a profit, the margin is
        always smaller than the markup. They convert into each other directly:
      </p>
      <Formula label="Converting between them">
        {'margin = markup ÷ (1 + markup)\nmarkup = margin ÷ (1 − margin)'}
      </Formula>
    </>
  ),
  examples: [
    {
      id: 'phone',
      title: 'A phone that costs $480 and sells for $840',
      body: (r, fmt) => (
        <p>
          The profit is $840 − $480 = {fmt.money(o(r, 'profit'))}. As a share of the cost, that is a
          markup of {fmt.pct(o(r, 'markup'), 2)}, the answer in OpenStax’s Example 6.20. As a share
          of the price, it is a margin of only <strong>{fmt.pct(o(r, 'result'), 2)}</strong>. Same
          sale, two very different percentages.
        </p>
      ),
    },
    {
      id: 'target',
      title: 'Pricing a $62 item for a 40% margin',
      body: (r, fmt) => (
        <p>
          Choose “Cost and the margin I want”. The price is $62 ÷ (1 − 0.40) = $62 ÷ 0.6 ={' '}
          <strong>{fmt.money(o(r, 'result'))}</strong>. Adding 40% to the cost would give only
          $86.80, a margin of 28.6%. To get a 40% margin you need a markup of{' '}
          {fmt.pct(o(r, 'markup'), 2)}.
        </p>
      ),
    },
    {
      id: 'shirt',
      title: 'What a retailer paid for a $29.50 T-shirt with an 18% markup',
      body: (r, fmt) => (
        <p>
          Choose “Selling price and markup”. Since price = cost × 1.18, the cost is $29.50 ÷ 1.18 ={' '}
          <strong>{fmt.money(o(r, 'result'))}</strong>, as in OpenStax’s Example 6.21. Taking 18%
          off the price instead would give $24.19, because 18% of the price is more than 18% of the
          cost.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Agree on which one you mean.</strong> Suppliers and retailers often quote markup,
        while financial statements and investors use margin. A “30%” target means very different
        prices depending on which it is.
      </li>
      <li>
        <strong>Gross margin is not net profit.</strong> It only covers the cost of the goods. Rent,
        wages, shipping and taxes come out of it, so a 40% gross margin might leave a few percent of
        net profit.
      </li>
      <li>
        <strong>Discounts eat margin quickly.</strong> On a 40% margin, a 20% discount removes half
        of the profit: a $100 item costing $60 sells for $80, leaving $20 instead of $40.
      </li>
      <li>
        <strong>Use the same basis for cost and price.</strong> Leave sales tax or VAT out of the
        selling price, since that money goes to the tax authority, not to you.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'What is the difference between margin and markup?',
      a: 'Both use the same profit, price minus cost. Markup divides it by the cost, and margin divides it by the selling price. A product bought for $50 and sold for $75 has a $25 profit, a 50% markup and a 33.3% margin. Markup is always the larger percentage when there is a profit.',
    },
    {
      q: 'How do I calculate the selling price from cost and margin?',
      a: 'Divide the cost by 1 minus the margin as a decimal. For a 25% margin on a $30 cost: $30 ÷ 0.75 = $40. Check it: the $10 profit is 25% of $40. Multiplying the cost by 1.25 instead gives $37.50, which is a 25% markup and only a 20% margin.',
    },
    {
      q: 'Can a margin be more than 100%?',
      a: 'No. Margin is profit divided by price, and the profit can never be more than the price unless the cost is negative. A margin approaches 100% as the cost approaches zero. Markup has no such limit: selling a $10 item for $50 is a 400% markup, but an 80% margin.',
    },
    {
      q: 'How do I convert markup to margin?',
      a: 'Divide the markup by 1 plus the markup, using decimals. A 50% markup is 0.5 ÷ 1.5 = 33.3% margin, and a 100% markup is a 50% margin. To go the other way, divide the margin by 1 minus the margin: a 20% margin is 0.2 ÷ 0.8 = 25% markup.',
    },
    {
      q: 'What is a good profit margin?',
      a: 'It varies widely by industry. Grocery and fuel retailers work on thin gross margins, while software and luxury goods run very high ones. Compare your margin with businesses selling similar products, and look at net margin after all expenses, not just gross margin, before judging whether prices are right.',
    },
  ],
  ogSample: (r, fmt) => `Margin ${fmt.pct(o(r, 'result'), 2)}`,
};
