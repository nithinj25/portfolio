import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-[60vh] place-items-center text-center">
      <div className="rise">
        <p className="font-mono text-xs tracking-widest text-accent">404</p>
        <h1 className="mt-3 font-serif text-5xl tracking-tight">This page took a wrong turn.</h1>
        <p className="mt-3 text-muted">The link is broken or the page has moved.</p>
        <Link href="/" className="mt-6 inline-block rounded-full bg-fg px-5 py-2.5 text-sm font-medium text-bg">
          Back home
        </Link>
      </div>
    </div>
  );
}
