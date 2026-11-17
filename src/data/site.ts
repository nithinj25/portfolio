// ─────────────────────────────────────────────────────────────
//  Everything the site says about you lives in this file.
//  Edit here; no component needs to change.
//  Anything still missing is marked TODO, here and on the page.
// ─────────────────────────────────────────────────────────────

export const site = {
  name: "Nithin J",
  handle: "nithinj25",
  role: "Full-stack & systems engineer",
  tagline: "Real-time systems × applied AI",
  // Used for canonical URLs, RSS and the sitemap. Change once you have a domain.
  url: "https://nithinj.vercel.app",
  description:
    "Real-time systems, low-latency engines and AI-powered products by Nithin J, with notes on what was learned along the way.",
  location: "India",
  timeZone: "Asia/Kolkata",
  timeZoneLabel: "IST",
  email: "nithinj326@gmail.com",
  available: true,
  availabilityText: "Open to internships & full-time roles",
  // Drop a photo in /public (e.g. /avatar.jpg) and put its path here.
  avatar: "",
  // TODO: put your résumé PDF in /public and set its path (e.g. "/resume.pdf").
  resume: "",
  // TODO: add your LinkedIn and X profile URLs. Empty ones show as dashed TODO icons.
  socials: {
    github: "https://github.com/nithinj25",
    linkedin: "",
    x: "",
  },
  // Shows a GitHub contribution heatmap under "Stack". When on, each visitor's
  // browser asks github-contributions-api.jogruber.de for your public activity.
  // TODO: set to true to link the GitHub heatmap in the Activity section.
  showGithubActivity: false,
  // TODO: your LeetCode username, to link the LeetCode heatmap. Empty shows a placeholder.
  leetcode: "",
};

export const about = [
  "I like owning the whole picture: the data model, the WebSocket server, the matching loop, and the pixels on screen. Most of what I build is real-time, and I care about proving it works: load tests, latency percentiles, differential tests.",
  "Lately that has meant a 1v1 mental-arithmetic ladder that stays fair under lag, a lock-free order book in C++17, and LLM agent pipelines that have to answer in production rather than in a notebook.",
];

export const focus = ["Real-time systems", "Low-latency C++", "LLM agents & RAG", "Full-stack web"];

export const stack: { group: string; items: string[] }[] = [
  { group: "Languages", items: ["TypeScript", "Python", "C++17", "SQL"] },
  { group: "Backend", items: ["Node.js", "FastAPI", "WebSockets", "Kafka", "Express"] },
  { group: "Frontend", items: ["React 19", "Next.js", "Tailwind CSS", "Three.js"] },
  { group: "Data", items: ["PostgreSQL", "Redis", "MongoDB", "ChromaDB"] },
  { group: "AI", items: ["LangGraph", "RAG", "Gemma", "Groq"] },
  { group: "Infra", items: ["Docker", "Caddy", "Azure", "Vercel", "Railway"] },
];

export type Experience = {
  company: string;
  role: string;
  start: string;
  end: string;
  summary?: string;
  url?: string;
  /** Image in /public, e.g. "/logos/acme.png". Without one, the row shows the company's initial. */
  logo?: string;
};

// TODO: add your roles here, newest first. While this list is empty the
// Experience section shows a TODO placeholder row.
// { company: "Acme", role: "Software Engineer Intern", start: "May 2026", end: "Aug 2026", summary: "What you shipped." },
export const experience: Experience[] = [];

export type Achievement = {
  title: string;
  org: string;
  note?: string;
  year: string;
  url?: string;
  /** Image in /public, e.g. "/logos/kaggle.png". Without one, the row shows the organisation's initial. */
  logo?: string;
};

export const achievements: Achievement[] = [
  {
    title: "Gemma hackathon",
    org: "Kaggle × Google DeepMind",
    note: "Built Clinical Trial Matcher",
    year: "2026",
    url: "https://github.com/nithinj25/trial-matcher",
  },
  {
    title: "Google Solution Challenge",
    org: "Google Developer Groups",
    note: "Built ArogyaLink",
    year: "2025",
    url: "https://github.com/nithinj25/arogyaLink",
  },
];
