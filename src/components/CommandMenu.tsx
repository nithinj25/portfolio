"use client";

import { Command } from "cmdk";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { site } from "@/data/site";
import { toggleTheme } from "./ThemeToggle";
import { SearchIcon } from "./icons";

export const OPEN_COMMAND_MENU = "open-command-menu";

// Home page sections, in page order. `id` matches the section's id attribute.
const SECTIONS = [
  { id: "about", label: "About" },
  { id: "stack", label: "Stack" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "achievements", label: "Achievements" },
  { id: "blog", label: "Blog" },
  { id: "contact", label: "Contact" },
];

type Props = {
  posts: { slug: string; title: string }[];
  projects: { slug: string; title: string; tagline: string }[];
};

const itemCls =
  "flex cursor-pointer items-center justify-between gap-4 rounded-lg px-3 py-2 text-sm data-[selected=true]:bg-line/70";

export default function CommandMenu({ posts, projects }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const opener = useRef<Element | null>(null);

  useEffect(() => {
    const show = () => {
      opener.current = document.activeElement;
      setOpen(true);
    };
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (document.querySelector("[data-command-menu]")) setOpen(false);
        else show();
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
    document.body.style.overflow = open ? "hidden" : "";
    if (!open) (opener.current as HTMLElement | null)?.focus?.();
  }, [open]);

  if (!open) return null;

  /** Close, then do the thing. */
  const run = (fn: () => void) => () => {
    setOpen(false);
    fn();
  };
  const go = (href: string) => run(() => router.push(href));
  const ext = (href: string) => run(() => window.open(href, "_blank", "noopener"));
  const jump = (id: string) =>
    run(() => {
      const el = pathname === "/" ? document.getElementById(id) : null;
      if (el) {
        const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
        // Wait a frame so the page is scrollable again after the menu closes.
        requestAnimationFrame(() => el.scrollIntoView({ behavior: reduce ? "auto" : "smooth" }));
      } else router.push(`/#${id}`);
    });

  return (
    <div
      data-command-menu
      className="fixed inset-0 z-50 flex items-start justify-center bg-bg/70 px-4 pt-[14vh] backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}
    >
      <Command
        label="Command menu"
        loop
        role="dialog"
        aria-modal="true"
        className="rise w-full max-w-md overflow-hidden rounded-2xl border border-line bg-card shadow-2xl shadow-black/20"
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
          if (e.key === "Tab") e.preventDefault(); // keep focus inside; arrows move through items
        }}
      >
        <div className="flex items-center gap-3 border-b border-line px-4">
          <SearchIcon className="shrink-0 text-faint" />
          <Command.Input
            autoFocus
            placeholder="Jump to a section, project or post…"
            className="h-12 w-full bg-transparent text-[15px] outline-none placeholder:text-faint"
          />
          <kbd className="rounded border border-line px-1.5 py-0.5 font-mono text-[10px] text-faint">esc</kbd>
        </div>

        <Command.List className="max-h-80 overflow-y-auto p-2">
          <Command.Empty className="px-3 py-6 text-center text-sm text-muted">Nothing matches that.</Command.Empty>

          <Command.Group heading="Sections">
            {SECTIONS.map((s) => (
              <Command.Item key={s.id} value={`section ${s.label}`} onSelect={jump(s.id)} className={itemCls}>
                {s.label}
              </Command.Item>
            ))}
          </Command.Group>

          <Command.Group heading="Pages">
            <Command.Item value="page home" onSelect={go("/")} className={itemCls}>
              Home
            </Command.Item>
            <Command.Item value="page all projects" onSelect={go("/projects")} className={itemCls}>
              All projects
            </Command.Item>
            <Command.Item value="page all posts blog" onSelect={go("/blog")} className={itemCls}>
              All posts
            </Command.Item>
          </Command.Group>

          <Command.Group heading="Projects">
            {projects.map((p) => (
              <Command.Item
                key={p.slug}
                value={`project ${p.title}`}
                keywords={[p.tagline]}
                onSelect={go(`/projects/${p.slug}`)}
                className={itemCls}
              >
                {p.title}
              </Command.Item>
            ))}
          </Command.Group>

          {posts.length > 0 && (
            <Command.Group heading="Posts">
              {posts.map((p) => (
                <Command.Item key={p.slug} value={`post ${p.title}`} onSelect={go(`/blog/${p.slug}`)} className={itemCls}>
                  <span className="truncate">{p.title}</span>
                </Command.Item>
              ))}
            </Command.Group>
          )}

          <Command.Group heading="Actions">
            <Command.Item value="toggle theme dark light" onSelect={run(() => toggleTheme())} className={itemCls}>
              Toggle theme
            </Command.Item>
            <Command.Item
              value="copy email address"
              onSelect={run(() => void navigator.clipboard?.writeText(site.email))}
              className={itemCls}
            >
              Copy email
              <span className="shrink-0 font-mono text-xs text-faint">{site.email}</span>
            </Command.Item>
            <Command.Item value="open github" onSelect={ext(site.socials.github)} className={itemCls}>
              Open GitHub <span className="font-mono text-xs text-faint">↗</span>
            </Command.Item>
            {site.socials.linkedin && (
              <Command.Item value="open linkedin" onSelect={ext(site.socials.linkedin)} className={itemCls}>
                Open LinkedIn <span className="font-mono text-xs text-faint">↗</span>
              </Command.Item>
            )}
            {site.socials.x && (
              <Command.Item value="open x twitter" onSelect={ext(site.socials.x)} className={itemCls}>
                Open X <span className="font-mono text-xs text-faint">↗</span>
              </Command.Item>
            )}
            {site.resume && (
              <Command.Item value="open resume cv" onSelect={ext(site.resume)} className={itemCls}>
                Open résumé <span className="font-mono text-xs text-faint">↗</span>
              </Command.Item>
            )}
          </Command.Group>
        </Command.List>
      </Command>
    </div>
  );
}
