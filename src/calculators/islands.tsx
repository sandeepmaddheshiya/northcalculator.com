'use client';

import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';
import type { IslandProps } from '@/components/calc/CalculatorIsland';

type ByCategory = ComponentType<IslandProps & { id: string }>;

/**
 * Two-level client island loader (ADR-020, ADR-028). This map holds one entry per category;
 * each category module (islands/{category}.tsx) maps calculator id → its own island chunk.
 * A page downloads this small map, its category's map and its island, so adding calculators
 * to one category does not grow every other calculator page. Server code renders
 * <CalculatorIslandFor category=… id=…> and never imports island files.
 * Every module in registry.ts must have an entry in its category file (checked by the content gate).
 */
const CATEGORIES: Record<string, ByCategory> = {
  finance: dynamic(() => import('./islands/finance')),
  math: dynamic(() => import('./islands/math')),
  health: dynamic(() => import('./islands/health')),
  'date-time': dynamic(() => import('./islands/date-time')),
  conversion: dynamic(() => import('./islands/conversion')),
  education: dynamic(() => import('./islands/education')),
  everyday: dynamic(() => import('./islands/everyday')),
  geometry: dynamic(() => import('./islands/geometry')),
  statistics: dynamic(() => import('./islands/statistics')),
  physics: dynamic(() => import('./islands/physics')),
  electronics: dynamic(() => import('./islands/electronics')),
  chemistry: dynamic(() => import('./islands/chemistry')),
  construction: dynamic(() => import('./islands/construction')),
};

export function CalculatorIslandFor({
  category,
  ...props
}: IslandProps & { id: string; category: string }) {
  const Islands = CATEGORIES[category];
  return Islands ? <Islands {...props} /> : null;
}
