import { resolveLocale } from '@/i18n/server';
import type { ReactNode } from 'react';
import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { getLocaleConfig } from '@/i18n/locales';
import { plexMono, plexSans } from '../fonts';
import { THEME_SCRIPT } from '@/lib/theme-script';
import { SITE } from '@/lib/site';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { ServiceWorker } from '@/components/layout/ServiceWorker';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  applicationName: SITE.name,
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '32x32' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.webmanifest',
  formatDetection: { telephone: false, address: false, email: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f6f8fb' },
    { media: '(prefers-color-scheme: dark)', color: '#08101c' },
  ],
};

// No NextIntlClientProvider: client islands receive pre-translated labels as props
// (src/i18n/labels.ts), so next-intl and its ICU runtime never ship to the browser.
export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const locale = resolveLocale((await params).locale);
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const config = getLocaleConfig(locale)!;

  return (
    <html
      lang={locale}
      dir={config.dir}
      className={`${plexSans.variable} ${plexMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="flex min-h-dvh flex-col">
        <SiteHeader locale={locale} />
        <div id="main" tabIndex={-1} className="flex-1 outline-none">
          {children}
        </div>
        <SiteFooter locale={locale} />
        <ServiceWorker />
      </body>
    </html>
  );
}
