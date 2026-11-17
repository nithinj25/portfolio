import Link from "next/link";
import { site } from "@/data/site";
import type { Project } from "@/lib/projects";
import ProjectArt from "./ProjectArt";
import { ArrowUpRight } from "./icons";
import { Spotlight } from "./widgets";

/** Screenshot if there is one, else the project's diagram, else a marked TODO slot. Always 16:10, so nothing shifts. */
export function ProjectMedia({ p, eager = false }: { p: Project; eager?: boolean }) {
  return (
    <div className="aspect-[16/10] overflow-hidden bg-bg/60">
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
            <p className="rounded-lg border border-dashed border-faint px-3 py-2 text-center font-mono text-[11px] leading-relaxed text-faint">
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
        <li key={t} className="rounded-full border border-line bg-card px-2.5 py-1 font-mono text-[11px] leading-none text-muted">
          {t}
        </li>
      ))}
    </ul>
  );
}

export default function ProjectCard({ p }: { p: Project }) {
  return (
    <Spotlight className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-card transition duration-300 ease-out hover:-translate-y-1 hover:border-accent/50 hover:shadow-[0_20px_50px_-28px_var(--accent)] has-[:focus-visible]:border-accent/50 motion-reduce:transform-none">
      <div className="border-b border-line">
        <ProjectMedia p={p} />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-lg font-medium tracking-tight">
            {/* The ::after stretches this link over the whole card. */}
            <Link href={`/projects/${p.slug}`} className="after:absolute after:inset-0 after:content-['']">
              {p.title}
            </Link>
          </h3>
          <span className="font-mono text-xs text-faint">{p.year}</span>
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
