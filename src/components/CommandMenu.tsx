"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { site } from "@/data/site";
import { toggleTheme } from "./ThemeToggle";
import { SearchIcon } from "./icons";

type Item = { group: string; label: string; hint?: string; run: () => void };

export const OPEN_COMMAND_MENU = "open-command-menu";

export default function CommandMenu({ posts }: { posts: { slug: string; title: string }[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);
  const opener = useRef<Element | null>(null);

  const items = useMemo<Item[]>(() => {
    const go = (href: string) => () => router.push(href);
    const ext = (href: string) => () => window.open(href, "_blank", "noopener");
    const list: Item[] = [
      { group: "Go to", label: "Home", run: go("/") },
      { group: "Go to", label: "Projects", run: go("/#projects") },
      { group: "Go to", label: "Blog", run: go("/blog") },
      { group: "Go to", label: "Contact", run: go("/#contact") },
      ...posts.map((p) => ({ group: "Posts", label: p.title, run: go(`/blog/${p.slug}`) })),
      { group: "Actions", label: "Toggle theme", run: () => toggleTheme() },
      {
        group: "Actions",
        label: "Copy email address",
        hint: site.email,
        run: () => void navigator.clipboard?.writeText(site.email),
      },
      { group: "Links", label: "GitHub", hint: "↗", run: ext(site.socials.github) },
    ];
    if (site.socials.linkedin) list.push({ group: "Links", label: "LinkedIn", hint: "↗", run: ext(site.socials.linkedin) });
    if (site.socials.x) list.push({ group: "Links", label: "X", hint: "↗", run: ext(site.socials.x) });
    if (site.resume) list.push({ group: "Links", label: "Résumé", hint: "↗", run: ext(site.resume) });
    return list;
  }, [posts, router]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? items.filter((i) => `${i.label} ${i.group}`.toLowerCase().includes(q)) : items;
  }, [items, query]);

  useEffect(() => {
    const show = () => {
      opener.current = document.activeElement;
      setQuery("");
      setActive(0);
      setOpen(true);
    };
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => {
          if (!o) show();
          return !o;
        });
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_COMMAND_MENU, show);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_COMMAND_MENU, show);
    };
  }, []);

  useEffect(() => {
    if (!open) (opener.current as HTMLElement | null)?.focus?.();
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  useEffect(() => {
    listRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: "nearest" });
  }, [active]);

  if (!open) return null;

  const choose = (item?: Item) => {
    if (!item) return;
    setOpen(false);
    item.run();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-bg/70 px-4 pt-[14vh] backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command menu"
        className="rise w-full max-w-md overflow-hidden rounded-2xl border border-line bg-card shadow-2xl shadow-black/20"
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
          else if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive((a) => (a + 1) % Math.max(1, results.length));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((a) => (a - 1 + results.length) % Math.max(1, results.length));
          } else if (e.key === "Enter") choose(results[active]);
        }}
      >
        <div className="flex items-center gap-3 border-b border-line px-4">
          <SearchIcon className="shrink-0 text-faint" />
          <input
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            placeholder="Search pages, posts, actions…"
            aria-label="Search"
            className="h-12 w-full bg-transparent text-[15px] outline-none placeholder:text-faint"
          />
          <kbd className="rounded border border-line px-1.5 py-0.5 font-mono text-[10px] text-faint">esc</kbd>
        </div>
        <ul ref={listRef} role="listbox" className="max-h-80 overflow-y-auto p-2">
          {results.length === 0 && <li className="px-3 py-6 text-center text-sm text-muted">Nothing matches “{query}”.</li>}
          {results.map((item, i) => (
            <li key={item.group + item.label} role="presentation">
              {(i === 0 || results[i - 1].group !== item.group) && (
                <div className="px-3 pb-1 pt-3 font-mono text-[10px] uppercase tracking-widest text-faint">{item.group}</div>
              )}
              <button
                type="button"
                role="option"
                aria-selected={i === active}
                onMouseEnter={() => setActive(i)}
                onClick={() => choose(item)}
                className="flex w-full items-center justify-between gap-4 rounded-lg px-3 py-2 text-left text-sm aria-selected:bg-line/60"
              >
                <span className="truncate">{item.label}</span>
                {item.hint && <span className="shrink-0 font-mono text-xs text-faint">{item.hint}</span>}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
