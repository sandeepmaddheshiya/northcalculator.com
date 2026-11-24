import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'n') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Sample Size Calculator',
  promise: 'How many responses you need for a given margin of error and confidence.',
  title: 'Sample Size Calculator for Surveys, Polls and Averages',
  description:
    'Work out how large a sample you need to estimate a percentage or a mean within a chosen margin of error at 90%, 95%, 99% or any confidence level.',
  summary:
    'The sample size needed depends on how precise you want to be and how confident. For a percentage, n = z² × p(1 − p) ÷ E², using p = 50% when you have no estimate, which gives the safest, largest answer. For a mean, n = (zσ ÷ E)². Always round up: a 95% survey with a ±5% margin needs 385 responses.',
  synonyms: [
    'survey sample size calculator',
    'how many people to survey',
    'poll sample size',
    'sample size formula',
    'minimum sample size',
    'margin of error sample size',
  ],
  ui: {
    type: 'Estimating a',
    'type.proportion': 'Percentage',
    'type.mean': 'Mean',
    margin: 'Margin of error',
    'margin.proportion': 'Margin of error (± percentage points)',
    'margin.mean': 'Margin of error (± units)',
    'margin.help': 'Half the width of the interval you want.',
    p: 'Expected percentage (%)',
    'p.help': 'Use 50 if you have no idea; it gives the largest sample.',
    sd: 'Standard deviation (σ)',
    level: 'Confidence level (%)',
    'out.n': 'Sample size needed',
    'out.exact': 'Before rounding up',
    'out.z': 'Critical value z',
    'explain.proportion':
      'A sample of {n} gives a margin of ±{e} percentage points at {level}% confidence.',
    'explain.mean': 'A sample of {n} estimates the mean within ±{e} at {level}% confidence.',
    'step.z': 'Two-sided critical value for the confidence level.',
    'step.proportion': 'n = z² × p(1 − p) ÷ E².',
    'step.mean': 'n = (z × σ ÷ E)².',
    'step.ceil': 'Round up to a whole number.',
    'warn.level': 'The confidence level must be between 0 and 100%.',
    'warn.margin': 'The margin of error must be greater than zero.',
    rounding:
      'The critical value is computed to about 15 digits (1.959964 for 95%, not 1.96), and the sample size is always rounded up.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Percentage">{'n = z² × p(1 − p) ÷ E²'}</Formula>
      <Formula label="Mean">{'n = (z × σ ÷ E)²'}</Formula>
      <p>
        E is the margin of error and z the critical value: 1.645 for 90%, 1.960 for 95% and 2.576
        for 99%. Halving the margin quadruples the sample. These formulas assume a random sample
        from a population much larger than the sample; they are the ones in OpenStax{' '}
        <em>Introductory Statistics</em> and the NIST/SEMATECH handbook.
      </p>
    </>
  ),
  examples: [
    {
      id: 'poll',
      title: 'A poll within ±3 points at 90% confidence',
      body: (r, fmt) => (
        <p>
          1.645² × 0.25 ÷ 0.03² = {fmt.sig(o(r, 'exact'), 6)}, so survey{' '}
          <strong>{fmt.num(o(r), 0)} people</strong>, as in OpenStax Example 8.14.
        </p>
      ),
    },
    {
      id: 'mean',
      title: 'A mean within ±2 when σ = 15, at 95%',
      body: (r, fmt) => (
        <p>
          (1.96 × 15 ÷ 2)² = {fmt.sig(o(r, 'exact'), 6)}, so <strong>{fmt.num(o(r), 0)}</strong>{' '}
          observations (Example 8.7).
        </p>
      ),
    },
    {
      id: 'survey',
      title: 'A survey within ±5 points at 95%',
      body: (r, fmt) => (
        <p>
          1.96² × 0.25 ÷ 0.05² = {fmt.sig(o(r, 'exact'), 6)}, so <strong>{fmt.num(o(r), 0)}</strong>{' '}
          responses.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Plan for non-response.</strong> If you expect 1 in 4 people to reply, invite four
        times the sample size.
      </li>
      <li>
        <strong>Subgroups need their own samples.</strong> A ±5 point margin overall becomes much
        wider for a subgroup that is only a fifth of the sample.
      </li>
      <li>
        <strong>Bias isn’t fixed by size.</strong> A large self-selected sample can be further off
        than a small random one.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How many people do I need to survey?',
      a: 'For a ±5 point margin at 95% confidence, about 385; for ±3 points, about 1,068; for ±1 point, about 9,604. These assume a random sample and p = 50%. Smaller margins cost much more because the sample grows with the square of 1 ÷ margin.',
    },
    {
      q: 'Why use 50% when I don’t know the proportion?',
      a: 'p(1 − p) is largest at p = 0.5, so 50% gives the biggest, safest sample. If earlier data suggest 10% or 90%, p(1 − p) is 0.09 instead of 0.25 and you need only about a third as many responses.',
    },
    {
      q: 'Does population size matter?',
      a: 'Hardly, as long as the sample is a small part of the population. The same 385 responses give ±5 points whether you survey a city or a country. When the sample is a large fraction of a small population, a finite population correction lowers the number needed.',
    },
    {
      q: 'What if I don’t know the standard deviation?',
      a: 'Use an estimate from a small pilot study or from earlier research on a similar group. After collecting the data, use the sample standard deviation and a t interval to report the actual margin.',
    },
  ],
  ogSample: (r, fmt) => `±3 points at 90% → ${fmt.num(o(r), 0)} people`,
};
