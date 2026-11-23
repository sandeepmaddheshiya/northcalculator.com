'use client';

/** Toggle RTL to preview mirrored layouts (BRIEF §8). */
export function GalleryControls() {
  return (
    <button
      type="button"
      className="border-line text-muted hover:text-text h-10 rounded-md border px-3 font-mono text-xs"
      onClick={() => {
        const el = document.documentElement;
        el.dir = el.dir === 'rtl' ? 'ltr' : 'rtl';
      }}
    >
      LTR / RTL
    </button>
  );
}
