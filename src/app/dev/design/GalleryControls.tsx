'use client';

/** Toggle RTL to preview mirrored layouts (BRIEF §8). */
export function GalleryControls() {
  return (
    <button
      type="button"
      className="h-10 rounded-md border border-line px-3 font-mono text-xs text-muted hover:text-text"
      onClick={() => {
        const el = document.documentElement;
        el.dir = el.dir === 'rtl' ? 'ltr' : 'rtl';
      }}
    >
      LTR / RTL
    </button>
  );
}
