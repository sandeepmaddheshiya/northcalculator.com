'use client';

import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';
import type { IslandProps } from '@/components/calc/CalculatorIsland';

/** health calculators: id → island chunk (ADR-028). Loaded only on health pages. */
const ISLANDS: Record<string, ComponentType<IslandProps>> = {
  bmi: dynamic(() => import('../health/bmi/Island')),
  bmr: dynamic(() => import('../health/bmr/Island')),
  calorie: dynamic(() => import('../health/calorie/Island')),
  'heart-rate': dynamic(() => import('../health/heart-rate/Island')),
  'running-pace': dynamic(() => import('../health/running-pace/Island')),
  'calories-burned': dynamic(() => import('../health/calories-burned/Island')),
};

export default function Islands({ id, ...props }: IslandProps & { id: string }) {
  const Island = ISLANDS[id];
  return Island ? <Island {...props} /> : null;
}
