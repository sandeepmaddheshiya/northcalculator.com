import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'power') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Heat Conduction Calculator',
  promise: 'Heat flow through a wall or layer, and its R-value, from Fourier’s law.',
  title: 'Heat Conduction Calculator: Heat Loss Rate and R-Value',
  description:
    'Find the rate of heat conduction through a flat layer from its material, area, thickness and temperatures, plus the heat over time and the R-value.',
  summary:
    'Heat flows through a solid layer at a rate set by its thermal conductivity, area, thickness and the temperature difference across it: Q/t = kA(T_hot − T_cold) ÷ d. Doubling the thickness halves the heat flow. The R-value, thickness ÷ conductivity, measures insulation: the higher it is, the slower heat escapes.',
  synonyms: [
    'thermal conductivity calculator',
    'heat loss through a wall',
    'Fourier law calculator',
    'R-value calculator',
    'heat transfer rate calculator',
    'insulation heat loss calculator',
  ],
  ui: {
    material: 'Material',
    'material.copper': 'Copper (390)',
    'material.aluminum': 'Aluminum (220)',
    'material.steel': 'Steel, iron (80)',
    'material.stainless': 'Stainless steel (14)',
    'material.ice': 'Ice (2.2)',
    'material.glass': 'Glass (0.84)',
    'material.concrete': 'Concrete, brick (0.84)',
    'material.water': 'Water (0.6)',
    'material.plasterboard': 'Plasterboard (0.16)',
    'material.snow': 'Snow, dry (0.10)',
    'material.cork': 'Cork (0.042)',
    'material.glasswool': 'Glass wool (0.042)',
    'material.wool': 'Wool (0.04)',
    'material.polystyrene': 'Polystyrene foam (0.035)',
    'material.air': 'Still air (0.023)',
    'material.styrofoam': 'Styrofoam (0.010)',
    'material.custom': 'Other: enter k',
    k: 'Thermal conductivity k (W/(m·K))',
    area: 'Area (m²)',
    thickness: 'Thickness (cm)',
    tempsRow: 'Temperatures (°C)',
    hot: 'Warm side',
    cold: 'Cold side',
    hours: 'Time for total heat (hours)',
    'out.power': 'Heat flow rate (W)',
    'out.heat': 'Heat over that time (J)',
    'out.kwh': 'Heat over that time (kWh)',
    'out.perArea': 'Heat flux (W/m²)',
    'out.rSI': 'R-value (m²·K/W)',
    'out.rUS': 'R-value (ft²·°F·h/Btu)',
    explain: '{p} W flows from the warm side to the cold side; the layer is R-{r} in US units.',
    'explain.reverse': '{p} W flows the other way, because the “cold” side is warmer.',
    'step.rate': 'Q/t = k × A × ΔT ÷ d, with d in metres.',
    'step.heat': 'Total heat = rate × time in seconds.',
    'step.r': 'R = d ÷ k; 1 ft²·°F·h/Btu = 0.1761102 m²·K/W.',
    'warn.k': 'Enter a thermal conductivity above zero.',
    'warn.size': 'Area and thickness must be above zero.',
    'warn.reverse': 'The cold side is warmer, so heat flows the other way.',
    rounding:
      'Conductivities are typical values near 0 °C from OpenStax; real materials vary with density, moisture and temperature.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Conduction (Fourier’s law)">{'Q/t = k × A × (T_hot − T_cold) ÷ d'}</Formula>
      <Formula label="R-value">{'R = d ÷ k\nR (US) = R (SI) ÷ 0.1761102'}</Formula>
      <p>
        k is in watts per metre per kelvin (the same as per °C, since only a difference is used).
        The rate is steady-state: it assumes the temperatures on both faces have settled.
      </p>
      <p>
        Real walls and windows also have still air films on each surface, which add their own
        resistance. For a single thin pane of glass these films, not the glass, set the heat loss,
        so a bare-layer calculation greatly overstates it.
      </p>
    </>
  ),
  examples: [
    {
      id: 'icebox',
      title: 'A Styrofoam ice box: 0.950 m², 2.50 cm thick, 35 °C outside, 0 °C inside',
      body: (r, fmt) => (
        <p>
          0.010 × 0.950 × 35.0 ÷ 0.0250 = <strong>{fmt.sig(o(r), 3)} W</strong>, or{' '}
          {fmt.sig(o(r, 'heat'), 3)} J in a day, enough to melt about 3.44 kg of ice, as in OpenStax{' '}
          <em>College Physics</em> Example 14.5.
        </p>
      ),
    },
    {
      id: 'foam',
      title: 'The same box in polystyrene foam (k = 0.035)',
      body: (r, fmt) => (
        <p>
          The rate rises to <strong>{fmt.sig(o(r), 3)} W</strong>, about 4.0 × 10⁶ J a day, as in
          OpenStax <em>University Physics</em> Example 1.10.
        </p>
      ),
    },
    {
      id: 'pan',
      title: 'Boiling water in an aluminum pan: 0.800 cm base, 5.33 °C across it',
      body: (r, fmt) => (
        <p>
          220 × 0.0154 × 5.33 ÷ 0.008 = <strong>{fmt.sig(o(r), 3)} W</strong>, the 2.26 kW needed to
          boil away 1 g of water a second (College Physics Example 14.6).
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Layers in series:</strong> add their R-values, then divide area × ΔT by the total R
        for the heat flow.
      </li>
      <li>
        <strong>Metals conduct thousands of times better</strong> than insulation: copper (390) vs
        glass wool (0.042), which is why pans are metal and attics use fibre or foam.
      </li>
      <li>
        <strong>Still air insulates:</strong> most insulation works by trapping air in small pockets
        so it cannot circulate.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do I calculate heat loss by conduction?',
      a: 'Multiply the thermal conductivity by the area and the temperature difference, then divide by the thickness in metres. A 0.950 m² Styrofoam wall 2.50 cm thick with 35 °C across it conducts 0.010 × 0.950 × 35 ÷ 0.025 = 13.3 W.',
    },
    {
      q: 'What is an R-value?',
      a: 'It is thermal resistance: thickness divided by conductivity. A higher R means less heat flow. In SI it is in m²·K/W; US building R-values are in ft²·°F·h/Btu, which are 5.68 times larger numbers for the same material. 3.5-inch fiberglass batts are about R-11.',
    },
    {
      q: 'What is thermal conductivity?',
      a: 'It is how readily a material conducts heat, in watts per metre per kelvin. Silver and copper are near 400, glass about 0.84, wood 0.08 to 0.16, and good insulation around 0.04. Air is 0.023 when it cannot move.',
    },
    {
      q: 'Why does a thicker layer insulate better?',
      a: 'Conduction is inversely proportional to thickness: heat must pass through more material, so doubling the thickness halves the heat flow and doubles the R-value. Doubling the area, by contrast, doubles the heat flow.',
    },
  ],
  ogSample: (r, fmt) => `Styrofoam box, 2.5 cm, 35 °C difference → ${fmt.sig(o(r), 3)} W`,
};
