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

type Day = { date: string; count: number; level: number };

/** GitHub contribution heatmap. Only mounted when `site.showGithubActivity` is on. */
export function GithubActivity() {
  const [data, setData] = useState<{ days: Day[]; total: number } | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetch(`https://github-contributions-api.jogruber.de/v4/${site.handle}?y=last`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((j) => setData({ days: j.contributions, total: j.total?.lastYear ?? 0 }))
      .catch(() => setFailed(true));
  }, []);

  if (failed) return null;
  const days = data?.days ?? Array.from({ length: 371 }, () => ({ date: "", count: 0, level: 0 }));
  const offset = data ? new Date(data.days[0].date + "T00:00:00Z").getUTCDay() : 0;

  return (
    <div className="mt-6 rounded-2xl border border-line bg-card p-4">
      <div className="overflow-x-auto pb-1">
        <div className="grid w-max grid-flow-col grid-rows-7 gap-[3px]">
          {Array.from({ length: offset }, (_, i) => (
            <span key={`pad${i}`} className="size-[10px]" />
          ))}
          {days.map((d, i) => (
            <span
              key={i}
              title={d.date ? `${d.count} on ${d.date}` : undefined}
              className="size-[10px] rounded-[2px]"
              style={{
                background: d.level
                  ? `color-mix(in oklab, var(--accent) ${d.level * 25}%, var(--line))`
                  : "var(--line)",
              }}
            />
          ))}
        </div>
      </div>
      <p className="mt-3 font-mono text-xs text-muted">
        {data ? `${data.total.toLocaleString("en-US")} contributions in the last year` : "Loading activity…"}
      </p>
    </div>
  );
}
