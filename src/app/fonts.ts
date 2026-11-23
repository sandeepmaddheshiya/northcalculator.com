import { IBM_Plex_Mono, IBM_Plex_Sans } from 'next/font/google';

// ADR-014. Self-hosted at build time by next/font (no runtime requests to Google),
// with metric-matched fallbacks (adjustFontFallback) so swapping causes no layout shift.
export const plexSans = IBM_Plex_Sans({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-plex-sans',
  preload: true,
});

export const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--font-plex-mono',
  preload: false,
});
