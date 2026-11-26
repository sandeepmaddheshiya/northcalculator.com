'use client';

import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';
import type { IslandProps } from '@/components/calc/CalculatorIsland';

/** date-time calculators: id → island chunk (ADR-028). Loaded only on date-time pages. */
const ISLANDS: Record<string, ComponentType<IslandProps>> = {
  age: dynamic(() => import('../date-time/age/Island')),
  'date-difference': dynamic(() => import('../date-time/date-difference/Island')),
  'date-add': dynamic(() => import('../date-time/date-add/Island')),
  time: dynamic(() => import('../date-time/time/Island')),
  'week-number': dynamic(() => import('../date-time/week-number/Island')),
  'business-days': dynamic(() => import('../date-time/business-days/Island')),
  'days-until': dynamic(() => import('../date-time/days-until/Island')),
  'hours-worked': dynamic(() => import('../date-time/hours-worked/Island')),
  'time-duration': dynamic(() => import('../date-time/time-duration/Island')),
  'time-zone': dynamic(() => import('../date-time/time-zone/Island')),
};

export default function Islands({ id, ...props }: IslandProps & { id: string }) {
  const Island = ISLANDS[id];
  return Island ? <Island {...props} /> : null;
}
