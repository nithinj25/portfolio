import Link from "next/link";
import BlogHeader from "@/components/blog/BlogHeader";
import { RssIcon } from "@/components/icons";
import { ScrollProgress } from "@/components/widgets";
import { site } from "@/data/site";

/**
 * The blog's frame: a quiet reading space, separate from the pixel-art
 * portfolio. No backdrop, no comets; just a header, the page, and a footer.
 */
export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ScrollProgress />
      <BlogHeader />
      <main id="main" className="min-h-[70vh]">
        {children}
      </main>
      <footer className="mt-24 border-t border-line">
        <div className="mx-auto flex max-w-[1320px] flex-wrap items-center justify-between gap-4 px-5 py-8 text-sm text-muted">
          <p>
            Notes by{" "}
            <Link href="/" className="link text-fg">
              {site.name}
            </Link>
          </p>
          <nav aria-label="Blog footer" className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link href="/" className="link hover:text-fg">
              Portfolio
            </Link>
            <Link href="/projects" className="link hover:text-fg">
              Projects
            </Link>
            <Link href="/blog" className="link hover:text-fg">
              All posts
            </Link>
            <a href="/rss.xml" className="flex items-center gap-1.5 hover:text-fg">
              <RssIcon width={13} height={13} /> RSS
            </a>
          </nav>
        </div>
      </footer>
    </>
  );
}
