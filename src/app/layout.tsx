import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { geistMono, instrumentSerif } from "./fonts";
import "./globals.css";
import CommandMenuLoader from "@/components/CommandMenuLoader";
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
// Same rules as src/lib/daycycle.ts `daylight`: a saved "light"/"dark" wins;
// otherwise the visitor's clock picks the theme and shade step
// (light 06:00–18:59: morning, afternoon from 15:00, evening from 17:15;
// dark: dusk 19:00–20:59 and 04:30–05:59, night otherwise).
// ?time=HH:MM or ?sky=dawn|day|dusk|night previews another time.
const themeScript = `(function(){var d=document.documentElement,t;try{t=localStorage.getItem("theme")}catch(e){}if(t==="light"||t==="dark"){d.dataset.theme=t;return}var n=new Date(),m=n.getHours()*60+n.getMinutes(),q=new URLSearchParams(location.search),p=(q.get("time")||"").match(/^(\\d{1,2}):(\\d{2})$/),s={dawn:390,day:750,dusk:1100,night:1380}[q.get("sky")];if(p)m=(+p[1]%24)*60+(+p[2]%60);else if(s!=null)m=s;var a="dark",b="night";if(m>=360&&m<900){a="light";b="morning"}else if(m>=900&&m<1035){a="light";b="afternoon"}else if(m>=1035&&m<1140){a="light";b="evening"}else if((m>=1140&&m<1260)||(m>=270&&m<360)){b="dusk"}d.dataset.theme=a;d.dataset.daylight=b})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const posts = getAllPosts().map(({ slug, title }) => ({ slug, title }));
  return (
    <html lang="en" data-theme="dark" data-scroll-behavior="smooth" className={`${GeistSans.variable} ${geistMono.variable} ${instrumentSerif.variable}`} suppressHydrationWarning>
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
        <CommandMenuLoader posts={posts} projects={projects.map(({ slug, title, tagline }) => ({ slug, title, tagline }))} />
      </body>
    </html>
  );
}
