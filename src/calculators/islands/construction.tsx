'use client';

import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';
import type { IslandProps } from '@/components/calc/CalculatorIsland';

/** construction calculators: id → island chunk (ADR-028). Loaded only on construction pages. */
const ISLANDS: Record<string, ComponentType<IslandProps>> = {
  concrete: dynamic(() => import('../construction/concrete/Island')),
  'board-feet': dynamic(() => import('../construction/board-feet/Island')),
  stairs: dynamic(() => import('../construction/stairs/Island')),
};

export default function Islands({ id, ...props }: IslandProps & { id: string }) {
  const Island = ISLANDS[id];
  return Island ? <Island {...props} /> : null;
}
