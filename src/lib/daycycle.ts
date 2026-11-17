// The day cycle: what the site looks like at each minute of the visitor's day.
//
// In auto mode (the default) two things follow the clock:
//   · the pixel skies (banner and full-screen backdrop) blend continuously
//     between the keyframes below, and the sun and moon travel in an arc;
//   · the page itself steps through five shades, each checked for text
//     contrast: morning → afternoon → evening (light), dusk → night (dark).
// Picking Light or Dark on the theme toggle freezes the sky at a fixed
// morning or night instead (see `paletteForMode`).
//
// Preview any time of day by adding ?time=HH:MM to a URL, e.g. ?time=18:20.

export type PageTheme = "light" | "dark";
export type DayStep = "morning" | "afternoon" | "evening" | "dusk" | "night";

export type SkyPalette = {
  /** Banner sky, top → bottom (8 colours). */
  bannerSky: string[];
  /** Backdrop: colour band at the top of the screen, page-side first (6). */
  sky: string[];
  /** Backdrop: horizon glow, faint first (4). */
  glow: string[];
  far: string;
  mid: string;
  near: string;
  orb: string;
  orbShade: string;
  /** 0–1: how visible the stars are. */
  starDim: number;
};

// ── Keyframes ─────────────────────────────────────────────────────────────
const NIGHT: SkyPalette = {
  bannerSky: ["#05061a", "#090c28", "#12143c", "#241b52", "#48265e", "#853860", "#c2573f", "#f08a4b"],
  sky: ["#0c0d1f", "#0e1027", "#11132f", "#131638", "#161941", "#181c4a"],
  glow: ["#1a1640", "#48265e", "#853860", "#c2573f"],
  far: "#1c1842",
  mid: "#110f2b",
  near: "#07070d",
  orb: "#f6ecce",
  orbShade: "#cfc3a0",
  starDim: 1,
};
const PREDAWN: SkyPalette = {
  bannerSky: ["#0a1030", "#141d4a", "#263466", "#4a4a86", "#8a6296", "#d48a8a", "#f6b27a", "#ffd9a0"],
  sky: ["#0c0f22", "#0f142b", "#131a35", "#182140", "#1d294b", "#233257"],
  glow: ["#1f2350", "#5a3a72", "#c4687a", "#f6b27a"],
  far: "#262a55",
  mid: "#171a38",
  near: "#090a14",
  orb: "#fbe3c4",
  orbShade: "#e0b99a",
  starDim: 0.35,
};
const DAWN: SkyPalette = {
  bannerSky: ["#7f9fe0", "#a3b4ea", "#c7c4ee", "#e6cfe8", "#f6d6d6", "#fbdcc0", "#ffe2b0", "#ffe9c4"],
  sky: ["#f5f2f6", "#efeaf4", "#e9e2f1", "#e3daef", "#ddd3ed", "#d6cbea"],
  glow: ["#e9e3f3", "#f4d9e2", "#fbd3c0", "#ffd9a0"],
  far: "#b3b4d6",
  mid: "#8a8fbf",
  near: "#525a8a",
  orb: "#ffe2b0",
  orbShade: "#ffc98a",
  starDim: 0.6,
};
const MORNING: SkyPalette = {
  bannerSky: ["#3a86dc", "#4b96e4", "#62a8ec", "#80bcf1", "#a3d0f5", "#cfe6f8", "#f3ead6", "#fbe3bf"],
  sky: ["#f1f5fa", "#e9f1f9", "#e0ebf7", "#d6e6f6", "#cbdff4", "#bfd7f1"],
  glow: ["#dcebf8", "#cfe6f8", "#f3ead6", "#fbe3bf"],
  far: "#a3bfd8",
  mid: "#7397b8",
  near: "#3f6284",
  orb: "#fff1b0",
  orbShade: "#ffd772",
  starDim: 1,
};
const NOON: SkyPalette = {
  bannerSky: ["#2f7bd6", "#3f8ce0", "#549fe9", "#70b4ef", "#93c9f4", "#bfe0f8", "#e6eef0", "#f4ecd6"],
  sky: ["#eef4fb", "#e2eefa", "#d3e6f9", "#c3ddf8", "#b2d3f6", "#a0c8f3"],
  glow: ["#e3effa", "#d6eafa", "#e8eee6", "#f1ead2"],
  far: "#9fbcd9",
  mid: "#6d93b8",
  near: "#3a5e83",
  orb: "#fffbe0",
  orbShade: "#ffe9a3",
  starDim: 1,
};
const AFTERNOON: SkyPalette = {
  bannerSky: ["#4a83cf", "#5d92d4", "#78a4d8", "#98b7da", "#bcc9d8", "#dcd6cf", "#f1dcc0", "#f8d4a6"],
  sky: ["#f6f3ee", "#efece6", "#e6e7e6", "#dde3ea", "#d3dded", "#c8d6ee"],
  glow: ["#efe9df", "#f5e2c8", "#f8d6a8", "#f6c48a"],
  far: "#b0b6c9",
  mid: "#878fac",
  near: "#535d7d",
  orb: "#ffe7a0",
  orbShade: "#ffc96a",
  starDim: 1,
};
const GOLDEN: SkyPalette = {
  bannerSky: ["#5b7fd0", "#8b93d6", "#b9a0cf", "#e0a9b6", "#f3b497", "#f8c07f", "#fbd08f", "#ffe0a8"],
  sky: ["#f7f1eb", "#f4e9de", "#f1e0d1", "#eed7c4", "#ebceb7", "#e8c5aa"],
  glow: ["#f3e6da", "#f7d4b6", "#f7ba8b", "#f29a5c"],
  far: "#c3a6ae",
  mid: "#977b93",
  near: "#5d4c6e",
  orb: "#ffd28a",
  orbShade: "#f7a95a",
  starDim: 1,
};
const SUNSET: SkyPalette = {
  bannerSky: ["#0b0820", "#1a0f38", "#33164e", "#5a1d5c", "#8f2d5a", "#c8483f", "#ee7a3c", "#ffb054"],
  sky: ["#0d0c20", "#110d28", "#160f31", "#1c113a", "#231343", "#2b164c"],
  glow: ["#2a1a4a", "#6e2f62", "#b5483f", "#f08a4b"],
  far: "#2a1c4a",
  mid: "#170f2e",
  near: "#08070e",
  orb: "#ffcf9a",
  orbShade: "#f0a066",
  starDim: 0.45,
};
const DUSK: SkyPalette = {
  bannerSky: ["#070820", "#0f1035", "#1e1850", "#36205c", "#5a2a62", "#8a3a5e", "#b5503f", "#d8703f"],
  sky: ["#0c0c20", "#0f0f2a", "#121234", "#15153d", "#181846", "#1b1b4f"],
  glow: ["#1d1745", "#4a2860", "#86385e", "#b5503f"],
  far: "#1c1842",
  mid: "#110f2b",
  near: "#07070d",
  orb: "#f6ecce",
  orbShade: "#cfc3a0",
  starDim: 0.8,
};

