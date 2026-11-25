import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'result') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Half-Life Calculator',
  promise: 'Amount left after radioactive decay, the time elapsed or the half-life.',
  title: 'Half-Life Calculator: Radioactive Decay and Carbon Dating',
  description:
    'Work out how much of a radioactive substance remains after a time, how long decay took (as in carbon dating), or the half-life itself, with the decay constant.',
  summary:
    'In one half-life, half of a radioactive sample decays, whatever its size. After two half-lives a quarter is left, after three an eighth: N = N₀ × (½)^(t ÷ t½). Run backwards, the fraction left gives the time, which is how carbon-14 dating works. The decay constant λ = ln 2 ÷ t½ is the fraction decaying per unit time.',
  synonyms: [
    'radioactive decay calculator',
    'carbon dating calculator',
    'exponential decay calculator',
    'decay constant calculator',
    'how much remains after half lives',
    'half life formula',
  ],
  ui: {
    find: 'Find',
    'find.remaining': 'Amount left',
    'find.time': 'Time elapsed',
    'find.halfLife': 'Half-life',
    initial: 'Starting amount (N₀)',
    remaining: 'Amount left (N)',
    time: 'Time elapsed (t)',
    halfLife: 'Half-life (t½)',
    'halfLife.help': 'Use the same time unit as the elapsed time, e.g. years for both.',
    'out.result': 'Amount left',
    'out.result.remaining': 'Amount left',
    'out.result.time': 'Time elapsed',
    'out.result.halfLife': 'Half-life',
    'out.percent': 'Fraction left',
    'out.halfLives': 'Number of half-lives',
    'out.lambda': 'Decay constant λ (per time unit)',
    explain: 'After {t} time units, {k} half-lives of {h}, {pct} of the sample is left.',
    'step.lambda': 'Decay constant λ = ln 2 ÷ half-life.',
    'step.remaining': 'N = N₀ × ½^(t ÷ t½).',
    'step.time': 't = −t½ × ln(N ÷ N₀) ÷ ln 2.',
    'step.halfLife': 't½ = −t × ln 2 ÷ ln(N ÷ N₀).',
    'warn.initial': 'The starting amount must be greater than zero.',
    'warn.remaining':
      'The amount left must be greater than zero and less than the starting amount.',
    'warn.halfLife': 'The half-life must be greater than zero.',
    'warn.time': 'The time must be greater than zero.',
    rounding:
      'Uses ln 2 exactly, not 0.693. Results keep 12 significant digits and are shown to 8.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Decay">{'N = N₀ × (½)^(t ÷ t½) = N₀ e^(−λt)\nλ = ln 2 ÷ t½'}</Formula>
      <Formula label="Solving for time">{'t = −t½ × ln(N ÷ N₀) ÷ ln 2'}</Formula>
      <p>
        N can be a mass, a number of atoms or an activity such as counts per minute, as long as N₀
        uses the same unit. OpenStax rounds λ (for example to 0.132 per year for cobalt-60), so its
        printed answers can differ from these in the last digit.
      </p>
    </>
  ),
  examples: [
    {
      id: 'cobalt',
      title: 'Cobalt-60 (t½ = 5.27 years) after 15 years',
      body: (r, fmt) => (
        <p>
          100 × ½^(15 ÷ 5.27) = <strong>{fmt.sig(o(r), 4)}%</strong> of the sample remains. OpenStax{' '}
          <em>Chemistry</em> Example 21.5 rounds λ to 0.132 y⁻¹ and gets 13.8%.
        </p>
      ),
    },
    {
      id: 'shroud',
      title: 'Carbon dating with 92% of the carbon-14 left',
      body: (r, fmt) => (
        <p>
          t = −5,730 × ln 0.92 ÷ ln 2 = <strong>{fmt.sig(o(r), 4)} years</strong>, the 690 years of
          OpenStax <em>College Physics</em> Example 31.4.
        </p>
      ),
    },
    {
      id: 'radon',
      title: 'Radon-222 (t½ = 3.823 days) decaying from 0.750 g to 0.100 g',
      body: (r, fmt) => (
        <p>
          t = −3.823 × ln(0.100 ÷ 0.750) ÷ ln 2 = <strong>{fmt.sig(o(r), 4)} days</strong>, matching
          the 11.1 days in OpenStax <em>Chemistry</em> §21.3.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Keep units consistent:</strong> if the half-life is in years, the time must be in
        years too.
      </li>
      <li>
        <strong>Ten half-lives</strong> leave less than 0.1%: (½)¹⁰ = 1/1,024. That limits carbon
        dating to about 50,000 years.
      </li>
      <li>
        <strong>Medicine and drugs</strong> often follow the same first-order decay, so the
        calculator also works for an elimination half-life.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'What is half-life?',
      a: 'The time for half of the radioactive atoms in a sample to decay. It is constant for each isotope: carbon-14’s is 5,730 years, iodine-131’s about 8 days. It does not depend on how much material there is, its temperature or its chemical form.',
    },
    {
      q: 'How do I calculate the amount left after a time?',
      a: 'Divide the time by the half-life to get the number of half-lives, then multiply the starting amount by ½ to that power. 80 g of a substance with a 10-day half-life has 80 × ½³ = 10 g left after 30 days.',
    },
    {
      q: 'How does carbon-14 dating work?',
      a: 'Living things keep a steady level of carbon-14; after death it decays with a 5,730-year half-life. Measuring the fraction left gives the time since death: half left means about 5,730 years, a quarter about 11,460 years.',
    },
    {
      q: 'What is the decay constant?',
      a: 'λ = ln 2 ÷ t½, about 0.693 ÷ t½. It is the fraction of nuclei decaying per unit of time when that fraction is small. Cobalt-60, with a 5.27-year half-life, has λ ≈ 0.1315 per year.',
    },
  ],
  ogSample: (r, fmt) => `Co-60 after 15 years → ${fmt.sig(o(r), 4)}% left`,
};
