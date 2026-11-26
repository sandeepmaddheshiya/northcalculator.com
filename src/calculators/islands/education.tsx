'use client';

import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';
import type { IslandProps } from '@/components/calc/CalculatorIsland';

/** education calculators: id → island chunk (ADR-028). Loaded only on education pages. */
const ISLANDS: Record<string, ComponentType<IslandProps>> = {
  gpa: dynamic(() => import('../education/gpa/Island')),
  grade: dynamic(() => import('../education/grade/Island')),
  'final-grade': dynamic(() => import('../education/final-grade/Island')),
  'test-score': dynamic(() => import('../education/test-score/Island')),
  cgpa: dynamic(() => import('../education/cgpa/Island')),
  'percent-gpa': dynamic(() => import('../education/percent-gpa/Island')),
};

export default function Islands({ id, ...props }: IslandProps & { id: string }) {
  const Island = ISLANDS[id];
  return Island ? <Island {...props} /> : null;
}
