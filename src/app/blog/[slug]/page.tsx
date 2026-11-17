import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "@/components/icons";
import { site } from "@/data/site";
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

  return (
    <article className="mx-auto max-w-[760px] pt-10">
      <Link href="/blog" className="rise inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-fg">
        <ArrowLeft width={14} height={14} /> All posts
      </Link>

      <header className="rise mt-8" style={{ "--i": 1 } as React.CSSProperties}>
        <p className="font-mono text-xs text-faint">
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          <span className="mx-2">·</span>
          {post.minutes} min read
          {post.draft && <span className="ml-3 text-accent">DRAFT · not in production builds</span>}
        </p>
        <h1 className="mt-3 text-balance font-serif text-[2.75rem] leading-[1.05] tracking-tight">{post.title}</h1>
        {post.description && <p className="mt-4 text-pretty text-lg leading-relaxed text-muted">{post.description}</p>}
      </header>

      <div
        className="prose rise mt-10 border-t border-line pt-10"
        style={{ "--i": 2 } as React.CSSProperties}
        dangerouslySetInnerHTML={{ __html: post.html }}
      />

      {post.tags.length > 0 && (
        <ul className="mt-10 flex flex-wrap gap-2">
          {post.tags.map((t) => (
            <li key={t} className="rounded-full border border-line bg-card px-2.5 py-1 font-mono text-[11px] leading-none text-muted">
              #{t}
            </li>
          ))}
        </ul>
      )}

      <footer className="mt-12 border-t border-line pt-8">
        <p className="text-sm text-muted">
          Written by <span className="text-fg">{site.name}</span>. Thoughts or corrections?{" "}
          <a href={`mailto:${site.email}?subject=${encodeURIComponent(`Re: ${post.title}`)}`} className="link text-fg">
            Email me
          </a>
          .
        </p>
        {(newer || older) && (
          <nav aria-label="More posts" className="mt-8 grid gap-3 sm:grid-cols-2">
            {older ? (
              <Link href={`/blog/${older.slug}`} className="group rounded-2xl border border-line bg-card p-4">
                <span className="font-mono text-[11px] uppercase tracking-widest text-faint">← Older</span>
                <span className="mt-1 block font-medium tracking-tight transition-colors group-hover:text-accent">{older.title}</span>
              </Link>
            ) : (
              <span />
            )}
            {newer && (
              <Link href={`/blog/${newer.slug}`} className="group rounded-2xl border border-line bg-card p-4 sm:text-right">
                <span className="font-mono text-[11px] uppercase tracking-widest text-faint">Newer →</span>
                <span className="mt-1 block font-medium tracking-tight transition-colors group-hover:text-accent">{newer.title}</span>
              </Link>
            )}
          </nav>
        )}
      </footer>
    </article>
  );
}
