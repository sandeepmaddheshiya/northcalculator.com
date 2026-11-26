import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'change') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Thermal Expansion Calculator',
  promise: 'How much a length, area or volume grows or shrinks with temperature.',
  title: 'Thermal Expansion Calculator: Linear, Area and Volume',
  description:
    'Find how much a rod, plate or volume of liquid expands with temperature, using ΔL = αLΔT or ΔV = βVΔT, with common materials and thermal stress.',
  summary:
    'Most materials grow when heated and shrink when cooled. The change is proportional to the original size and the temperature change: ΔL = αLΔT for length, about 2α for area and β for volume. Pick a material or enter your own coefficient. For a bar held at both ends, you can also see the thermal stress it builds up.',
  synonyms: [
    'linear expansion calculator',
    'coefficient of thermal expansion calculator',
    'volume expansion calculator',
    'thermal stress calculator',
    'expansion of steel with temperature',
    'ΔL = αLΔT calculator',
  ],
  ui: {
    mode: 'Expansion',
    'mode.linear': 'Length',
    'mode.area': 'Area',
    'mode.volume': 'Volume',
    material: 'Material',
    'material.aluminum': 'Aluminum',
    'material.brass': 'Brass',
    'material.copper': 'Copper',
    'material.gold': 'Gold',
    'material.steel': 'Iron or steel',
    'material.invar': 'Invar (nickel-iron alloy)',
    'material.lead': 'Lead',
    'material.silver': 'Silver',
    'material.glass': 'Glass (ordinary)',
    'material.pyrex': 'Glass (Pyrex)',
    'material.quartz': 'Quartz',
    'material.concrete': 'Concrete or brick',
    'material.ether': 'Ether',
    'material.ethanol': 'Ethyl alcohol',
    'material.gasoline': 'Gasoline (petrol)',
    'material.glycerin': 'Glycerin',
    'material.mercury': 'Mercury',
    'material.water': 'Water',
    'material.air': 'Air and most gases',
    'material.custom': 'Other: enter the coefficient',
    coef: 'Coefficient (× 10⁻⁶ per °C)',
    'coef.linear': 'Linear coefficient α (× 10⁻⁶ per °C)',
    'coef.area': 'Linear coefficient α (× 10⁻⁶ per °C)',
    'coef.volume': 'Volume coefficient β (× 10⁻⁶ per °C)',
    size: 'Original size',
    'size.linear': 'Original length',
    'size.area': 'Original area',
    'size.volume': 'Original volume',
    'size.help': 'Any unit; the change comes out in the same unit.',
    tu: 'Temperature unit',
    'tu.C': '°C (or K)',
    'tu.F': '°F',
    tempsRow: 'Temperature',
    t1: 'From',
    t2: 'To',
    y: 'Young’s modulus Y (GPa), for a bar fixed at both ends',
    'y.help': 'Concrete in compression is about 20 GPa (OpenStax). Leave at 0 to skip the stress.',
    'out.change': 'Change in size',
    'out.change.linear': 'Change in length ΔL',
    'out.change.area': 'Change in area ΔA',
    'out.change.volume': 'Change in volume ΔV',
    'out.final': 'New size',
    'out.final.linear': 'New length',
    'out.final.area': 'New area',
    'out.final.volume': 'New volume',
    'out.percent': 'Change (%)',
    'out.dT': 'Temperature change ΔT (°C)',
    'out.coef': 'Coefficient used (per °C)',
    'out.coef.linear': 'α used (per °C)',
    'out.coef.area': 'α used (per °C)',
    'out.coef.volume': 'β used (per °C)',
    'out.stress': 'Thermal stress if both ends are fixed (MPa)',
    'explain.grow': 'It grows by {d}, to {f}, in the unit you entered.',
    'explain.shrink': 'It shrinks by {d}, to {f}, in the unit you entered.',
    'step.f': 'Convert the °F difference to °C: multiply by 5/9.',
    'step.linear': 'ΔL = α × L × ΔT.',
    'step.area': 'ΔA = 2α × A × ΔT.',
    'step.volume': 'ΔV = β × V × ΔT.',
    'step.stress': 'Stress = Y × α × ΔT.',
    'warn.fluid':
      'Liquids and gases have no fixed length, so only volume expansion applies. Switch to Volume.',
    'warn.size': 'Enter an original size above zero.',
    'warn.tension':
      'The bar is cooling, so a bar fixed at both ends is pulled in tension rather than squeezed.',
    rounding:
      'Coefficients are OpenStax table values at 20 °C. They vary slightly with temperature, so results are approximate over large ranges.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Length, area, volume">
        {'ΔL = α L ΔT\nΔA = 2α A ΔT\nΔV = β V ΔT   (β ≈ 3α for solids)'}
      </Formula>
      <Formula label="Thermal stress, ends fixed">{'F ÷ A = Y α ΔT'}</Formula>
      <p>
        ΔT is the final temperature minus the starting one. A change of 1 °C is the same as 1 K, so
        kelvin readings work with the °C setting. The area formula holds for small changes in
        temperature. Liquids have only a volume coefficient, because they take the shape of their
        container.
      </p>
    </>
  ),
  examples: [
    {
      id: 'bridge',
      title: 'Golden Gate Bridge: 1275 m of steel from −15 °C to 40 °C',
      body: (r, fmt) => (
        <p>
          ΔL = 12 × 10⁻⁶ × 1275 × 55 = <strong>{fmt.sig(o(r), 2)} m</strong>, as in OpenStax{' '}
          <em>College Physics</em> Example 13.3. Small next to the span, but observable.
        </p>
      ),
    },
    {
      id: 'gasoline',
      title: 'A 60.0 L tank of gasoline warming from 15 °C to 35 °C',
      body: (r, fmt) => (
        <p>
          The gasoline grows by <strong>{fmt.sig(o(r), 3)} L</strong>. The steel tank grows by only
          0.042 L, so about 1.10 L spills, as in Example 13.4.
        </p>
      ),
    },
    {
      id: 'concrete',
      title: 'Concrete highway blocks laid at 5 °C, on a 38 °C day',
      body: (r, fmt) => (
        <p>
          With Y = 20 GPa the blocks are squeezed by{' '}
          <strong>{fmt.sig(o(r, 'stress'), 2)} MPa</strong>, as in <em>University Physics</em>{' '}
          Volume 2 Example 1.4.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Containers expand too:</strong> a full tank overflows by the difference between the
        liquid’s expansion and the tank’s, since liquids expand much more than solids.
      </li>
      <li>
        <strong>Compare stress with strength:</strong> 7.9 MPa in the concrete example is below its
        ultimate compressive strength of 20 MPa but above its shear strength of 2 MPa, so blocks may
        chip without breaking.
      </li>
      <li>
        <strong>Low-expansion materials:</strong> Invar (α = 0.9 × 10⁻⁶ per °C) and quartz (0.4 ×
        10⁻⁶) expand roughly 13 to 30 times less than steel.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do I calculate linear thermal expansion?',
      a: 'Multiply the coefficient of linear expansion by the original length and the temperature change: ΔL = αLΔT. A 1275 m steel span with α = 12 × 10⁻⁶ per °C, warming by 55 °C, grows by 0.84 m.',
    },
    {
      q: 'What is the difference between α and β?',
      a: 'α is the fractional change in length per degree and β the fractional change in volume per degree. For a solid that expands equally in all directions, β is about 3α; the table values for aluminum are 25 and 75 × 10⁻⁶ per °C.',
    },
    {
      q: 'Does it matter whether I use Celsius or kelvin?',
      a: 'No. Only the temperature difference enters the formula, and a change of one degree Celsius equals a change of one kelvin. Fahrenheit differences are converted by multiplying by 5/9 before applying the coefficient.',
    },
    {
      q: 'What is thermal stress?',
      a: 'If a bar cannot expand, because both ends are fixed, the material is squeezed instead. The stress is Young’s modulus times the strain it was prevented from having: F/A = YαΔT. Cooling a fixed bar pulls it in tension instead.',
    },
  ],
  ogSample: (r, fmt) => `1275 m of steel, −15 → 40 °C → grows ${fmt.sig(o(r), 2)} m`,
};
