import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const out = (r: { outputs: Record<string, unknown> }) => String(r.outputs.result);

export const content: CalculatorContent = {
  name: 'LCM and GCF Calculator',
  promise: 'Least common multiple and greatest common factor of two or more whole numbers.',
  title: 'LCM and GCF Calculator: Least Common Multiple and GCF',
  description:
    'Find the least common multiple (LCM) and greatest common factor (GCF, also called GCD or HCF) of up to 50 whole numbers, with prime factorizations shown.',
  summary:
    'The greatest common factor (GCF) is the largest whole number that divides every number in a list. The least common multiple (LCM) is the smallest number that every number in the list divides into. Write each number as a product of primes: the GCF uses each shared prime at its lowest power, and the LCM uses every prime at its highest power.',
  synonyms: [
    'LCM calculator',
    'GCF calculator',
    'GCD calculator',
    'HCF calculator',
    'least common multiple calculator',
    'greatest common divisor',
    'highest common factor',
  ],
  ui: {
    find: 'Find the',
    'find.gcf': 'Greatest common factor',
    'find.lcm': 'Least common multiple',
    numbers: 'Whole numbers',
    'numbers.help':
      'Two or more whole numbers from 1 to 1,000,000,000,000, separated by commas or spaces.',
    'out.result.gcf': 'Greatest common factor (GCF)',
    'out.result.lcm': 'Least common multiple (LCM)',
    'out.gcf': 'GCF',
    'out.lcm': 'LCM',
    'explain.gcf': '{r} is the largest number that divides each of {list} exactly.',
    'explain.lcm': '{r} is the smallest number that each of {list} divides into exactly.',
    'step.factor': 'Write each number as a product of primes.',
    'step.gcf': 'GCF: take each prime that appears in every number, at its lowest power.',
    'step.lcm': 'LCM: take every prime that appears, at its highest power.',
    'step.identity': 'Check: for two numbers, LCM = a × b ÷ GCF.',
    'warn.ignored': 'Left out {n} entries that are not whole numbers from 1 to 10¹²: {list}.',
    'warn.many': 'Only the first {n} numbers are used.',
    'warn.two': 'Enter at least two whole numbers.',
    'warn.coprime':
      'These numbers share no prime factor, so their GCF is 1. Numbers like this are called relatively prime (coprime).',
    rounding:
      'No rounding: whole-number arithmetic is exact, and the LCM is computed with arbitrary-precision integers however large it gets.',
  },
  HowItWorks: () => (
    <>
      <p>
        Every whole number above 1 can be written as a product of primes in exactly one way, for
        example 120 = 2³ × 3 × 5. Once you have the factorizations, both answers follow directly.
      </p>
      <Formula label="From prime factorizations">
        {
          'GCF = product of shared primes, each at its lowest power\nLCM = product of all primes, each at its highest power'
        }
      </Formula>
      <p>
        For 54 = 2 × 3³ and 36 = 2² × 3², the shared primes are 2 and 3. Their lowest powers are 2¹
        and 3², so the GCF is 2 × 9 = 18. The highest powers are 2² and 3³, so the LCM is 4 × 27 =
        108.
      </p>
      <p>
        For large numbers, factoring is slow, so the calculator finds the GCF with Euclid’s
        algorithm: replace the larger number with the remainder after dividing by the smaller, and
        repeat until the remainder is 0.
      </p>
      <Formula label="Euclid’s algorithm and the LCM identity">
        {'gcd(a, b) = gcd(b, a mod b),   gcd(a, 0) = a\nlcm(a, b) = a × b ÷ gcd(a, b)'}
      </Formula>
      <p>
        With three or more numbers, the calculator applies these pairwise: gcd(a, b, c) = gcd(gcd(a,
        b), c), and the same for the LCM.
      </p>
    </>
  ),
  examples: [
    {
      id: 'gcf',
      title: 'The GCF of 54 and 36',
      body: (r) => (
        <p>
          54 = 2 × 3³ and 36 = 2² × 3². Both contain 2 and 3. Taking the lower power of each gives 2
          × 3² = <strong>{out(r)}</strong>. This is Example 7.1 in OpenStax Elementary Algebra.
          Euclid’s algorithm agrees: 54 mod 36 = 18, and 36 mod 18 = 0.
        </p>
      ),
    },
    {
      id: 'lcm',
      title: 'The LCM of 15 and 18',
      body: (r) => (
        <p>
          15 = 3 × 5 and 18 = 2 × 3². The LCM needs 2, 3² and 5: 2 × 9 × 5 ={' '}
          <strong>{out(r)}</strong>. As a check, 15 × 18 = 270, and 270 ÷ GCF 3 = 90.
        </p>
      ),
    },
    {
      id: 'buses',
      title: 'When three bus routes next leave together',
      body: (r) => (
        <p>
          Buses leave a station every 12, 20 and 30 minutes, all at 8:00. They leave together again
          after the LCM of 12, 20 and 30 minutes. 12 = 2² × 3, 20 = 2² × 5 and 30 = 2 × 3 × 5, so
          the LCM is 2² × 3 × 5 = <strong>{out(r)}</strong> minutes, at 9:00.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Adding fractions uses the LCM.</strong> The least common denominator of 5/12 and
        7/18 is the LCM of 12 and 18, which is 36. Using it keeps the numbers small: 15/36 + 14/36 =
        29/36.
      </li>
      <li>
        <strong>Simplifying fractions uses the GCF.</strong> Divide the top and bottom by their GCF
        to reduce in one step: GCF(36, 54) = 18, so 36/54 = 2/3.
      </li>
      <li>
        <strong>GCF, GCD and HCF are the same thing.</strong> US schools say greatest common factor,
        mathematicians say greatest common divisor, and UK and Indian textbooks say highest common
        factor.
      </li>
      <li>
        <strong>
          The GCF can never exceed the smallest number, and the LCM is never below the largest.
        </strong>{' '}
        If an answer breaks either rule, a number was mistyped.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'What is the difference between LCM and GCF?',
      a: 'The GCF is the largest number that divides into all of your numbers, so it is at most the smallest of them. The LCM is the smallest number that all of yours divide into, so it is at least the largest. For 12 and 18, the GCF is 6 and the LCM is 36.',
    },
    {
      q: 'How do you find the LCM of three numbers?',
      a: 'Factor each into primes and multiply every prime at the highest power it appears. For 12, 20 and 30, the primes are 2² (from 12 and 20), 3 and 5, so the LCM is 4 × 3 × 5 = 60. Alternatively, find the LCM of the first two and then the LCM of that result with the third.',
    },
    {
      q: 'Is GCD the same as GCF or HCF?',
      a: 'Yes. Greatest common divisor, greatest common factor and highest common factor are three names for the same number. Which one you see depends on the country and the level of the course, but the calculation is identical.',
    },
    {
      q: 'What does it mean if the GCF is 1?',
      a: 'The numbers share no prime factor, so they are called relatively prime or coprime. 8 and 15 are an example, even though neither is prime. For two coprime numbers, the LCM is simply their product, here 120.',
    },
    {
      q: 'Why is LCM times GCF equal to the product of two numbers?',
      a: 'For each prime, the GCF takes the smaller of the two exponents and the LCM takes the larger. Together they use both exponents exactly once, just like multiplying the numbers. So 12 × 18 = 216 = 6 × 36. This only holds for two numbers, not three or more.',
    },
  ],
  ogSample: (r) => `GCF(54, 36) = ${out(r)}`,
};
