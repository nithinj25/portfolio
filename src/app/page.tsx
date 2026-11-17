import Link from "next/link";
import Banner from "@/components/Banner";
import Heatmap from "@/components/Heatmap";
import PostList, { FeaturedPost } from "@/components/PostList";
import ProjectCard from "@/components/ProjectCard";
import SocialLinks from "@/components/SocialLinks";
import { CloudIcon, CodeIcon, DatabaseIcon, LayoutIcon, PinIcon, ServerIcon, SparkIcon } from "@/components/icons";
import { CopyEmail, LocalTime, Reveal, Spotlight } from "@/components/widgets";
import { about, achievements, experience, focus, headlineStats, site, stack } from "@/data/site";
import { featuredProjects, projects } from "@/lib/projects";
import { getAllPosts } from "@/lib/posts";

/** A numbered section: "02" label, serif title, a rule, then the content. */
function Section({
  id,
  n,
  title,
  aside,
  children,
}: {
  id: string;
  n: string;
  title: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="mt-24 scroll-mt-24">
      <Reveal>
        <div className="mb-7 flex items-end justify-between gap-4 border-b border-line pb-4">
          <h2 id={`${id}-title`} className="flex items-baseline gap-3 font-serif text-[2rem] leading-none tracking-tight">
            <span aria-hidden className="font-mono text-xs tracking-widest text-accent">
              {n}
            </span>
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

const STACK_ICONS: Record<string, typeof CodeIcon> = {
  Languages: CodeIcon,
  Backend: ServerIcon,
  Frontend: LayoutIcon,
  Data: DatabaseIcon,
  AI: SparkIcon,
  Infra: CloudIcon,
};

/**
 * One entry on the Experience and Achievements timelines: a logo (or initial)
 * on the rail, then title, organisation and date. The rail line joins entries.
 */
function TimelineItem({
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
    <li className={`relative flex gap-5 pb-8 last:pb-0 ${todo ? "text-faint" : ""}`}>
      {/* The rail: hidden on the last entry so the line ends at its marker. */}
      <span aria-hidden className="absolute bottom-0 left-5 top-12 w-px bg-line [li:last-child>&]:hidden" />
      {logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logo} alt="" width={40} height={40} className="relative size-10 shrink-0 rounded-xl border border-line bg-card object-contain" />
      ) : (
        <span
          aria-hidden
          className={`relative grid size-10 shrink-0 place-items-center rounded-xl border bg-card font-serif text-xl italic ${
            todo ? "border-dashed border-faint" : "border-line"
          }`}
        >
          {mark}
        </span>
      )}
      <div className="min-w-0 flex-1 pt-0.5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4">
          <h3 className={`tracking-tight ${todo ? "font-mono text-sm" : "text-lg font-medium"}`}>
            {url ? (
              <a href={url} target="_blank" rel="noreferrer" className="link">
                {title}
              </a>
            ) : (
              title
            )}
          </h3>
          <span className="font-mono text-xs text-faint">{date}</span>
        </div>
        <p className={`text-sm ${todo ? "font-mono text-xs" : "text-muted"}`}>{sub}</p>
        {note && <p className="mt-2 max-w-[68ch] text-sm leading-relaxed text-muted">{note}</p>}
      </div>
    </li>
  );
}

