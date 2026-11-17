import Link from "next/link";
import Banner from "@/components/Banner";
import Heatmap from "@/components/Heatmap";
import PostList from "@/components/PostList";
import ProjectCard from "@/components/ProjectCard";
import { FileIcon, GithubIcon, LinkedinIcon, MailIcon, PinIcon, XIcon } from "@/components/icons";
import { CopyEmail, LocalTime, Reveal, Spotlight } from "@/components/widgets";
import { about, achievements, experience, focus, site, stack } from "@/data/site";
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
      <Reveal>
        <div className="mb-6 flex items-baseline justify-between gap-4">
          <h2 id={`${id}-title`} className="font-serif text-[1.75rem] leading-none tracking-tight">
            {title}
          </h2>
          {aside}
        </div>
        {children}
      </Reveal>
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

// Links that are still empty in site.ts render as dashed TODO icons.
const socialLinks = [
  { href: site.socials.github, label: "GitHub", Icon: GithubIcon },
  { href: site.socials.x, label: "X", Icon: XIcon },
  { href: site.socials.linkedin, label: "LinkedIn", Icon: LinkedinIcon },
  { href: `mailto:${site.email}`, label: "Email", Icon: MailIcon },
  { href: site.resume, label: "Résumé", Icon: FileIcon },
];

/** One row of the Experience and Achievements lists: logo, title, organisation, date. */
function Row({
  logo,
  mark,
  title,
  url,
  sub,
  note,
  date,
  todo = false,
}: {
  logo?: string;
  mark: string;
  title: string;
  url?: string;
  sub: string;
  note?: string;
  date: string;
  todo?: boolean;
}) {
  return (
    <li className={`flex items-start gap-4 border-b border-line py-4 ${todo ? "text-faint" : ""}`}>
      {logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logo} alt="" width={40} height={40} className="size-10 shrink-0 rounded-xl border border-line bg-card object-contain" />
      ) : (
        <span
          aria-hidden
          className={`grid size-10 shrink-0 place-items-center rounded-xl border bg-card font-serif text-xl italic ${
            todo ? "border-dashed border-faint" : "border-line"
          }`}
        >
          {mark}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <h3 className={`tracking-tight ${todo ? "font-mono text-sm" : "font-medium"}`}>
          {url ? (
            <a href={url} target="_blank" rel="noreferrer" className="link">
              {title}
            </a>
          ) : (
            title
          )}
        </h3>
        <p className={`text-sm ${todo ? "font-mono text-xs" : "text-muted"}`}>{sub}</p>
        {note && <p className="mt-1.5 text-sm leading-relaxed text-muted">{note}</p>}
      </div>
      <span className="shrink-0 pt-0.5 font-mono text-xs text-faint">{date}</span>
    </li>
  );
}

export default function Home() {
  const posts = getAllPosts().slice(0, 3);
  const initials = site.name
    .split(" ")
    .map((w) => w[0])
    .join("");

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="pt-8">
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
                {href ? (
                  <a
                    href={href}
                    target={href.startsWith("http") || href.endsWith(".pdf") ? "_blank" : undefined}
                    rel="noreferrer"
                    aria-label={label}
                    title={label}
                    className="grid size-9 place-items-center rounded-full border border-line bg-bg text-muted transition hover:-translate-y-0.5 hover:border-faint hover:text-fg"
                  >
                    <Icon />
                  </a>
                ) : (
                  <span
                    role="img"
                    aria-label={`${label} (TODO: link not added yet)`}
                    title={`TODO: add your ${label} link in src/data/site.ts`}
                    className="grid size-9 place-items-center rounded-full border border-dashed border-faint bg-bg text-faint"
                  >
                    <Icon />
                  </span>
                )}
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
      <Section id="stack" title="Stack">
        <dl className="divide-y divide-line border-y border-line">
          {stack.map((row) => (
            <div key={row.group} className="grid gap-2 py-3 sm:grid-cols-[7rem_1fr] sm:items-center">
              <dt className="font-mono text-[11px] uppercase tracking-widest text-faint">{row.group}</dt>
              <dd className="flex flex-wrap gap-x-4 gap-y-0.5 text-sm">
                {row.items.map((item) => (
                  <span
                    key={item}
                    className="-mx-1.5 cursor-default rounded-md px-1.5 py-0.5 transition-colors duration-200 hover:bg-accent/10 hover:text-accent"
                  >
                    {item}
                  </span>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      </Section>

      {/* ── Activity: heatmaps (placeholders until linked in site.ts) ── */}
      <Section id="activity" title="Activity">
        <div className="grid gap-4">
          <Heatmap source="github" />
          <Heatmap source="leetcode" />
        </div>
      </Section>

      {/* ── Experience ───────────────────────────────────── */}
      <Section id="experience" title="Experience">
        <ol className="border-t border-line">
          {experience.map((e) => (
            <Row
              key={e.company + e.role}
              logo={e.logo}
              mark={e.company[0]}
              title={e.role}
              url={e.url}
              sub={e.company}
              note={e.summary}
              date={`${e.start} – ${e.end}`}
            />
          ))}
          {experience.length === 0 && (
            <Row todo mark="?" title="TODO: add your experience" sub="Role · Organisation (src/data/site.ts)" date="Dates" />
          )}
        </ol>
      </Section>

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

      {/* ── Achievements ─────────────────────────────────── */}
      <Section id="achievements" title="Achievements">
        <ul className="border-t border-line">
          {achievements.map((h) => (
            <Row key={h.title} logo={h.logo} mark={h.org[0]} title={h.title} url={h.url} sub={h.org} note={h.note} date={h.year} />
          ))}
          {achievements.length === 0 && (
            <Row todo mark="?" title="TODO: add your achievements" sub="Award · Organisation (src/data/site.ts)" date="Year" />
          )}
        </ul>
      </Section>

      {/* ── Blog ─────────────────────────────────────────── */}
      {posts.length > 0 && (
        <Section
          id="blog"
          title="Blog"
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
