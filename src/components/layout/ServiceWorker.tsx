'use client';

import { useEffect } from 'react';

/** Registers the offline service worker (public/sw.js) in production builds only. */
export function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js').catch(() => {
      /* offline support is an enhancement; the site works without it */
    });
  }, []);
  return null;
}
