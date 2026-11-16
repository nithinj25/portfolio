"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { site } from "@/data/site";
import { OPEN_COMMAND_MENU } from "./CommandMenu";
import ThemeToggle from "./ThemeToggle";
import { SearchIcon } from "./icons";

// `section` is the home page section that lights this link up while it is in view.
const links = [
  { href: "/projects", label: "Projects", section: "projects" },
  { href: "/blog", label: "Blog", section: "blog" },
];

export default function Nav() {
  const pathname = usePathname();
  const [inView, setInView] = useState<string | null>(null);

  // Scroll-spy on the home page: track which linked section crosses the middle band.
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
        setInView(links.find((l) => visible.has(l.section))?.section ?? null);
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
    <header className="sticky top-0 z-40">
      {/* Only the bar itself is frosted, so the backdrop stays visible on either side of it. */}
      <nav
        aria-label="Main"
        className="mx-auto flex h-14 max-w-[840px] items-center justify-between rounded-b-2xl bg-bg/80 px-10 backdrop-blur-md max-[880px]:rounded-none max-[880px]:px-5"
      >
        <Link href="/" className="font-serif text-xl italic tracking-tight" aria-label={`${site.name}, home`}>
          {site.name.toLowerCase()}
          <span className="text-accent">.</span>
        </Link>
        <div className="flex items-center gap-1">
          {links.map((l) => {
            const onPage = pathname.startsWith(l.href);
            const active = onPage || inView === l.section;
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={onPage ? "page" : undefined}
                data-active={active}
                className="relative rounded-full px-3 py-1.5 text-sm text-muted transition-colors after:absolute after:inset-x-3 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-accent after:transition-transform after:duration-300 hover:text-fg data-[active=true]:text-fg data-[active=true]:after:scale-x-100"
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
            className="ml-1 flex h-8 items-center gap-2 rounded-full border border-line px-2.5 text-muted transition-colors hover:border-faint hover:text-fg"
          >
            <SearchIcon width={14} height={14} />
            <kbd className="hidden font-mono text-[10px] sm:inline">Ctrl K</kbd>
          </button>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
