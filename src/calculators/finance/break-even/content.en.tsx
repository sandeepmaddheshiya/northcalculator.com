import type { CalculatorContent } from '@/calculators/content-types';
import { currencyUi } from '@/calculators/currencies';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'units') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Break-Even Calculator',
  promise: 'How many units you must sell to cover your costs, or to hit a profit target.',
  title: 'Break-Even Calculator: Units and Sales to Cover Your Costs',
  description:
    'Find the break-even point in units and in sales from fixed costs, price and variable cost per unit, plus the sales needed to reach a target profit.',
  summary:
    'The break-even point is where total revenue equals total costs, so there is neither profit nor loss. Each unit sold contributes its price minus its variable cost toward the fixed costs; that amount is the contribution margin. Dividing fixed costs by the contribution margin per unit gives the units needed to break even, and adding a profit target finds the sales needed to earn it.',
  synonyms: [
    'break-even point calculator',
    'break-even analysis',
    'contribution margin calculator',
    'how many units to break even',
    'target profit calculator',
    'cost-volume-profit',
  ],
  ui: {
    currency: 'Currency',
    ...currencyUi('en'),
    fixed: 'Fixed costs (per period)',
    'fixed.help':
      'Costs that do not change with sales volume, such as rent, salaries and insurance.',
    price: 'Selling price per unit',
    variable: 'Variable cost per unit',
    'variable.help':
      'Costs that rise with each unit, such as materials, packaging and sales commission.',
    profit: 'Target profit (optional)',
    'profit.help':
      'The pre-tax profit you want for the period. Leave at 0 for the break-even point.',
    'out.units': 'Units to sell',
    'out.sales': 'Sales revenue needed',
    'out.cm': 'Contribution margin per unit',
    'out.cmRatio': 'Contribution margin ratio',
    'out.exact': 'Exact units (before rounding up)',
    explain: 'Selling {units} units, or {sales} of sales, covers all fixed and variable costs.',
    'explain.target':
      'Selling {units} units, or {sales} of sales, covers all costs and earns {profit} of profit.',
    'step.cm': 'Contribution margin per unit = price − variable cost.',
    'step.units':
      'Units = (fixed costs + target profit) ÷ contribution margin per unit, rounded up.',
    'step.ratio': 'Contribution margin ratio = margin ÷ price.',
    'step.sales': 'Sales needed = (fixed costs + target profit) ÷ contribution margin ratio.',
    'warn.noMargin':
      'The variable cost is not below the price, so each sale loses money and no volume of sales can break even.',
    'warn.roundUp': 'You can only sell whole units, so the number is rounded up to the next unit.',
    rounding:
      'Money is calculated in cents. Units are rounded up to a whole unit; sales revenue uses the exact ratio and is rounded to the cent.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Contribution margin">
        {'margin per unit = price − variable cost per unit\nmargin ratio = margin per unit ÷ price'}
      </Formula>
      <Formula label="Break-even and target profit">
        {
          'units = (fixed costs + target profit) ÷ margin per unit\nsales = (fixed costs + target profit) ÷ margin ratio'
        }
      </Formula>
      <p>
        OpenStax’s managerial accounting text uses Hicks Manufacturing’s birdbath: it sells for $100
        and costs $20 in variable costs, a margin of $80 (80%). With $18,000 of monthly fixed costs,
        Hicks breaks even at $18,000 ÷ $80 = 225 units, or $18,000 ÷ 0.80 = $22,500 of sales. It
        only makes a profit from the 226th unit.
      </p>
      <p>
        The model assumes a constant price and variable cost per unit and fixed costs that do not
        change within the range of sales you consider, the standard assumptions of
        cost-volume-profit analysis.
      </p>
    </>
  ),
  examples: [
    {
      id: 'hicks',
      title: 'Hicks Manufacturing’s birdbaths',
      body: (r, fmt) => (
        <p>
          $18,000 ÷ $80 = <strong>{fmt.int(o(r))} units</strong>, or {fmt.money(o(r, 'sales'))} of
          sales a month, matching OpenStax’s figures.
        </p>
      ),
    },
    {
      id: 'target',
      title: 'Units needed for a $40,000 profit',
      body: (r, fmt) => (
        <p>
          ($18,000 + $40,000) ÷ $80 = <strong>{fmt.int(o(r))} units</strong>, which is{' '}
          {fmt.money(o(r, 'sales'))} of sales. In the book this $40,000 pre-tax target equals
          $24,000 after a 40% tax rate.
        </p>
      ),
    },
    {
      id: 'service',
      title: 'A tax preparer charging $400 a return',
      body: (r, fmt) => (
        <p>
          Each return costs $150 in variable costs, so the margin is $250 and the ratio{' '}
          {fmt.pct(o(r, 'cmRatio'), 1)}. With $14,000 of fixed costs, the preparer breaks even at{' '}
          <strong>{fmt.int(o(r))} returns</strong>, or {fmt.money(o(r, 'sales'))}.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Separate fixed and variable costs carefully.</strong> A cost that rises with each
        unit is variable; one that stays the same each month is fixed. Mixed costs need splitting.
      </li>
      <li>
        <strong>Use one period throughout.</strong> Monthly fixed costs give a monthly break-even
        point; annual costs give an annual one.
      </li>
      <li>
        <strong>Test price changes.</strong> A higher price raises the margin and lowers the
        break-even point, but may reduce how many units you sell.
      </li>
      <li>
        <strong>Several products?</strong> Use a weighted average contribution margin based on your
        expected sales mix.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do I calculate a break-even point?',
      a: 'Subtract the variable cost per unit from the price to get the contribution margin, then divide fixed costs by it. With $12,000 of fixed costs, a $50 price and $30 of variable cost, the margin is $20 and the break-even point is 600 units, or $30,000 of sales.',
    },
    {
      q: 'What is a contribution margin?',
      a: 'It is the part of each sale left after variable costs, available to pay fixed costs and then provide profit. A product selling for $100 with $20 of variable cost has an $80 margin per unit, or an 80% contribution margin ratio.',
    },
    {
      q: 'How do I find the sales needed for a target profit?',
      a: 'Add the target profit to fixed costs before dividing by the contribution margin. To earn $10,000 on top of $12,000 of fixed costs with a $20 margin, you need ($12,000 + $10,000) ÷ $20 = 1,100 units.',
    },
    {
      q: 'Why is the break-even point rounded up?',
      a: 'You cannot sell part of a unit. If the exact answer is 562.5 units, selling 562 still leaves a small loss, so 563 units are needed to cover every cost. Sales revenue needed is shown exactly.',
    },
  ],
  ogSample: (r, fmt) => `Break even at ${fmt.int(o(r))} units`,
};
