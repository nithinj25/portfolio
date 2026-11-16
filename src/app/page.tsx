import Link from "next/link";
import Banner from "@/components/Banner";
import PostList from "@/components/PostList";
import ProjectCard from "@/components/ProjectCard";
import { FileIcon, GithubIcon, LinkedinIcon, MailIcon, PinIcon, XIcon } from "@/components/icons";
import { CopyEmail, GithubActivity, LocalTime, Spotlight } from "@/components/widgets";
import { about, experience, focus, highlights, site, stack } from "@/data/site";
import { featuredProjects, projects } from "@/lib/projects";
import { getAllPosts } from "@/lib/posts";

function Section({
  id,
  title,
  aside,
  children,
}: {
  id: string;
  title: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="mt-20 scroll-mt-20">
      <div className="mb-6 flex items-baseline justify-between gap-4">
        <h2 id={`${id}-title`} className="font-serif text-[1.75rem] leading-none tracking-tight">
          {title}
        </h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-line bg-card px-2.5 py-1 font-mono text-[11px] leading-none text-muted">
      {children}
    </span>
  );
}

const socialLinks = [
  { href: site.socials.github, label: "GitHub", Icon: GithubIcon },
  { href: site.socials.linkedin, label: "LinkedIn", Icon: LinkedinIcon },
  { href: site.socials.x, label: "X", Icon: XIcon },
  { href: `mailto:${site.email}`, label: "Email", Icon: MailIcon },
  { href: site.resume, label: "Résumé", Icon: FileIcon },
].filter((s) => s.href);

