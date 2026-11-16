import type { Metadata } from "next";
import PostList from "@/components/PostList";
import { RssIcon } from "@/components/icons";
import { getAllPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Blog",
  description: "Notes on real-time systems, low-latency code and building with LLMs.",
};

export default function BlogIndex() {
  const posts = getAllPosts();
  const years = [...new Set(posts.map((p) => p.date.slice(0, 4)))];

  return (
    <div className="pt-12">
      <header className="rise">
        <h1 className="font-serif text-5xl leading-none tracking-tight">Blog</h1>
        <p className="mt-4 max-w-md text-lg text-muted">
          Notes on real-time systems, low-latency code and building with LLMs. Mostly things I had to learn the hard way.
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

      {years.map((year, i) => (
        <section key={year} className="rise mt-12" style={{ "--i": i + 1 } as React.CSSProperties} aria-label={`Posts from ${year}`}>
          <h2 className="mb-3 font-mono text-xs tracking-widest text-faint">{year}</h2>
          <PostList posts={posts.filter((p) => p.date.startsWith(year))} />
        </section>
      ))}
    </div>
  );
}
