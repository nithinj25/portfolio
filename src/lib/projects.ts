// ─────────────────────────────────────────────────────────────
//  Every project on the site comes from this list:
//  the home page cards, /projects and /projects/[slug].
//
//  To add a screenshot: put an image in public/projects/ and set
//  `image: "/projects/<slug>.png"`. Until then a card shows its
//  diagram (`art`) or a marked TODO slot.
// ─────────────────────────────────────────────────────────────

export const AREAS = ["Real-time", "Systems", "AI", "Full-stack"] as const;
export type Area = (typeof AREAS)[number];

export type Project = {
  slug: string;
  title: string;
  /** One line, shown on cards. */
  tagline: string;
  /** A short paragraph, shown on the project page. */
  blurb: string;
  metric?: string;
  tech: string[];
  year: string;
  live?: string;
  source?: string;
  image?: string;
  art?: "duel" | "book" | "graph" | "pulse" | "funnel";
  /** Badge on the card. Only set what is true: "Live" needs a live link. */
  status?: "Live" | "Research" | "Building" | "Archived";
  /** Filter chips on /projects. */
  areas: Area[];
  /** Shown on the home page. */
  featured?: boolean;
  /** Bullet points for the project page. Leave out to show a TODO there. */
  details?: string[];
};

export const projects: Project[] = [
  {
    slug: "mathduel",
    areas: ["Real-time", "Full-stack"],
    title: "MathDuel",
    tagline: "Live 1v1 math duels: 20 questions in 90 seconds, on a Glicko-2 ladder.",
    blurb:
      "Real-time 1v1 mental-arithmetic duels. Both players get the same seeded questions, the server never sends an answer, and results settle onto a Glicko-2 ladder.",
    metric: "400 concurrent players · 13 ms p95",
    tech: ["FastAPI", "Node.js", "Redis", "Kafka", "ClickHouse", "PostgreSQL"],
    year: "2026",
    live: "https://mathduel.me",
    status: "Live",
    source: "https://github.com/nithinj25/math_dual",
    art: "duel",
    featured: true,
    details: [
      "Server-authoritative 20-question, 90-second duels with Glicko-2 ratings across three tiers, live at mathduel.me.",
      "Both players receive the same questions in the same order, generated from a shared seed. The server compares answers and never sends one to a client.",
      "Stateless WebSocket gateways sit in front of a FastAPI service. Matchmaking pairs players with a single race-free Redis Lua script.",
      "Match events stream through Kafka into ClickHouse for analytics, off the hot path.",
      "Solve times are adjusted for round-trip latency, so ties break on thinking time instead of connection quality.",
      "Load tested at 400 concurrent players: 13 ms p95 answer round trip and 0.07% failed duels across 1,387 duels, on a 2 vCPU / 4 GiB box.",
    ],
  },
  {
    slug: "orderbook-cpp",
    areas: ["Systems"],
    title: "orderbook_cpp",
    tagline: "A lock-free limit order book matching engine in C++17.",
    blurb:
      "A lock-free limit order book matching engine. SPSC ring buffers in and out, a matching thread that never allocates, and a hierarchical bitmap for best-price lookup.",
    metric: "31 ns median · ~16M msgs/sec",
    tech: ["C++17", "Atomics", "Lock-free", "CMake"],
    year: "2026",
    source: "https://github.com/nithinj25/orderbook_cpp",
    art: "book",
    featured: true,
    details: [
      "Orders arrive on one single-producer/single-consumer ring buffer and execution reports leave on another. The matching thread never allocates and never does I/O.",
      "The book is an array indexed directly by price, with a FIFO queue at each level.",
      "A price bitmap with TZCNT finds the next best price in about 13 ns when 1 level in 1,000 is occupied, against 398 ns for a linear walk: 30× faster.",
      "Packing each order into 28 bytes cut p99 latency by 35%.",
      "Correctness is checked with a differential test against a simple reference book. Latency is measured with the CPU cycle counter: 31 ns p50, 95 ns p99.",
    ],
  },
  {
    slug: "drug-repurposing",
    areas: ["AI"],
    title: "Multi-Agent Drug Repurposing",
    tagline: "Co-authored paper: a 10-agent LLM pipeline that screens 19,830 drugs for repurposing.",
    blurb:
      "Research on screening drug-repurposing candidates for real-world feasibility, not just link prediction. Co-authored the paper Beyond Link Prediction: Multi-Agent Feasibility Screening of Drug Repurposing.",
    metric: "19,830 drugs · 811× speedup from caching",
    tech: ["Python", "LLM Agents", "DrugBank", "Open Targets"],
    year: "2026",
    source: "https://github.com/nithinj25/drug-research",
    status: "Research",
    art: "funnel",
    featured: true,
    details: [
      "Ten agents score each of 19,830 DrugBank drugs (55K aliases) on mechanism, trials, safety and market.",
      "A mechanistic gate (at least 15% target overlap) exits weak candidates early.",
      "Distributed caching gave an 811× speedup.",
    ],
  },
  {
    slug: "devlens",
    areas: ["AI", "Full-stack"],
    title: "DevLens",
    tagline: "Multi-agent GitHub analyzer with a recruiter dashboard and anti-cheat scoring.",
    blurb:
      "Repository analyzer and recruiter intelligence platform. A multi-agent pipeline reads a candidate's Git history, code and profile, then generates technical questions and a scored PDF report.",
    metric: "3 parallel agents · anti-cheat scoring",
    tech: ["LangGraph", "Claude", "Groq", "FastAPI", "Next.js"],
    year: "2025",
    source: "https://github.com/nithinj25/devLens2",
    art: "graph",
    featured: true,
    details: [
      "Three parallel LangGraph agents (Git, Code and Profile) power a recruiter dashboard with anti-cheat scoring.",
      "Candidates submit repositories and answer generated technical questions. Recruiters create jobs, screen candidates and download PDF reports.",
      "Next.js frontend on Vercel, FastAPI agent service on Railway, Supabase PostgreSQL for storage.",
    ],
  },
  {
    slug: "lan-hydra",
    areas: ["Systems"],
    title: "LAN Hydra",
    tagline: "Red-team toolkit for CAN bus injection on vehicle networks.",
    blurb:
      "A red-team command-line toolkit that simulates four attack classes (injection, spoofing, replay and man-in-the-middle) on vehicle CAN buses.",
    metric: "4 attack classes",
    tech: ["C++", "SocketCAN", "Python"],
    year: "2025",
    source: "https://github.com/nithinj25/lan-hydra",
  },
  {
    slug: "clinical-trial-matcher",
    areas: ["AI"],
    title: "Clinical Trial Matcher",
    tagline: "On-device AI that matches cancer patients to clinical trials.",
    blurb:
      "Matches cancer patients to open clinical trials with a model that runs entirely on-device. Multilingual, private by construction, and written for a physician to read.",
    metric: "Gemma 3 12B · fully on-device",
    tech: ["Gemma 3", "ChromaDB", "RAG", "React"],
    year: "2026",
    source: "https://github.com/nithinj25/trial-matcher",
    art: "pulse",
    details: [
      "Runs fully on-device: no patient data is sent anywhere beyond public ClinicalTrials.gov queries.",
      "Works in six languages: English, Hindi, Spanish, Arabic, French and Chinese.",
      "Includes a consent explainer with plain-language sections and a RAG chatbot for questions about a trial.",
      "Built for the Gemma hackathon run by Kaggle and Google DeepMind.",
    ],
  },
  {
    slug: "arogyalink",
    areas: ["AI"],
    title: "ArogyaLink",
    tagline: "Emergency healthcare coordination for rural India, by phone call.",
    blurb: "Emergency healthcare coordination for rural India: one phone call, any language, instant dispatch.",
    tech: ["Twilio IVR", "Gemini", "FastAPI", "Firebase", "Flutter"],
    year: "2025",
    live: "https://solution-challenge-cb95c.web.app",
    status: "Live",
    source: "https://github.com/nithinj25/arogyaLink",
    details: [
      "A Twilio voice IVR feeds Gemini-powered agents on a FastAPI backend running on Cloud Run.",
      "Calls are monitored live through Firebase Realtime Database, with a web dashboard and a Flutter mobile app.",
      "Built for the Google Solution Challenge 2025.",
    ],
  },
  {
    slug: "ws-auction",
    areas: ["Real-time"],
    title: "Multiplayer Auction Game",
    tagline: "Real-time bidding game with sub-100 ms bids and no database on the bid path.",
    blurb:
      "Real-time multiplayer auction game in an 80s arcade shell. Bids land in under 100 ms with zero database hits, and Redis Pub/Sub fans rooms out across server instances.",
    metric: "Sub-100 ms bids · 0 DB hits on the bid path",
    tech: ["TypeScript", "Node.js", "WebSockets", "Redis", "PostgreSQL"],
    year: "2026",
    source: "https://github.com/nithinj25/auction_game",
    details: [
      "Players join a room, bid on mystery items with hidden true values, and compete to make the most profit.",
      "Game results persist to PostgreSQL and a global all-time leaderboard lives in Redis.",
      "Every bid passes a four-stage guard chain (phase, host, balance, increment) without touching the database.",
      "Scales horizontally through Redis Pub/Sub fan-out with no sticky sessions, plus 30-second heartbeats and anti-snipe timer extensions.",
    ],
  },
  {
    slug: "url-shortener",
    areas: ["Full-stack"],
    title: "Distributed URL Shortener",
    tagline: "Link shortener with click analytics streamed through Kafka into ClickHouse.",
    blurb:
      "Deployed link shortener with JWT refresh-token rotation, Redis caching and rate limiting. Clicks stream through Kafka into ClickHouse for analytics, and a Chrome extension shortens the current tab.",
    tech: ["Node.js", "TypeScript", "Redis", "Kafka", "ClickHouse", "MongoDB"],
    year: "2026",
    source: "https://github.com/nithinj25/url_shortner",
    details: [
      "JWT auth with refresh-token rotation, Redis caching and rate limiting.",
      "Click events stream through Kafka into ClickHouse, so analytics never slow down redirects.",
      "GeoIP click analytics and a companion Chrome extension.",
    ],
  },
  {
    slug: "sift",
    areas: ["Systems"],
    title: "sift",
    tagline: "A streaming record processor for JSONL and CSV.",
    blurb: "A streaming record processor for JSONL and CSV with a small expression language. Zero runtime dependencies.",
    tech: ["TypeScript", "CLI", "Streams"],
    year: "2026",
    source: "https://github.com/nithinj25/cli_tool",
  },
];

export const featuredProjects = projects.filter((p) => p.featured);

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);
