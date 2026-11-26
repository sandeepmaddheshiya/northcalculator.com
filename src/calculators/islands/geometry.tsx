'use client';

import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';
import type { IslandProps } from '@/components/calc/CalculatorIsland';

/** geometry calculators: id → island chunk (ADR-028). Loaded only on geometry pages. */
const ISLANDS: Record<string, ComponentType<IslandProps>> = {
  area: dynamic(() => import('../geometry/area/Island')),
  circle: dynamic(() => import('../geometry/circle/Island')),
  pythagorean: dynamic(() => import('../geometry/pythagorean/Island')),
  volume: dynamic(() => import('../geometry/volume/Island')),
  triangle: dynamic(() => import('../geometry/triangle/Island')),
  'arc-sector': dynamic(() => import('../geometry/arc-sector/Island')),
  'surface-area': dynamic(() => import('../geometry/surface-area/Island')),
};

export default function Islands({ id, ...props }: IslandProps & { id: string }) {
  const Island = ISLANDS[id];
  return Island ? <Island {...props} /> : null;
}
