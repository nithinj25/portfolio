# Portfolio

Personal site and blog. Next.js 16, Tailwind CSS 4, Markdown posts. Every page is statically generated.

```bash
npm install
npm run dev        # http://localhost:3000 (polls for file changes, so it works on a Windows drive under WSL)
npm run build      # production build
```

## Editing your details

Personal details live in [`src/data/site.ts`](src/data/site.ts) and projects in [`src/lib/projects.ts`](src/lib/projects.ts). Anything still missing is marked `TODO` in those files and shows as a dashed placeholder on the page:

| Field | What it does |
|---|---|
| `url` | Your real domain. Used for link previews, RSS and the sitemap. |
| `avatar` | Put a photo in `public/` and set its path (e.g. `/avatar.jpg`). Until then the site shows your initials. |
| `resume` | Put a PDF in `public/` and set its path. Until then the résumé icon is a dashed TODO. |
| `socials.linkedin`, `socials.x` | Profile URLs. Empty ones show as dashed TODO icons. |
| `experience` | Empty for now, so the section shows one TODO row. Add roles, newest first. |
| `achievements` | Rows with title, organisation and year. Add a `logo` path to replace the initial. |
| `showTodos` | `true` shows dashed TODO placeholders for anything not filled in. Set to `false` to hide them all so the site looks finished. |
| `headlineStats` | The two measured numbers beside your name in the hero. |
| `leetcode` | Your LeetCode username, for the Activity heatmap (placeholder until set). |
| `showGithubActivity` | Set to `true` for a contribution heatmap. It is loaded from a third-party API using your GitHub username. |

### Projects

Each entry in `src/lib/projects.ts` drives its home page card, its card on `/projects` and its own page at `/projects/<slug>`.

- `featured: true` puts it on the home page.
- `image: "/projects/<slug>.png"` shows a screenshot (put the file in `public/projects/`). Without one, the card shows its diagram or a TODO slot.
- `details` is the bullet list on the project page. Without it, that page shows a TODO.

## Writing a blog post

```bash
npm run new-post "My post title"
```

This creates `content/blog/my-post-title.md` as a draft. Write in Markdown under the header:

```md
---
title: "My post title"
description: "One sentence shown under the title and in link previews."
date: 2026-11-16
tags: [systems, notes]
draft: true
---
```

- Drafts are visible in `npm run dev` and left out of production builds. Set `draft: false` to publish.
- The filename is the URL: `content/blog/my-post.md` becomes `/blog/my-post`.
- Code blocks, tables, lists, quotes and images all work. Put images in `public/` and link them as `/my-image.png`.
- Posts appear on the home page, at `/blog`, in the command menu (Ctrl/⌘ K), the RSS feed and the sitemap automatically.

## Deploying

Push this folder to its own GitHub repository and import it on [Vercel](https://vercel.com/new). No settings are needed. Each push rebuilds the site, so publishing a post is: write, commit, push.

## Where things are

```
content/blog/        posts (Markdown)
src/data/site.ts     personal content: bio, stack, experience, achievements
src/lib/projects.ts  every project
src/app/             pages: home, /projects, /projects/[slug], /blog, /blog/[slug], rss.xml, sitemap
src/components/      Banner and StarMargins (canvases), CommandMenu, ProjectCard, …
src/app/globals.css  colours, fonts and blog typography
```
