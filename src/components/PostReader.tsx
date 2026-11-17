"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { ArrowUpRight } from "./icons";

/**
 * A reading panel that slides in over the current page when a post is opened
 * from inside the site. The address bar still changes to /blog/<slug>, so the
 * post can be shared; closing (✕, Esc, or clicking outside) goes back, leaving
 * the reader exactly where they were. Opening the link directly shows the
 * full post page instead.
 */
export default function PostReader({ slug, children }: { slug: string; children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const panel = useRef<HTMLDivElement>(null);
  const open = pathname === `/blog/${slug}`;

  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    const scrollbar = innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = `${scrollbar}px`; // no layout jump when the scrollbar hides
    panel.current?.focus();
    panel.current?.scrollTo({ top: 0 });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") router.back();
    };
    addEventListener("keydown", onKey);
    return () => {
      removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
      opener?.focus?.();
    };
  }, [open, router]);

  // The slot keeps its last page after other navigations; only show while this post is the URL.
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex justify-end bg-bg/60 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && router.back()}
    >
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="reader-title"
        tabIndex={-1}
        className="reader-panel h-full w-full max-w-[860px] overflow-y-auto border-l border-line bg-bg shadow-2xl shadow-black/40 outline-none"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-line bg-bg/90 px-5 py-3 backdrop-blur sm:px-10">
          <p className="font-mono text-xs uppercase tracking-widest text-faint">Reading</p>
          <div className="flex items-center gap-2">
            {/* A plain link (not next/link) so it loads the full page rather than this panel. */}
            <a
              href={`/blog/${slug}`}
              className="flex h-11 items-center gap-1.5 rounded-full px-3 text-sm text-muted transition-colors hover:text-fg sm:h-9"
            >
              Open as page <ArrowUpRight width={13} height={13} />
            </a>
            <button
              type="button"
              onClick={() => router.back()}
              aria-label="Close and return"
              className="grid size-11 place-items-center rounded-full border border-line text-muted transition-colors hover:border-faint hover:text-fg sm:size-9"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </div>
        </div>
        <div className="px-5 pb-16 pt-10 sm:px-10">{children}</div>
      </div>
    </div>
  );
}
