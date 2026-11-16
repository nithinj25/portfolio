import Link from "next/link";
import { formatDate, type PostMeta } from "@/lib/posts";

export default function PostList({ posts }: { posts: PostMeta[] }) {
  return (
    <ul className="border-t border-line">
      {posts.map((p) => (
        <li key={p.slug} className="border-b border-line">
          <Link href={`/blog/${p.slug}`} className="group grid gap-1 py-4 sm:grid-cols-[1fr_auto] sm:gap-6">
            <div className="min-w-0">
              <h3 className="font-medium tracking-tight transition-colors group-hover:text-accent">
                {p.title}
                {p.draft && (
                  <span className="ml-2 rounded-full border border-line px-2 py-0.5 align-middle font-mono text-[10px] uppercase tracking-wider text-muted">
                    draft
                  </span>
                )}
              </h3>
              {p.description && <p className="mt-1 text-sm leading-relaxed text-muted">{p.description}</p>}
              {p.tags.length > 0 && <p className="mt-2 font-mono text-[11px] text-faint">{p.tags.map((t) => `#${t}`).join("  ")}</p>}
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
