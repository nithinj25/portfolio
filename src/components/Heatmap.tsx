import type { Calendar, Day } from "@/lib/activity";
import { CodeIcon, GithubIcon } from "./icons";

// A year-long activity heatmap card, GitHub-style: 53 weeks × 7 days.
// The data is fetched at build time (src/lib/activity.ts) and passed in.
// Without data the card is a placeholder: an empty grid with a label.
// No fake activity is drawn.
type Source = "github" | "leetcode";

const WEEKS = 53;
const META = {
  github: { name: "GitHub", unit: "contributions", Icon: GithubIcon, profile: (h: string) => `https://github.com/${h}` },
  leetcode: { name: "LeetCode", unit: "submissions", Icon: CodeIcon, profile: (h: string) => `https://leetcode.com/u/${h}/` },
};

export default function Heatmap({ source, handle, data }: { source: Source; handle: string; data: Calendar | null }) {
  const { name, unit, Icon, profile } = META[source];
  const linked = Boolean(handle && data);
  const days: Day[] = data?.days ?? Array.from({ length: WEEKS * 7 }, () => ({ date: "", count: 0, level: 0 }));
  const offset = data ? new Date(data.days[0].date + "T00:00:00Z").getUTCDay() : 0;

  return (
    <div className={`rounded-2xl border bg-card p-5 ${linked ? "border-line" : "border-dashed border-faint"}`}>
      <div className="flex items-center justify-between gap-4">
        <h3 className="flex items-center gap-2 font-medium tracking-tight">
          <Icon className="text-muted" /> {name}
        </h3>
        {handle ? (
          <a href={profile(handle)} target="_blank" rel="noreferrer" className="link font-mono text-xs text-muted hover:text-accent">
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
              {handle ? `Could not load ${name} activity right now` : `Placeholder · add your ${name} in src/data/site.ts`}
            </span>
          </p>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 font-mono text-xs text-muted">
        <p>{data ? `${data.total.toLocaleString("en-US")} ${unit} in the last year` : `– ${unit} in the last year`}</p>
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
