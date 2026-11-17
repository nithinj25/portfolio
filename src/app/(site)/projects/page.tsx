import type { Metadata } from "next";
import ProjectGrid from "@/components/ProjectGrid";
import { site } from "@/data/site";
import { projects } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Projects",
  description: "Real-time systems, low-latency engines and AI products, with source for each.",
};

export default function ProjectsPage() {
  return (
    <div className="pt-12">
      <header className="rise">
        <h1 className="font-serif text-5xl leading-none tracking-tight">Projects</h1>
        <p className="mt-4 max-w-md text-lg text-muted">
          Things I have built to understand how they work. Each one links to its source.
        </p>
        <p className="mt-4 font-mono text-xs text-faint">
          {projects.length} projects ·{" "}
          <a href={site.socials.github} target="_blank" rel="noreferrer" className="link hover:text-accent">
            more on GitHub
          </a>
        </p>
      </header>

      <div className="rise mt-10" style={{ "--i": 1 } as React.CSSProperties}>
        <ProjectGrid projects={projects} />
      </div>
    </div>
  );
}
