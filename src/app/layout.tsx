import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "@fontsource/instrument-serif/400.css";
import "@fontsource/instrument-serif/400-italic.css";
import "./globals.css";
import CommandMenu from "@/components/CommandMenu";
import { site } from "@/data/site";
import { getAllPosts } from "@/lib/posts";
import { projects } from "@/lib/projects";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} · ${site.role}`, template: `%s · ${site.name}` },
  description: site.description,
  openGraph: { title: site.name, description: site.description, url: site.url, siteName: site.name, type: "website" },
  twitter: { card: "summary_large_image" },
  alternates: { types: { "application/rss+xml": "/rss.xml" } },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf9f5" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0b0c" },
  ],
};

// Runs before first paint so the theme never flashes.
// Same rule as ThemeToggle: a saved "light"/"dark" wins; otherwise follow the
// visitor's clock (light 7:00–18:59, dark otherwise).
const themeScript = `(function(){var t;try{t=localStorage.getItem("theme")}catch(e){}if(t!=="light"&&t!=="dark"){var h=new Date().getHours();t=h>=7&&h<19?"light":"dark"}document.documentElement.dataset.theme=t})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const posts = getAllPosts().map(({ slug, title }) => ({ slug, title }));
  return (
    <html lang="en" data-theme="dark" data-scroll-behavior="smooth" className={`${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh font-sans">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-card focus:px-3 focus:py-2"
        >
          Skip to content
        </a>
        {children}
        <CommandMenu posts={posts} projects={projects.map(({ slug, title, tagline }) => ({ slug, title, tagline }))} />
      </body>
    </html>
  );
}
