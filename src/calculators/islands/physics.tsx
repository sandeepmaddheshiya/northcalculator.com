'use client';

import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';
import type { IslandProps } from '@/components/calc/CalculatorIsland';

/** physics calculators: id → island chunk (ADR-028). Loaded only on physics pages. */
const ISLANDS: Record<string, ComponentType<IslandProps>> = {
  'speed-distance-time': dynamic(() => import('../physics/speed-distance-time/Island')),
  'kinetic-energy': dynamic(() => import('../physics/kinetic-energy/Island')),
  density: dynamic(() => import('../physics/density/Island')),
  force: dynamic(() => import('../physics/force/Island')),
  'free-fall': dynamic(() => import('../physics/free-fall/Island')),
  projectile: dynamic(() => import('../physics/projectile/Island')),
  'work-power': dynamic(() => import('../physics/work-power/Island')),
  wave: dynamic(() => import('../physics/wave/Island')),
  momentum: dynamic(() => import('../physics/momentum/Island')),
  pressure: dynamic(() => import('../physics/pressure/Island')),
  'hookes-law': dynamic(() => import('../physics/hookes-law/Island')),
  'specific-heat': dynamic(() => import('../physics/specific-heat/Island')),
  gravitation: dynamic(() => import('../physics/gravitation/Island')),
  pendulum: dynamic(() => import('../physics/pendulum/Island')),
  centripetal: dynamic(() => import('../physics/centripetal/Island')),
  'thin-lens': dynamic(() => import('../physics/thin-lens/Island')),
  doppler: dynamic(() => import('../physics/doppler/Island')),
  buoyancy: dynamic(() => import('../physics/buoyancy/Island')),
  torque: dynamic(() => import('../physics/torque/Island')),
  'potential-energy': dynamic(() => import('../physics/potential-energy/Island')),
  acceleration: dynamic(() => import('../physics/acceleration/Island')),
  refraction: dynamic(() => import('../physics/refraction/Island')),
  orbit: dynamic(() => import('../physics/orbit/Island')),
  collision: dynamic(() => import('../physics/collision/Island')),
  conduction: dynamic(() => import('../physics/conduction/Island')),
  'flow-rate': dynamic(() => import('../physics/flow-rate/Island')),
  bernoulli: dynamic(() => import('../physics/bernoulli/Island')),
  photon: dynamic(() => import('../physics/photon/Island')),
  'de-broglie': dynamic(() => import('../physics/de-broglie/Island')),
  relativity: dynamic(() => import('../physics/relativity/Island')),
  carnot: dynamic(() => import('../physics/carnot/Island')),
  'magnetic-force': dynamic(() => import('../physics/magnetic-force/Island')),
};

export default function Islands({ id, ...props }: IslandProps & { id: string }) {
  const Island = ISLANDS[id];
  return Island ? <Island {...props} /> : null;
}
