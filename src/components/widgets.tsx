"use client";

import { useEffect, useRef, useState, type ComponentProps } from "react";
import { site } from "@/data/site";

/** A card whose soft glow follows the cursor (see `.spot` in globals.css). */
export function Spotlight({ className = "", ...props }: ComponentProps<"div">) {
  return (
    <div
      {...props}
      className={`spot ${className}`}
      onPointerMove={(e) => {
        const b = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty("--mx", `${e.clientX - b.left}px`);
        e.currentTarget.style.setProperty("--my", `${e.clientY - b.top}px`);
      }}
    />
  );
}

/** Fades and slides its children up, once, the first time they scroll into view. */
export function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        el.classList.add("in");
        io.disconnect();
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`reveal ${className}`}>
      {children}
    </div>
  );
}

/** Current time where you live, e.g. "14:32 IST". Renders after mount to avoid a hydration mismatch. */
export function LocalTime() {
  const [now, setNow] = useState<string | null>(null);
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", { timeZone: site.timeZone, hour: "2-digit", minute: "2-digit" });
    const tick = () => setNow(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 15_000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="font-mono text-xs tabular-nums text-faint" suppressHydrationWarning>
      {now ? `${now} ${site.timeZoneLabel}` : " "}
    </span>
  );
}

export function CopyEmail({ className = "" }: { className?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className={className}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(site.email);
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        } catch {
          location.href = `mailto:${site.email}`;
        }
      }}
    >
      <span aria-live="polite">{copied ? "Copied to clipboard" : "Copy email"}</span>
    </button>
  );
}

/** Thin bar at the top of every page that fills as you scroll. */
export function ScrollProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      setP(max > 0 ? Math.min(1, scrollY / max) : 0);
    };
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5">
      <div className="h-full origin-left bg-accent" style={{ transform: `scaleX(${p})` }} />
    </div>
  );
}
