import Link from "next/link";
import Banner from "@/components/Banner";
import Heatmap from "@/components/Heatmap";
import PostList, { FeaturedPost } from "@/components/PostList";
import ProjectCard from "@/components/ProjectCard";
import SocialLinks from "@/components/SocialLinks";
import { ArrowUpRight, CloudIcon, CodeIcon, DatabaseIcon, LayoutIcon, MailIcon, PinIcon, ServerIcon, SparkIcon } from "@/components/icons";
import { CopyEmail, LocalTime, Reveal, Spotlight } from "@/components/widgets";
import { achievements, bio, competitive, currently, education, experience, headlineStats, site, stack } from "@/data/site";
import { getGithubCalendar, getLeetcode } from "@/lib/activity";
import { featuredProjects, projects } from "@/lib/projects";
import { getAllPosts } from "@/lib/posts";

// The page follows the outline of the reference portfolio:
// hero (bio, now, socials) → experience → projects → hackathons → GitHub
// activity → DSA & competitive programming → skills → education → blogs,
// closing with a contact card. The theme and components are this site's own.

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

const STACK_ICONS: Record<string, typeof CodeIcon> = {
  Languages: CodeIcon,
  "ML & Data": SparkIcon,
  "Backend & Systems": ServerIcon,
  "Data & Streaming": DatabaseIcon,
  Frontend: LayoutIcon,
  "Developer Tools": CloudIcon,
};

/** A competitive-programming platform card: name, headline number, details, profile link. */
function PlatformCard({
  name,
  value,
  label,
  url,
  children,
}: {
  name: string;
  value: string;
  label: string;
  url?: string;
  children?: React.ReactNode;
}) {
  return (
    <Spotlight className="flex h-full flex-col rounded-2xl border border-line bg-card p-5 transition-colors has-[a:hover]:border-accent/50">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-mono text-xs uppercase tracking-widest text-muted">{name}</h3>
        {url ? (
          <a href={url} target="_blank" rel="noreferrer" aria-label={`${name} profile`} className="text-muted transition-colors after:absolute after:inset-0 after:content-[''] hover:text-accent">
            <ArrowUpRight width={14} height={14} />
          </a>
        ) : (
          site.showTodos && <span className="font-mono text-[11px] text-faint">TODO: profile link</span>
        )}
      </div>
      <p className="mt-4 font-serif text-4xl leading-none tracking-tight">{value}</p>
      <p className="mt-1.5 font-mono text-xs text-muted">{label}</p>
      {children && <div className="mt-auto pt-5">{children}</div>}
    </Spotlight>
  );
}

/**
 * One entry on the Experience and Education timelines: a logo (or initial)
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
}: {
  logo?: string;
  mark: string;
  title: string;
  url?: string;
  sub: string;
  note?: string;
  date: string;
}) {
  return (
    <li className="relative flex gap-5 pb-8 last:pb-0">
      {/* The rail: hidden on the last entry so the line ends at its marker. */}
      <span aria-hidden className="absolute bottom-0 left-5 top-12 w-px bg-line [li:last-child>&]:hidden" />
      {logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logo} alt="" width={40} height={40} className="relative size-10 shrink-0 rounded-xl border border-line bg-card object-contain" />
      ) : (
        <span aria-hidden className="relative grid size-10 shrink-0 place-items-center rounded-xl border border-line bg-card font-serif text-xl italic">
          {mark}
        </span>
      )}
      <div className="min-w-0 flex-1 pt-0.5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4">
          <h3 className="text-lg font-medium tracking-tight">
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
        <p className="text-sm text-muted">{sub}</p>
        {note && <p className="mt-2 max-w-[68ch] text-sm leading-relaxed text-muted">{note}</p>}
      </div>
    </li>
  );
}

