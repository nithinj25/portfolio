// ─────────────────────────────────────────────────────────────
//  Everything the site says about you lives in this file.
//  Edit here; no component needs to change.
//  Filled in from the résumé (Nithin_res_26_V7.pdf). Anything still
//  missing is marked TODO, here and on the page.
// ─────────────────────────────────────────────────────────────

export const site = {
  name: "Nithin J",
  handle: "nithinj25",
  role: "AI & ML undergrad at BMSIT&M",
  tagline: "Real-time systems × applied AI",
  // Used for canonical URLs, RSS and the sitemap. Change once you have a domain.
  url: "https://nithinj.vercel.app",
  description:
    "Nithin J, an AI & ML undergraduate in Bengaluru, builds real-time systems, low-latency engines and multi-agent LLM pipelines.",
  location: "Bengaluru, India",
  timeZone: "Asia/Kolkata",
  timeZoneLabel: "IST",
  email: "nithinjstudent@gmail.com",
  available: true,
  availabilityText: "Open to internships",
  // Square photo in /public, shown round/rounded at up to 88px.
  avatar: "/avatar.jpg",
  // public/resume.pdf is Nithin_res_26_V7.pdf with the phone number removed
  // (text, icon and link). When you update the résumé, remove it again first.
  resume: "/resume.pdf",
  // TODO: add your X profile URL. Empty ones show as dashed TODO icons.
  socials: {
    github: "https://github.com/nithinj25",
    linkedin: "https://www.linkedin.com/in/nithinj25/",
    x: "",
  },
  // Placeholders for things you have not filled in yet (missing social links,
  // project screenshots, unlinked profiles) show as dashed TODO slots.
  // Set this to false to hide them all, so the site looks finished.
  showTodos: true,
  // GitHub contribution heatmap in the Activity section (uses `handle`).
  // Fetched when the site is built and refreshed daily, not from visitors' browsers.
  showGithubActivity: true,
  // LeetCode username: drives the LeetCode heatmap and stats, fetched the same way.
  leetcode: "higgsboson25",
};

// The hero: one-sentence bio, then what you're doing now.
export const bio =
  "AI & ML undergraduate in Bengaluru, building real-time systems, low-latency engines and multi-agent LLM pipelines, and proving they work with load tests and latency percentiles.";

export const currently = [
  "Studying B.E. Artificial Intelligence & Machine Learning at BMSIT&M, CGPA 9.48.",
  "Core team at Google Developer Groups (DSA & ML) and Tech Head at IEEE.",
  "Co-author of a paper on multi-agent feasibility screening for drug repurposing.",
];

// Longer about text. Not shown on the page in this layout; kept for reuse.
export const about = [
  "I'm an AI & ML undergraduate at BMS Institute of Technology and Management in Bengaluru. I like owning the whole picture: the data model, the WebSocket server, the matching loop, and the pixels on screen. Most of what I build is real-time, and I care about proving it works: load tests, latency percentiles, differential tests.",
  "Lately that has meant a 1v1 mental-arithmetic ladder that stays fair under lag, a lock-free order book in C++17, and co-authoring a paper on multi-agent screening for drug repurposing. Outside my own projects I'm on the GDG core team for DSA & ML and Tech Head at IEEE.",
];

// Headline numbers shown beside your name, from the résumé.
export const headlineStats = [
  { value: "9.48", label: "CGPA · B.E. AI & ML" },
  { value: "Top 12", label: "of 180K+ · EY Techathon" },
];

export const focus = ["Real-time systems", "Low-latency C++", "LLM agents & RAG", "Competitive programming"];

