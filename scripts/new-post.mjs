// Usage: npm run new-post "My post title"
// Creates content/blog/my-post-title.md as a draft, ready to write in.
import fs from "node:fs";
import path from "node:path";

const title = process.argv.slice(2).join(" ").trim();
if (!title) {
  console.error('Give the post a title:  npm run new-post "My post title"');
  process.exit(1);
}

const slug = title
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "");
const dir = path.join(process.cwd(), "content", "blog");
const file = path.join(dir, `${slug}.md`);

if (fs.existsSync(file)) {
  console.error(`A post already exists at content/blog/${slug}.md`);
  process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(
  file,
  `---
title: ${JSON.stringify(title)}
description: "One sentence that tells a reader why this is worth their time."
date: ${today}
tags: []
draft: true
---

Start writing here.
`,
);

console.log(`Created content/blog/${slug}.md (draft). Preview it at http://localhost:3000/blog/${slug}`);
console.log("Set draft: false when it is ready to publish.");