export default function Home() {
  const [latest, ...olderPosts] = getAllPosts().slice(0, 4);
  const initials = site.name
    .split(" ")
    .map((w) => w[0])
    .join("");

  const stats = [
    { value: String(projects.length), label: "projects built" },
    { value: String(achievements.length), label: "hackathons" },
    ...headlineStats,
  ];

  // Sections that would only hold placeholders disappear when showTodos is off.
  const showExperience = experience.length > 0 || site.showTodos;
  const showGithub = site.showGithubActivity || site.showTodos;
  const showLeetcode = Boolean(site.leetcode) || site.showTodos;

  // Sections number themselves in the order they actually render.
  let count = 0;
  const next = () => String(++count).padStart(2, "0");

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
          <SocialLinks className="pb-1" />
        </div>

        <div
          className="rise mt-6 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end"
          style={{ "--i": 2 } as React.CSSProperties}
        >
          <div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <h1 className="font-serif text-6xl leading-none tracking-tight">{site.name}</h1>
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
            <p className="mt-4 text-lg text-muted">
              {site.role} <span className="text-faint">/</span> <span className="text-fg">{site.tagline}</span>
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
              <span className="flex items-center gap-1.5">
                <PinIcon width={14} height={14} /> {site.location}
              </span>
              <LocalTime />
            </div>
          </div>

          {/* Headline numbers */}
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line lg:w-[380px]">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col-reverse bg-card px-4 py-3.5">
                <dt className="mt-1 font-mono text-[11px] leading-snug text-muted">{s.label}</dt>
                <dd className="font-serif text-3xl leading-none tracking-tight">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── About ────────────────────────────────────────── */}
      <Section id="about" n={next()} title="About">
        <div className="max-w-[68ch] space-y-4 text-[1.0625rem] leading-relaxed text-muted">
          {about.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
        <ul className="mt-6 flex flex-wrap gap-2">
          {focus.map((f) => (
            <li key={f}>
              <Chip>{f}</Chip>
            </li>
          ))}
        </ul>
      </Section>

      {/* ── Stack ────────────────────────────────────────── */}
      <Section id="stack" n={next()} title="Stack">
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {stack.map((group) => {
            const Icon = STACK_ICONS[group.group] ?? CodeIcon;
            return (
              <li key={group.group}>
                <Spotlight className="h-full rounded-2xl border border-line bg-card p-5">
                  <h3 className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-widest text-muted">
                    <span className="grid size-8 place-items-center rounded-lg border border-line bg-bg text-accent">
                      <Icon />
                    </span>
                    {group.group}
                  </h3>
                  <ul className="mt-4 flex flex-wrap gap-1.5">
                    {group.items.map((item) => (
                      <li
                        key={item}
                        className="cursor-default rounded-md border border-line px-2 py-1 text-sm transition-colors duration-200 hover:border-accent/50 hover:bg-accent/10 hover:text-accent"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </Spotlight>
              </li>
            );
          })}
        </ul>
      </Section>

      {/* ── Activity: heatmaps (placeholders until linked in site.ts) ── */}
      {(showGithub || showLeetcode) && (
        <Section id="activity" n={next()} title="Activity">
          <div className="grid gap-4">
            {showGithub && <Heatmap source="github" />}
            {showLeetcode && <Heatmap source="leetcode" />}
          </div>
        </Section>
      )}

      {/* ── Experience ───────────────────────────────────── */}
      {showExperience && (
        <Section id="experience" n={next()} title="Experience">
          <ol>
            {experience.map((e) => (
              <TimelineItem
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
              <TimelineItem todo mark="?" title="TODO: add your experience" sub="Role · Organisation (src/data/site.ts)" date="Dates" />
            )}
          </ol>
        </Section>
      )}

      {/* ── Projects ─────────────────────────────────────── */}
      <Section
        id="projects"
        n={next()}
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
      {(achievements.length > 0 || site.showTodos) && (
        <Section id="achievements" n={next()} title="Achievements">
          <ul>
            {achievements.map((h) => (
              <TimelineItem key={h.title} logo={h.logo} mark={h.org[0]} title={h.title} url={h.url} sub={h.org} note={h.note} date={h.year} />
            ))}
            {achievements.length === 0 && (
              <TimelineItem todo mark="?" title="TODO: add your achievements" sub="Award · Organisation (src/data/site.ts)" date="Year" />
            )}
          </ul>
        </Section>
      )}

      {/* ── Blog ─────────────────────────────────────────── */}
      {latest && (
        <Section
          id="blog"
          n={next()}
          title="Blog"
          aside={
            <Link href="/blog" className="link text-sm text-muted hover:text-fg">
              All posts
            </Link>
          }
        >
          <FeaturedPost post={latest} />
          <PostList posts={olderPosts} />
        </Section>
      )}

      {/* ── Contact ──────────────────────────────────────── */}
      <section id="contact" aria-labelledby="contact-title" className="mt-24 scroll-mt-24">
        <Reveal>
          <Spotlight className="rounded-3xl border border-line bg-card px-6 py-12 text-center sm:px-10">
            <h2 id="contact-title" className="font-serif text-5xl leading-tight tracking-tight">
              Let&apos;s build something <em className="text-accent">fast</em>.
            </h2>
            <p className="mx-auto mt-3 max-w-sm text-muted">
              Have a role, a project or a hard latency problem? My inbox is open.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <a
                href={`mailto:${site.email}`}
                className="rounded-full bg-fg px-5 py-2.5 text-sm font-medium text-bg transition-transform hover:-translate-y-0.5"
              >
                {site.email}
              </a>
              <CopyEmail className="rounded-full border border-line px-5 py-2.5 text-sm text-muted transition-colors hover:text-fg" />
            </div>
            <div className="mt-8 flex flex-col items-center gap-3 border-t border-line pt-6">
              <p className="font-mono text-[11px] uppercase tracking-widest text-faint">Or find me on</p>
              <SocialLinks />
            </div>
          </Spotlight>
        </Reveal>
      </section>
    </>
  );
}
