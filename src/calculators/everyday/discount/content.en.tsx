import type { CalculatorContent } from '@/calculators/content-types';
import { currencyUi } from '@/calculators/currencies';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k: string) => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Discount Calculator',
  promise: 'Sale price and savings for any percent off, stacked discounts, or the original price.',
  title: 'Discount Calculator: Sale Price, Percent Off, Original',
  description:
    'Find the sale price and your savings at any percent off, combine two discounts correctly, or work back to the percent off or original price.',
  summary:
    'A discount of d percent takes d hundredths off the price, so the sale price is the original multiplied by (1 − d ÷ 100): 30% off $80 is $56. A second discount applies to the reduced price, so 25% off and then 20% off is 40% in total, not 45%. To find the original price, divide the sale price by (1 − d ÷ 100).',
  synonyms: [
    'percent off calculator',
    'sale price calculator',
    'savings calculator',
    'price after discount',
    'original price calculator',
    'double discount calculator',
  ],
  ui: {
    mode: 'What do you want to work out?',
    'mode.sale': 'Sale price from a percent off',
    'mode.percent': 'Percent off from two prices',
    'mode.original': 'Original price before a discount',
    'price.sale': 'Original price',
    'price.percent': 'Original price',
    'price.original': 'Sale price',
    price: 'Price',
    off: 'Discount (% off)',
    salePrice: 'Sale price',
    extra: 'Extra discount (% off the sale price)',
    'extra.help': 'For “an extra 20% off sale items”. It applies after the first discount.',
    currency: 'Currency',
    ...currencyUi('en'),
    'out.result': 'Result',
    'out.saved': 'You save',
    'out.combined': 'Combined discount',
    'explain.sale': 'You pay {s} and save {saved}.',
    'explain.percent': 'That’s {p} off, a saving of {saved}.',
    'explain.markup': 'The new price is higher: a {p} increase of {saved}.',
    'explain.original': 'Before {off} off, the price was {o}.',
    'step.discount': 'Discount: the original price times the percentage.',
    'step.sale': 'Sale price: the original minus the discount.',
    'step.extra': 'Extra discount on the reduced price.',
    'step.combined': 'The combined discount is one minus the product of what each discount leaves.',
    'step.saved': 'Amount saved: original minus sale price.',
    'step.percent': 'Percent off: the saving as a share of the original price.',
    'step.factor': 'Share of the price left after the discount.',
    'step.divide': 'Original price: the sale price divided by that share.',
    'warn.zeroPrice': 'The original price can’t be zero when working out a percentage.',
    'warn.higher':
      'The second price is higher than the first, so this is a price increase, not a discount.',
    'warn.full': 'At 100% off the sale price is zero, so the original price can’t be recovered.',
    rounding:
      'Prices are rounded half-up to the smallest currency unit at each step shown. Percentages are not rounded until they are displayed, to 2 decimal places.',
  },
  HowItWorks: () => (
    <>
      <Formula
        label="Discount formulas"
        where={[
          { symbol: 'P', meaning: 'original price' },
          { symbol: 'S', meaning: 'sale price' },
          { symbol: 'd', meaning: 'discount as a decimal (30% = 0.30)' },
        ]}
      >
        {'S = P × (1 − d)\nd = (P − S) ÷ P\nP = S ÷ (1 − d)'}
      </Formula>
      <p>
        These are the formulas OpenStax’s Contemporary Mathematics uses for discounts. The second
        line gives the percent off from two prices. The third recovers the original price from a
        sale price, which is not the same as adding the percentage back on.
      </p>
      <h3>Two discounts in a row</h3>
      <p>
        When a store offers an extra discount on sale items, the second percentage applies to the
        already-reduced price. The total discount is 1 − (1 − d₁)(1 − d₂). For 25% and then 20%,
        that is 1 − 0.75 × 0.80 = 0.40, so 40%, not 45%.
      </p>
    </>
  ),
  examples: [
    {
      id: 'shirt',
      title: 'A $80 shirt at 30% off',
      body: (r, fmt) => (
        <p>
          The discount is 80 × 0.30 = {fmt.money(o(r, 'saved'))}, so the sale price is{' '}
          <strong>{fmt.money(o(r, 'result'))}</strong>. Multiplying by 0.70 directly gives the same
          answer in one step.
        </p>
      ),
    },
    {
      id: 'stacked',
      title: '25% off, then an extra 20% off',
      body: (r, fmt) => (
        <p>
          A $120 jacket is 25% off, so it costs $90. The extra 20% comes off $90, not $120, leaving{' '}
          <strong>{fmt.money(o(r, 'result'))}</strong>. The total saving is{' '}
          {fmt.money(o(r, 'saved'))}, a combined discount of {fmt.pct(o(r, 'combined'), 0)}, less
          than the 45% the two numbers suggest.
        </p>
      ),
    },
    {
      id: 'tires',
      title: 'The price before a 10% discount',
      body: (r, fmt) => (
        <p>
          Two tires cost $189 after a 10% discount. The sale price is 90% of the original, so the
          original was 189 ÷ 0.90 = <strong>{fmt.money(o(r, 'result'))}</strong>. Adding 10% to $189
          would give $207.90, which is wrong, because the discount was 10% of the higher price.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Compare offers on the final price.</strong> “Buy one, get one 50% off” on two equal
        items is 25% off overall. Work out what you pay in total, not the headline percentage.
      </li>
      <li>
        <strong>Check whether tax is applied before or after the discount.</strong> Sales tax is
        normally charged on the discounted price. Use the sales tax calculator on the sale price for
        the amount you will pay.
      </li>
      <li>
        <strong>A coupon for a fixed amount works differently.</strong> $10 off a $40 item is 25%
        off, but $10 off a $100 item is only 10%. Enter both prices in “Percent off from two prices”
        to compare.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do I calculate a discount?',
      a: 'Multiply the original price by the discount as a decimal to get the amount off, then subtract it. For 30% off $80, the discount is $24 and the sale price $56. Or multiply by 1 minus the discount: $80 × 0.70 = $56.',
    },
    {
      q: 'Is 20% off plus an extra 20% off the same as 40% off?',
      a: 'No. The second 20% applies to the reduced price. After 20% off, you pay 80%, and 20% off that leaves 80% of 80%, which is 64%. That is a 36% discount in total, not 40%.',
    },
    {
      q: 'How do I find the original price from a sale price?',
      a: 'Divide the sale price by 1 minus the discount. If a jacket costs $63 after 30% off, the original price was $63 ÷ 0.70 = $90. Adding 30% to $63 would give $81.90, which is wrong.',
    },
    {
      q: 'How do I work out what percent off something is?',
      a: 'Subtract the sale price from the original price, divide by the original price and multiply by 100. A $240 bus pass sold to students for $168 is (240 − 168) ÷ 240 = 0.30, so 30% off.',
    },
  ],
  ogSample: (r, fmt) => `30% off $80 = ${fmt.money(o(r, 'result'))}`,
};
