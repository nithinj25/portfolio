// Activity data for the heatmaps and the LeetCode stats, fetched on the server
// when the site is built and refreshed at most once a day. Visitors' browsers
// never call these services. Every function returns null on failure, and the
// page then falls back to a placeholder instead of breaking.
const DAY = 86_400_000;
const WEEKS = 53;
const REVALIDATE = { next: { revalidate: 86_400 } };

export type Day = { date: string; count: number; level: number };
export type Calendar = { days: Day[]; total: number };

export type LeetcodeStats = {
  solved: number;
  easy: number;
  medium: number;
  hard: number;
  totals: { easy: number; medium: number; hard: number };
  rating: number | null;
  topPercent: number | null;
  streak: number;
  activeDays: number;
  calendar: Calendar;
};

export async function getGithubCalendar(handle: string): Promise<Calendar | null> {
  try {
    const r = await fetch(`https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(handle)}?y=last`, REVALIDATE);
    if (!r.ok) return null;
    const j = await r.json();
    if (!Array.isArray(j.contributions)) return null;
    return { days: j.contributions, total: j.total?.lastYear ?? 0 };
  } catch {
    return null;
  }
}

/** Buckets a daily count into the heatmap's 0–4 shades. */
const level = (n: number) => (n === 0 ? 0 : n <= 2 ? 1 : n <= 5 ? 2 : n <= 9 ? 3 : 4);

export async function getLeetcode(handle: string): Promise<LeetcodeStats | null> {
  const thisYear = new Date().getUTCFullYear();
  const query = `query q($u: String!, $y: Int!, $p: Int!) {
    matchedUser(username: $u) {
      submitStatsGlobal { acSubmissionNum { difficulty count } }
      now: userCalendar(year: $y) { submissionCalendar streak totalActiveDays }
      prev: userCalendar(year: $p) { submissionCalendar }
    }
    userContestRanking(username: $u) { rating topPercentage }
    allQuestionsCount { difficulty count }
  }`;
  try {
    const r = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json", Referer: "https://leetcode.com" },
      body: JSON.stringify({ query, variables: { u: handle, y: thisYear, p: thisYear - 1 } }),
      ...REVALIDATE,
    });
    if (!r.ok) return null;
    const { data } = await r.json();
    const user = data?.matchedUser;
    if (!user) return null;

    const ac = Object.fromEntries(user.submitStatsGlobal.acSubmissionNum.map((x: { difficulty: string; count: number }) => [x.difficulty, x.count]));
    const all = Object.fromEntries(data.allQuestionsCount.map((x: { difficulty: string; count: number }) => [x.difficulty, x.count]));

    // Merge both years' calendars ({ "unix seconds": count }) into one map keyed by UTC date.
    const counts = new Map<string, number>();
    for (const cal of [user.prev?.submissionCalendar, user.now?.submissionCalendar]) {
      for (const [ts, n] of Object.entries(JSON.parse(cal || "{}") as Record<string, number>)) {
        const d = new Date(Number(ts) * 1000).toISOString().slice(0, 10);
        counts.set(d, (counts.get(d) ?? 0) + n);
      }
    }
    // The last 53 weeks, oldest first, ending today.
    const today = Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate());
    const days: Day[] = Array.from({ length: WEEKS * 7 }, (_, i) => {
      const date = new Date(today - (WEEKS * 7 - 1 - i) * DAY).toISOString().slice(0, 10);
      const count = counts.get(date) ?? 0;
      return { date, count, level: level(count) };
    });

    const contest = data.userContestRanking;
    return {
      solved: ac.All ?? 0,
      easy: ac.Easy ?? 0,
      medium: ac.Medium ?? 0,
      hard: ac.Hard ?? 0,
      totals: { easy: all.Easy ?? 0, medium: all.Medium ?? 0, hard: all.Hard ?? 0 },
      rating: contest?.rating ? Math.round(contest.rating) : null,
      topPercent: contest?.topPercentage ?? null,
      streak: user.now?.streak ?? 0,
      activeDays: user.now?.totalActiveDays ?? 0,
      calendar: { days, total: days.reduce((s, d) => s + d.count, 0) },
    };
  } catch {
    return null;
  }
}
