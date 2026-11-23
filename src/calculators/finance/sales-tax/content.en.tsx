import type { CalculatorContent } from '@/calculators/content-types';
import { currencyUi } from '@/calculators/currencies';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k: string) => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Sales Tax Calculator',
  promise: 'Add or remove sales tax, VAT or GST, or find the rate from two prices.',
  title: 'Sales Tax Calculator: Add or Remove Tax, VAT and GST',
  description:
    'Add sales tax, VAT or GST to a price, take it out of a tax-inclusive price, or find the rate from the prices before and after tax.',
  summary:
    'Sales tax, VAT and GST are a percentage of the price before tax. To add it, multiply the price by the rate and add the result: 8.25% on $428.99 is $35.39, for $464.38. To remove it from a price that includes tax, divide by 1 plus the rate. Subtracting the percentage from the total gives the wrong answer.',
  synonyms: [
    'VAT calculator',
    'GST calculator',
    'reverse sales tax calculator',
    'tax inclusive calculator',
    'remove VAT',
    'add VAT',
    'sales tax rate calculator',
  ],
  ui: {
    mode: 'What do you want to work out?',
    'mode.add': 'Add tax to a price',
    'mode.remove': 'Remove tax from a price that includes it',
    'mode.rate': 'Find the tax rate from two prices',
    amount: 'Amount',
    'amount.add': 'Price before tax',
    'amount.remove': 'Price including tax',
    'amount.rate': 'Price before tax',
    rate: 'Tax rate (sales tax, VAT or GST)',
    gross: 'Price including tax',
    currency: 'Currency',
    ...currencyUi('en'),
    'out.result': 'Result',
    'out.tax': 'Tax',
    'out.net': 'Price before tax',
    'out.total': 'Price including tax',
    'explain.add': 'Tax is {tax}, so you pay {total}.',
    'explain.remove': 'The price before tax is {net}, and {tax} of what you paid is tax.',
    'explain.rate': 'The tax rate is {r}.',
    'step.tax': 'Tax: the price times the rate, rounded to the cent.',
    'step.total': 'Total: the price plus the tax.',
    'step.divide': 'Price before tax: the total divided by (1 + rate).',
    'step.taxIncluded': 'Tax included in the price: total minus the price before tax.',
    'step.taxPaid': 'Tax paid: the total minus the price before tax.',
    'step.rate': 'Rate: the tax as a percentage of the price before tax.',
    'warn.zeroNet': 'The price before tax can’t be zero when finding a rate.',
    'warn.grossLower':
      'The price including tax is lower than the price before tax. Check the two amounts.',
    rounding:
      'Tax is rounded half-up to the smallest currency unit, as most tills do for a single item. Rates are shown to three decimal places.',
  },
  HowItWorks: () => (
    <>
      <Formula
        label="Sales tax, VAT and GST"
        where={[
          { symbol: 'P', meaning: 'price before tax' },
          { symbol: 'T', meaning: 'price including tax' },
          { symbol: 'r', meaning: 'tax rate as a decimal (8.25% = 0.0825)' },
        ]}
      >
        {'tax = P × r          T = P + tax\nP   = T ÷ (1 + r)    tax = T − P\nr   = (T − P) ÷ P'}
      </Formula>
      <p>
        All three taxes work the same way at the till: a percentage of the price before tax. The
        differences lie in what is taxed and who collects it, not in the arithmetic.
      </p>
      <h3>Removing tax from a tax-inclusive price</h3>
      <p>
        UK and EU shelf prices include VAT, and Indian prices often include GST. The tax is a
        percentage of the price before tax, so take it out by dividing by 1 + r. HMRC describes this
        as the VAT fraction: at 20%, the VAT is 20/120, or one sixth, of the price including VAT.
        Taking 20% off £120 gives £96, which is wrong. The correct price before VAT is £100.
      </p>
    </>
  ),
  examples: [
    {
      id: 'add',
      title: '8.25% sales tax on a $428.99 purchase',
      body: (r, fmt) => (
        <p>
          428.99 × 0.0825 = 35.39 to the cent, so the tax is{' '}
          <strong>{fmt.money(o(r, 'tax'))}</strong> and you pay {fmt.money(o(r, 'total'))}. This is
          OpenStax’s worked example for Kankakee, Illinois, where the book gives the rate as 8.25%.
        </p>
      ),
    },
    {
      id: 'vat',
      title: 'Taking 20% VAT out of £120',
      body: (r, fmt) => (
        <p>
          Divide by 1.20: 120 ÷ 1.2 = <strong>{fmt.money(o(r, 'net'))}</strong> before VAT, so the
          VAT is {fmt.money(o(r, 'tax'))}, exactly one sixth of the total.
        </p>
      ),
    },
    {
      id: 'rate',
      title: 'Which rate turns $329.50 into $354.21?',
      body: (r, fmt) => (
        <p>
          The tax paid is 354.21 − 329.50 = <strong>{fmt.money(o(r, 'tax'))}</strong>, and 24.71 ÷
          329.50 = 0.07499, so the rate is {fmt.pct(o(r, 'result'), 2)}, which is 7.5% once the cent
          rounding is allowed for.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>US rates combine state and local taxes.</strong> The rate you pay is the state rate
        plus any county, city or district rates, and it can differ between neighbouring towns. Check
        your state revenue department for the rate at your address.
      </li>
      <li>
        <strong>Rates differ by product.</strong> Many places tax groceries, medicine or children’s
        clothing at a lower rate or not at all. India has several GST slabs, and the UK has
        standard, reduced and zero VAT rates. Use the rate that applies to the item.
      </li>
      <li>
        <strong>Receipts may differ by a cent.</strong> Shops that total several items before taxing
        them, or that round each line, can differ slightly from one calculation on the total.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do I calculate sales tax?',
      a: 'Multiply the price before tax by the tax rate as a decimal, then add the result to the price. At 8.81% on a $499 TV, the tax is 499 × 0.0881 = $43.96 and the total is $542.96.',
    },
    {
      q: 'How do I remove VAT or GST from a price?',
      a: 'Divide the price including tax by 1 plus the rate. With 20% VAT, divide by 1.2: £120 becomes £100 before VAT. With 18% GST, divide by 1.18: ₹1,180 becomes ₹1,000. Subtracting the percentage from the total gives too small an answer.',
    },
    {
      q: 'How do I find the sales tax rate from a receipt?',
      a: 'Subtract the pre-tax total from the amount paid to get the tax, then divide by the pre-tax total. Tax of $24.71 on $329.50 is 24.71 ÷ 329.50 = 0.075, so the rate is 7.5%. Choose “Find the tax rate from two prices” to do this.',
    },
    {
      q: 'What is the difference between sales tax, VAT and GST?',
      a: 'US sales tax is charged once, at the final sale. VAT and GST are charged at each stage of production, with businesses reclaiming the tax they paid, and are usually included in shelf prices. For a shopper, all three are a percentage of the pre-tax price.',
    },
  ],
  ogSample: (r, fmt) => `${fmt.money(428.99)} + tax = ${fmt.money(o(r, 'total'))}`,
};
