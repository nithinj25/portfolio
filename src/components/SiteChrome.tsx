import Footer from "./Footer";
import Nav from "./Nav";
import WorldBackdrop from "./WorldBackdrop";
import { ScrollProgress } from "./widgets";

/**
 * The frame for the portfolio pages (home, projects, 404): the pixel-art
 * backdrop, floating nav, the veil that keeps text readable, and the footer.
 * Blog pages use their own calmer frame (src/app/(blog)/layout.tsx).
 */
export default function SiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ScrollProgress />
      <WorldBackdrop />
      <Nav />
      {/* The veil keeps text readable over the backdrop; the scene shows in full beside and below it. */}
      <div className="veil">
        <main id="main" className="mx-auto max-w-[920px] px-5">
          {children}
        </main>
        <Footer />
      </div>
      {/* Room at the end of every page for the landing: the campsite, unobstructed. */}
      <div aria-hidden className="h-[44vh]" />
    </>
  );
}