const h = (hh: number, mm = 0) => hh * 60 + mm;
// Each keyframe sits on the page theme it belongs to. The page switches to
// light at 06:00 and to dark at 19:00, matching the keyframes either side.
const KEYFRAMES: [number, SkyPalette][] = [
  [h(0), NIGHT],
  [h(4, 30), NIGHT],
  [h(5, 30), PREDAWN],
  [h(5, 59), PREDAWN],
  [h(6), DAWN],
  [h(8, 30), MORNING],
  [h(12, 30), NOON],
  [h(15, 30), AFTERNOON],
  [h(17, 45), GOLDEN],
  [h(18, 59), GOLDEN],
  [h(19), SUNSET],
  [h(20, 15), DUSK],
  [h(21, 30), NIGHT],
  [h(24), NIGHT],
];

// ── Time ──────────────────────────────────────────────────────────────────
/** Minutes since local midnight, honouring a ?time=HH:MM (or ?sky=dawn|day|dusk|night) preview. */
export function minuteOfDay(now = new Date()): number {
  if (typeof location !== "undefined") {
    const q = new URLSearchParams(location.search);
    const t = q.get("time")?.match(/^(\d{1,2}):(\d{2})$/);
    if (t) return (Number(t[1]) % 24) * 60 + (Number(t[2]) % 60);
    const named = { dawn: h(6, 30), day: h(12, 30), dusk: h(18, 20), night: h(23) }[q.get("sky") ?? ""];
    if (named != null) return named;
  }
  return now.getHours() * 60 + now.getMinutes();
}

