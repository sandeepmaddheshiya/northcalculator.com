import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { plexMono, plexSans } from '../fonts';
import { THEME_SCRIPT } from '@/lib/theme-script';

// Internal design review surface: never indexed, robots-blocked (BRIEF §7).
export const metadata: Metadata = {
  title: 'Design system · NorthCalculator',
  robots: { index: false, follow: false },
};

export default function DevLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={`${plexSans.variable} ${plexMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
