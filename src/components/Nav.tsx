"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/data/site";
import { OPEN_COMMAND_MENU } from "./CommandMenu";
import ThemeToggle from "./ThemeToggle";
import { SearchIcon } from "./icons";

const links = [
  { href: "/projects", label: "Projects", match: "/projects" },
  { href: "/blog", label: "Blog", match: "/blog" },
];

export default function Nav() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-40 bg-bg/80 backdrop-blur-md">
      <nav aria-label="Main" className="mx-auto flex h-14 max-w-[680px] items-center justify-between px-5">
        <Link href="/" className="font-serif text-xl italic tracking-tight" aria-label={`${site.name}, home`}>
          {site.name.toLowerCase()}
          <span className="text-accent">.</span>
        </Link>
        <div className="flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={l.match && pathname.startsWith(l.match) ? "page" : undefined}
              className="rounded-full px-3 py-1.5 text-sm text-muted transition-colors hover:text-fg aria-[current=page]:text-fg"
            >
              {l.label}
            </Link>
          ))}
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event(OPEN_COMMAND_MENU))}
            aria-label="Open command menu"
            className="ml-1 flex h-8 items-center gap-2 rounded-full border border-line px-2.5 text-muted transition-colors hover:text-fg"
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
