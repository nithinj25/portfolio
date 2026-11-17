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
  // Drop a photo in /public (e.g. /avatar.jpg) and put its path here.
  avatar: "",
  // TODO: put your résumé PDF in /public and set its path (e.g. "/resume.pdf").
  // Note the PDF includes your phone number, which would then be public.
  resume: "",
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

export const about = [
  "I'm an AI & ML undergraduate at BMS Institute of Technology and Management in Bengaluru. I like owning the whole picture: the data model, the WebSocket server, the matching loop, and the pixels on screen. Most of what I build is real-time, and I care about proving it works: load tests, latency percentiles, differential tests.",
  "Lately that has meant a 1v1 mental-arithmetic ladder that stays fair under lag, a lock-free order book in C++17, and co-authoring a paper on multi-agent screening for drug repurposing. Outside my own projects I'm on the GDG core team for DSA & ML and Tech Head at IEEE.",
];

// Headline numbers shown beside your name, from the résumé.
export const headlineStats = [
  { value: "9.48", label: "CGPA · B.E. AI & ML" },
  { value: "Top 12", label: "of 180,000+ · EY Techathon" },
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

export type Research = {
  title: string;
  project: string;
  role: string;
  year: string;
  points: string[];
  tech: string[];
  source?: string;
};

export const research: Research[] = [
  {
    title: "Beyond Link Prediction: Multi-Agent Feasibility Screening of Drug Repurposing",
    project: "Multi-Agent Drug Repurposing Screening",
    role: "Co-author",
    year: "2026",
    points: [
      "A 10-agent pipeline scores 19,830 DrugBank drugs (55K aliases) on mechanism, trials, safety and market.",
      "A mechanistic gate (≥15% target overlap) exits weak candidates early; distributed caching gave an 811× speedup.",
    ],
    tech: ["Python", "LLM Agents", "DrugBank", "Open Targets"],
    source: "https://github.com/nithinj25/drug-research",
  },
];

export type Achievement = {
  title: string;
  /** The result, e.g. "Finalist · Top 12 of 180,000+". */
  org: string;
  note?: string;
  year: string;
  url?: string;
  /** Image in /public, e.g. "/logos/ey.png". Without one, the row shows the event's initial. */
  logo?: string;
};

export const achievements: Achievement[] = [
  {
    title: "EY Techathon",
    org: "Finalist · Top 12 of 180,000+",
    note: "AI-driven drug repurposing prototype on biomedical data.",
    year: "2026",
  },
  {
    title: "Unisys Innovation Program",
    org: "Top 20 of 12,760 entries",
    note: "Built InsuraAI for the insurance industry.",
    year: "2025",
  },
  {
    title: "Smart India Hackathon",
    org: "Top 50 · college level",
    note: "AI automation prototype with edge deployment.",
    year: "2025",
  },
  {
    title: "Hack4Good, IEEE SB NITC",
    org: "Finalist",
    note: "National three-round hackathon, with a working prototype.",
    year: "2024",
  },
  {
    title: "CodeCon’24, IEEE BMSIT&M",
    org: "6th place of 50 teams",
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
    { name: "CodeChef", rating: "1470", url: "" }, // TODO: profile URL
    { name: "Codeforces", rating: "1000", url: "" }, // TODO: profile URL
  ] as Platform[],
};
