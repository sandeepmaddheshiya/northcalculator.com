import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'riser') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Stair Calculator',
  promise: 'Number of steps, riser height, total run and angle for a straight stair.',
  title: 'Stair Calculator: Risers, Treads, Run and Stringer Length',
  description:
    'Enter the floor-to-floor rise to get the number of steps, equal riser height, total run, stair angle and stringer length, checked against IRC or OSHA limits.',
  summary:
    'To lay out a straight stair, divide the total rise by the tallest riser your code allows and round up to get the number of risers, then divide the rise equally between them. There is one tread fewer than risers. In US homes the International Residential Code allows risers up to 7¾ inches and treads of at least 10 inches.',
  synonyms: [
    'stair stringer calculator',
    'stair rise and run calculator',
    'how many steps do I need',
    'riser height calculator',
    'deck stair calculator',
    'stair code calculator',
  ],
  ui: {
    code: 'Rules',
    'code.irc': 'Home (IRC)',
    'code.osha': 'Workplace (OSHA)',
    'code.custom': 'Custom',
    unit: 'Units',
    'unit.in': 'inches',
    'unit.cm': 'centimetres',
    rise: 'Total rise',
    'rise.in': 'Total rise (inches)',
    'rise.cm': 'Total rise (cm)',
    'rise.help': 'Finished floor to finished floor, measured vertically.',
    tread: 'Tread depth',
    'tread.in': 'Tread depth (inches)',
    'tread.cm': 'Tread depth (cm)',
    'tread.help': 'The horizontal run of each step, nosing to nosing.',
    maxRiser: 'Maximum riser height',
    'maxRiser.in': 'Maximum riser height (inches)',
    'maxRiser.cm': 'Maximum riser height (cm)',
    'out.riser': 'Riser height',
    'out.riser.in': 'Riser height (inches)',
    'out.riser.cm': 'Riser height (cm)',
    'out.risers': 'Number of risers',
    'out.treads': 'Number of treads',
    'out.run': 'Total run',
    'out.run.in': 'Total run (inches)',
    'out.run.cm': 'Total run (cm)',
    'out.runFt': 'Total run (feet)',
    'out.angle': 'Stair angle (°)',
    'out.stringer': 'Stringer length (approx.)',
    'out.stringer.in': 'Stringer length, approx. (inches)',
    'out.stringer.cm': 'Stringer length, approx. (cm)',
    explain:
      '{n} equal risers of {r} {u} and {t} treads, covering {run} {u} of floor horizontally.',
    'step.n': 'Risers = total rise ÷ maximum riser, rounded up.',
    'step.riser': 'Riser height = total rise ÷ number of risers.',
    'step.run': 'Total run = (risers − 1) treads × tread depth.',
    'step.angle': 'Angle = tan⁻¹(riser ÷ tread).',
    'step.stringer':
      'Stringer ≈ √(total rise² + total run²), before cutting for the top and bottom.',
    'warn.rise': 'Enter a total rise above zero.',
    'warn.tread': 'Enter a tread depth above zero.',
    'warn.max': 'Enter a maximum riser height above zero.',
    'warn.tread.irc': 'The IRC requires treads of at least {min} {u}.',
    'warn.tread.osha': 'OSHA requires treads of at least {min} {u} on standard stairs.',
    'warn.angle': 'At {a}°, this is outside OSHA’s 30°–50° range for standard stairs.',
    'warn.nosing': 'Treads under 11 inches need a nosing of ¾ to 1¼ inches under the IRC.',
    'warn.single': 'A single step needs no tread between floors; check the rise.',
    rounding:
      'Limits follow the IRC as adopted in many US jurisdictions and OSHA 1910.25; local codes can differ, so confirm with your building department.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Number of risers">{'n = ⌈total rise ÷ maximum riser⌉'}</Formula>
      <Formula label="Layout">
        {'riser = total rise ÷ n\ntreads = n − 1\ntotal run = treads × tread depth'}
      </Formula>
      <Formula label="Angle and stringer">
        {'angle = tan⁻¹(riser ÷ tread)\nstringer ≈ √(rise² + run²)'}
      </Formula>
      <p>
        Every riser in a flight must be the same height: the IRC allows the tallest and shortest to
        differ by no more than ⅜ inch, and OSHA requires uniform risers and treads between landings.
        Rounding the riser count up guarantees each riser is at or under the limit.
      </p>
      <p>
        Measure the rise from finished floor to finished floor, including flooring, or the top or
        bottom step will come out a different height from the rest.
      </p>
    </>
  ),
  examples: [
    {
      id: 'house',
      title: 'A 9-foot floor-to-floor rise (108 in) with 10-inch treads',
      body: (r, fmt) => (
        <p>
          108 ÷ 7.75 = 13.9, so 14 risers of <strong>{fmt.sig(o(r), 4)} in</strong> and 13 treads, a
          total run of {fmt.sig(o(r, 'run'), 3)} in ({fmt.sig(o(r, 'runFt'), 3)} ft) at{' '}
          {fmt.sig(o(r, 'angle'), 3)}°.
        </p>
      ),
    },
    {
      id: 'deck',
      title: 'Deck stairs: 30 inches to the ground',
      body: (r, fmt) => (
        <p>
          30 ÷ 7.75 rounds up to 4 risers of exactly <strong>{fmt.sig(o(r), 3)} in</strong>, with 3
          treads.
        </p>
      ),
    },
    {
      id: 'plant',
      title: 'A 12-foot mezzanine stair under OSHA, 9½-inch treads',
      body: (r, fmt) => (
        <p>
          144 ÷ 9.5 rounds up to 16 risers of <strong>{fmt.sig(o(r), 3)} in</strong>. The angle,{' '}
          {fmt.sig(o(r, 'angle'), 3)}°, is within OSHA’s 30°–50° range.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Check headroom:</strong> both the IRC and OSHA require at least 6 feet 8 inches of
        clearance above the tread nosings along the whole stair.
      </li>
      <li>
        <strong>Lower and deeper is easier:</strong> a riser around 7 inches with an 11-inch tread
        is more comfortable than the code maximum, at the cost of a longer run.
      </li>
      <li>
        <strong>Stringer stock:</strong> buy boards longer than the computed stringer to allow for
        the cuts at the top and bottom.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do I calculate how many stairs I need?',
      a: 'Measure the total rise from finished floor to finished floor, divide by the maximum riser height and round up. For a 108-inch rise and the IRC’s 7¾-inch limit, 108 ÷ 7.75 = 13.9, so you need 14 risers of 7.71 inches and 13 treads.',
    },
    {
      q: 'What is the maximum stair riser height?',
      a: 'In homes built under the International Residential Code it is 7¾ inches, with treads at least 10 inches deep. OSHA’s workplace rule allows risers up to 9.5 inches and treads of at least 9.5 inches, at 30° to 50°. Check which code edition your area has adopted.',
    },
    {
      q: 'Why is there one fewer tread than risers?',
      a: 'The top riser steps onto the upper floor, which acts as the last tread. A stair with 14 risers therefore has 13 treads, and its total run is 13 times the tread depth.',
    },
    {
      q: 'What angle should stairs be?',
      a: 'It follows from riser and tread: tan⁻¹(riser ÷ tread). A 7½-inch riser with a 10-inch tread gives 36° 52′, a row of OSHA’s Table D-1. OSHA standard stairs must be between 30° and 50°; steeper ones are ship stairs or ladders.',
    },
  ],
  ogSample: (r, fmt) => `108 in rise → 14 risers of ${fmt.sig(o(r), 4)} in`,
};
