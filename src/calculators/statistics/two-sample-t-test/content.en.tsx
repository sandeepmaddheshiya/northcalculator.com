import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'p') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Two-Sample t-Test Calculator',
  promise: 'Compare two group means: Welch or pooled t-test with p-value and decision.',
  title: 'Two-Sample t-Test Calculator: Welch and Pooled p-Values',
  description:
    'Compare the means of two independent groups from their sizes, means and standard deviations: Welch or pooled t statistic, degrees of freedom and p-value.',
  summary:
    'A two-sample t-test asks whether two independent groups have different population means. It divides the difference between the sample means by its standard error and reads a p-value from the t distribution. Welch’s version, the default, does not assume equal variances; the pooled version does, and uses n₁ + n₂ − 2 degrees of freedom.',
  synonyms: [
    'independent samples t-test calculator',
    "Welch's t-test calculator",
    'pooled t-test calculator',
    'compare two means calculator',
    'difference between two means test',
    'two sample t test p-value',
  ],
  ui: {
    g1Row: 'Group 1',
    g2Row: 'Group 2',
    n1: 'Size n₁',
    m1: 'Mean x̄₁',
    s1: 'SD s₁',
    n2: 'Size n₂',
    m2: 'Mean x̄₂',
    s2: 'SD s₂',
    tail: 'Alternative hypothesis',
    'tail.two': 'μ₁ ≠ μ₂ (two-tailed)',
    'tail.right': 'μ₁ > μ₂ (right-tailed)',
    'tail.left': 'μ₁ < μ₂ (left-tailed)',
    alpha: 'Significance level (α)',
    'alpha.10': '0.10',
    'alpha.05': '0.05',
    'alpha.01': '0.01',
    method: 'Variances',
    'method.welch': 'Unequal (Welch)',
    'method.pooled': 'Equal (pooled)',
    'method.help': 'Welch is safer unless you have good reason to assume equal variances.',
    'out.p': 'p-value',
    'out.decision': 'Decision',
    'out.t': 't statistic',
    'out.df': 'Degrees of freedom',
    'out.critical': 'Critical value',
    'out.diff': 'Difference in means (x̄₁ − x̄₂)',
    'out.se': 'Standard error of the difference',
    'out.sp': 'Pooled standard deviation',
    'decision.reject': 'Reject H₀',
    'decision.keep': 'Do not reject H₀',
    'explain.reject': 'p = {p} is below α = {a}: the data support μ₁ {sym} μ₂.',
    'explain.keep': 'p = {p} is not below α = {a}: not enough evidence that μ₁ {sym} μ₂.',
    'step.se': 'Welch standard error = √(s₁²/n₁ + s₂²/n₂).',
    'step.pooled': 'Pooled SD from both samples, then SE = sp √(1/n₁ + 1/n₂).',
    'step.t': 't = (x̄₁ − x̄₂) ÷ SE.',
    'step.dfWelch': 'Welch–Satterthwaite degrees of freedom (usually not a whole number).',
    'step.dfPooled': 'Pooled degrees of freedom = n₁ + n₂ − 2.',
    'step.p.two': 'Two-tailed p-value; reject H₀ when p < α.',
    'step.p.right': 'Right-tailed p-value; reject H₀ when p < α.',
    'step.p.left': 'Left-tailed p-value; reject H₀ when p < α.',
    'warn.n': 'Each group needs a whole-number size of at least 2.',
    'warn.sd': 'Standard deviations must be above zero.',
    'warn.unequal':
      'One standard deviation is more than twice the other, so the equal-variance assumption is doubtful. Consider Welch.',
    rounding: 'Results keep 12 significant digits; p-values are shown to 6 significant figures.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Welch (unequal variances)">
        {
          't = (x̄₁ − x̄₂) ÷ √(s₁²/n₁ + s₂²/n₂)\ndf = (a + b)² ÷ (a²/(n₁−1) + b²/(n₂−1)),  a = s₁²/n₁, b = s₂²/n₂'
        }
      </Formula>
      <Formula label="Pooled (equal variances)">
        {
          'sp² = ((n₁−1)s₁² + (n₂−1)s₂²) ÷ (n₁ + n₂ − 2)\nt = (x̄₁ − x̄₂) ÷ (sp √(1/n₁ + 1/n₂)),  df = n₁ + n₂ − 2'
        }
      </Formula>
      <p>
        The groups must be independent: different people, items or runs. For paired data, such as
        the same people before and after, take the differences and use the one-sample t-test on them
        against 0.
      </p>
    </>
  ),
  examples: [
    {
      id: 'sports',
      title: 'Hours of sport a day: 9 girls (2, s 0.866) vs 16 boys (3.2, s 1.00)',
      body: (r, fmt) => (
        <p>
          The Welch t is {fmt.sig(o(r, 't'), 3)} on about {fmt.sig(o(r, 'df'), 4)} degrees of
          freedom, giving p = <strong>{fmt.sig(o(r), 2)}</strong>: a significant difference at 5%,
          as in OpenStax <em>Introductory Statistics</em> Example 10.1.
        </p>
      ),
    },
    {
      id: 'colleges',
      title: 'Class sizes at two colleges, right-tailed at 1%',
      body: (r, fmt) => (
        <p>
          College A (11 classes, mean 4, s 1.5) vs college B (9, mean 3.5, s 1) gives p ={' '}
          <strong>{fmt.sig(o(r), 4)}</strong>, far above 0.01, so there is not enough evidence that
          A’s mean is larger (Example 10.2).
        </p>
      ),
    },
    {
      id: 'mpg',
      title: 'NIST fuel economy: 249 US cars vs 79 Japanese cars, pooled',
      body: (r, fmt) => (
        <p>
          With a pooled SD of {fmt.sig(o(r, 'sp'), 6)}, T = {fmt.sig(o(r, 't'), 7)} on{' '}
          {fmt.int(o(r, 'df'))} degrees of freedom, far past the critical value{' '}
          {fmt.sig(o(r, 'critical'), 5)}: the means differ, p = <strong>{fmt.sig(o(r), 3)}</strong>.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Welch or pooled?</strong> Welch works whether or not the variances are equal and
        loses little when they are. Pooled is slightly more powerful only when they truly match.
      </li>
      <li>
        <strong>Small samples</strong> assume each population is roughly normal. With 30 or more per
        group the test is robust to moderate skew.
      </li>
      <li>
        <strong>Report the difference too:</strong> x̄₁ − x̄₂ and its confidence interval show how big
        the effect is, which a p-value alone does not.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do I do a two-sample t-test?',
      a: 'Subtract the means, divide by the standard error √(s₁²/n₁ + s₂²/n₂), and find the p-value from the t distribution with the Welch degrees of freedom. For 9 girls averaging 2 hours and 16 boys averaging 3.2, t ≈ −3.14 on 18.8 degrees of freedom, p ≈ 0.0054.',
    },
    {
      q: 'What is the difference between Welch’s and Student’s t-test?',
      a: 'Student’s (pooled) test assumes both populations have the same variance and combines the two sample variances. Welch’s test estimates them separately and adjusts the degrees of freedom. Welch is the safer default; many statisticians recommend it always.',
    },
    {
      q: 'Why are the degrees of freedom not a whole number?',
      a: 'The Welch–Satterthwaite formula approximates the distribution of the t statistic when variances differ, and that approximation gives a fractional df. It always lies between the smaller of n₁ − 1 and n₂ − 1 and n₁ + n₂ − 2.',
    },
    {
      q: 'Can I use this for before-and-after data?',
      a: 'No. Measurements on the same subjects are paired, not independent. Compute each subject’s difference and run a one-sample t-test of those differences against 0, which is usually far more sensitive.',
    },
  ],
  ogSample: (r, fmt) => `x̄ 2 vs 3.2 (n 9 and 16) → p = ${fmt.sig(o(r), 2)}`,
};
