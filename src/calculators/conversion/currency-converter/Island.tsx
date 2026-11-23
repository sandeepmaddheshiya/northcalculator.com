'use client';

import { useEffect, useState } from 'react';
import { CalculatorIsland, type IslandProps } from '@/components/calc/CalculatorIsland';
import { definition, type RateData } from './definition';
import { compute } from './compute';

/**
 * Generic island plus a one-time refresh of the daily reference rates (ADR-007): the primary
 * provider, then the jsDelivr mirror, else the build-time snapshot already on the page.
 */
async function fetchRates(known: readonly string[]): Promise<RateData | null> {
  try {
    const r = await fetch('https://open.er-api.com/v6/latest/USD');
    const j = await r.json();
    if (j.result === 'success' && j.rates?.USD === 1)
      return {
        base: 'USD',
        time: j.time_last_update_unix,
        source: 'er-api',
        rates: pick(j.rates, known),
      };
  } catch {
    /* try the mirror */
  }
  try {
    const r = await fetch(
      'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.min.json',
    );
    const j = await r.json();
    const rates = Object.fromEntries(
      Object.entries(j.usd as Record<string, number>).map(([k, v]) => [k.toUpperCase(), v]),
    );
    if (rates.USD === 1)
      return {
        base: 'USD',
        time: Math.floor(Date.parse(`${j.date}T00:00:00Z`) / 1000),
        source: 'fawazahmed0',
        rates: pick(rates, known),
      };
  } catch {
    /* keep the snapshot */
  }
  return null;
}

function pick(rates: Record<string, number>, known: readonly string[]): Record<string, number> {
  return Object.fromEntries(
    known.filter((k) => typeof rates[k] === 'number' && rates[k]! > 0).map((k) => [k, rates[k]!]),
  );
}

export default function Island(props: IslandProps) {
  const snapshot = props.data as RateData;
  const [data, setData] = useState<RateData>(snapshot);
  useEffect(() => {
    let live = true;
    fetchRates(Object.keys(snapshot.rates)).then((fresh) => {
      // Only replace the snapshot with newer data that covers the same currencies.
      if (
        live &&
        fresh &&
        fresh.time >= snapshot.time &&
        Object.keys(fresh.rates).length >= Object.keys(snapshot.rates).length * 0.9
      )
        setData({ ...fresh, rates: { ...snapshot.rates, ...fresh.rates } });
    });
    return () => {
      live = false;
    };
  }, [snapshot]);
  return (
    <>
      <CalculatorIsland {...props} data={data} def={definition} compute={compute} />
      <p className="mt-3 text-xs text-subtle">
        {props.ui['attribution.pre']}{' '}
        <a
          href="https://www.exchangerate-api.com"
          rel="noopener"
          target="_blank"
          className="underline underline-offset-2"
        >
          ExchangeRate-API
        </a>
        . {props.ui['attribution.post']}
      </p>
    </>
  );
}
