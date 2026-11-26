'use client';

import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';
import type { IslandProps } from '@/components/calc/CalculatorIsland';

/** chemistry calculators: id → island chunk (ADR-028). Loaded only on chemistry pages. */
const ISLANDS: Record<string, ComponentType<IslandProps>> = {
  'molar-mass': dynamic(() => import('../chemistry/molar-mass/Island')),
  dilution: dynamic(() => import('../chemistry/dilution/Island')),
  'ideal-gas': dynamic(() => import('../chemistry/ideal-gas/Island')),
  ph: dynamic(() => import('../chemistry/ph/Island')),
  'percent-yield': dynamic(() => import('../chemistry/percent-yield/Island')),
  'half-life': dynamic(() => import('../chemistry/half-life/Island')),
  'combined-gas': dynamic(() => import('../chemistry/combined-gas/Island')),
  molarity: dynamic(() => import('../chemistry/molarity/Island')),
  'percent-composition': dynamic(() => import('../chemistry/percent-composition/Island')),
  'empirical-formula': dynamic(() => import('../chemistry/empirical-formula/Island')),
  buffer: dynamic(() => import('../chemistry/buffer/Island')),
  gibbs: dynamic(() => import('../chemistry/gibbs/Island')),
  arrhenius: dynamic(() => import('../chemistry/arrhenius/Island')),
  colligative: dynamic(() => import('../chemistry/colligative/Island')),
  nernst: dynamic(() => import('../chemistry/nernst/Island')),
  concentration: dynamic(() => import('../chemistry/concentration/Island')),
  'vapor-pressure': dynamic(() => import('../chemistry/vapor-pressure/Island')),
};

export default function Islands({ id, ...props }: IslandProps & { id: string }) {
  const Island = ISLANDS[id];
  return Island ? <Island {...props} /> : null;
}
