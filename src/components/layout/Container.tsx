import type { ReactNode } from 'react';

/** 8-pt grid container: 16px gutters on phones, 24px from 640px, 1240px max. */
export function Container({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-[1240px] px-4 sm:px-6 ${className}`}>{children}</div>
  );
}
