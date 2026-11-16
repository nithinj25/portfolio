---
title: "Hello, world"
description: "Why I'm starting a blog, and a quick tour of what a post here can do."
date: 2026-11-16
tags: [meta]
---

I build things to understand them, and I understand them better once I have had to explain them. This blog is where the explaining happens: short notes on real-time systems, low-latency code and shipping with LLMs.

The rest of this first post doubles as a reference for how posts are written.

## Posts are Markdown files

Every post is one file in `content/blog/`. The filename becomes the URL, and a few lines at the top describe it:

```md
---
title: "Hello, world"
description: "Shown under the title and in link previews."
date: 2026-11-16
tags: [meta]
draft: false
---
```

Set `draft: true` and the post shows up while you run the site locally but is left out of the published build.

## What you can use

Code blocks are highlighted and follow the light or dark theme:

```ts
function readingTime(text: string) {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 220));
}
```

Inline `code`, **bold**, *italic*, [links](https://github.com/nithinj25) and lists all work:

1. Write the post.
2. Push to GitHub.
3. The site rebuilds and the post is live.

Tables are good for benchmarks:

| Run | p50 | p99 |
|---|---|---|
| Before | 398 ns | 2,106 ns |
| After | 13 ns | 22 ns |

> And a quote, for the one sentence you want people to remember.

That is everything. More soon.
