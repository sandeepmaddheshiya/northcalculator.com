'use client';

import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';
import type { IslandProps } from '@/components/calc/CalculatorIsland';

/** math calculators: id → island chunk (ADR-028). Loaded only on math pages. */
const ISLANDS: Record<string, ComponentType<IslandProps>> = {
  percentage: dynamic(() => import('../math/percentage/Island')),
  'scientific-calculator': dynamic(() => import('../math/scientific/Island')),
  fraction: dynamic(() => import('../math/fraction/Island')),
  average: dynamic(() => import('../math/average/Island')),
  'lcm-gcf': dynamic(() => import('../math/lcm-gcf/Island')),
  'percentage-change': dynamic(() => import('../math/percentage-change/Island')),
  ratio: dynamic(() => import('../math/ratio/Island')),
  rounding: dynamic(() => import('../math/rounding/Island')),
  'percent-difference': dynamic(() => import('../math/percent-difference/Island')),
  exponent: dynamic(() => import('../math/exponent/Island')),
  root: dynamic(() => import('../math/root/Island')),
  logarithm: dynamic(() => import('../math/logarithm/Island')),
  'scientific-notation': dynamic(() => import('../math/scientific-notation/Island')),
  'random-number': dynamic(() => import('../math/random-number/Island')),
  dice: dynamic(() => import('../math/dice/Island')),
  quadratic: dynamic(() => import('../math/quadratic/Island')),
  slope: dynamic(() => import('../math/slope/Island')),
  trigonometry: dynamic(() => import('../math/trigonometry/Island')),
  'linear-system': dynamic(() => import('../math/linear-system/Island')),
  'prime-factorization': dynamic(() => import('../math/prime-factorization/Island')),
};

export default function Islands({ id, ...props }: IslandProps & { id: string }) {
  const Island = ISLANDS[id];
  return Island ? <Island {...props} /> : null;
}
