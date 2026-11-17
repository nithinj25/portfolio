"use client";

import { useState } from "react";
import { AREAS, type Area, type Project } from "@/lib/projects";
import ProjectCard from "./ProjectCard";

/** The /projects grid: three columns on wide screens, with filter chips by area. */
export default function ProjectGrid({ projects }: { projects: Project[] }) {
  const [area, setArea] = useState<Area | "All">("All");
  const shown = area === "All" ? projects : projects.filter((p) => p.areas.includes(area));
  const count = (a: Area) => projects.filter((p) => p.areas.includes(a)).length;

  return (
    <>
      <div role="group" aria-label="Filter projects by area" className="flex flex-wrap gap-2">
        {(["All", ...AREAS] as const).map((a) => (
          <button
            key={a}
            type="button"
            aria-pressed={area === a}
            onClick={() => setArea(a)}
            className="rounded-full border border-line bg-card px-3.5 py-1.5 text-sm text-muted transition-colors hover:text-fg aria-pressed:border-fg aria-pressed:bg-fg aria-pressed:text-bg"
          >
            {a}
            <span className="ml-1.5 font-mono text-xs opacity-60">{a === "All" ? projects.length : count(a)}</span>
          </button>
        ))}
      </div>

      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((p) => (
          <li key={p.slug} className="rise">
            <ProjectCard p={p} />
          </li>
        ))}
      </ul>
      <p aria-live="polite" className="sr-only">
        Showing {shown.length} of {projects.length} projects
      </p>
    </>
  );
}
