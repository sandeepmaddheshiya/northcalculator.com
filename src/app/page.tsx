import { redirect } from 'next/navigation';
import { DEFAULT_LOCALE } from '@/i18n/locales';

// In production Cloudflare serves a 301 from public/_redirects before this file is reached.
export default function RootPage() {
  redirect(`/${DEFAULT_LOCALE}`);
}
