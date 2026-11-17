import Link from "next/link";
import { site } from "@/data/site";
import type { Project } from "@/lib/projects";
import ProjectArt from "./ProjectArt";
import { ArrowUpRight } from "./icons";
import { Spotlight } from "./widgets";

/**
 * Screenshot if there is one, else the project's diagram, else a marked TODO
 * slot. 16:10 with a fixed box, so nothing shifts. On cards (`capped`) the box
 * stops growing past a set height, so a full-width card on a mid-size screen
 * doesn't turn into a giant picture; the diagram stays centred inside it.
 */
export function ProjectMedia({ p, eager = false, capped = false }: { p: Project; eager?: boolean; capped?: boolean }) {
  return (
    <div className={`aspect-[16/10] w-full overflow-hidden bg-bg/60 ${capped ? "max-h-52 sm:max-h-60" : ""}`}>
      <div className="size-full transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transform-none">
        {p.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={p.image}
            alt={`Screenshot of ${p.title}`}
            width={1280}
            height={800}
            loading={eager ? "eager" : "lazy"}
            className="size-full object-cover"
          />
        ) : p.art ? (
          <ProjectArt kind={p.art} title={p.title} />
        ) : !site.showTodos ? (
          <div className="grid size-full place-items-center p-4">
            <p className="font-serif text-3xl italic text-faint">{p.title}</p>
          </div>
        ) : (
          <div className="grid size-full place-items-center p-4">
            <p className="rounded-lg border border-dashed border-faint px-3 py-2 text-center font-mono text-xs leading-relaxed text-faint">
              TODO: add screenshot
              <br />
              public/projects/{p.slug}.png
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export function ProjectLinks({ p }: { p: Project }) {
  const cls =
    "relative z-10 flex items-center gap-1 text-sm text-muted transition-colors hover:text-accent";
  return (
    <div className="flex items-center gap-4">
      {p.live && (
        <a href={p.live} target="_blank" rel="noreferrer" className={cls} aria-label={`${p.title} live site`}>
          Live <ArrowUpRight width={13} height={13} />
        </a>
      )}
      {p.source && (
        <a href={p.source} target="_blank" rel="noreferrer" className={cls} aria-label={`${p.title} on GitHub`}>
          GitHub <ArrowUpRight width={13} height={13} />
        </a>
      )}
    </div>
  );
}

export function TechTags({ tech }: { tech: string[] }) {
  return (
    <ul className="flex flex-wrap gap-1.5">
      {tech.map((t) => (
        <li key={t} className="rounded-full border border-line bg-card px-2.5 py-1 font-mono text-xs leading-none text-muted">
          {t}
        </li>
      ))}
    </ul>
  );
}

/** `wide`: media beside the text, for one standout card that spans the row. */
export default function ProjectCard({ p, wide = false }: { p: Project; wide?: boolean }) {
  return (
    <Spotlight className={`group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-card transition duration-300 ease-out hover:-translate-y-1 hover:border-accent/50 hover:shadow-[0_20px_50px_-28px_var(--accent)] has-[:focus-visible]:border-accent/50 motion-reduce:transform-none ${wide ? "sm:grid sm:grid-cols-[1.15fr_1fr]" : ""}`}>
      <div className={`border-b border-line ${wide ? "sm:flex sm:items-center sm:border-b-0 sm:border-r" : ""}`}>
        <div className="w-full">
          <ProjectMedia p={p} capped />
        </div>
      </div>
      <div className={`flex flex-1 flex-col p-5 ${wide ? "sm:p-7" : ""}`}>
        <div className="flex items-baseline justify-between gap-3">
          <h3 className={wide ? "font-serif text-3xl leading-tight tracking-tight" : "text-lg font-medium tracking-tight"}>
            {/* The ::after stretches this link over the whole card. */}
            <Link href={`/projects/${p.slug}`} className="after:absolute after:inset-0 after:content-['']">
              {p.title}
            </Link>
          </h3>
          <span className="flex shrink-0 items-center gap-2">
            {p.status && (
            <span
              className={`rounded-full px-2 py-0.5 font-mono text-[11px] uppercase tracking-wider ${
                p.status === "Live" ? "bg-good/15 text-good" : "bg-accent/10 text-accent-strong"
              }`}
            >
              {p.status}
            </span>
          )}
            <span className="font-mono text-xs text-faint">{p.year}</span>
          </span>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-muted">{p.tagline}</p>
        {p.metric && <p className="mt-2 font-mono text-xs text-accent">{p.metric}</p>}
        <div className="mt-4">
          <TechTags tech={p.tech} />
        </div>
        <div className="mt-auto pt-5">
          <ProjectLinks p={p} />
        </div>
      </div>
    </Spotlight>
  );
}
