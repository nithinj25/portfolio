import Link from "next/link";
import { formatDate, type PostMeta } from "@/lib/posts";
import { Spotlight } from "./widgets";

const Draft = () => (
  <span className="ml-2 rounded-full border border-line px-2 py-0.5 align-middle font-mono text-[11px] uppercase tracking-wider text-muted">
    draft
  </span>
);

/** The newest post, as a larger card above the list. */
export function FeaturedPost({ post }: { post: PostMeta }) {
  return (
    <Spotlight className="group relative mb-2 rounded-2xl border border-line bg-card p-6 transition duration-300 hover:-translate-y-0.5 hover:border-accent/50 motion-reduce:transform-none sm:p-7">
      <p className="flex items-center gap-3 font-mono text-xs text-faint">
        <span className="rounded-full bg-accent/10 px-2 py-0.5 text-accent">Latest</span>
        <time dateTime={post.date}>{formatDate(post.date)}</time>
        <span>{post.minutes} min read</span>
      </p>
      <h3 className="mt-4 max-w-[26ch] font-serif text-3xl leading-[1.1] tracking-tight sm:text-4xl">
        <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0 after:content-['']">
          {post.title}
        </Link>
        {post.draft && <Draft />}
      </h3>
      {post.description && <p className="mt-3 max-w-[60ch] leading-relaxed text-muted">{post.description}</p>}
      <div className="mt-5 flex items-center justify-between gap-4">
        <p className="font-mono text-xs text-faint">{post.tags.map((t) => `#${t}`).join("  ")}</p>
        <span className="flex items-center gap-1 text-sm text-muted transition-colors group-hover:text-accent">
          Read <span aria-hidden className="transition-transform group-hover:translate-x-0.5">→</span>
        </span>
      </div>
    </Spotlight>
  );
}

export default function PostList({ posts }: { posts: PostMeta[] }) {
  if (posts.length === 0) return null;
  return (
    <ul className="border-t border-line">
      {posts.map((p) => (
        <li key={p.slug} className="border-b border-line">
          <Link href={`/blog/${p.slug}`} className="group grid gap-1 py-4 sm:grid-cols-[1fr_auto] sm:gap-6">
            <div className="min-w-0">
              <h3 className="font-medium tracking-tight transition-colors group-hover:text-accent">
                {p.title}
                {p.draft && <Draft />}
              </h3>
              {p.description && <p className="mt-1 max-w-[68ch] text-sm leading-relaxed text-muted">{p.description}</p>}
              {p.tags.length > 0 && <p className="mt-2 font-mono text-xs text-faint">{p.tags.map((t) => `#${t}`).join("  ")}</p>}
            </div>
            <p className="whitespace-nowrap font-mono text-xs text-faint sm:pt-1 sm:text-right">
              <time dateTime={p.date}>{formatDate(p.date, "short")}</time>
              <span className="mx-1.5">·</span>
              {p.minutes} min
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
