import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeStringify from "rehype-stringify";

const POSTS_DIR = path.join(process.cwd(), "content", "blog");

export type PostMeta = {
  slug: string;
  title: string;
  description: string;
  date: string; // ISO
  tags: string[];
  minutes: number;
  draft: boolean;
  /** Optional cover image: `cover: /blog/my-post.png` (file in public/) plus `coverAlt`. */
  cover?: string;
  coverAlt?: string;
};

export type Heading = { id: string; text: string; level: 2 | 3 };
export type Post = PostMeta & { html: string; headings: Heading[] };

// Minimal HTML-tree types for the small rehype step below.
type HNode = { type: string; tagName?: string; value?: string; properties?: Record<string, unknown>; children?: HNode[] };

/**
 * A paragraph that holds only an image becomes a <figure>, with the image's
 * Markdown title as the caption: ![alt](/blog/pic.png "Caption here")
 */
function rehypeFigures() {
  const walk = (node: HNode) => {
    node.children = node.children?.map((child) => {
      const kids = child.children?.filter((c) => !(c.type === "text" && !c.value?.trim())) ?? [];
      if (child.tagName === "p" && kids.length === 1 && kids[0].tagName === "img") {
        const img = kids[0];
        const caption = img.properties?.title ? String(img.properties.title) : "";
        img.properties = { ...img.properties, title: undefined, loading: "lazy", decoding: "async" };
        return {
          type: "element",
          tagName: "figure",
          properties: {},
          children: caption ? [img, { type: "element", tagName: "figcaption", properties: {}, children: [{ type: "text", value: caption }] }] : [img],
        };
      }
      walk(child);
      return child;
    });
  };
  return (tree: HNode) => walk(tree);
}

function readPost(file: string): PostMeta & { body: string } {
  const slug = file.replace(/\.md$/, "");
  const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf8");
  const { data, content } = matter(raw);
  const words = content.trim().split(/\s+/).length;
  return {
    slug,
    title: String(data.title ?? slug),
    description: String(data.description ?? ""),
    date: new Date(data.date ?? Date.now()).toISOString(),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    minutes: Math.max(1, Math.round(words / 220)),
    draft: Boolean(data.draft),
    cover: data.cover ? String(data.cover) : undefined,
    coverAlt: data.coverAlt ? String(data.coverAlt) : undefined,
    body: content,
  };
}

/** Newest first. Drafts show up in `npm run dev` and are left out of production builds. */
export function getAllPosts(): PostMeta[] {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const { body: _body, ...meta } = readPost(f);
      return meta;
    })
    .filter((p) => process.env.NODE_ENV !== "production" || !p.draft)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export async function getPost(slug: string): Promise<Post | null> {
  const file = `${slug}.md`;
  if (!/^[\w-]+$/.test(slug) || !fs.existsSync(path.join(POSTS_DIR, file))) return null;
  const { body, ...meta } = readPost(file);
  const html = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypeFigures)
    .use(rehypePrettyCode, {
      theme: { light: "github-light", dark: "github-dark-dimmed" },
      keepBackground: false,
    })
    .use(rehypeStringify)
    .process(body);
  // Section headings for the table of contents (ids come from rehype-slug).
  const headings: Heading[] = [...String(html).matchAll(/<h([23]) id="([^"]+)">([\s\S]*?)<\/h\1>/g)].map((m) => ({
    level: Number(m[1]) as 2 | 3,
    id: m[2],
    text: m[3].replace(/<[^>]+>/g, "").replace(/&#x26;|&amp;/g, "&").replace(/&#x3C;|&lt;/g, "<").trim(),
  }));
  return { ...meta, html: String(html), headings };
}

export function formatDate(iso: string, style: "long" | "short" = "long") {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    year: "numeric",
    month: style === "long" ? "long" : "short",
    day: "numeric",
  }).format(new Date(iso));
}
