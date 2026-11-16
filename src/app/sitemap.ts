import type { MetadataRoute } from "next";
import { site } from "@/data/site";
import { getAllPosts } from "@/lib/posts";
import { projects } from "@/lib/projects";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: site.url },
    { url: `${site.url}/projects` },
    ...projects.map((p) => ({ url: `${site.url}/projects/${p.slug}` })),
    { url: `${site.url}/blog` },
    ...getAllPosts().map((p) => ({ url: `${site.url}/blog/${p.slug}`, lastModified: p.date })),
  ];
}
