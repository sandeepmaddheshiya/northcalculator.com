import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k: string) => r.outputs[k];

export const content: CalculatorContent = {
  name: 'BMI Calculator',
  promise: 'Your body mass index, its WHO category, and the healthy weight range for your height.',
  title: 'BMI Calculator: Body Mass Index for Adults (kg or lb)',
  description:
    'Calculate your body mass index in metric or US units and see the WHO category and healthy weight range for your height, with optional Asian cut-offs.',
  summary:
    'Body mass index (BMI) is your weight in kilograms divided by the square of your height in metres. For adults aged 20 and over, the World Health Organization classes a BMI under 18.5 as underweight, 18.5 to 24.9 as a healthy weight, 25 to 29.9 as overweight and 30 or more as obesity. BMI is a screening measure for populations: it does not measure body fat or diagnose health.',
  synonyms: [
    'body mass index calculator',
    'BMI chart',
    'healthy weight calculator',
    'BMI calculator for women',
    'BMI calculator for men',
    'Asian BMI calculator',
    'ideal weight',
  ],
  ui: {
    system: 'Units',
    'system.metric': 'Metric (cm, kg)',
    'system.imperial': 'US (ft, in, lb)',
    cm: 'Height',
    kg: 'Weight',
    ft: 'Height (feet)',
    in: 'Height (inches)',
    lb: 'Weight',
    'unit.cm': 'cm',
    'unit.kg': 'kg',
    'unit.ft': 'ft',
    'unit.in': 'in',
    'unit.lb': 'lb',
    age: 'Age (years)',
    'age.help':
      'Adult categories apply from age 20. For younger people the calculator shows a warning instead.',
    cutoffs: 'Categories',
    'cutoffs.who': 'WHO international (all adults)',
    'cutoffs.asian': 'WHO action points for Asian populations',
    'cutoffs.help':
      'A 2004 WHO expert consultation found higher health risks at lower BMIs in many Asian populations.',
    'out.bmi': 'Your BMI',
    'out.category': 'Category',
    'out.range': 'Healthy weight range for your height',
    'out.change': 'Change to reach that range',
    'out.prime': 'BMI Prime (BMI ÷ 25)',
    'cat.under': 'Underweight',
    'cat.normal': 'Healthy weight',
    'cat.overweight': 'Overweight',
    'cat.obese1': 'Obesity class I',
    'cat.obese2': 'Obesity class II',
    'cat.obese3': 'Obesity class III',
    'cat.asianLow': 'Below the first Asian action point',
    'cat.asian23': 'At or above action point 23.0',
    'cat.asian275': 'At or above action point 27.5',
    'cat.asian325': 'At or above action point 32.5',
    'cat.asian375': 'At or above action point 37.5',
    explain: 'For your height, a healthy-weight BMI of 18.5 to 24.9 corresponds to {range}.',
    'explain.asian':
      'For your height, a BMI from 18.5 up to the first Asian action point (23.0) corresponds to {range}.',
    'step.meters': 'Convert height to metres.',
    'step.inches': 'Total height in inches.',
    'step.toMetric': 'Convert to metres and kilograms using the exact international definitions.',
    'step.bmi': 'Divide weight by height squared, and round to one decimal place.',
    'step.703':
      'Check with the US shortcut, 703 × pounds ÷ inches². It differs only in the last digit, if at all.',
    'step.range': 'Weights at BMI 18.5 and just under {upper} for this height.',
    'table.caption': 'Categories and the matching weights for your height',
    'table.category': 'Category',
    'table.bmi': 'BMI',
    'table.weight': 'Weight at your height',
    'warn.child':
      'Adult BMI categories don’t apply under age 20. For children and teens, BMI is compared with growth charts for their age and sex (BMI-for-age percentiles). Ask a paediatrician or use a growth-chart tool.',
    'warn.extreme':
      'This BMI is outside the usual range. Check the height and weight, and talk to a doctor if they are correct.',
    rounding:
      'BMI is computed from unrounded inputs and shown to one decimal place, rounded half-up. The category is assigned from that displayed value, so 24.96 shows as 25.0 and is classed as overweight. Weights are shown to one decimal place.',
  },
  HowItWorks: () => (
    <>
      <Formula
        label="Body mass index"
        where={[
          { symbol: 'BMI', meaning: 'body mass index, in kg/m²' },
          { symbol: 'weight', meaning: 'in kilograms' },
          { symbol: 'height', meaning: 'in metres' },
        ]}
      >
        {'BMI = weight ÷ height²'}
      </Formula>
      <p>
        With US units, the calculator converts exactly (1 inch = 0.0254 m, 1 pound = 0.45359237 kg)
        before applying the same formula. The familiar shortcut 703 × pounds ÷ inches² uses a
        rounded factor (the exact one is 703.07) and gives the same answer to one decimal place in
        almost every case.
      </p>
      <h3>Categories for adults</h3>
      <p>
        The World Health Organization defines overweight as a BMI of 25 or more and obesity as 30 or
        more. Its classification also sets underweight below 18.5 and splits obesity into classes I
        (30–34.9), II (35–39.9) and III (40 and over). These categories apply to adults of both
        sexes from age 20.
      </p>
      <h3>Asian populations</h3>
      <p>
        A WHO expert consultation published in The Lancet in 2004 found that many Asian populations
        have a higher risk of type 2 diabetes and cardiovascular disease at BMIs below 25. The risk
        threshold varied between populations, from 22 to 25. The consultation kept the international
        categories but proposed additional public-health action points at 23.0, 27.5, 32.5 and 37.5.
        Several countries use these, or their own national cut-offs, in clinical guidance. Choose
        them under “More options” to see where you fall.
      </p>
      <h3>What BMI can’t tell you</h3>
      <p>
        BMI uses only height and weight. It doesn’t separate muscle from fat, so muscular people can
        be classed as overweight with little body fat. It doesn’t show where fat is carried. Fat
        around the waist carries more risk, which is why clinicians also measure waist
        circumference. It isn’t used in pregnancy, and it reads differently in older adults, who
        tend to lose muscle. It’s a quick screening number, not a diagnosis.
      </p>
    </>
  ),
  examples: [
    {
      id: 'metric',
      title: '175 cm and 82 kg',
      body: (r, fmt) => (
        <p>
          Height in metres is 1.75, and 1.75² = 3.0625. Then 82 ÷ 3.0625 = 26.78, so the BMI is{' '}
          <strong>{fmt.num(o(r, 'bmi') as number, 1)}</strong>, in the overweight range (25–29.9).
          At this height, the healthy-weight range is {String(o(r, 'range'))}, so reaching it would
          mean a change of {String(o(r, 'change'))}.
        </p>
      ),
    },
    {
      id: 'imperial',
      title: '5 ft 4 in and 135 lb',
      body: (r, fmt) => (
        <p>
          5 ft 4 in is 64 inches, or 1.6256 m. 135 lb is 61.235 kg. The BMI is 61.235 ÷ 1.6256² ={' '}
          <strong>{fmt.num(o(r, 'bmi') as number, 1)}</strong>, a healthy weight. With the US
          shortcut: 703 × 135 ÷ 64² = 23.17, the same to one decimal place. The healthy range at
          this height is {String(o(r, 'range'))}.
        </p>
      ),
    },
    {
      id: 'asian',
      title: 'The same BMI read with the Asian action points',
      body: (r, fmt) => (
        <p>
          At 165 cm and 66 kg, BMI = 66 ÷ 1.65² ={' '}
          <strong>{fmt.num(o(r, 'bmi') as number, 1)}</strong>. On the international scale this is a
          healthy weight, just under 25. With the WHO action points for Asian populations, it is
          above the first action point of 23.0, where the consultation found risk of diabetes and
          heart disease already rising in many Asian groups. To stay below 23.0 at this height,
          weight would need to be in the range {String(o(r, 'range'))}.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Use it with a waist measurement.</strong> Two people with the same BMI can carry
        very different amounts of abdominal fat. A tape measure around the waist, at the level of
        the navel, adds the information BMI leaves out.
      </li>
      <li>
        <strong>Don’t use adult categories for children.</strong> Under 20, the healthy range
        changes with age and differs between girls and boys, so BMI is read from growth charts as a
        percentile. The calculator warns you if you enter an age under 20.
      </li>
      <li>
        <strong>Muscular builds read high.</strong> Athletes and people who do heavy strength
        training often have a BMI over 25 with a low body-fat percentage. If that describes you, a
        body-fat measurement is more informative.
      </li>
      <li>
        <strong>Small changes are normal.</strong> Weight varies by a kilogram or more across a day
        with food, fluid and time of day. Weigh at the same time, in similar clothing, if you track
        BMI over weeks.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'What is a healthy BMI for adults?',
      a: 'For adults aged 20 and over, the WHO classes a BMI from 18.5 to 24.9 as a healthy weight. Below 18.5 is underweight, 25 to 29.9 is overweight and 30 or more is obesity. For many Asian populations, the WHO noted that health risks begin to rise from about 23.',
    },
    {
      q: 'Is BMI different for men and women?',
      a: 'The formula and the adult categories are the same for men and women. At the same BMI, women on average have a higher percentage of body fat than men, which is one reason BMI is treated as a rough screening measure rather than a body-fat test. For children and teens, sex is taken into account through growth charts.',
    },
    {
      q: 'Why does the calculator use Asian cut-off points as an option?',
      a: 'A 2004 WHO expert consultation found that many Asian populations have more body fat and higher diabetes and heart-disease risk at a given BMI than European populations. It kept the international categories but added action points at 23.0, 27.5, 32.5 and 37.5. Some national guidelines, for example in parts of South and East Asia, use similar lower cut-offs.',
    },
    {
      q: 'Can BMI be wrong for athletes?',
      a: 'Yes. BMI cannot tell muscle from fat, so a muscular person can have a BMI over 25 or even 30 with low body fat. For athletes, waist circumference or a body-fat measurement such as a DEXA scan gives a better picture.',
    },
    {
      q: 'How do I calculate BMI with pounds and inches?',
      a: 'Multiply your weight in pounds by 703 and divide by your height in inches squared. For 150 lb at 5 ft 5 in (65 inches), that is 703 × 150 ÷ 4,225 = 24.96, shown as 25.0. This calculator converts to kilograms and metres exactly and gives the same result.',
    },
    {
      q: 'Should I use BMI during pregnancy?',
      a: 'No. Weight gain in pregnancy is expected and BMI categories don’t apply. Guidance on healthy pregnancy weight gain is based on your BMI before pregnancy, so if you know your pre-pregnancy weight, calculate that BMI and discuss the result with your midwife or doctor.',
    },
  ],
  ogSample: (r, fmt) => `BMI ${fmt.num(o(r, 'bmi') as number, 1)}`,
};