/** The page theme and shade step for a minute of the day (auto mode). */
export function daylight(m = minuteOfDay()): { theme: PageTheme; step: DayStep } {
  if (m >= h(6) && m < h(15)) return { theme: "light", step: "morning" };
  if (m >= h(15) && m < h(17, 15)) return { theme: "light", step: "afternoon" };
  if (m >= h(17, 15) && m < h(19)) return { theme: "light", step: "evening" };
  if ((m >= h(19) && m < h(21)) || (m >= h(4, 30) && m < h(6))) return { theme: "dark", step: "dusk" };
  return { theme: "dark", step: "night" };
}

/**
 * Where the sun or moon is: `frac` runs 0 → 1 from rising (left) to setting
 * (right). The sun is up 05:45–19:15, the moon the rest of the night.
 */
export function orbArc(m = minuteOfDay()): { kind: "sun" | "moon"; frac: number } {
  const rise = h(5, 45);
  const set = h(19, 15);
  if (m >= rise && m < set) return { kind: "sun", frac: (m - rise) / (set - rise) };
  const night = 24 * 60 - (set - rise);
  return { kind: "moon", frac: (((m - set + 24 * 60) % (24 * 60)) / night) };
}

// ── Colour blending ───────────────────────────────────────────────────────
const toRgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const toHex = (rgb: number[]) => "#" + rgb.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
const mix = (a: string, b: string, t: number) => {
  const A = toRgb(a);
  const B = toRgb(b);
  return toHex(A.map((v, i) => v + (B[i] - v) * t));
};

/** The sky palette at a minute of the day, blended between the two nearest keyframes. */
export function paletteAt(m = minuteOfDay()): SkyPalette {
  let i = KEYFRAMES.findIndex(([at]) => at > m);
  if (i <= 0) i = KEYFRAMES.length - 1;
  const [a, A] = KEYFRAMES[i - 1];
  const [b, B] = KEYFRAMES[i];
  const t = b === a ? 0 : (m - a) / (b - a);
  return {
    bannerSky: A.bannerSky.map((c, k) => mix(c, B.bannerSky[k], t)),
    sky: A.sky.map((c, k) => mix(c, B.sky[k], t)),
    glow: A.glow.map((c, k) => mix(c, B.glow[k], t)),
    far: mix(A.far, B.far, t),
    mid: mix(A.mid, B.mid, t),
    near: mix(A.near, B.near, t),
    orb: mix(A.orb, B.orb, t),
    orbShade: mix(A.orbShade, B.orbShade, t),
    starDim: A.starDim + (B.starDim - A.starDim) * t,
  };
}

/**
 * What the skies should show for the current theme mode. Auto follows the
 * clock; a manual Light or Dark freezes a calm morning or night.
 */
export function paletteForMode(mode: "auto" | "light" | "dark"): { palette: SkyPalette; arc: { kind: "sun" | "moon"; frac: number } } {
  if (mode === "light") return { palette: MORNING, arc: { kind: "sun", frac: 0.72 } };
  if (mode === "dark") return { palette: NIGHT, arc: { kind: "moon", frac: 0.72 } };
  const m = minuteOfDay();
  return { palette: paletteAt(m), arc: orbArc(m) };
}

/** Calls `onTick` once a minute, so the skies keep moving while the page is open. */
export function everyMinute(onTick: () => void) {
  const id = setInterval(onTick, 60_000);
  return () => clearInterval(id);
}
