import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PostList from "@/components/PostList";
import ReadingFocus from "@/components/blog/ReadingFocus";
import ShareButtons from "@/components/blog/ShareButtons";
import TableOfContents from "@/components/blog/TableOfContents";
import { bio, site } from "@/data/site";
import { formatDate, getAllPosts, getPost } from "@/lib/posts";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost((await params).slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      publishedTime: post.date,
      authors: [site.name],
      tags: post.tags,
      ...(post.cover ? { images: [{ url: post.cover, alt: post.coverAlt ?? post.title }] } : {}),
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const all = getAllPosts();
  const i = all.findIndex((p) => p.slug === slug);
  const newer = all[i - 1];
  const older = all[i + 1];
  const more = all.filter((p) => p.slug !== slug && p.slug !== newer?.slug && p.slug !== older?.slug).slice(0, 3);
  const initials = site.name
    .split(" ")
    .map((w) => w[0])
    .join("");

  return (
    <article className="reading px-5">
      {/* ── Header ───────────────────────────────────────── */}
      <header className="mx-auto max-w-[860px] pt-14 text-center sm:pt-20">
        {post.tags.length > 0 && (
          <p className="flex flex-wrap justify-center gap-2">
            {post.tags.map((t) => (
              <span key={t} className="rounded-full bg-accent/10 px-2.5 py-1 font-mono text-xs text-accent-strong">
                {t}
              </span>
            ))}
          </p>
        )}
        <h1 className="mt-6 text-balance font-serif text-[2.6rem] leading-[1.05] tracking-tight sm:text-[3.5rem]">{post.title}</h1>
        {post.description && <p className="mx-auto mt-5 max-w-[58ch] text-pretty text-lg leading-relaxed text-muted sm:text-xl">{post.description}</p>}
        <div className="mt-8 flex items-center justify-center gap-3">
          {site.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={site.avatar} alt="" width={40} height={40} className="size-10 rounded-full object-cover" />
          ) : (
            <span aria-hidden className="grid size-10 place-items-center rounded-full border border-line bg-card font-serif text-lg italic">
              {initials}
            </span>
          )}
          <div className="text-left text-sm">
            <p className="font-medium">{site.name}</p>
            <p className="text-muted">
              <time dateTime={post.date}>{formatDate(post.date)}</time> · {post.minutes} min read
              {post.draft && <span className="ml-2 text-accent">· Draft</span>}
            </p>
          </div>
        </div>
      </header>

      {/* ── Cover (optional: `cover:` in the post's front matter) ── */}
      {post.cover && (
        <figure className="mx-auto mt-12 max-w-[1180px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.cover} alt={post.coverAlt ?? ""} className="w-full rounded-2xl border border-line object-cover" />
        </figure>
      )}

      {/* ── Body, with "On this page" beside it on wide screens ── */}
      <div className="mx-auto mt-14 grid max-w-[1320px] grid-cols-[minmax(0,1fr)] gap-12 xl:grid-cols-[200px_minmax(0,780px)_200px] xl:justify-center">
        <aside className="hidden xl:block">
          <div className="sticky top-24">
            <TableOfContents headings={post.headings} />
          </div>
        </aside>

        <div className="mx-auto w-full min-w-0 max-w-[780px] xl:mx-0">
          {post.headings.length > 1 && (
            <details className="mb-10 rounded-2xl border border-line bg-card px-5 py-4 xl:hidden">
              <summary className="cursor-pointer font-mono text-xs uppercase tracking-widest text-muted">On this page</summary>
              <ol className="mt-3 space-y-2 text-sm">
                {post.headings.map((h) => (
                  <li key={h.id} className={h.level === 3 ? "pl-4" : ""}>
                    <a href={`#${h.id}`} className="link text-muted hover:text-fg">
                      {h.text}
                    </a>
                  </li>
                ))}
              </ol>
            </details>
          )}

          <ReadingFocus>
            <div className="prose" dangerouslySetInnerHTML={{ __html: post.html }} />
          </ReadingFocus>

          {post.original && (
            <p className="mt-12 text-sm text-muted">
              Originally published on{" "}
              <a href={post.original} target="_blank" rel="noreferrer" className="text-fg underline decoration-line underline-offset-4 hover:decoration-accent">
                {post.original.includes("linkedin.com") ? "LinkedIn" : new URL(post.original).hostname}
              </a>
              .
            </p>
          )}

          {/* ── End of post ─────────────────────────────── */}
          <div className="mt-14 border-t border-line pt-8">
            <ShareButtons title={post.title} />
          </div>

          <aside aria-label="About the author" className="mt-10 flex gap-4 rounded-2xl border border-line bg-card p-6">
            {site.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={site.avatar} alt="" width={56} height={56} className="size-14 shrink-0 rounded-full object-cover" />
            ) : (
              <span aria-hidden className="grid size-14 shrink-0 place-items-center rounded-full border border-line bg-bg font-serif text-2xl italic">
                {initials}
              </span>
            )}
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-faint">Written by</p>
              <p className="mt-1 text-lg font-medium">{site.name}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted">{bio}</p>
              <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                <Link href="/" className="link text-fg">
                  Portfolio
                </Link>
                <a href={site.socials.github} target="_blank" rel="noreferrer" className="link text-fg">
                  GitHub
                </a>
                {site.socials.linkedin && (
                  <a href={site.socials.linkedin} target="_blank" rel="noreferrer" className="link text-fg">
                    LinkedIn
                  </a>
                )}
                <a href={`mailto:${site.email}?subject=${encodeURIComponent(`Re: ${post.title}`)}`} className="link text-fg">
                  Reply by email
                </a>
              </p>
            </div>
          </aside>

          {(newer || older) && (
            <nav aria-label="Previous and next posts" className="mt-10 grid gap-3 sm:grid-cols-2">
              {older ? (
                <Link href={`/blog/${older.slug}`} className="group rounded-2xl border border-line bg-card p-5 transition-colors hover:border-faint">
                  <span className="font-mono text-xs uppercase tracking-widest text-faint">← Previous</span>
                  <span className="mt-2 block font-medium leading-snug tracking-tight transition-colors group-hover:text-accent">{older.title}</span>
                </Link>
              ) : (
                <span />
              )}
              {newer && (
                <Link href={`/blog/${newer.slug}`} className="group rounded-2xl border border-line bg-card p-5 text-right transition-colors hover:border-faint">
                  <span className="font-mono text-xs uppercase tracking-widest text-faint">Next →</span>
                  <span className="mt-2 block font-medium leading-snug tracking-tight transition-colors group-hover:text-accent">{newer.title}</span>
                </Link>
              )}
            </nav>
          )}

          {more.length > 0 && (
            <section aria-labelledby="more-title" className="mt-14">
              <h2 id="more-title" className="mb-4 font-serif text-2xl tracking-tight">
                More notes
              </h2>
              <PostList posts={more} />
            </section>
          )}
        </div>
      </div>
    </article>
  );
}
