'use client';

import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';
import type { IslandProps } from '@/components/calc/CalculatorIsland';

/** conversion calculators: id → island chunk (ADR-028). Loaded only on conversion pages. */
const ISLANDS: Record<string, ComponentType<IslandProps>> = {
  'unit-converter': dynamic(() => import('../conversion/unit-converter/Island')),
  'currency-converter': dynamic(() => import('../conversion/currency-converter/Island')),
  'length-converter': dynamic(() => import('../conversion/length-converter/Island')),
  'weight-converter': dynamic(() => import('../conversion/weight-converter/Island')),
  'temperature-converter': dynamic(() => import('../conversion/temperature-converter/Island')),
  'volume-converter': dynamic(() => import('../conversion/volume-converter/Island')),
  'area-converter': dynamic(() => import('../conversion/area-converter/Island')),
  'speed-converter': dynamic(() => import('../conversion/speed-converter/Island')),
  'pressure-converter': dynamic(() => import('../conversion/pressure-converter/Island')),
  'energy-converter': dynamic(() => import('../conversion/energy-converter/Island')),
  'data-converter': dynamic(() => import('../conversion/data-converter/Island')),
  'fuel-economy-converter': dynamic(() => import('../conversion/fuel-economy-converter/Island')),
  'power-converter': dynamic(() => import('../conversion/power-converter/Island')),
  'time-converter': dynamic(() => import('../conversion/time-converter/Island')),
};

export default function Islands({ id, ...props }: IslandProps & { id: string }) {
  const Island = ISLANDS[id];
  return Island ? <Island {...props} /> : null;
}
