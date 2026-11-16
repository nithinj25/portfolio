# Portfolio

Personal site and blog. Next.js 16, Tailwind CSS 4, Markdown posts. Every page is statically generated.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
```

## Editing your details

Everything the site says about you is in [`src/data/site.ts`](src/data/site.ts): name, tagline, bio, stack, projects, hackathons and social links. A few things worth filling in:

| Field | What it does |
|---|---|
| `url` | Your real domain. Used for link previews, RSS and the sitemap. |
| `avatar` | Put a photo in `public/` and set its path (e.g. `/avatar.jpg`). Until then the site shows your initials. |
| `resume` | Put a PDF in `public/` and set its path to show a résumé button. |
| `socials.linkedin`, `socials.x` | Leave empty to hide the icon. |
| `experience` | Empty for now, so the section is hidden. Add a role and it appears. |
| `showGithubActivity` | Set to `true` for a contribution heatmap. It is loaded from a third-party API using your GitHub username. |

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
src/data/site.ts     all personal content
src/app/             pages: home, /blog, /blog/[slug], rss.xml, sitemap
src/components/      Banner (pixel landscape), CommandMenu, ProjectArt, …
src/app/globals.css  colours, fonts and blog typography
```