export const stack: { group: string; items: string[] }[] = [
  { group: "Languages", items: ["C++", "Python", "TypeScript", "JavaScript", "Java"] },
  { group: "ML & Data", items: ["NumPy", "Pandas", "scikit-learn", "PyTorch", "XGBoost", "LightGBM", "LangGraph"] },
  { group: "Backend & Systems", items: ["Node.js", "Express", "FastAPI", "REST APIs", "WebSockets"] },
  { group: "Data & Streaming", items: ["Redis", "Kafka", "ClickHouse", "MongoDB", "PostgreSQL / Supabase"] },
  { group: "Frontend", items: ["React", "Next.js", "Tailwind CSS"] },
  { group: "Developer Tools", items: ["Git", "Docker", "Linux", "Prometheus / Grafana"] },
];

export type Experience = {
  company: string;
  role: string;
  start: string;
  end: string;
  location?: string;
  summary?: string;
  url?: string;
  /** Image in /public, e.g. "/logos/acme.png". Without one, the row shows the company's initial. */
  logo?: string;
};

// Newest first.
export const experience: Experience[] = [
  {
    company: "Google Developer Groups (GDG)",
    role: "Core Team · DSA & ML",
    start: "2025",
    end: "Present",
    location: "Bengaluru",
    summary:
      "Led DSA and ML initiatives: ran problem-solving and competitive-programming workshops, and mentored at ML workshops and hackathons.",
  },
  {
    company: "IEEE",
    role: "Tech Head",
    start: "2024",
    end: "Present",
    location: "Bengaluru",
    summary:
      "Led and mentored project teams, including a RAG-based Q&A system built on LLMs, vector databases and retrieval pipelines.",
  },
];

export type Achievement = {
  title: string;
  /** Short result for the badge, e.g. "Finalist". */
  result: string;
  /** The rest of the result, e.g. "Top 12 of 180,000+". */
  detail?: string;
  note?: string;
  year: string;
  url?: string;
  /** Image in /public, e.g. "/logos/ey.png". Without one, the row shows the event's initial. */
  logo?: string;
};

export const achievements: Achievement[] = [
  {
    title: "EY Techathon",
    result: "Finalist",
    detail: "Top 12 of 180,000+",
    note: "AI-driven drug repurposing prototype on biomedical data.",
    year: "2026",
  },
  {
    title: "Unisys Innovation Program",
    result: "Top 20",
    detail: "of 12,760 entries",
    note: "Built InsuraAI for the insurance industry.",
    year: "2025",
  },
  {
    title: "Smart India Hackathon",
    result: "Top 50",
    detail: "College level",
    note: "AI automation prototype with edge deployment.",
    year: "2025",
  },
  {
    title: "Hack4Good, IEEE SB NITC",
    result: "Finalist",
    detail: "National, three rounds",
    note: "Reached the final with a working prototype.",
    year: "2024",
  },
  {
    title: "CodeCon’24, IEEE BMSIT&M",
    result: "6th place",
    detail: "of 50 teams",
    note: "Aptitude, debugging and coding rounds.",
    year: "2024",
  },
];

export type Education = { school: string; degree: string; score: string; start: string; end: string; location?: string };

export const education: Education[] = [
  {
    school: "BMS Institute of Technology and Management",
    degree: "B.E. Artificial Intelligence and Machine Learning",
    score: "CGPA 9.48",
    start: "2024",
    end: "2028",
    location: "Bengaluru",
  },
  {
    school: "Sri Kumaran Children’s Home Composite PU College",
    degree: "Class XII (PCMC)",
    score: "90%",
    start: "2022",
    end: "2024",
  },
  {
    school: "Prarthana Central School",
    degree: "Class X (CBSE)",
    score: "94%",
    start: "2021",
    end: "2022",
  },
];

// Competitive programming. LeetCode numbers are fetched live (see `leetcode`
// above); the others are the ratings from the résumé.
export type Platform = { name: string; rating?: string; url?: string };

export const competitive = {
  note: "Graphs, DP and greedy in C++ STL.",
  platforms: [
    { name: "CodeChef", rating: "1470", url: "https://www.codechef.com/users/higgsbosson_25" },
    { name: "Codeforces", rating: "1000", url: "https://codeforces.com/profile/nithinj326" },
  ] as Platform[],
};
