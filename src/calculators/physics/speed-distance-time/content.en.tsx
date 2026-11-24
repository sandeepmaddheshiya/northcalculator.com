import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'result') => r.outputs[k];

export const content: CalculatorContent = {
  name: 'Speed, Distance and Time Calculator',
  promise: 'Find speed, distance or travel time from the other two, in any common unit.',
  title: 'Speed, Distance and Time Calculator: Speed and Travel Time',
  description:
    'Work out average speed, distance travelled or travel time from the other two, in km/h, mph or m/s, with kilometres, miles or metres and hours:minutes:seconds.',
  summary:
    'Distance equals speed multiplied by time. Rearranged, speed is distance divided by time, and time is distance divided by speed. The units must agree: miles with miles per hour and hours, or kilometres with km/h. This calculator converts for you, so you can enter a distance in miles and a speed in km/h and still get the right travel time.',
  synonyms: [
    'average speed calculator',
    'travel time calculator',
    'distance calculator',
    'd = rt calculator',
    'how long will it take to drive',
    'speed formula',
  ],
  ui: {
    find: 'Find',
    'find.speed': 'Speed',
    'find.distance': 'Distance',
    'find.time': 'Time',
    dist: 'Distance',
    distance: 'Distance',
    distUnit: 'Distance unit',
    time: 'Time',
    spd: 'Speed',
    speed: 'Speed',
    speedUnit: 'Speed unit',
    'unit.km': 'km',
    'unit.mi': 'miles',
    'unit.m': 'metres',
    'unit.h': 'Hours',
    'unit.min': 'Minutes',
    'unit.s': 'Seconds',
    'unit.kmh': 'km/h',
    'unit.mph': 'mph',
    'unit.ms': 'm/s',
    'sym.km': 'km',
    'sym.mi': 'mi',
    'sym.m': 'm',
    'sym.kmh': 'km/h',
    'sym.mph': 'mph',
    'sym.ms': 'm/s',
    'out.result': 'Speed',
    'out.result.speed': 'Average speed',
    'out.result.distance': 'Distance',
    'out.result.time': 'Time (h:mm:ss)',
    'out.kmh': 'Speed in km/h',
    'out.mph': 'Speed in mph',
    'out.ms': 'Speed in m/s',
    'out.km': 'Distance in km',
    'out.mi': 'Distance in miles',
    'out.hours': 'Time in hours',
    explain: 'Covering {d} in {t} means an average speed of {s}.',
    'step.speed': 'Speed = distance ÷ time, after converting to matching units.',
    'step.distance': 'Distance = speed × time, after converting to matching units.',
    'step.time': 'Time = distance ÷ speed, after converting to matching units.',
    'warn.time': 'Enter a time greater than zero.',
    'warn.speed': 'Enter a speed greater than zero.',
    rounding:
      'Uses the exact mile of 1,609.344 m. Speeds and distances keep 12 significant digits and are shown to 8; times are shown to the nearest second.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Distance, speed and time">
        {'distance = speed × time\nspeed = distance ÷ time\ntime = distance ÷ speed'}
      </Formula>
      <p>
        This is average speed: the total distance divided by the total time, including stops. A car
        that drives 6 km to a shop and back in 30 minutes averages 12 km/h however fast it went on
        the open road. Conversions use 1 mi = 1.609344 km exactly, so 1 mph = 0.44704 m/s, and 1
        km/h = 1/3.6 m/s.
      </p>
    </>
  ),
  examples: [
    {
      id: 'store',
      title: 'A 6 km round trip in 30 minutes',
      body: (r) => (
        <p>
          6 km ÷ 0.5 h = <strong>{String(o(r))}</strong>, the average speed OpenStax{' '}
          <em>College Physics</em> gives for this trip to the store and back.
        </p>
      ),
    },
    {
      id: 'express',
      title: 'An express train at 60 mph for 4 hours',
      body: (r) => (
        <p>
          60 mph × 4 h = <strong>{String(o(r))}</strong>, as in OpenStax <em>Elementary Algebra</em>{' '}
          Example 3.48, where the local train covers the same 240 miles at 48 mph in 5 hours.
        </p>
      ),
    },
    {
      id: 'desert',
      title: 'How long 175 miles takes at 70 mph',
      body: (r) => (
        <p>
          175 ÷ 70 = 2.5 hours, which is <strong>{String(o(r))}</strong>: the desert leg of the
          drive to Las Vegas in Example 3.52.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Plan for the average, not the limit.</strong> Stops, traffic and slower roads mean a
        trip on a 70 mph highway rarely averages 70 mph.
      </li>
      <li>
        <strong>Minutes are not decimals of an hour.</strong> 1.5 hours is 1 hour 30 minutes, not 1
        hour 50 minutes. Enter hours and minutes separately to avoid the slip.
      </li>
      <li>
        <strong>Speed and velocity differ.</strong> Velocity includes direction, so a round trip has
        zero average velocity even though the average speed is not zero.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'What is the formula for speed?',
      a: 'Speed is distance divided by time. If you drive 150 miles in 2.5 hours, your average speed is 150 ÷ 2.5 = 60 mph. In metres and seconds, a runner who covers 400 m in 80 s averages 5 m/s.',
    },
    {
      q: 'How do I work out travel time?',
      a: 'Divide the distance by the speed. A 300 km trip at an average of 80 km/h takes 300 ÷ 80 = 3.75 hours, which is 3 hours 45 minutes. Add time for breaks, because they lower your average speed.',
    },
    {
      q: 'How do I convert mph to km/h?',
      a: 'Multiply by 1.609344, the number of kilometres in a mile. 60 mph is about 96.56 km/h and 70 mph about 112.65 km/h. To go the other way, divide km/h by 1.609344, so 100 km/h is about 62.14 mph.',
    },
    {
      q: 'What is the difference between average speed and instantaneous speed?',
      a: 'Average speed is the whole distance divided by the whole time. Instantaneous speed is how fast you are going at one moment, which is what a speedometer shows. On a trip with stops, the speedometer often reads higher than your average.',
    },
  ],
  ogSample: (r) => `6 km in 30 min → ${String(o(r))}`,
};
