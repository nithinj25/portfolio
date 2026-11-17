import type { Metadata } from "next";
import Link from "next/link";
import PostList from "@/components/PostList";
import { RssIcon } from "@/components/icons";
import { formatDate, getAllPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Notes",
  description: "Notes on real-time systems, low-latency code and building with LLMs.",
};

export default function BlogIndex() {
  const posts = getAllPosts();
  const [latest, ...rest] = posts;
  const years = [...new Set(rest.map((p) => p.date.slice(0, 4)))];

  return (
    <div className="mx-auto max-w-[760px] px-5 pt-14 sm:pt-20">
      <header>
        <h1 className="font-serif text-5xl leading-none tracking-tight sm:text-6xl">Notes</h1>
        <p className="mt-4 max-w-[52ch] text-lg leading-relaxed text-muted">
          On real-time systems, low-latency code and building with LLMs. Mostly things I had to learn the hard way.
        </p>
        <p className="mt-4 flex items-center gap-4 font-mono text-xs text-faint">
          <span>
            {posts.length} {posts.length === 1 ? "post" : "posts"}
          </span>
          <a href="/rss.xml" className="flex items-center gap-1.5 transition-colors hover:text-accent">
            <RssIcon width={12} height={12} /> Subscribe via RSS
          </a>
        </p>
      </header>

      {posts.length === 0 && <p className="mt-16 text-muted">Nothing published yet. The first post is on its way.</p>}

      {/* The newest post, large, with its cover if it has one. */}
      {latest && (
        <Link href={`/blog/${latest.slug}`} className="group mt-12 block border-y border-line py-10">
          {latest.cover && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={latest.cover} alt={latest.coverAlt ?? ""} className="mb-8 w-full rounded-2xl border border-line object-cover" />
          )}
          <p className="flex flex-wrap items-center gap-3 font-mono text-xs text-faint">
            <span className="rounded-full bg-accent/10 px-2 py-0.5 text-accent">Latest</span>
            <time dateTime={latest.date}>{formatDate(latest.date)}</time>
            <span>{latest.minutes} min read</span>
          </p>
          <h2 className="mt-4 font-serif text-4xl leading-[1.08] tracking-tight transition-colors group-hover:text-accent sm:text-5xl">
            {latest.title}
          </h2>
          {latest.description && <p className="mt-4 max-w-[60ch] text-lg leading-relaxed text-muted">{latest.description}</p>}
          <p className="mt-6 text-sm text-fg">
            Read the post <span aria-hidden className="inline-block transition-transform group-hover:translate-x-1">→</span>
          </p>
        </Link>
      )}

      {years.map((year) => (
        <section key={year} className="mt-12" aria-label={`Posts from ${year}`}>
          <h2 className="mb-3 font-mono text-xs tracking-widest text-faint">{year}</h2>
          <PostList posts={rest.filter((p) => p.date.startsWith(year))} />
        </section>
      ))}
    </div>
  );
}
