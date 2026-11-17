import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProjectLinks, ProjectMedia, TechTags } from "@/components/ProjectCard";
import { ArrowLeft } from "@/components/icons";
import { site } from "@/data/site";
import { getProject, projects } from "@/lib/projects";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = getProject((await params).slug);
  if (!p) return {};
  return { title: p.title, description: p.tagline, alternates: { canonical: `/projects/${p.slug}` } };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) notFound();

  const i = projects.indexOf(p);
  const prev = projects[i - 1];
  const next = projects[i + 1];

  return (
    <article className="pt-10">
      <Link href="/projects" className="rise inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-fg">
        <ArrowLeft width={14} height={14} /> All projects
      </Link>

      <header className="rise mt-8" style={{ "--i": 1 } as React.CSSProperties}>
        <p className="flex items-center gap-3 font-mono text-xs text-faint">
          {p.year}
          {p.status && (
          <span
            className={`rounded-full px-2 py-0.5 font-mono text-[11px] uppercase tracking-wider ${
              p.status === "Live" ? "bg-good/15 text-good" : "bg-accent/10 text-accent"
            }`}
          >
            {p.status}
          </span>
          )}
        </p>
        <h1 className="mt-3 text-balance font-serif text-[2.75rem] leading-[1.05] tracking-tight">{p.title}</h1>
        <p className="mt-4 max-w-[68ch] text-pretty text-lg leading-relaxed text-muted">{p.blurb}</p>
        {p.metric && <p className="mt-4 font-mono text-sm text-accent">{p.metric}</p>}
        <div className="mt-5">
          <ProjectLinks p={p} />
        </div>
      </header>

      <div
        className="rise mt-8 overflow-hidden rounded-2xl border border-line bg-card"
        style={{ "--i": 2 } as React.CSSProperties}
      >
        <ProjectMedia p={p} eager />
      </div>

      {(p.details || site.showTodos) && (
      <section className="rise mt-10" style={{ "--i": 3 } as React.CSSProperties} aria-labelledby="details-title">
        <h2 id="details-title" className="font-serif text-[1.75rem] leading-none tracking-tight">
          How it works
        </h2>
        {p.details ? (
          <ul className="mt-5 max-w-[68ch] space-y-3 text-[1.0625rem] leading-relaxed text-muted">
            {p.details.map((d) => (
              <li key={d} className="flex gap-3">
                <span aria-hidden className="mt-[0.7em] size-1.5 shrink-0 rounded-full bg-accent" />
                <span>{d}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-5 rounded-xl border border-dashed border-faint px-4 py-3 font-mono text-xs leading-relaxed text-faint">
            TODO: add a few points about how {p.title} works (the `details` list in src/lib/projects.ts).
          </p>
        )}
      </section>
      )}

      <section className="mt-10" aria-labelledby="tech-title">
        <h2 id="tech-title" className="mb-4 font-mono text-xs uppercase tracking-widest text-faint">
          Built with
        </h2>
        <TechTags tech={p.tech} />
      </section>

      <nav aria-label="More projects" className="mt-12 grid gap-3 border-t border-line pt-8 sm:grid-cols-2">
        {prev ? (
          <Link href={`/projects/${prev.slug}`} className="group rounded-2xl border border-line bg-card p-4">
            <span className="font-mono text-xs uppercase tracking-widest text-faint">← Previous</span>
            <span className="mt-1 block font-medium tracking-tight transition-colors group-hover:text-accent">{prev.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link href={`/projects/${next.slug}`} className="group rounded-2xl border border-line bg-card p-4 sm:text-right">
            <span className="font-mono text-xs uppercase tracking-widest text-faint">Next →</span>
            <span className="mt-1 block font-medium tracking-tight transition-colors group-hover:text-accent">{next.title}</span>
          </Link>
        )}
      </nav>
    </article>
  );
}
