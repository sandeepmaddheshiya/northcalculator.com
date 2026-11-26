'use client';

import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';
import type { IslandProps } from '@/components/calc/CalculatorIsland';

/** everyday calculators: id → island chunk (ADR-028). Loaded only on everyday pages. */
const ISLANDS: Record<string, ComponentType<IslandProps>> = {
  tip: dynamic(() => import('../everyday/tip/Island')),
  discount: dynamic(() => import('../everyday/discount/Island')),
  'unit-price': dynamic(() => import('../everyday/unit-price/Island')),
  'fuel-cost': dynamic(() => import('../everyday/fuel-cost/Island')),
  'bill-split': dynamic(() => import('../everyday/bill-split/Island')),
};

export default function Islands({ id, ...props }: IslandProps & { id: string }) {
  const Island = ISLANDS[id];
  return Island ? <Island {...props} /> : null;
}
