import Link from "next/link";
import { site } from "@/data/site";
import { formatDate, getAllPosts, type Post } from "@/lib/posts";

/**
 * The body of a blog post: header, text, tags, and links to the next and
 * previous posts. Shared by the full post page and the reader panel, so a
 * post looks the same in both.
 *
 * `inPanel`: links to other posts replace the history entry, so one close
 * (✕ or Esc) always returns to the page underneath.
 */
export default function PostArticle({ post, titleId, inPanel = false }: { post: Post; titleId?: string; inPanel?: boolean }) {
  const all = getAllPosts();
  const i = all.findIndex((p) => p.slug === post.slug);
  const newer = all[i - 1];
  const older = all[i + 1];

  return (
    <article>
      <header>
        <p className="font-mono text-xs text-faint">
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          <span className="mx-2">·</span>
          {post.minutes} min read
          {post.draft && <span className="ml-3 text-accent">DRAFT · not in production builds</span>}
        </p>
        <h1 id={titleId} className="mt-3 text-balance font-serif text-[2.75rem] leading-[1.05] tracking-tight">
          {post.title}
        </h1>
        {post.description && <p className="mt-4 text-pretty text-lg leading-relaxed text-muted">{post.description}</p>}
      </header>

      <div className="prose mt-10 border-t border-line pt-10" dangerouslySetInnerHTML={{ __html: post.html }} />

      {post.tags.length > 0 && (
        <ul className="mt-10 flex flex-wrap gap-2">
          {post.tags.map((t) => (
            <li key={t} className="rounded-full border border-line bg-card px-2.5 py-1 font-mono text-xs leading-none text-muted">
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
              <Link href={`/blog/${older.slug}`} replace={inPanel} className="group rounded-2xl border border-line bg-card p-4">
                <span className="font-mono text-xs uppercase tracking-widest text-faint">← Older</span>
                <span className="mt-1 block font-medium tracking-tight transition-colors group-hover:text-accent">{older.title}</span>
              </Link>
            ) : (
              <span />
            )}
            {newer && (
              <Link href={`/blog/${newer.slug}`} replace={inPanel} className="group rounded-2xl border border-line bg-card p-4 sm:text-right">
                <span className="font-mono text-xs uppercase tracking-widest text-faint">Newer →</span>
                <span className="mt-1 block font-medium tracking-tight transition-colors group-hover:text-accent">{newer.title}</span>
              </Link>
            )}
          </nav>
        )}
      </footer>
    </article>
  );
}
