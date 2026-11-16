// ─────────────────────────────────────────────────────────────
//  Everything the site says about you lives in this file.
//  Edit here; no component needs to change.
//  Sections with an empty list (experience, for now) hide themselves.
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
  // Path to a PDF in /public (e.g. /resume.pdf). Empty hides the button.
  resume: "",
  socials: {
    github: "https://github.com/nithinj25",
    linkedin: "",
    x: "",
  },
  // Shows a GitHub contribution heatmap under "Stack". When on, each visitor's
  // browser asks github-contributions-api.jogruber.de for your public activity.
  showGithubActivity: false,
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
};

// Add roles here, newest first, and the "Experience" section appears.
// { company: "Acme", role: "Software Engineer Intern", start: "May 2026", end: "Aug 2026", summary: "What you shipped." },
export const experience: Experience[] = [];

export type Project = {
  title: string;
  blurb: string;
  metric?: string;
  tech: string[];
  year: string;
  live?: string;
  source?: string;
  art?: "duel" | "book" | "graph" | "pulse";
};

export const featured: Project[] = [
  {
    title: "MathDuel",
    blurb:
      "Real-time 1v1 mental-arithmetic duels. Both players get the same seeded questions, the server never sends an answer, and results settle onto a Glicko-2 ladder.",
    metric: "400 concurrent players · 13 ms p95",
    tech: ["FastAPI", "Node", "React 19", "Redis", "Kafka", "PostgreSQL"],
    year: "2026",
    live: "https://mathduel.me",
    source: "https://github.com/nithinj25/math_dual",
    art: "duel",
  },
  {
    title: "orderbook_cpp",
    blurb:
      "A lock-free limit order book matching engine. SPSC ring buffers in and out, a matching thread that never allocates, and a hierarchical bitmap for best-price lookup.",
    metric: "31 ns median · ~16M msgs/sec",
    tech: ["C++17", "Lock-free", "CMake"],
    year: "2026",
    source: "https://github.com/nithinj25/orderbook_cpp",
    art: "book",
  },
  {
    title: "DevLens",
    blurb:
      "Repository analyzer and recruiter intelligence platform. A multi-agent pipeline reads a candidate's Git history, code and profile, then generates technical questions and a scored PDF report.",
    metric: "3 agents · candidate & recruiter flows",
    tech: ["Next.js 16", "FastAPI", "LangGraph", "Supabase"],
    year: "2026",
    source: "https://github.com/nithinj25/devLens2",
    art: "graph",
  },
  {
    title: "Clinical Trial Matcher",
    blurb:
      "Matches cancer patients to open clinical trials with a model that runs entirely on-device. Multilingual, private by construction, and written for a physician to read.",
    metric: "Gemma 3 12B · fully on-device",
    tech: ["Gemma 3", "ChromaDB", "RAG", "React"],
    year: "2026",
    source: "https://github.com/nithinj25/trial-matcher",
    art: "pulse",
  },
];

export const moreProjects: Project[] = [
  {
    title: "ArogyaLink",
    blurb: "Emergency healthcare coordination for rural India: one phone call, any language, instant dispatch.",
    tech: ["Twilio IVR", "Gemini", "FastAPI", "Firebase", "Flutter"],
    year: "2025",
    live: "https://solution-challenge-cb95c.web.app",
    source: "https://github.com/nithinj25/arogyaLink",
  },
  {
    title: "WS Auction",
    blurb: "Multiplayer auction game in an 80s arcade shell. Redis Pub/Sub fans rooms out across server instances.",
    tech: ["WebSockets", "Node.js", "Redis", "PostgreSQL"],
    year: "2026",
    source: "https://github.com/nithinj25/auction_game",
  },
  {
    title: "URL Shortener",
    blurb: "Deployed link shortener with JWT auth, Redis caching, GeoIP click analytics and a Chrome extension.",
    tech: ["React", "Express", "MongoDB", "Redis"],
    year: "2026",
    source: "https://github.com/nithinj25/url_shortner",
  },
  {
    title: "sift",
    blurb: "A streaming record processor for JSONL and CSV with a small expression language. Zero runtime dependencies.",
    tech: ["TypeScript", "CLI", "Streams"],
    year: "2026",
    source: "https://github.com/nithinj25/cli_tool",
  },
];

export type Highlight = { title: string; detail: string; year: string; url?: string };

export const highlights: Highlight[] = [
  {
    title: "Gemma hackathon",
    detail: "Kaggle × Google DeepMind · built Clinical Trial Matcher",
    year: "2026",
    url: "https://github.com/nithinj25/trial-matcher",
  },
  {
    title: "Google Solution Challenge",
    detail: "Google Developer Groups · built ArogyaLink",
    year: "2025",
    url: "https://github.com/nithinj25/arogyaLink",
  },
];
