import Link from 'next/link';
import type { Metadata } from 'next';
import { plexMono, plexSans } from './fonts';
import { THEME_SCRIPT } from '@/lib/theme-script';
import en from '../../messages/en.json';

export const metadata: Metadata = { title: en.notFound.title, robots: { index: false } };

// Global 404 (Cloudflare Pages serves out/404.html with a real 404 status).
export default function NotFound() {
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
      <body className="min-h-dvh">
        <main className="mx-auto max-w-2xl px-4 py-24 sm:px-6">
          <p className="num text-subtle font-mono text-sm">404</p>
          <h1 className="mt-2 text-3xl font-semibold">{en.notFound.title}</h1>
          <p className="text-muted mt-4 text-lg">{en.notFound.body}</p>
          <Link
            href="/en"
            className="text-brand mt-8 inline-block font-medium underline underline-offset-4"
          >
            {en.notFound.back}
          </Link>
        </main>
      </body>
    </html>
  );
}
