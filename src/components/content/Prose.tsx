import type { ReactNode } from 'react';

/** Long-form typography for explanation content. Measure ~68ch. */
export function Prose({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`max-w-[68ch] text-[17px] leading-[1.7] text-text marker:text-subtle [&_a]:text-brand [&_a]:underline [&_a]:underline-offset-4 [&_h2]:mt-12 [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:mt-8 [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold [&_li]:mt-1.5 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:ps-6 [&_p]:my-4 [&_strong]:font-semibold [&_ul]:my-4 [&_ul]:list-disc [&_ul]:ps-6 ${className}`}
    >
      {children}
    </div>
  );
}
