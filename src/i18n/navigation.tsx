import NextLink from 'next/link';
import type { ComponentProps } from 'react';
import { getLocale } from 'next-intl/server';

/**
 * Locale-prefixing Link for Server Components: `<Link href="/about">` → `/en/about`.
 * Implemented server-side so next-intl (and its ICU runtime) never ships to the browser.
 */
export async function Link({
  href,
  ...rest
}: Omit<ComponentProps<typeof NextLink>, 'href'> & { href: string }) {
  const locale = await getLocale();
  const path =
    href === '/' ? `/${locale}` : `/${locale}${href.startsWith('/') ? href : `/${href}`}`;
  return <NextLink href={path} prefetch={false} {...rest} />;
}