export default function Home() {
  const posts = getAllPosts().slice(0, 3);
  const initials = site.name
    .split(" ")
    .map((w) => w[0])
    .join("");

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="pt-4">
        <div className="rise">
          <Banner />
        </div>
        <div className="rise -mt-10 flex items-end justify-between px-4" style={{ "--i": 1 } as React.CSSProperties}>
          {site.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={site.avatar}
              alt={site.name}
              width={88}
              height={88}
              className="size-22 rounded-3xl border-4 border-bg object-cover"
            />
          ) : (
            <div
              aria-hidden
              className="grid size-22 place-items-center rounded-3xl border-4 border-bg bg-card font-serif text-4xl italic ring-1 ring-line"
            >
              {initials}
            </div>
          )}
          <ul className="flex items-center gap-1 pb-1">
            {socialLinks.map(({ href, label, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                  aria-label={label}
                  title={label}
                  className="grid size-9 place-items-center rounded-full border border-line bg-bg text-muted transition hover:-translate-y-0.5 hover:text-fg"
                >
                  <Icon />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="rise mt-5" style={{ "--i": 2 } as React.CSSProperties}>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h1 className="font-serif text-5xl leading-none tracking-tight">{site.name}</h1>
            {site.available && (
              <span className="flex items-center gap-2 rounded-full border border-line bg-card py-1 pl-2.5 pr-3 text-xs text-muted">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-good opacity-60 motion-reduce:hidden" />
                  <span className="relative inline-flex size-2 rounded-full bg-good" />
                </span>
                {site.availabilityText}
              </span>
            )}
          </div>
          <p className="mt-3 text-lg text-muted">
            {site.role} <span className="text-faint">/</span> <span className="text-fg">{site.tagline}</span>
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
            <span className="flex items-center gap-1.5">
              <PinIcon width={14} height={14} /> {site.location}
            </span>
            <LocalTime />
          </div>
        </div>
      </section>

      {/* ── About ────────────────────────────────────────── */}
      <Section id="about" title="About">
        <div className="space-y-4 text-[1.0625rem] leading-relaxed text-muted">
          {about.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
        <ul className="mt-5 flex flex-wrap gap-2">
          {focus.map((f) => (
            <li key={f}>
              <Chip>{f}</Chip>
            </li>
          ))}
        </ul>
      </Section>

      {/* ── Stack ────────────────────────────────────────── */}
      <Section id="stack" title={site.showGithubActivity ? "Stack & activity" : "Stack"}>
        <dl className="divide-y divide-line border-y border-line">
          {stack.map((row) => (
            <div key={row.group} className="grid gap-2 py-3 sm:grid-cols-[7rem_1fr] sm:items-center">
              <dt className="font-mono text-[11px] uppercase tracking-widest text-faint">{row.group}</dt>
              <dd className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                {row.items.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </dd>
            </div>
          ))}
        </dl>
        {site.showGithubActivity && <GithubActivity />}
      </Section>

      {/* ── Experience (hidden until you add a role) ─────── */}
      {experience.length > 0 && (
        <Section id="experience" title="Experience">
          <ol className="space-y-6">
            {experience.map((e) => (
              <li key={e.company + e.role} className="grid gap-1 sm:grid-cols-[1fr_auto] sm:gap-6">
                <div>
                  <h3 className="font-medium">
                    {e.url ? (
                      <a href={e.url} target="_blank" rel="noreferrer" className="link">
                        {e.company}
                      </a>
                    ) : (
                      e.company
                    )}
                  </h3>
                  <p className="text-sm text-muted">{e.role}</p>
                  {e.summary && <p className="mt-2 text-sm leading-relaxed text-muted">{e.summary}</p>}
                </div>
                <p className="font-mono text-xs text-faint sm:pt-1">
                  {e.start} – {e.end}
                </p>
              </li>
            ))}
          </ol>
        </Section>
      )}

      {/* ── Projects ─────────────────────────────────────── */}
      <Section
        id="projects"
        title="Projects"
        aside={
          <Link href="/projects" className="link text-sm text-muted hover:text-fg">
            All {projects.length} projects
          </Link>
        }
      >
        <ul className="grid gap-4 sm:grid-cols-2">
          {featuredProjects.map((p) => (
            <li key={p.slug}>
              <ProjectCard p={p} />
            </li>
          ))}
        </ul>
      </Section>

      {/* ── Hackathons ───────────────────────────────────── */}
      {highlights.length > 0 && (
        <Section id="hackathons" title="Hackathons">
          <ul className="border-t border-line">
            {highlights.map((h) => (
              <li key={h.title} className="flex items-baseline justify-between gap-6 border-b border-line py-3.5">
                <div>
                  <h3 className="font-medium tracking-tight">
                    {h.url ? (
                      <a href={h.url} target="_blank" rel="noreferrer" className="link">
                        {h.title}
                      </a>
                    ) : (
                      h.title
                    )}
                  </h3>
                  <p className="text-sm text-muted">{h.detail}</p>
                </div>
                <span className="font-mono text-xs text-faint">{h.year}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* ── Writing ──────────────────────────────────────── */}
      {posts.length > 0 && (
        <Section
          id="writing"
          title="Writing"
          aside={
            <Link href="/blog" className="link text-sm text-muted hover:text-fg">
              All posts
            </Link>
          }
        >
          <PostList posts={posts} />
        </Section>
      )}

      {/* ── Contact ──────────────────────────────────────── */}
      <section id="contact" aria-labelledby="contact-title" className="mt-20 scroll-mt-20">
        <Spotlight className="rounded-3xl border border-line bg-card px-6 py-10 text-center sm:px-10">
          <h2 id="contact-title" className="font-serif text-4xl leading-tight tracking-tight">
            Let&apos;s build something <em className="text-accent">fast</em>.
          </h2>
          <p className="mx-auto mt-3 max-w-sm text-muted">
            Have a role, a project or a hard latency problem? My inbox is open.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <a
              href={`mailto:${site.email}`}
              className="rounded-full bg-fg px-5 py-2.5 text-sm font-medium text-bg transition-transform hover:-translate-y-0.5"
            >
              {site.email}
            </a>
            <CopyEmail className="rounded-full border border-line px-5 py-2.5 text-sm text-muted transition-colors hover:text-fg" />
          </div>
        </Spotlight>
      </section>
    </>
  );
}
