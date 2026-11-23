#!/usr/bin/env node
/**
 * Currency snapshot for the currency converter (ADR-007). Fetches daily reference rates from
 * ExchangeRate-API's open endpoint (fallback: the fawazahmed0 currency-api on jsDelivr) and
 * writes rates.snapshot.json, which is embedded at build time so the page renders a real result
 * without JavaScript. On any failure the existing snapshot is kept and the build continues.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const OUT = 'src/calculators/conversion/currency-converter/rates.snapshot.json';
const ISO = /^[A-Z]{3}$/;

async function primary() {
  const r = await fetch('https://open.er-api.com/v6/latest/USD', {
    signal: AbortSignal.timeout(15000),
  });
  const j = await r.json();
  if (j.result !== 'success' || j.base_code !== 'USD') throw new Error('unexpected response');
  return { base: 'USD', time: j.time_last_update_unix, source: 'er-api', rates: j.rates };
}

async function fallback() {
  const r = await fetch(
    'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.min.json',
    { signal: AbortSignal.timeout(15000) },
  );
  const j = await r.json();
  const rates = Object.fromEntries(Object.entries(j.usd).map(([k, v]) => [k.toUpperCase(), v]));
  return {
    base: 'USD',
    time: Math.floor(Date.parse(`${j.date}T00:00:00Z`) / 1000),
    source: 'fawazahmed0',
    rates,
  };
}

/** Keep ISO 4217 codes Intl knows (drops crypto and metals the fallback includes). */
function clean(snap) {
  const names = new Intl.DisplayNames(['en'], { type: 'currency' });
  const rates = {};
  for (const [k, v] of Object.entries(snap.rates).sort(([a], [b]) => a.localeCompare(b))) {
    if (!ISO.test(k) || typeof v !== 'number' || !(v > 0)) continue;
    if (names.of(k) === k) continue;
    rates[k] = v;
  }
  if (rates.USD !== 1 || Object.keys(rates).length < 100)
    throw new Error('snapshot looks incomplete');
  return { ...snap, rates };
}

let snap;
for (const get of [primary, fallback]) {
  try {
    snap = clean(await get());
    break;
  } catch (e) {
    console.warn(`rates: ${get.name} failed: ${e.message}`);
  }
}
if (!snap) {
  const old = JSON.parse(readFileSync(OUT, 'utf8'));
  console.warn(
    `rates: keeping the existing snapshot from ${new Date(old.time * 1000).toISOString()}`,
  );
} else {
  writeFileSync(OUT, JSON.stringify(snap) + '\n');
  console.log(
    `rates: ${Object.keys(snap.rates).length} currencies from ${snap.source}, updated ${new Date(snap.time * 1000).toISOString()}`,
  );
}
