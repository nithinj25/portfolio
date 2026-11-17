import Link from "next/link";
import LostScene from "@/components/LostScene";

export default function NotFound() {
  return (
    <div className="grid min-h-[70vh] place-items-center pt-10 text-center">
      <div className="rise w-full">
        <LostScene />
        <h1 className="mt-8 font-serif text-5xl tracking-tight">This page drifted off course.</h1>
        <p className="mt-3 text-muted">The link is broken or the page has moved. Everything else is still where you left it.</p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link href="/" className="rounded-full bg-fg px-5 py-2.5 text-sm font-medium text-bg transition-transform hover:-translate-y-0.5">
            Back home
          </Link>
          <Link href="/projects" className="rounded-full border border-line bg-card px-5 py-2.5 text-sm text-muted transition-colors hover:text-fg">
            See projects
          </Link>
        </div>
      </div>
    </div>
  );
}
