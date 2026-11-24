#!/usr/bin/env node
/**
 * Refresh the US CPI-U annual averages used by the inflation calculator (`pnpm cpi`).
 * Source: U.S. Bureau of Labor Statistics public API v1, series CUUR0000SA0 (CPI for All Urban
 * Consumers, U.S. city average, all items, not seasonally adjusted, 1982–84 = 100). Annual averages
 * are BLS's own period M13 values. Without a key, v1 serves 10 years per request and about 25
 * requests a day; with a free registration key in BLS_API_KEY, v2 serves 20 years per request.
 * Runs are rare (once a year after January's release), so the file is committed and versioned.
 */
import { writeFileSync } from 'node:fs';

const SERIES = 'CUUR0000SA0';
const OUT = 'src/calculators/finance/inflation/cpi.json';
const first = 1913;
const last = new Date().getUTCFullYear();
const annual = {};
const key = process.env.BLS_API_KEY;
const span = key ? 20 : 10;
for (let start = first; start <= last; start += span) {
  const end = Math.min(start + span - 1, last);
  const res = await fetch(`https://api.bls.gov/publicAPI/${key ? 'v2' : 'v1'}/timeseries/data/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      seriesid: [SERIES],
      startyear: String(start),
      endyear: String(end),
      ...(key ? { registrationkey: key, annualaverage: true } : {}),
    }),
  });
  const body = await res.json();
  if (body.status !== 'REQUEST_SUCCEEDED') throw new Error(`BLS ${start}-${end}: ${body.message}`);
  for (const p of body.Results.series[0].data)
    if (p.period === 'M13' && p.value !== '-') annual[p.year] = Number(p.value);
}
const years = Object.keys(annual)
  .map(Number)
  .sort((a, b) => a - b);
if (years.length < 100 || years[0] !== first) {
  console.error(`Only ${years.length} annual averages received; keeping the existing file.`);
  process.exit(1);
}
writeFileSync(
  OUT,
  `${JSON.stringify(
    {
      series: SERIES,
      source:
        'U.S. Bureau of Labor Statistics, CPI-U U.S. city average, all items, 1982-84=100, annual averages',
      fetched: new Date().toISOString().slice(0, 10),
      first: years[0],
      last: years.at(-1),
      annual,
    },
    null,
    2,
  )}\n`,
);
console.log(`CPI-U annual averages ${years[0]}–${years.at(-1)} written to ${OUT}`);
