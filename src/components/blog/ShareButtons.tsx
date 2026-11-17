"use client";

import { useState } from "react";
import { LinkedinIcon, XIcon } from "../icons";

/** Copy link, share to X, share to LinkedIn. Uses the page's own URL. */
export default function ShareButtons({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  const url = () => location.href.split("#")[0];
  const open = (href: string) => window.open(href, "_blank", "noopener,width=640,height=560");
  const btn =
    "flex h-11 items-center gap-2 rounded-full border border-line bg-card px-4 text-sm text-muted transition-colors hover:border-faint hover:text-fg sm:h-9";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 font-mono text-xs uppercase tracking-widest text-faint">Share</span>
      <button
        type="button"
        className={btn}
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url());
            setCopied(true);
            setTimeout(() => setCopied(false), 1600);
          } catch {}
        }}
      >
        <span aria-live="polite">{copied ? "Link copied" : "Copy link"}</span>
      </button>
      <button
        type="button"
        className={btn}
        aria-label="Share on X (opens a new window)"
        onClick={() => open(`https://x.com/intent/post?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url())}`)}
      >
        <XIcon width={14} height={14} /> X
      </button>
      <button
        type="button"
        className={btn}
        aria-label="Share on LinkedIn (opens a new window)"
        onClick={() => open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url())}`)}
      >
        <LinkedinIcon width={14} height={14} /> LinkedIn
      </button>
    </div>
  );
}
