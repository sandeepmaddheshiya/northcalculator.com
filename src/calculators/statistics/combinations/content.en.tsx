import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'nCr') => String(r.outputs[k]);

export const content: CalculatorContent = {
  name: 'Permutation and Combination Calculator',
  promise: 'Count the ways to choose or arrange r items from n, exactly.',
  title: 'Permutation and Combination Calculator: nPr and nCr',
  description:
    'Find nCr and nPr for any n and r, plus counts with repetition and n factorial, worked exactly with whole-number arithmetic and shown step by step.',
  summary:
    'A combination counts the ways to choose r items from n when order does not matter, such as a committee or a poker hand. A permutation counts the arrangements when order matters, such as first, second and third place. nPr = n!/(n − r)!, and nCr divides that by r factorial, because each group of r can be ordered in r factorial ways.',
  synonyms: [
    'nCr calculator',
    'nPr calculator',
    'combination calculator',
    'permutation calculator',
    'n choose r',
    'binomial coefficient calculator',
  ],
  ui: {
    n: 'Total items (n)',
    'n.help': 'Whole number up to 1,000.',
    r: 'Items chosen (r)',
    'r.help': 'Cannot be more than n.',
    'out.nCr': 'Combinations, nCr',
    'out.nPr': 'Permutations, nPr',
    'out.repPerm': 'Ordered, with repetition (nʳ)',
    'out.repComb': 'Unordered, with repetition',
    'out.nFact': 'n factorial (n!)',
    explain: 'There are {c} ways to choose {r} from {n}, and {p} ways to arrange them in order.',
    'step.perm': 'Permutations: multiply r factors counting down from n.',
    'step.comb': 'Combinations: divide by r!, the number of orders of each group.',
    'warn.rn': 'r cannot be larger than n when items are not repeated.',
    rounding:
      'Exact whole numbers. Results longer than 21 digits are shown in scientific notation to 7 significant digits.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Without repetition">{'nPr = n!/(n − r)!\nnCr = n!/(r!(n − r)!)'}</Formula>
      <Formula label="With repetition">{'ordered: nʳ\nunordered: (n + r − 1)Cr'}</Formula>
      <p>
        n factorial, written n!, means n × (n − 1) × … × 1, and 0! is 1. The calculator multiplies
        the factors with whole-number arithmetic, so even 1000C500 is exact. OpenStax{' '}
        <em>Contemporary Mathematics</em> prints 38C5 as 501,492 in Example 7.10; the correct value
        is 501,942.
      </p>
    </>
  ),
  examples: [
    {
      id: 'committee',
      title: 'A committee of 3 from 8 people',
      body: (r) => (
        <p>
          8C3 = 8! ÷ (3! × 5!) = <strong>{o(r)}</strong> committees. If the three roles differ
          (chair, secretary, treasurer), order matters: 8P3 = 8 × 7 × 6 = {o(r, 'nPr')}.
        </p>
      ),
    },
    {
      id: 'poker',
      title: 'Two cards from a 52-card deck',
      body: (r) => (
        <p>
          There are <strong>{o(r)}</strong> two-card hands, and {o(r, 'nPr')} ordered deals, since
          each hand can be dealt in 2 orders.
        </p>
      ),
    },
    {
      id: 'lottery',
      title: 'A lottery that draws 5 numbers from 38',
      body: (r) => (
        <p>
          38C5 = <strong>{o(r)}</strong>, so one ticket has a 1 in {o(r)} chance of matching all
          five numbers.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Does order matter?</strong> Rankings, passwords and seating plans are permutations.
        Teams, hands of cards and pizza toppings are combinations.
      </li>
      <li>
        <strong>Can an item be used twice?</strong> A PIN can repeat digits, so a 4-digit PIN has
        10⁴ = 10,000 options. Choosing 3 scoops from 5 flavours, repeats allowed, gives 7C3 = 35.
      </li>
      <li>
        <strong>nCr is symmetric:</strong> choosing 3 people to go is the same as choosing 5 to
        stay, so 8C3 = 8C5.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'What is the difference between a permutation and a combination?',
      a: 'A permutation counts ordered arrangements and a combination counts unordered groups. Picking a gold, silver and bronze winner from 8 runners gives 336 permutations. Picking any 3 of the 8 to advance gives 56 combinations, because each group of 3 can be ordered 6 ways.',
    },
    {
      q: 'What does n choose r mean?',
      a: 'It is another name for nCr, the number of ways to choose r items from n without caring about order. It is also called the binomial coefficient, because it gives the coefficients when you expand (a + b)ⁿ. For example, 5 choose 2 is 10.',
    },
    {
      q: 'Why is 0! equal to 1?',
      a: 'There is exactly one way to arrange nothing: do nothing. Defining 0! as 1 also keeps the formulas working, so nCn and nC0 both come out as 1, matching the single way to take everything or nothing.',
    },
    {
      q: 'How many combinations does a 4-digit lock have?',
      a: 'A lock with digits 0 to 9 on each of 4 wheels has 10⁴ = 10,000 settings, because order matters and digits can repeat. Strictly that is a permutation with repetition. If no digit could repeat, it would be 10P4 = 5,040.',
    },
  ],
  ogSample: (r) => `8C3 = ${o(r)}`,
};
