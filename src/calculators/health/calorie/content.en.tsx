import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';
import { BODY_UI } from '../energy';

const o = (r: { outputs: Record<string, unknown> }, k = 'tdee') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Calorie Calculator',
  promise: 'Your estimated daily calorie needs from your body size and activity level.',
  title: 'Calorie Calculator: Daily Calorie Needs (TDEE) by Activity',
  description:
    'Estimate how many calories you use in a day, your total daily energy expenditure, from basal metabolic rate and physical activity level, following FAO/WHO/UNU.',
  summary:
    'Your daily energy need is your basal metabolic rate multiplied by your physical activity level (PAL), the average of your day expressed as a multiple of BMR. The FAO/WHO/UNU expert consultation groups adults into sedentary or light (PAL 1.40–1.69), active (1.70–1.99) and vigorous (2.00–2.40) lifestyles. The result is the intake that would keep your weight stable on average.',
  synonyms: [
    'TDEE calculator',
    'maintenance calorie calculator',
    'daily calorie calculator',
    'how many calories do I need',
    'total daily energy expenditure',
    'energy requirement calculator',
  ],
  ui: {
    ...BODY_UI,
    activity: 'Activity level',
    'activity.sedentary': 'Sedentary or light (office work, little exercise)',
    'activity.active': 'Active (on your feet at work, or exercise most days)',
    'activity.vigorous': 'Vigorous (heavy manual work or hard training)',
    'activity.custom': 'Enter my own PAL',
    'activity.help':
      'Based on the example days in the FAO/WHO/UNU report: PAL 1.53 for desk work with a little walking, 1.76 for standing work plus an hour of light exercise, 2.25 for heavy manual work.',
    pal: 'Physical activity level (PAL)',
    'pal.help':
      'Your 24-hour energy use as a multiple of BMR. Values from 1.40 to 2.40 can be kept up over the long term.',
    equation: 'BMR equation',
    'equation.mifflin': 'Mifflin–St Jeor (1990)',
    'equation.schofield': 'Schofield / FAO–WHO (weight only)',
    'out.tdee': 'Calories per day (kcal)',
    'out.range': 'Range for this activity class',
    'out.kj': 'Energy per day (kJ)',
    'out.bmr': 'BMR (kcal per day)',
    'out.pal': 'PAL used',
    explain:
      'At a PAL of {pal}, you use about {tdee} kcal a day: your BMR of {bmr} kcal plus the energy for everything you do.',
    'step.bmrMifflin': 'Estimate BMR with the Mifflin–St Jeor equation.',
    'step.bmrSchofield': 'Estimate BMR with the Schofield equation for your sex and age band.',
    'step.pal': 'Multiply BMR by the physical activity level.',
    'warn.highPal':
      'FAO/WHO/UNU note that PAL values above 2.40 are difficult to maintain over a long period.',
    'warn.lowPal':
      'A PAL below 1.40 is below the range FAO/WHO/UNU give for free-living adults, so check the value.',
    rounding:
      'Calculated without intermediate rounding and rounded to the nearest whole kcal; 1 kcal = 4.184 kJ.',
  },
  HowItWorks: () => (
    <>
      <p>
        The FAO/WHO/UNU expert consultation calculates adult energy requirements in two steps:
        estimate the basal metabolic rate, then multiply it by the physical activity level.
      </p>
      <Formula label="Daily energy requirement">{'energy (kcal/day) = BMR × PAL'}</Formula>
      <p>
        PAL is the day’s total energy use divided by BMR. Sleeping counts as 1.0 × BMR per hour,
        sitting at a desk about 1.5, walking about 3.2. Averaging over 24 hours gives the PAL: the
        report’s example office day works out at 36.7 ÷ 24 = 1.53.
      </p>
      <Formula label="Lifestyle classes (Table 5.3)">
        {
          'sedentary or light   1.40–1.69\nactive or moderate   1.70–1.99\nvigorous             2.00–2.40'
        }
      </Formula>
      <p>
        The report’s own example: a man with a BMR of 1,697 kcal and a PAL of 1.75 needs 1.75 ×
        1,697 ≈ 2,970 kcal a day. The calculator shows the full range for your class as well,
        because few people know their PAL precisely.
      </p>
    </>
  ),
  examples: [
    {
      id: 'office',
      title: 'An office worker: woman, 35, 165 cm, 62 kg',
      body: (r, fmt) => (
        <p>
          Her BMR by Mifflin–St Jeor is about 1,315 kcal. A desk job with some walking matches the
          sedentary example day, PAL 1.53, so she uses about{' '}
          <strong>{fmt.int(o(r))} kcal a day</strong>. Anywhere in the sedentary class gives{' '}
          {String(r.outputs.range)}.
        </p>
      ),
    },
    {
      id: 'fao',
      title: 'The FAO vigorous example: a 70 kg man aged 20–25',
      body: (r, fmt) => (
        <p>
          The report gives this group a BMR of about 1,745 kcal and a PAL of 2.25 for a day of farm
          work, and a requirement of 3,925 kcal. Using the Schofield equation exactly (1,746.2 kcal)
          gives <strong>{fmt.int(o(r))} kcal</strong>; the 4 kcal gap comes from the report rounding
          the BMR first.
        </p>
      ),
    },
    {
      id: 'active',
      title: 'An active man: 45, 5 ft 10 in, 185 lb',
      body: (r, fmt) => (
        <p>
          His BMR is about 1,730 kcal. Working on his feet plus regular exercise fits the active
          class, PAL 1.76, for about <strong>{fmt.int(o(r))} kcal a day</strong>, or{' '}
          {fmt.int(o(r, 'kj'))} kJ.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>It is an estimate for planning.</strong> Real needs vary between people with the
        same numbers. Track your weight over a few weeks: if it holds steady, your intake matches
        your needs.
      </li>
      <li>
        <strong>Be honest about activity.</strong> Exercise moves PAL less than people expect. The
        report rates low-intensity aerobic exercise at 4.2 × BMR, so swapping an hour of TV (1.4)
        for it raises the day’s PAL by only (4.2 − 1.4) ÷ 24 ≈ 0.12.
      </li>
      <li>
        <strong>Changing weight changes needs.</strong> A smaller body uses less energy, so
        recompute after any significant change in weight.
      </li>
      <li>
        <strong>Get advice for medical diets.</strong> Pregnancy, breastfeeding, illness, eating
        disorders and growing children all need specific guidance. A registered dietitian or doctor
        can help.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How many calories do I need a day?',
      a: 'Multiply your BMR by your physical activity level. A 35-year-old woman of 165 cm and 62 kg has a BMR near 1,315 kcal; with a desk job (PAL 1.53) she needs about 2,010 kcal, and with an active job (1.76) about 2,315 kcal. The calculator does this from your own measurements.',
    },
    {
      q: 'What is TDEE?',
      a: 'Total daily energy expenditure is all the energy you use in 24 hours: resting metabolism, digesting food, daily movement and exercise. Eating that many calories keeps your weight stable on average. FAO, WHO and UNU estimate it as BMR multiplied by the physical activity level.',
    },
    {
      q: 'Which activity level should I choose?',
      a: 'Pick the example day that is closest to yours. Desk work with a little walking is sedentary (PAL 1.53). Standing or walking work plus about an hour of light exercise is active (1.76). Several hours of heavy manual work is vigorous (2.25). If unsure, choose the lower level.',
    },
    {
      q: 'Why do different calculators give different calorie numbers?',
      a: 'They use different BMR equations and different activity multipliers. This one follows the FAO/WHO/UNU method with the Mifflin–St Jeor or Schofield equation. Differences of 100 to 300 kcal between calculators are normal, which is another reason to treat any figure as a starting estimate.',
    },
  ],
  ogSample: (r, fmt) => `${fmt.int(o(r))} kcal/day`,
};
