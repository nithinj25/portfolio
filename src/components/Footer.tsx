import Link from "next/link";
import { site } from "@/data/site";
import { ArrowUp, RssIcon } from "./icons";

const pages = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/blog", label: "Blog" },
];

export default function Footer() {
  return (
    <footer className="mt-24">
      <div className="mx-auto max-w-[920px] px-5">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4 border-t border-line pt-6 text-sm text-muted">
          <p>
            © {new Date().getFullYear()} {site.name}
          </p>
          <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {pages.map((p) => (
              <Link key={p.href} href={p.href} className="link hover:text-fg">
                {p.label}
              </Link>
            ))}
            <a href={site.socials.github} target="_blank" rel="noreferrer" className="link hover:text-fg">
              GitHub
            </a>
            <a href="/rss.xml" className="flex items-center gap-1.5 hover:text-fg">
              <RssIcon width={13} height={13} /> RSS
            </a>
            <a
              href="#"
              className="flex items-center gap-1.5 rounded-full border border-line bg-card px-3 py-1 transition-colors hover:border-faint hover:text-fg"
            >
              <ArrowUp width={13} height={13} /> Back to top
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
