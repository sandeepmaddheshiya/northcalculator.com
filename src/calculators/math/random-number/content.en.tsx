import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k: string) => String(r.outputs[k]);

export const content: CalculatorContent = {
  name: 'Random Number Generator',
  promise: 'Random whole numbers in any range, with or without repeats.',
  title: 'Random Number Generator: Pick Numbers in Any Range',
  description:
    'Generate one or many random whole numbers between any two values, with or without repeats, sorted if you like, and see the chance of that exact result.',
  summary:
    'The generator picks whole numbers between a minimum and a maximum, with every value equally likely. Choose how many numbers you want and whether repeats are allowed, which is how raffle and lottery draws work. Each press of the button draws again from a fresh random seed, and the page link keeps the seed, so anyone opening it sees the same numbers.',
  synonyms: [
    'RNG',
    'random number picker',
    'pick a random number',
    'number generator 1 to 100',
    'random draw generator',
    'lottery number generator',
  ],
  ui: {
    range: 'Range',
    min: 'From',
    max: 'To',
    count: 'How many numbers',
    unique: 'No repeats',
    'unique.help': 'Each number can be drawn only once, like names from a hat.',
    sorted: 'Sort the results',
    seed: 'Seed',
    reroll: 'Generate',
    'out.result': 'Your numbers',
    'out.possible': 'Possible values',
    'out.chance': 'Chance of exactly this result',
    'out.sum': 'Sum',
    'explain.one': 'A whole number from {lo} to {hi}, each value equally likely.',
    'explain.many': '{n} whole numbers from {lo} to {hi}, drawn independently (repeats allowed).',
    'explain.unique': '{n} different whole numbers from {lo} to {hi}, drawn without repeats.',
    'step.uniform':
      'Each draw picks one of {n} values with equal probability, rejecting raw outputs that would favour some values.',
    'warn.swapped': 'The minimum was larger than the maximum, so they were swapped.',
    'warn.range': 'The range is too wide. Keep it to at most 4,294,967,296 values.',
    'warn.tooMany':
      'Without repeats you can only draw {n} numbers from this range, so that is how many are shown.',
    rounding:
      'Whole numbers only. Draws use the xoshiro128** generator seeded from your browser’s cryptographic random source.',
  },
  HowItWorks: () => (
    <>
      <p>
        When you press the button, your browser’s cryptographic random source (the Web Cryptography
        API’s getRandomValues) produces a 128-bit seed. A fast, well-tested pseudo-random generator,
        xoshiro128**, turns the seed into a stream of 32-bit numbers. The implementation is checked
        against the authors’ published test values.
      </p>
      <Formula label="Uniform draw from N values">
        {
          'N = max − min + 1\nkeep raw values below ⌊2³² ÷ N⌋ × N, reject the rest\nresult = min + (raw mod N)'
        }
      </Formula>
      <p>
        Taking a raw number modulo N alone would make small values slightly more likely whenever 2³²
        is not a multiple of N. Rejecting the few raw values above the last full block removes that
        bias, so each value has probability exactly 1/N.
      </p>
      <p>
        <strong>No repeats</strong> draws without replacement by shuffling the range, so every set
        of numbers is equally likely. The chance of one exact sorted set of k numbers from N is 1 in
        C(N, k).
      </p>
    </>
  ),
  examples: [
    {
      id: 'one',
      title: 'Pick a number from 1 to 100',
      body: (r) => (
        <p>
          With one number from 1 to 100 there are {o(r, 'possible')} equally likely results, so any
          particular number comes up with a chance of <strong>{o(r, 'chance')}</strong>. Press
          Generate again for an independent draw.
        </p>
      ),
    },
    {
      id: 'lottery',
      title: 'Six different numbers from 1 to 49',
      body: (r) => (
        <p>
          Turn on No repeats and Sort, and ask for 6 numbers from 1 to 49, the format of several
          national lotteries. The chance of any one exact set is <strong>{o(r, 'chance')}</strong>,
          the number of ways to choose 6 from 49.
        </p>
      ),
    },
    {
      id: 'coin',
      title: 'Ten coin tosses',
      body: (r) => (
        <p>
          Use 0 for tails and 1 for heads, and draw 10 numbers with repeats. Each toss has{' '}
          {o(r, 'possible')} outcomes, so any particular sequence of ten has a chance of{' '}
          <strong>{o(r, 'chance')}</strong>.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Fine for games, classrooms and giveaways.</strong> Every value is equally likely and
        results can’t be predicted without the seed.
      </li>
      <li>
        <strong>Not for passwords or keys.</strong> Use a password manager or your operating
        system’s key generator for security; this tool is designed to make draws shareable and
        repeatable.
      </li>
      <li>
        <strong>Official draws have their own rules.</strong> Regulated lotteries and prize draws
        must use their approved process. Use this to practise or to settle informal choices.
      </li>
      <li>
        <strong>Share a draw.</strong> The page address includes the seed, so sending the link lets
        others check exactly the numbers you got.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'Is this random number generator truly random?',
      a: 'The seed comes from your browser’s cryptographic random source, and the numbers come from a pseudo-random generator, which is deterministic once seeded. For everyday draws the result is unpredictable and every value is equally likely. For security uses such as passwords, use a dedicated cryptographic tool instead.',
    },
    {
      q: 'How do I pick random numbers without repeats?',
      a: 'Turn on No repeats. The generator then draws without replacement, like taking numbered balls out of a bag, so no number appears twice. You can draw at most as many numbers as there are values in the range.',
    },
    {
      q: 'What are the odds of a lottery like 6 from 49?',
      a: 'There are C(49, 6) = 13,983,816 different sets of six numbers, and each is equally likely, so one ticket has a 1 in 13,983,816 chance of matching all six. The calculator shows this figure whenever you choose numbers without repeats and sort them.',
    },
    {
      q: 'Why does the same link show the same numbers?',
      a: 'The random seed is stored in the page address. Opening the link recreates the same sequence, which lets you share a draw and lets others confirm it. Press Generate to draw new numbers with a new seed.',
    },
  ],
  ogSample: () => 'Random numbers in any range',
};
