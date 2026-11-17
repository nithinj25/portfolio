"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { site } from "@/data/site";
import { OPEN_COMMAND_MENU } from "./CommandMenu";
import ThemeToggle from "./ThemeToggle";
import { SearchIcon } from "./icons";

// `section` is the home page section that lights a link up while it is in view.
// Links whose href starts with "/#" jump to a section; the others open a page.
// `wide` links are hidden on small screens to keep the bar from crowding.
const links = [
  { href: "/#experience", label: "Experience", section: "experience", wide: true },
  { href: "/projects", label: "Projects", section: "projects", wide: false },
  { href: "/blog", label: "Blog", section: "blog", wide: false },
  { href: "/#contact", label: "Contact", section: "contact", wide: true },
];

export default function Nav() {
  const pathname = usePathname();
  const [inView, setInView] = useState<string | null>(null);

  // Scroll-spy on the home page: the last linked section to cross the middle band wins.
  useEffect(() => {
    setInView(null);
    if (pathname !== "/") return;
    const visible = new Set<string>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.add(e.target.id);
          else visible.delete(e.target.id);
        }
        setInView([...links].reverse().find((l) => visible.has(l.section))?.section ?? null);
      },
      { rootMargin: "-35% 0px -55% 0px" },
    );
    for (const l of links) {
      const el = document.getElementById(l.section);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, [pathname]);

  return (
    // A floating pill, the same width as the content below it.
    <header className="sticky top-3 z-40 px-5">
      <nav
        aria-label="Main"
        className="mx-auto flex h-12 max-w-[880px] items-center justify-between rounded-full border border-line bg-card/75 pl-5 pr-2 shadow-[0_10px_30px_-20px_rgba(0,0,0,0.6)] backdrop-blur-md"
      >
        <Link href="/" className="font-serif text-xl italic tracking-tight" aria-label={`${site.name}, home`}>
          {site.name.toLowerCase()}
          <span className="text-accent">.</span>
        </Link>
        <div className="flex items-center gap-0.5">
          {links.map((l) => {
            const onPage = !l.href.startsWith("/#") && pathname.startsWith(l.href);
            const active = onPage || inView === l.section;
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={onPage ? "page" : undefined}
                data-active={active}
                className={`relative rounded-full px-3 py-3 text-sm sm:py-1.5 text-muted transition-colors after:absolute after:inset-x-3 after:bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-accent after:transition-transform after:duration-300 hover:text-fg data-[active=true]:text-fg data-[active=true]:after:scale-x-100 ${
                  l.wide ? "hidden sm:block" : ""
                }`}
              >
                {l.label}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event(OPEN_COMMAND_MENU))}
            aria-label="Open command menu"
            aria-keyshortcuts="Control+K Meta+K"
            className="ml-2 flex h-11 items-center gap-2 sm:h-8 rounded-full border border-line px-2.5 text-muted transition-colors hover:border-faint hover:text-fg"
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
