import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';
import { BODY_UI } from '../energy';

const o = (r: { outputs: Record<string, unknown> }, k = 'bmr') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'BMR Calculator',
  promise: 'How many calories your body uses at complete rest, from two published equations.',
  title: 'BMR Calculator: Basal Metabolic Rate (Mifflin–St Jeor)',
  description:
    'Estimate your basal metabolic rate, the calories your body burns at rest, with the Mifflin–St Jeor equation or the Schofield equations used by FAO and WHO.',
  summary:
    'Basal metabolic rate (BMR) is the energy your body uses at complete rest: breathing, circulation, temperature and cell repair. FAO, WHO and UNU put typical daily energy use at 1.4 to 2.4 times BMR, so BMR is roughly 40–70% of the total. BMR is estimated from weight, height, age and sex with equations fitted to measurements, so it is an average, not a measurement of you.',
  synonyms: [
    'basal metabolic rate calculator',
    'resting metabolic rate calculator',
    'RMR calculator',
    'Mifflin St Jeor calculator',
    'how many calories do I burn at rest',
    'metabolism calculator',
  ],
  ui: {
    ...BODY_UI,
    equation: 'Equation',
    'equation.mifflin': 'Mifflin–St Jeor (1990)',
    'equation.schofield': 'Schofield / FAO–WHO (weight only)',
    'equation.help':
      'Mifflin–St Jeor uses height, weight, age and sex. The Schofield equations, adopted by FAO, WHO and UNU, use weight, sex and age band only.',
    'out.bmr': 'BMR (kcal per day)',
    'out.kj': 'BMR (kJ per day)',
    'out.perHour': 'kcal per hour at rest',
    'out.other.mifflin': 'Schofield estimate (kcal per day)',
    'out.other.schofield': 'Mifflin–St Jeor estimate (kcal per day)',
    explain:
      'Your estimated basal metabolic rate is about {bmr} kcal a day ({eq}). This is energy used at complete rest, before any activity.',
    'step.mifflinMale':
      'Mifflin–St Jeor for men: 10 × weight (kg) + 6.25 × height (cm) − 5 × age + 5.',
    'step.mifflinFemale':
      'Mifflin–St Jeor for women: 10 × weight (kg) + 6.25 × height (cm) − 5 × age − 161.',
    'step.schofield': 'Schofield equation for your sex and age band, from body weight.',
    'warn.ageRange':
      'Mifflin–St Jeor was fitted to adults aged 19 to 78, so the estimate is less certain outside that range.',
    'warn.low':
      'This estimate is unusually low. Check the height and weight, and speak to a health professional about energy needs at this body size.',
    rounding:
      'Calculated without intermediate rounding and rounded to the nearest whole kcal; 1 kcal = 4.184 kJ.',
  },
  HowItWorks: () => (
    <>
      <p>
        The Mifflin–St Jeor equation was derived in 1990 from 498 healthy adults whose resting
        energy expenditure was measured by indirect calorimetry. The authors published a version
        separated by sex:
      </p>
      <Formula
        label="Mifflin–St Jeor (kcal/day)"
        where={[
          { symbol: 'W', meaning: 'weight in kg' },
          { symbol: 'H', meaning: 'height in cm' },
          { symbol: 'A', meaning: 'age in years' },
        ]}
      >
        {'men:   10 W + 6.25 H − 5 A + 5\nwomen: 10 W + 6.25 H − 5 A − 161'}
      </Formula>
      <p>
        The same paper found that the older Harris–Benedict equations overestimated measured resting
        energy by about 5% in its subjects, which is why Mifflin–St Jeor is the default here.
      </p>
      <p>
        The FAO/WHO/UNU expert consultation on human energy requirements uses the Schofield
        equations, which need only body weight, sex and age band. For adults they are:
      </p>
      <Formula label="Schofield (kcal/day, weight W in kg)">
        {
          '          18–29 y           30–59 y          60+ y\nmen       15.057 W + 692.2  11.472 W + 873.1  11.711 W + 587.7\nwomen     14.818 W + 486.6   8.126 W + 845.6   9.082 W + 658.5'
        }
      </Formula>
      <p>
        Both are averages. Two people with the same numbers can differ by a few hundred kcal a day,
        mainly because of differences in muscle mass.
      </p>
    </>
  ),
  examples: [
    {
      id: 'woman',
      title: 'A woman, 35, 165 cm and 62 kg',
      body: (r, fmt) => (
        <p>
          10 × 62 + 6.25 × 165 − 5 × 35 − 161 = 620 + 1,031.25 − 175 − 161 = 1,315.25, so her
          estimated BMR is <strong>{fmt.int(o(r))} kcal a day</strong>, about{' '}
          {fmt.num(o(r, 'perHour'), 1)} kcal an hour. The Schofield equation gives{' '}
          {fmt.int(o(r, 'other'))} kcal for the same woman.
        </p>
      ),
    },
    {
      id: 'man',
      title: 'A man, 45, 5 ft 10 in and 185 lb',
      body: (r, fmt) => (
        <p>
          In metric units he is 177.8 cm and 83.9 kg. Mifflin–St Jeor gives 10 × 83.91 + 6.25 ×
          177.8 − 5 × 45 + 5 = <strong>{fmt.int(o(r))} kcal a day</strong>, or {fmt.int(o(r, 'kj'))}{' '}
          kJ.
        </p>
      ),
    },
    {
      id: 'fao',
      title: 'The FAO example: a 55 kg woman in her forties',
      body: (r, fmt) => (
        <p>
          FAO/WHO/UNU illustrate energy needs with a group of women aged 30 to 50 weighing 55 kg,
          with a mean BMR of about 1,290 kcal. The Schofield equation for women aged 30 to 59 gives
          8.126 × 55 + 845.6 = 1,292.5, which rounds to <strong>{fmt.int(o(r))} kcal</strong>. The
          report rounds its figure to 5.40 MJ.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>BMR is not your daily calorie need.</strong> It leaves out all movement, digestion
        and exercise. Multiply it by your physical activity level to estimate total needs; the
        calorie calculator does this.
      </li>
      <li>
        <strong>Body composition matters.</strong> Roza and Shizgal showed resting energy use is
        related to body cell mass, which the equations only approximate from weight and height.
        People with more or less lean tissue than average will differ from the estimate.
      </li>
      <li>
        <strong>Healthy adults only.</strong> The equations were fitted to healthy adults. Roza and
        Shizgal found predictions unreliable in malnourished patients, and pregnancy and growth have
        their own requirements in the FAO/WHO/UNU report.
      </li>
      <li>
        <strong>Ask a professional before big changes.</strong> If you are planning a diet, a
        registered dietitian or doctor can account for your health and history, which no equation
        can.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'What is a normal BMR?',
      a: 'There is no single normal value, because BMR scales with body size. Mifflin–St Jeor gives about 1,315 kcal a day for a 35-year-old woman of 165 cm and 62 kg, and about 1,730 kcal for a 45-year-old man of 178 cm and 84 kg. Larger and younger people have higher estimates.',
    },
    {
      q: 'What is the difference between BMR and RMR?',
      a: 'Basal metabolic rate is measured under strict conditions: after a night’s sleep, fasting and fully at rest. Resting metabolic rate or resting energy expenditure is measured under looser conditions and is usually slightly higher. The Mifflin–St Jeor equation actually predicts resting energy expenditure, but the two are close and often used interchangeably.',
    },
    {
      q: 'Which BMR equation is most accurate?',
      a: 'No single equation fits everyone. Mifflin–St Jeor was fitted to measurements of 498 adults and found the older Harris–Benedict equations to overestimate by about 5%. The Schofield equations are the basis of FAO and WHO energy requirements. Expect any equation to be off by a few hundred kcal for an individual.',
    },
    {
      q: 'Does BMR decrease with age?',
      a: 'Yes, gradually. In Mifflin–St Jeor each extra year lowers the estimate by 5 kcal a day, so ten years make a 50 kcal difference for the same height and weight. Roza and Shizgal found resting energy use tracks body cell mass, so part of the change with age reflects changes in lean tissue.',
    },
  ],
  ogSample: (r, fmt) => `BMR ${fmt.int(o(r))} kcal/day`,
};
