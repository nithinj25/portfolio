"use client";

import { useEffect, useState } from "react";
import type { Heading } from "@/lib/posts";

/** "On this page": the post's sections, with the one you are reading highlighted. */
export default function TableOfContents({ headings }: { headings: Heading[] }) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const els = headings.map((h) => document.getElementById(h.id)).filter((e): e is HTMLElement => Boolean(e));
    let frame = 0;
    const update = () => {
      // The last heading that has passed the top third of the screen.
      let current: string | null = null;
      for (const el of els) if (el.getBoundingClientRect().top < innerHeight * 0.33) current = el.id;
      setActive(current);
    };
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    update();
    addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, [headings]);

  if (headings.length < 2) return null;
  return (
    <nav aria-label="On this page">
      <p className="font-mono text-xs uppercase tracking-widest text-faint">On this page</p>
      <ol className="mt-4 space-y-1 border-l border-line">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              aria-current={active === h.id ? "location" : undefined}
              className={`-ml-px block border-l py-1.5 text-sm leading-snug transition-colors ${h.level === 3 ? "pl-7" : "pl-4"} ${
                active === h.id ? "border-accent text-fg" : "border-transparent text-muted hover:text-fg"
              }`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
