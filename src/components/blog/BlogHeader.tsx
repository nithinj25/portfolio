"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { site } from "@/data/site";
import { OPEN_COMMAND_MENU } from "../CommandMenu";
import ThemeToggle from "../ThemeToggle";
import { ArrowLeft, SearchIcon } from "../icons";

/**
 * The blog's own header: back to the portfolio, the blog name, search and
 * theme. Like most reading sites it slides away while you scroll down and
 * comes back as soon as you scroll up.
 */
export default function BlogHeader() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let last = scrollY;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const y = scrollY;
        if (y > last + 6 && y > 140) setHidden(true);
        else if (y < last - 6 || y < 140) setHidden(false);
        last = y;
      });
    };
    addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      // Focusing anything inside brings the header back, so keyboard users never lose it.
      onFocusCapture={() => setHidden(false)}
      className={`sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur-md transition-transform duration-300 motion-reduce:transition-none ${
        hidden ? "-translate-y-full" : ""
      }`}
    >
      <nav aria-label="Blog" className="mx-auto flex h-14 max-w-[1320px] items-center justify-between gap-4 px-5">
        <div className="flex min-w-0 items-center gap-1">
          <Link
            href="/"
            className="flex h-11 items-center gap-2 rounded-full pr-3 text-sm text-muted transition-colors hover:text-fg sm:h-9"
            aria-label={`Back to ${site.name}'s portfolio`}
          >
            <ArrowLeft width={15} height={15} />
            <span className="hidden sm:inline">{site.name}</span>
          </Link>
          <span aria-hidden className="h-5 w-px bg-line" />
          <Link href="/blog" className="flex h-11 items-center px-3 font-serif text-xl italic tracking-tight sm:h-9">
            Notes<span className="text-accent">.</span>
          </Link>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event(OPEN_COMMAND_MENU))}
            aria-label="Search posts and pages"
            className="flex h-11 items-center gap-2 rounded-full border border-line px-3 text-muted transition-colors hover:border-faint hover:text-fg sm:h-8"
          >
            <SearchIcon width={14} height={14} />
            <kbd className="hidden font-mono text-[11px] sm:inline">Ctrl K</kbd>
          </button>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
