/**
 * Seeded pseudo-random numbers for the random number and dice tools.
 *
 * Generator: xoshiro128** 1.1 (Blackman & Vigna, "Scrambled linear pseudorandom number generators",
 * ACM TOMS 2021), verified against the reference implementation's test vector. The seed comes from
 * crypto.getRandomValues in the browser (W3C Web Cryptography API) and is kept in the page URL, so
 * a shared link reproduces the same draw. Integers in a range use rejection sampling, so every
 * value is exactly equally likely (no modulo bias).
 */
export type Rng = () => number; // uniform 32-bit unsigned integers

const rotl = (x: number, k: number) => ((x << k) | (x >>> (32 - k))) >>> 0;

export function xoshiro128ss(state: [number, number, number, number]): Rng {
  const s = state.map((x) => x >>> 0) as [number, number, number, number];
  return () => {
    const result = Math.imul(rotl(Math.imul(s[1], 5) >>> 0, 7), 9) >>> 0;
    const t = (s[1] << 9) >>> 0;
    s[2] = (s[2] ^ s[0]) >>> 0;
    s[3] = (s[3] ^ s[1]) >>> 0;
    s[1] = (s[1] ^ s[2]) >>> 0;
    s[0] = (s[0] ^ s[3]) >>> 0;
    s[2] = (s[2] ^ t) >>> 0;
    s[3] = rotl(s[3], 11);
    return result;
  };
}

/** SplitMix32-style mixing to turn any seed text into a non-zero 128-bit state. */
export function stateFromSeed(seed: string): [number, number, number, number] {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 0x01000193) >>> 0;
  const out: number[] = [];
  for (let i = 0; i < 4; i++) {
    h = (h + 0x9e3779b9) >>> 0;
    let z = h;
    z = Math.imul(z ^ (z >>> 16), 0x85ebca6b) >>> 0;
    z = Math.imul(z ^ (z >>> 13), 0xc2b2ae35) >>> 0;
    out.push((z ^ (z >>> 16)) >>> 0);
  }
  if (!out.some((x) => x !== 0)) out[0] = 1;
  return out as [number, number, number, number];
}

/** Uniform integer in [0, n) by rejection sampling, n ≤ 2³². */
export function uniformBelow(rng: Rng, n: number): number {
  const limit = Math.floor(4294967296 / n) * n;
  let x = rng();
  while (x >= limit) x = rng();
  return x % n;
}

/** A fresh random seed (browser only). */
export function newSeed(): string {
  const a = new Uint32Array(4);
  crypto.getRandomValues(a);
  return [...a].map((x) => x.toString(16).padStart(8, '0')).join('');
}
