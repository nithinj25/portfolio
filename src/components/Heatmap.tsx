"use client";

import { useEffect, useState } from "react";
import { site } from "@/data/site";
import { GithubIcon, CodeIcon } from "./icons";

// A year-long activity heatmap card, GitHub-style: 53 weeks × 7 days.
//
// Until an account is linked in src/data/site.ts the card is a placeholder:
// an empty grid with a TODO label. No fake activity is drawn.
//
//   GitHub    set `showGithubActivity: true` (uses `handle`)
//   LeetCode  set `leetcode: "<username>"`; the data loader is still a TODO
type Day = { date: string; count: number; level: number };
type Source = "github" | "leetcode";

const WEEKS = 53;
const META = {
  github: { name: "GitHub", unit: "contributions", Icon: GithubIcon },
  leetcode: { name: "LeetCode", unit: "submissions", Icon: CodeIcon },
};

export default function Heatmap({ source }: { source: Source }) {
  const { name, unit, Icon } = META[source];
  const handle = source === "github" ? (site.showGithubActivity ? site.handle : "") : site.leetcode;
  const profile = source === "github" ? `https://github.com/${handle}` : `https://leetcode.com/u/${handle}`;

  const [data, setData] = useState<{ days: Day[]; total: number } | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!handle || source !== "github") return; // TODO: LeetCode loader, once a username is set
    fetch(`https://github-contributions-api.jogruber.de/v4/${handle}?y=last`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((j) => setData({ days: j.contributions, total: j.total?.lastYear ?? 0 }))
      .catch(() => setFailed(true));
  }, [handle, source]);

  const linked = Boolean(handle) && source === "github" && !failed;
  const days: Day[] = data?.days ?? Array.from({ length: WEEKS * 7 }, () => ({ date: "", count: 0, level: 0 }));
  const offset = data ? new Date(data.days[0].date + "T00:00:00Z").getUTCDay() : 0;

  return (
    <div className={`rounded-2xl border bg-card p-5 ${linked ? "border-line" : "border-dashed border-faint"}`}>
      <div className="flex items-center justify-between gap-4">
        <h3 className="flex items-center gap-2 font-medium tracking-tight">
          <Icon className="text-muted" /> {name}
        </h3>
        {linked ? (
          <a href={profile} target="_blank" rel="noreferrer" className="link font-mono text-xs text-muted hover:text-accent">
            @{handle}
          </a>
        ) : (
          <span className="font-mono text-xs text-faint">TODO: link your {name}</span>
        )}
      </div>

      <div className="relative mt-4">
        <div className="overflow-x-auto pb-1">
          <div className={`grid min-w-[680px] grid-flow-col grid-rows-7 gap-[3px] [grid-auto-columns:minmax(0,1fr)] ${linked ? "" : "opacity-60"}`}>
            {Array.from({ length: offset }, (_, i) => (
              <span key={`pad${i}`} className="aspect-square" />
            ))}
            {days.map((d, i) => (
              <span
                key={i}
                title={d.date ? `${d.count} on ${d.date}` : undefined}
                className="aspect-square rounded-[3px]"
                style={{ background: d.level ? `color-mix(in oklab, var(--accent) ${d.level * 25}%, var(--line))` : "var(--line)" }}
              />
            ))}
          </div>
        </div>
        {!linked && (
          <p className="pointer-events-none absolute inset-0 grid place-items-center px-3 text-center">
            <span className="max-w-full rounded-lg border border-dashed border-faint bg-card px-3 py-1.5 font-mono text-[11px] leading-relaxed text-muted">
              {failed ? `Could not load ${name} activity` : `Placeholder · add your ${name} in src/data/site.ts`}
            </span>
          </p>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 font-mono text-xs text-muted">
        <p>
          {linked ? (data ? `${data.total.toLocaleString("en-US")} ${unit} in the last year` : "Loading…") : `– ${unit} in the last year`}
        </p>
        <p className="flex items-center gap-1.5 text-faint" aria-hidden>
          Less
          {[0, 1, 2, 3, 4].map((l) => (
            <span
              key={l}
              className="size-[11px] rounded-[2px]"
              style={{ background: l ? `color-mix(in oklab, var(--accent) ${l * 25}%, var(--line))` : "var(--line)" }}
            />
          ))}
          More
        </p>
      </div>
    </div>
  );
}
