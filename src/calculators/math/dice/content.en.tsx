import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';
import { SIDES } from './definition';

const o = (r: { outputs: Record<string, unknown> }, k: string) => String(r.outputs[k]);

export const content: CalculatorContent = {
  name: 'Dice Roller',
  promise: 'Roll any number of fair dice, from d4 to d100, with a modifier.',
  title: 'Dice Roller: Roll d4, d6, d8, d10, d12, d20 and d100 Online',
  description:
    'Roll up to 100 fair virtual dice with 4 to 100 sides, add a modifier, and see every roll, the total, the possible range and the average you should expect.',
  summary:
    'Each virtual die lands on any of its faces with equal probability, like a fair physical die. Choose how many dice and how many sides, using the usual notation where 2d6 means two six-sided dice, and add a modifier if your game needs one. The roller shows each die, the total, the lowest and highest possible totals and the long-run average.',
  synonyms: [
    'roll dice online',
    'virtual dice',
    'd20 roller',
    'random dice',
    'dice simulator',
    'RPG dice roller',
  ],
  ui: {
    roll: 'Dice',
    dice: 'Number of dice',
    sides: 'Sides',
    ...Object.fromEntries(SIDES.map((s) => [`sides.${s}`, `d${s}`])),
    modifier: 'Modifier',
    'modifier.help': 'Added to (or, if negative, subtracted from) the total, as in 1d20 + 5.',
    seed: 'Seed',
    reroll: 'Roll',
    'out.total': 'Total',
    'out.rolls': 'Each die',
    'out.range': 'Possible totals',
    'out.expected': 'Average total over many rolls',
    explain: 'You rolled {dice} for a total of {total}.',
    'step.rolls': 'Add the dice and the modifier.',
    'step.expected': 'A fair die with s sides averages (s + 1) ÷ 2.',
    rounding:
      'Whole-number rolls. Each die uses an unbiased draw from the xoshiro128** generator, seeded from your browser’s cryptographic random source.',
  },
  HowItWorks: () => (
    <>
      <p>
        On a fair die every face is equally likely. OpenStax <em>Introductory Statistics</em> uses
        the six-sided die as its example: each face from 1 to 6 has probability 1/6, so rolling at
        least five has probability 2/6.
      </p>
      <Formula label="One die with s sides">{'P(any face) = 1 ÷ s\naverage = (s + 1) ÷ 2'}</Formula>
      <Formula label="k dice plus a modifier m">
        {'lowest = k + m\nhighest = k × s + m\naverage = k × (s + 1) ÷ 2 + m'}
      </Formula>
      <p>
        Totals of several dice are not equally likely. With 2d6 there are 36 equally likely pairs,
        and 6 of them add up to 7, so 7 is the most common total (probability 6/36 = 1/6), while 2
        and 12 each need a single pair (1/36).
      </p>
      <p>
        The roller draws each die with rejection sampling from a well-tested pseudo-random
        generator, seeded from your browser’s cryptographic random source, so no face is favoured.
      </p>
    </>
  ),
  examples: [
    {
      id: 'two',
      title: 'Two six-sided dice (2d6)',
      body: (r) => (
        <p>
          Totals run from <strong>{o(r, 'range')}</strong>. The average total is {o(r, 'expected')},
          which is also the most likely single total: 6 of the 36 combinations make 7.
        </p>
      ),
    },
    {
      id: 'd20',
      title: 'A d20 with a +5 modifier',
      body: (r) => (
        <p>
          One twenty-sided die gives 1 to 20 with equal chance; adding 5 shifts the result to{' '}
          <strong>{o(r, 'range')}</strong>, with an average of {o(r, 'expected')}. Every total in
          that range is equally likely, unlike sums of several dice.
        </p>
      ),
    },
    {
      id: 'fireball',
      title: 'Eight six-sided dice (8d6)',
      body: (r) => (
        <p>
          Eight dice total between <strong>{o(r, 'range')}</strong>, averaging {o(r, 'expected')}.
          With many dice, results cluster tightly around the average and the extremes become very
          rare: all sixes has a chance of 1 in 1,679,616.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Dice notation.</strong> “3d8 + 2” means roll three eight-sided dice and add 2. Enter
        3, choose d8, and put 2 in the modifier under More options.
      </li>
      <li>
        <strong>Percentile dice.</strong> A d100 gives 1 to 100 directly, the same as rolling two
        d10 for tens and units.
      </li>
      <li>
        <strong>Share a roll.</strong> The page address stores the seed, so a shared link shows
        everyone the same result. Press Roll to make a new one.
      </li>
      <li>
        <strong>Streaks happen.</strong> Several high or low rolls in a row are normal with fair
        dice; each roll is independent of the ones before it.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'What is the most likely total with two dice?',
      a: 'Seven. Of the 36 equally likely ways two six-sided dice can land, six add up to 7 (1+6, 2+5, 3+4, 4+3, 5+2, 6+1), so the chance is 1 in 6. Totals of 2 and 12 are the least likely, at 1 in 36 each.',
    },
    {
      q: 'Is this dice roller fair?',
      a: 'Yes. Each die picks a face with equal probability using an unbiased method, and the starting seed comes from your browser’s cryptographic random source. Over many rolls each face of a d6 comes up about one sixth of the time, as a fair physical die would.',
    },
    {
      q: 'What does d20 mean?',
      a: 'It is a twenty-sided die, common in tabletop role-playing games. The number after d is the number of faces, so d4, d6, d8, d10, d12, d20 and d100 are dice with 4 to 100 sides. A number in front, like 2d20, says how many to roll.',
    },
    {
      q: 'What is the average roll of a die?',
      a: 'For a fair die with s sides, the average is (s + 1) ÷ 2: 3.5 for a d6, 10.5 for a d20 and 50.5 for a d100. For several dice, multiply by the number of dice and add any modifier.',
    },
  ],
  ogSample: () => 'Roll d4 to d100 online',
};
