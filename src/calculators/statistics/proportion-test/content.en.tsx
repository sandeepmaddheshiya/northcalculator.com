import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'p') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'One-Proportion z-Test Calculator',
  promise: 'Test a claimed percentage against your sample: z score, p-value and decision.',
  title: 'One-Proportion z-Test Calculator: p-Value for a Percentage',
  description:
    'Test whether a sample proportion differs from a claimed percentage: enter successes, sample size and the claim to get the z statistic, p-value and decision.',
  summary:
    'A one-proportion z-test checks a claim such as “25% of fleas are killed” against a sample. It compares the sample proportion p̂ = x ÷ n with the claimed p₀, measured in standard errors √(p₀(1 − p₀) ÷ n). A small p-value means the sample would be unusual if the claim were true. The test needs at least 5 expected successes and failures.',
  synonyms: [
    'hypothesis test for a proportion',
    'one sample proportion test',
    'z test for proportions',
    'percentage hypothesis test',
    'proportion p-value calculator',
    'binomial proportion z-test',
  ],
  ui: {
    x: 'Successes (x)',
    n: 'Sample size (n)',
    p0: 'Claimed proportion (p₀)',
    'p0.help': 'The percentage stated by the null hypothesis, H₀: p = p₀.',
    tail: 'Alternative hypothesis',
    'tail.two': 'p ≠ p₀ (two-tailed)',
    'tail.right': 'p > p₀ (right-tailed)',
    'tail.left': 'p < p₀ (left-tailed)',
    alpha: 'Significance level (α)',
    'alpha.10': '0.10',
    'alpha.05': '0.05',
    'alpha.01': '0.01',
    'alpha.005': '0.005',
    'out.p': 'p-value',
    'out.decision': 'Decision',
    'out.z': 'z statistic',
    'out.pHat': 'Sample proportion p̂ (%)',
    'out.critical': 'Critical z',
    'out.se': 'Standard error under H₀ (%)',
    'decision.reject': 'Reject H₀',
    'decision.keep': 'Do not reject H₀',
    'explain.reject': 'p = {p} is below α = {a}: the data support p {sym} {p0}%.',
    'explain.keep': 'p = {p} is not below α = {a}: not enough evidence that p {sym} {p0}%.',
    'step.phat': 'Sample proportion p̂ = x ÷ n.',
    'step.se': 'Standard error from the claim: √(p₀(1 − p₀) ÷ n).',
    'step.z': 'z = (p̂ − p₀) ÷ standard error.',
    'step.p.two': 'Two-tailed p-value: twice the normal area beyond |z|.',
    'step.p.right': 'Right-tailed p-value: the normal area above z.',
    'step.p.left': 'Left-tailed p-value: the normal area below z.',
    'warn.n': 'The sample size must be a whole number of at least 1.',
    'warn.x': 'Successes must be a whole number between 0 and n.',
    'warn.p0': 'The claimed proportion must be between 0% and 100%, not equal to either.',
    'warn.small':
      'n × p₀ or n × (1 − p₀) is below 5, so the normal approximation is unreliable; an exact binomial test is better.',
    rounding: 'p-values come from the normal distribution, accurate to about 15 digits.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Test statistic">{'p̂ = x ÷ n\nz = (p̂ − p₀) ÷ √(p₀(1 − p₀) ÷ n)'}</Formula>
      <p>
        The standard error uses the claimed p₀, not the sample p̂, because the test asks how unusual
        the sample would be if the claim were true. This is the form in both OpenStax and the NIST
        e-Handbook.
      </p>
      <p>
        The p-value is the normal-curve area beyond z: one tail for a directional claim, both tails
        for “different from”. Reject the claim when the p-value is below your significance level.
      </p>
    </>
  ),
  examples: [
    {
      id: 'shampoo',
      title: 'A flea shampoo killed 17 of 42 fleas; is that more than 25%?',
      body: (r, fmt) => (
        <p>
          p̂ = 40.5%, z = {fmt.sig(o(r, 'z'), 5)}, p = <strong>{fmt.sig(o(r), 3)}</strong>. That is
          above α = 0.01, so the evidence is not strong enough, as in OpenStax{' '}
          <em>Introductory Statistics</em> Example 9.19.
        </p>
      ),
    },
    {
      id: 'wafers',
      title: '26 defective wafers out of 200 against a historical 10%',
      body: (r, fmt) => (
        <p>
          z = {fmt.sig(o(r, 'z'), 4)} is below the critical {fmt.sig(o(r, 'critical'), 4)}, so the
          new process cannot be called worse at the 5% level (p ={' '}
          <strong>{fmt.sig(o(r), 3)}</strong>), as in the NIST e-Handbook example.
        </p>
      ),
    },
    {
      id: 'brides',
      title: '53 of 100 first-time brides younger than their grooms; different from 50%?',
      body: (r, fmt) => (
        <p>
          z = 0.6 and p = <strong>{fmt.sig(o(r), 4)}</strong>: no evidence the proportion differs
          from half (Example 9.17).
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Check the sample size:</strong> with p₀ = 10%, you need at least 50 observations so
        that n × p₀ ≥ 5, as the NIST e-Handbook notes.
      </li>
      <li>
        <strong>Rare events need huge samples:</strong> testing a rate of 0.034% took over 400,000
        people in OpenStax Example 9.21.
      </li>
      <li>
        <strong>Estimate as well as test:</strong> a confidence interval for the proportion shows
        the range of plausible values, which a single p-value does not.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do I test a claimed percentage?',
      a: 'Compute p̂ = x ÷ n, then z = (p̂ − p₀) ÷ √(p₀(1 − p₀)/n), and find the normal-curve p-value. For 17 of 42 against 25%, p̂ = 0.405, z = 2.32 and the right-tailed p-value is 0.0103.',
    },
    {
      q: 'Why does the standard error use p₀ instead of p̂?',
      a: 'The test assumes the null hypothesis is true and asks how far the sample is from it in that world, so the spread is the one implied by p₀. Confidence intervals, which make no claim, use p̂ instead.',
    },
    {
      q: 'When is the z-test for a proportion not valid?',
      a: 'When the expected number of successes or failures, n × p₀ or n × (1 − p₀), is below 5, the normal approximation is poor. Use an exact binomial test then, or collect a larger sample.',
    },
    {
      q: 'What is the difference between one- and two-tailed tests?',
      a: 'A one-tailed test checks a direction, such as “more than 25%”, and puts all of α in one tail. A two-tailed test checks “different from” and splits α between both tails, doubling the p-value for the same z.',
    },
  ],
  ogSample: (r, fmt) => `17 of 42 vs 25% → p = ${fmt.sig(o(r), 3)}`,
};
