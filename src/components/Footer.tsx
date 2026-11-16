import Link from "next/link";
import { site } from "@/data/site";
import { RssIcon } from "./icons";

export default function Footer() {
  return (
    <footer className="mt-24">
      <div className="mx-auto max-w-[800px] px-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6 text-sm text-muted">
        <p>
          © {new Date().getFullYear()} {site.name}
        </p>
        <div className="flex items-center gap-5">
          <Link href="/blog" className="link hover:text-fg">
            Blog
          </Link>
          <a href={site.socials.github} target="_blank" rel="noreferrer" className="link hover:text-fg">
            GitHub
          </a>
          <a href="/rss.xml" className="flex items-center gap-1.5 hover:text-fg">
            <RssIcon width={13} height={13} /> RSS
          </a>
        </div>
      </div>
      </div>
    </footer>
  );
}
