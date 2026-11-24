import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'result') => String(r.outputs[k]);

export const content: CalculatorContent = {
  name: 'Pace Calculator',
  promise: 'Running pace, finish time or distance, per kilometre or per mile.',
  title: 'Pace Calculator: Running Pace, Race Time and Distance',
  description:
    'Work out your running pace from a race time, predict a finish time from a pace, or find the distance covered, in minutes per km or per mile, for any race.',
  summary:
    'Pace is time divided by distance, written as minutes and seconds per kilometre or per mile. Knowing any two of distance, time and pace gives the third. A 3:30:00 marathon over the official 42.195 km is about 4:59 per kilometre or 8:01 per mile. Speed is the inverse of pace: distance divided by time.',
  synonyms: [
    'running pace calculator',
    'marathon pace calculator',
    'minutes per mile calculator',
    'race time calculator',
    'min/km calculator',
    'half marathon pace',
    'running speed calculator',
  ],
  ui: {
    mode: 'Calculate',
    'mode.pace': 'Pace',
    'mode.time': 'Finish time',
    'mode.distance': 'Distance',
    race: 'Race',
    'race.custom': 'Other distance',
    'race.mile': 'Road mile',
    'race.5k': '5 km',
    'race.10k': '10 km',
    'race.half': 'Half marathon',
    'race.marathon': 'Marathon',
    dist: 'Distance',
    distance: 'Distance',
    distUnit: 'Unit',
    'unit.km': 'km',
    'unit.mi': 'miles',
    time: 'Time',
    paceIn: 'Pace',
    'unit.h': 'Hours',
    'unit.min': 'Minutes',
    'unit.s': 'Seconds',
    paceUnit: 'Pace per',
    'pace.km': 'Kilometre',
    'pace.mi': 'Mile',
    'out.result.pace': 'Pace',
    'out.result.time': 'Finish time',
    'out.result.distance': 'Distance',
    'out.perKm': 'Pace per km',
    'out.perMi': 'Pace per mile',
    'out.kmh': 'Speed (km/h)',
    'out.mph': 'Speed (mph)',
    'out.km': 'Distance (km)',
    'per.km': '/km',
    'per.mi': '/mi',
    'dist.km': '{v} km',
    'dist.mi': '{v} mi',
    'explain.pace': 'Finishing in {time} means averaging {pace} over {km} km ({mi} miles).',
    'explain.time': 'At {pace}, {km} km takes {time}.',
    'explain.distance': 'In {time} at {pace} you cover {km} km ({mi} miles).',
    'step.pace': 'Pace = time ÷ distance.',
    'step.time': 'Time = pace × distance.',
    'step.distance': 'Distance = time ÷ pace.',
    'step.speed': 'Speed = distance ÷ time.',
    'warn.distance': 'Enter a distance above zero.',
    'warn.time': 'Enter a time above zero.',
    'warn.pace': 'Enter a pace above zero.',
    'warn.fast':
      'That is faster than 2:30 per kilometre, quicker than elite marathon pace. Check the time and distance.',
    rounding:
      'Paces and times are rounded to the nearest second; speeds to 2 decimal places. Race distances are exact: 1 mile = 1.609344 km.',
  },
  HowItWorks: () => (
    <>
      <p>Pace, time and distance are linked by one relationship, so any two give the third:</p>
      <Formula label="Pace, time and distance">
        {'pace = time ÷ distance\ntime = pace × distance\ndistance = time ÷ pace'}
      </Formula>
      <p>
        The calculator works in seconds and kilometres. A pace of 5:30 per km is 330 seconds per km,
        so 10 km takes 3,300 seconds, which is 55:00. To switch between kilometres and miles it uses
        the exact international mile, 1.609344 km, which is also the Road Mile in the World
        Athletics rules.
      </p>
      <Formula label="Converting pace">{'pace per mile = pace per km × 1.609344'}</Formula>
      <p>
        Race distances follow the World Athletics Technical Rules for road races: 5 km, 10 km, the
        half marathon and the marathon of 42.195 km. The half marathon is half of that, 21.0975 km.
        Speed is the inverse of pace: 5:00 per km is 60 ÷ 5 = 12 km/h.
      </p>
    </>
  ),
  examples: [
    {
      id: 'marathon',
      title: 'Pace for a 3:30 marathon',
      body: (r) => (
        <p>
          3 hours 30 minutes is 12,600 seconds. Over 42.195 km that is 298.6 seconds per km, which
          rounds to <strong>{o(r)}</strong>, or {o(r, 'perMi')} in miles. Keeping an even pace like
          this is how most runners plan a target time.
        </p>
      ),
    },
    {
      id: 'tenk',
      title: 'A 10 km race at 5:30 per km',
      body: (r) => (
        <p>
          Choose Finish time and 10 km. 330 seconds × 10 = 3,300 seconds, a finish time of{' '}
          <strong>{o(r)}</strong>. The average speed is {o(r, 'kmh')} km/h.
        </p>
      ),
    },
    {
      id: 'distance',
      title: 'How far is 45 minutes at 9:00 per mile?',
      body: (r) => (
        <p>
          Choose Distance, with miles as the unit. 2,700 seconds ÷ 540 seconds per mile ={' '}
          <strong>{o(r)}</strong>, which is about {o(r, 'perKm')} in kilometre pace.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Courses are measured on the shortest legal route,</strong> as the World Athletics
        rules require. Weaving around other runners adds distance, so a GPS watch often shows a
        slightly longer race than the official distance and a slightly faster pace.
      </li>
      <li>
        <strong>Pace assumes even running.</strong> The result is an average. Course profile and
        weather change how fast each section is run, so compare your splits with the average, not
        each kilometre in isolation.
      </li>
      <li>
        <strong>Even pace is easier to judge.</strong> Splitting a race into equal kilometres or
        miles at your target pace lets you check progress at every marker.
      </li>
      <li>
        <strong>Treadmills show speed.</strong> Convert: a speed of 10 km/h is a pace of 6:00 per
        km, and 6 mph is 10:00 per mile.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do I calculate my running pace?',
      a: 'Divide your time by the distance. A 5 km run in 27 minutes 30 seconds is 1,650 seconds ÷ 5 = 330 seconds per km, which is 5:30 per km. For miles, divide by the distance in miles instead, or multiply the per-km pace by 1.609344.',
    },
    {
      q: 'What pace do I need for a sub-4-hour marathon?',
      a: 'Four hours is 14,400 seconds. Over 42.195 km that is 341.3 seconds per km, so you need to average faster than 5:41 per km, or 9:09 per mile. Running even splits at that pace from the start gets you to the finish line just inside four hours.',
    },
    {
      q: 'How do I convert pace per km to pace per mile?',
      a: 'Multiply the pace by 1.609344, the number of kilometres in a mile. A pace of 6:00 per km is 360 × 1.609344 = 579.4 seconds, or 9:39 per mile. To go the other way, divide the pace per mile by 1.609344.',
    },
    {
      q: 'How long is a half marathon?',
      a: 'A half marathon is half of the 42.195 km marathon distance in the World Athletics rules, which is 21.0975 km or about 13.11 miles. At 6:00 per km, it takes 2:06:35.',
    },
  ],
  ogSample: (r) => `3:30 marathon = ${o(r)}`,
};
