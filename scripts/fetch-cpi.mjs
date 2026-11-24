#!/usr/bin/env node
/**
 * Refresh the US CPI-U annual averages used by the inflation calculator (`pnpm cpi`).
 * Source: U.S. Bureau of Labor Statistics public API v1, series CUUR0000SA0 (CPI for All Urban
 * Consumers, U.S. city average, all items, not seasonally adjusted, 1982–84 = 100). Annual averages
 * are BLS's period M13 values where the API returns them, otherwise the mean of the 12 monthly
 * indexes (BLS's own definition of the annual average), for complete years only. Without a key, v1 serves 10 years per request and about 25
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
  const months = {};
  for (const p of body.Results.series[0].data) {
    if (p.value === '-') continue;
    if (p.period === 'M13') annual[p.year] = Number(p.value);
    else if (/^M(0[1-9]|1[0-2])$/.test(p.period)) (months[p.year] ??= []).push(p.value);
  }
  // v1 omits annual averages (M13); BLS's annual average is the mean of the 12 monthly indexes,
  // rounded to 3 decimals. Only complete years are used.
  for (const [y, v] of Object.entries(months)) {
    if (y in annual || v.length !== 12) continue;
    // Published to the same precision as that year's monthly indexes (1 decimal before 2007).
    const dp = Math.max(...v.map((x) => (x.split('.')[1] ?? '').length));
    annual[y] = Number((v.reduce((a, b) => a + Number(b), 0) / 12).toFixed(dp));
  }
}
// The plain GET returns the latest three years including any published M13 annual averages,
// which covers recent years with a missing month (October 2025 was not collected).
{
  const res = await fetch(`https://api.bls.gov/publicAPI/v1/timeseries/data/${SERIES}`);
  const body = await res.json();
  if (body.status === 'REQUEST_SUCCEEDED')
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
