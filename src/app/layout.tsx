import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "@fontsource/instrument-serif/400.css";
import "@fontsource/instrument-serif/400-italic.css";
import "./globals.css";
import CommandMenu from "@/components/CommandMenu";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import StarMargins from "@/components/StarMargins";
import { site } from "@/data/site";
import { getAllPosts } from "@/lib/posts";

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

// Runs before first paint so the saved (or system) theme never flashes.
const themeScript = `(function(){var t;try{t=localStorage.getItem("theme")}catch(e){}if(t!=="light"&&t!=="dark")t=matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";document.documentElement.dataset.theme=t})()`;

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
        <StarMargins />
        <Nav />
        <main id="main" className="mx-auto max-w-[680px] px-5">
          {children}
        </main>
        <Footer />
        <CommandMenu posts={posts} />
      </body>
    </html>
  );
}
