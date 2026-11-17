import type { Project } from "@/lib/projects";

// Small animated diagrams that stand in for screenshots. Each one sketches the
// idea behind the project using only theme colours.
const mono = { fontFamily: "var(--font-mono)" } as const;

function Duel() {
  const lanes = [
    { label: "you", w: 168, score: "14", accent: true, delay: "0s" },
    { label: "rival", w: 132, score: "11", accent: false, delay: "-1.2s" },
  ];
  return (
    <>
      <text x="160" y="62" textAnchor="middle" fontSize="34" fill="var(--fg)" style={mono}>
        17 × 6 = <tspan className="art-blink" fill="var(--accent)">?</tspan>
      </text>
      <text x="160" y="86" textAnchor="middle" fontSize="9" fill="var(--faint)" letterSpacing="2" style={mono}>
        SEED 0x5EED · Q 14 / 20
      </text>
      {lanes.map((l, i) => (
        <g key={l.label} transform={`translate(48 ${118 + i * 30})`}>
          <text y="9" fontSize="9" fill="var(--muted)" style={mono}>
            {l.label}
          </text>
          <rect x="40" width="190" height="10" rx="5" fill="var(--line)" />
          <rect
            x="40"
            width={l.w}
            height="10"
            rx="5"
            fill={l.accent ? "var(--accent)" : "var(--faint)"}
            className="art-grow"
            style={{ transformOrigin: "left", animationDelay: l.delay }}
          />
          <text x="240" y="9" fontSize="9" fill="var(--fg)" style={mono}>
            {l.score}
          </text>
        </g>
      ))}
    </>
  );
}

function Book() {
  const bids = [96, 74, 58, 82, 40, 28];
  const asks = [88, 62, 78, 46, 54, 22];
  return (
    <>
      {bids.map((w, i) => (
        <g key={i} transform={`translate(0 ${34 + i * 23})`}>
          <rect
            x={136 - w}
            width={w}
            height="14"
            rx="2"
            fill={i === 0 ? "var(--accent)" : "var(--fg)"}
            opacity={i === 0 ? 1 : 0.16 - i * 0.015}
            className="art-grow"
            style={{ transformOrigin: "right", animationDelay: `${-i * 0.4}s` }}
          />
          <rect
            x="184"
            width={asks[i]}
            height="14"
            rx="2"
            fill="var(--fg)"
            opacity={i === 0 ? 0.5 : 0.16 - i * 0.015}
            className="art-grow"
            style={{ transformOrigin: "left", animationDelay: `${-i * 0.55}s` }}
          />
          <text x="160" y="10.5" textAnchor="middle" fontSize="8" fill={i === 0 ? "var(--fg)" : "var(--faint)"} style={mono}>
            {60000 - i * 5}
          </text>
        </g>
      ))}
      <text x="136" y="22" textAnchor="end" fontSize="8" fill="var(--muted)" letterSpacing="1.5" style={mono}>
        BIDS
      </text>
      <text x="184" y="22" fontSize="8" fill="var(--muted)" letterSpacing="1.5" style={mono}>
        ASKS
      </text>
      <text x="160" y="184" textAnchor="middle" fontSize="8" fill="var(--accent)" letterSpacing="1.5" style={mono}>
        p50 31ns
      </text>
    </>
  );
}

function Graph() {
  const agents = ["git", "code", "profile"];
  return (
    <>
      {agents.map((a, i) => {
        const y = 50 + i * 50;
        return (
          <g key={a}>
            <path
              d={`M104 ${y} C 150 ${y}, 150 100, 196 100`}
              fill="none"
              stroke="var(--accent)"
              strokeWidth="1.2"
              className="art-dash"
              style={{ animationDelay: `${i * 0.35}s` }}
            />
            <rect x="40" y={y - 13} width="64" height="26" rx="13" fill="var(--card)" stroke="var(--line)" />
            <text x="72" y={y + 3} textAnchor="middle" fontSize="9" fill="var(--muted)" style={mono}>
              {a}
            </text>
          </g>
        );
      })}
      <circle cx="238" cy="100" r="40" fill="none" stroke="var(--line)" strokeWidth="5" />
      <circle
        cx="238"
        cy="100"
        r="40"
        fill="none"
        stroke="var(--accent)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray="218 251"
        transform="rotate(-90 238 100)"
      />
      <text x="238" y="106" textAnchor="middle" fontSize="24" fill="var(--fg)" style={mono}>
        87
      </text>
      <text x="238" y="120" textAnchor="middle" fontSize="7" fill="var(--faint)" letterSpacing="1.5" style={mono}>
        SCORE
      </text>
    </>
  );
}

function Pulse() {
  const rows = [
    { id: "NCT-0418", w: 150, on: true },
    { id: "NCT-2207", w: 112, on: false },
    { id: "NCT-0963", w: 78, on: false },
  ];
  return (
    <>
      <path
        d="M24 66 H92 l8 -6 8 6 h14 l7 -30 9 52 8 -22 h18 l8 -8 8 8 H296"
        fill="none"
        stroke="var(--accent)"
        strokeWidth="1.6"
        strokeLinejoin="round"
        className="art-dash"
      />
      {rows.map((r, i) => (
        <g key={r.id} transform={`translate(40 ${112 + i * 24})`}>
          <text y="9" fontSize="9" fill={r.on ? "var(--fg)" : "var(--muted)"} style={mono}>
            {r.id}
          </text>
          <rect x="64" y="1" width="160" height="8" rx="4" fill="var(--line)" />
          <rect x="64" y="1" width={r.w} height="8" rx="4" fill={r.on ? "var(--accent)" : "var(--faint)"} />
          <text x="234" y="9" fontSize="9" fill="var(--muted)" style={mono}>
            {r.on ? "match" : "review"}
          </text>
        </g>
      ))}
    </>
  );
}

function Funnel() {
  const stages = [
    { label: "19,830 drugs", w: 260 },
    { label: "mechanism gate ≥15%", w: 204 },
    { label: "trials · safety · market", w: 150 },
    { label: "shortlist", w: 84 },
  ];
  return (
    <>
      {stages.map((s, i) => (
        <g key={s.label} transform={`translate(${160 - s.w / 2} ${30 + i * 36})`}>
          <rect
            width={s.w}
            height="18"
            rx="3"
            fill={i === stages.length - 1 ? "var(--accent)" : "var(--fg)"}
            opacity={i === stages.length - 1 ? 1 : 0.14 + i * 0.05}
            className="art-grow"
            style={{ transformOrigin: "center", animationDelay: `${-i * 0.5}s` }}
          />
          <text x={s.w / 2} y="12.5" textAnchor="middle" fontSize="8" fill={i === stages.length - 1 ? "var(--bg)" : "var(--muted)"} style={mono}>
            {s.label}
          </text>
        </g>
      ))}
      <text x="160" y="186" textAnchor="middle" fontSize="8" fill="var(--accent)" letterSpacing="1.5" style={mono}>
        10 AGENTS · 811× CACHE SPEEDUP
      </text>
    </>
  );
}

const ART = { duel: Duel, book: Book, graph: Graph, pulse: Pulse, funnel: Funnel };

export default function ProjectArt({ kind, title }: { kind: NonNullable<Project["art"]>; title: string }) {
  const Art = ART[kind];
  return (
    <svg viewBox="0 0 320 200" role="img" aria-label={`Illustration for ${title}`} className="block w-full">
      <Art />
    </svg>
  );
}
