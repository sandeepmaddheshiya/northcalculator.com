import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { resolveLocale } from '@/i18n/server';
import { getLocaleConfig } from '@/i18n/locales';
import { plexMono, plexSans } from '../../fonts';
import { SITE } from '@/lib/site';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// Embeds are frames on other sites: never indexed (the canonical page is), no site chrome.
export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  robots: { index: false, follow: true },
};

export default async function EmbedLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const locale = resolveLocale((await params).locale);
  setRequestLocale(locale);
  const config = getLocaleConfig(locale)!;
  return (
    <html lang={locale} dir={config.dir} className={`${plexSans.variable} ${plexMono.variable}`}>
      <body className="bg-bg">{children}</body>
    </html>
  );
}