export default async function Home() {
  const [latest, ...olderPosts] = getAllPosts().slice(0, 4);
  // Fetched at build time and refreshed daily; null falls back to a placeholder.
  const [github, leetcode] = await Promise.all([
    site.showGithubActivity ? getGithubCalendar(site.handle) : null,
    site.leetcode ? getLeetcode(site.leetcode) : null,
  ]);
  const initials = site.name
    .split(" ")
    .map((w) => w[0])
    .join("");

  const stats = [
    { value: String(projects.length), label: "projects built" },
    { value: String(achievements.length), label: "hackathon results" },
    ...headlineStats,
  ];

  // Sections number themselves in the order they actually render.
  let count = 0;
  const next = () => String(++count).padStart(2, "0");

  return (
    <>
      {/* ── Hero: bio, what I'm doing now, socials ───────── */}
      <section id="about" aria-label="About" className="scroll-mt-24 pt-8">
        <div className="rise">
          <Banner />
        </div>
        <div className="rise -mt-10 px-4" style={{ "--i": 1 } as React.CSSProperties}>
          {site.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={site.avatar} alt={site.name} width={88} height={88} className="size-22 rounded-3xl border-4 border-bg object-cover" />
          ) : (
            <div aria-hidden className="grid size-22 place-items-center rounded-3xl border-4 border-bg bg-card font-serif text-4xl italic ring-1 ring-line">
              {initials}
            </div>
          )}
        </div>

        <div className="rise mt-6 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-start" style={{ "--i": 2 } as React.CSSProperties}>
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
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
              <span className="flex items-center gap-1.5">
                <PinIcon width={14} height={14} /> {site.location}
              </span>
              <LocalTime />
            </div>
            <p className="mt-5 max-w-[60ch] text-lg leading-relaxed text-fg">{bio}</p>
            <ul className="mt-4 max-w-[64ch] space-y-2 text-muted">
              {currently.map((c) => (
                <li key={c} className="flex gap-3">
                  <span aria-hidden className="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-accent" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href={`mailto:${site.email}`}
                className="flex items-center gap-2 rounded-full bg-fg px-5 py-2.5 text-sm font-medium text-bg transition-transform hover:-translate-y-0.5"
              >
                <MailIcon width={15} height={15} /> Send an email
              </a>
              <Link
                href="/projects"
                className="rounded-full border border-line bg-card px-5 py-2.5 text-sm text-muted transition-colors hover:border-faint hover:text-fg"
              >
                See projects
              </Link>
            </div>
          </div>

          {/* Headline numbers */}
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line lg:mt-2 lg:w-[380px]">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col-reverse bg-card px-4 py-3.5">
                <dt className="mt-1 font-mono text-xs leading-snug text-muted">{s.label}</dt>
                <dd className="font-serif text-3xl leading-none tracking-tight">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="rise mt-8 flex flex-wrap items-center gap-4 border-y border-line py-4" style={{ "--i": 3 } as React.CSSProperties}>
          <p className="font-mono text-xs uppercase tracking-widest text-faint">Here are my socials</p>
          <SocialLinks />
        </div>
      </section>

      {/* ── Experience ───────────────────────────────────── */}
      {experience.length > 0 && (
        <Section id="experience" n={next()} title="Experience">
          <ol>
            {experience.map((e) => (
              <TimelineItem
                key={e.company + e.role}
                logo={e.logo}
                mark={e.company[0]}
                title={e.role}
                url={e.url}
                sub={e.location ? `${e.company} · ${e.location}` : e.company}
                note={e.summary}
                date={`${e.start} – ${e.end}`}
              />
            ))}
          </ol>
        </Section>
      )}

      {/* ── Projects ─────────────────────────────────────── */}
      <Section
        id="projects"
        n={next()}
        title="Projects"
        aside={
          <Link href="/projects" className="link relative text-sm text-muted after:absolute after:-inset-3 after:content-[''] hover:text-fg">
            View all {projects.length}
          </Link>
        }
      >
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featuredProjects.map((p, i) => (
            <li key={p.slug} className={i === 0 ? "sm:col-span-2 lg:col-span-3" : ""}>
              <ProjectCard p={p} wide={i === 0} />
            </li>
          ))}
        </ul>
      </Section>

      {/* ── Hackathons ───────────────────────────────────── */}
      {achievements.length > 0 && (
        <Section id="hackathons" n={next()} title="Hackathons">
          <ul className="grid gap-4 sm:grid-cols-2">
            {achievements.map((h, i) => (
              <li key={h.title} className={i === 0 ? "sm:col-span-2" : ""}>
                <Spotlight className="flex h-full flex-col rounded-2xl border border-line bg-card p-5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full bg-accent/10 px-2.5 py-0.5 font-mono text-xs text-accent-strong">{h.result}</span>
                    <span className="font-mono text-xs text-faint">{h.year}</span>
                  </div>
                  <h3 className={`mt-4 tracking-tight ${i === 0 ? "font-serif text-3xl leading-tight" : "text-lg font-medium"}`}>
                    {h.url ? (
                      <a href={h.url} target="_blank" rel="noreferrer" className="link">
                        {h.title}
                      </a>
                    ) : (
                      h.title
                    )}
                  </h3>
                  {h.detail && <p className="mt-1 font-mono text-xs text-muted">{h.detail}</p>}
                  {h.note && <p className="mt-3 max-w-[68ch] text-sm leading-relaxed text-muted">{h.note}</p>}
                </Spotlight>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* ── GitHub activity ──────────────────────────────── */}
      {(site.showGithubActivity || site.showTodos) && (
        <Section id="activity" n={next()} title="GitHub activity">
          <Heatmap source="github" handle={site.showGithubActivity ? site.handle : ""} data={github} />
        </Section>
      )}

      {/* ── DSA & competitive programming ───────────────── */}
      <Section id="competitive" n={next()} title="Competitive programming">
        <p className="-mt-2 mb-6 max-w-[68ch] text-muted">{competitive.note}</p>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {site.leetcode && (
            <li>
              <PlatformCard
                name="LeetCode"
                value={leetcode ? leetcode.solved.toLocaleString("en-US") : "–"}
                label={leetcode ? "problems solved" : "could not load stats right now"}
                url={`https://leetcode.com/u/${site.leetcode}/`}
              >
                {leetcode && (
                  <>
                    <ul className="space-y-2">
                      {(
                        [
                          ["Easy", leetcode.easy, leetcode.totals.easy],
                          ["Medium", leetcode.medium, leetcode.totals.medium],
                          ["Hard", leetcode.hard, leetcode.totals.hard],
                        ] as const
                      ).map(([d, n, total]) => (
                        <li key={d} className="grid grid-cols-[3.5rem_1fr_auto] items-center gap-3 font-mono text-xs text-muted">
                          {d}
                          <span className="h-1.5 overflow-hidden rounded-full bg-line">
                            <span className="block h-full rounded-full bg-accent" style={{ width: `${Math.max(2, (n / total) * 100)}%` }} />
                          </span>
                          <span className="tabular-nums text-fg">{n}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-4 font-mono text-xs text-faint">
                      {leetcode.rating ? `Contest rating ${leetcode.rating}` : "No contest rating yet"}
                      {leetcode.topPercent ? ` · top ${leetcode.topPercent}%` : ""}
                      {leetcode.streak ? ` · ${leetcode.streak}-day streak` : ""}
                    </p>
                  </>
                )}
              </PlatformCard>
            </li>
          )}
          {competitive.platforms.map((p) => (
            <li key={p.name}>
              <PlatformCard name={p.name} value={p.rating ?? "–"} label="rating" url={p.url} />
            </li>
          ))}
        </ul>
        {(site.leetcode || site.showTodos) && (
          <div className="mt-4">
            <Heatmap source="leetcode" handle={site.leetcode} data={leetcode?.calendar ?? null} />
          </div>
        )}
      </Section>

      {/* ── Skills & technologies ────────────────────────── */}
      <Section id="skills" n={next()} title="Skills & technologies">
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {stack.map((group) => {
            const Icon = STACK_ICONS[group.group] ?? CodeIcon;
            return (
              <li key={group.group}>
                <Spotlight className="h-full rounded-2xl border border-line bg-card p-5">
                  <h3 className="flex items-center gap-2.5 font-mono text-xs uppercase tracking-widest text-muted">
                    <span className="grid size-8 place-items-center rounded-lg border border-line bg-bg text-accent">
                      <Icon />
                    </span>
                    {group.group}
                  </h3>
                  <ul className="mt-4 flex flex-wrap gap-1.5">
                    {group.items.map((item) => (
                      <li
                        key={item}
                        className="cursor-default rounded-md border border-line px-2 py-1 text-sm transition-colors duration-200 hover:border-accent/50 hover:bg-accent/10 hover:text-accent-strong"
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

      {/* ── Education ──────────────────────────────────── */}
      {education.length > 0 && (
        <Section id="education" n={next()} title="Education">
          <ol>
            {education.map((ed) => (
              <TimelineItem
                key={ed.degree}
                mark={ed.school[0]}
                title={ed.degree}
                sub={[ed.school, ed.location].filter(Boolean).join(" · ")}
                note={ed.score}
                date={`${ed.start} – ${ed.end}`}
              />
            ))}
          </ol>
        </Section>
      )}

      {/* ── Blogs ─────────────────────────────────────────── */}
      {latest && (
        <Section
          id="blog"
          n={next()}
          title="Blog"
          aside={
            <Link href="/blog" className="link relative text-sm text-muted after:absolute after:-inset-3 after:content-[''] hover:text-fg">
              View all
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
            <p className="mx-auto mt-3 max-w-sm text-muted">Have a role, a project or a hard latency problem? My inbox is open.</p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <a
                href={`mailto:${site.email}`}
                className="rounded-full bg-fg px-5 py-2.5 text-sm font-medium text-bg transition-transform hover:-translate-y-0.5"
              >
                {site.email}
              </a>
              <CopyEmail className="rounded-full border border-line px-5 py-2.5 text-sm text-muted transition-colors hover:text-fg" />
            </div>
          </Spotlight>
        </Reveal>
      </section>
    </>
  );
}
