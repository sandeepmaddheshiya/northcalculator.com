import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'factors') => String(r.outputs[k]);

export const content: CalculatorContent = {
  name: 'Prime Factorization Calculator',
  promise: 'Break a whole number into primes, check if it is prime, and list its divisors.',
  title: 'Prime Factorization Calculator: Prime Factors and Divisors',
  description:
    'Find the prime factorization of any whole number up to a trillion, in exponent and expanded form, check whether it is prime, and count and list its divisors.',
  summary:
    'Every whole number above 1 is either prime, with exactly two factors (1 and itself), or a product of primes in exactly one way apart from order. 84 = 2 × 2 × 3 × 7, or 2² × 3 × 7 in exponent form. To test a number, it is enough to try dividing by primes up to its square root: if none divides it, it is prime.',
  synonyms: [
    'prime factors calculator',
    'is it prime calculator',
    'factor tree calculator',
    'prime number checker',
    'divisors calculator',
    'number of factors',
  ],
  ui: {
    n: 'Whole number',
    'n.help': 'From 1 to 1,000,000,000,000.',
    'out.factors': 'Prime factorization',
    'out.expanded': 'Expanded',
    'out.kind': 'Type',
    'out.divisorCount': 'Number of divisors',
    'out.divisors': 'Divisors',
    'kind.prime': 'Prime',
    'kind.composite': 'Composite',
    'kind.one': 'Neither prime nor composite',
    'divisors.many': 'More than 120 divisors',
    'explain.prime': '{n} is prime: its only divisors are 1 and itself.',
    'explain.composite': '{n} = {f}, with {c} divisors in all.',
    'explain.one': '1 is neither prime nor composite.',
    'step.trial': 'Try dividing by primes up to the square root.',
    'step.result': 'Every factor left is prime.',
    'warn.range': 'Enter a whole number from 1 to 1,000,000,000,000.',
    rounding: 'Exact whole-number arithmetic.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Prime factorization">
        {'n = p₁^a × p₂^b × p₃^c × …\ndivisors = (a + 1)(b + 1)(c + 1)…'}
      </Formula>
      <p>
        The calculator divides by 2, then by odd numbers, up to √n, the same test OpenStax{' '}
        <em>Contemporary Mathematics</em> uses: 2,917 has no prime factor up to √2,917 ≈ 54, so it
        is prime. The number of divisors comes from the exponents: 84 = 2² × 3 × 7 has 3 × 2 × 2 =
        12.
      </p>
    </>
  ),
  examples: [
    {
      id: 'eightyFour',
      title: 'The prime factors of 84',
      body: (r) => (
        <p>
          84 = {o(r, 'expanded')} = <strong>{o(r)}</strong>, as in OpenStax <em>Prealgebra</em>{' '}
          Example 2.49, with {o(r, 'divisorCount')} divisors.
        </p>
      ),
    },
    {
      id: 'big',
      title: 'The prime factors of 10,241',
      body: (r) => (
        <p>
          10,241 = <strong>{o(r)}</strong>, three different primes, as in OpenStax{' '}
          <em>Contemporary Mathematics</em> Example 3.14.
        </p>
      ),
    },
    {
      id: 'prime',
      title: 'Is 2,917 prime?',
      body: (r) => (
        <p>
          No prime up to 54 divides it, so 2,917 is <strong>{o(r, 'kind').toLowerCase()}</strong>{' '}
          (Example 3.10).
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Quick checks:</strong> even numbers divide by 2, digit sums divisible by 3 mean the
        number is too, and a last digit of 0 or 5 means 5 divides it.
      </li>
      <li>
        <strong>GCF and LCM</strong> come straight from the factorizations: shared primes at their
        lowest powers give the GCF, all primes at their highest powers the LCM.
      </li>
      <li>
        <strong>1 is not prime</strong>, and 2 is the only even prime.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do I find the prime factorization of a number?',
      a: 'Divide by the smallest prime that goes in, and repeat with the quotient until you reach 1. For 120: 120 ÷ 2 = 60, ÷ 2 = 30, ÷ 2 = 15, ÷ 3 = 5, ÷ 5 = 1, so 120 = 2³ × 3 × 5, as OpenStax shows with its ladder method.',
    },
    {
      q: 'How can I tell if a number is prime?',
      a: 'Try dividing it by each prime up to its square root. If none divides it evenly, the number is prime. For 2,117, √2,117 ≈ 46, and 29 divides it: 2,117 = 29 × 73, so it is composite.',
    },
    {
      q: 'How many divisors does a number have?',
      a: 'Add 1 to each exponent in the prime factorization and multiply. 1,400 = 2³ × 5² × 7 has (3 + 1)(2 + 1)(1 + 1) = 24 divisors, while a prime always has exactly 2.',
    },
    {
      q: 'Why is 1 not a prime number?',
      a: 'A prime has exactly two different factors, 1 and itself, and 1 has only one. Leaving 1 out also keeps prime factorizations unique; otherwise 6 could be written as 2 × 3, 1 × 2 × 3, 1 × 1 × 2 × 3 and so on.',
    },
  ],
  ogSample: (r) => `84 = ${o(r)}`,
};
