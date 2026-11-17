import fs from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { focus, site } from "@/data/site";

// The picture shown when the site is shared (LinkedIn, WhatsApp, X, Slack…).
// A pixel-art night scene in the banner's palette with your name and tagline.
// Generated once at build time; it updates whenever site.ts changes.
export const alt = `${site.name}: ${site.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const P = 10; // one "pixel" of the scene, in image pixels
const COLS = size.width / P;
const ROWS = size.height / P;

const hash = (n: number) => {
  const x = Math.sin(n * 127.1) * 43758.5453;
  return x - Math.floor(x);
};
const ridge = (x: number, base: number, amp: number, f: number, p: number) =>
  Math.round(base - Math.sin(x * f + p) * amp - Math.sin(x * f * 2.7 + p * 2) * amp * 0.4 - Math.sin(x * f * 6.1) * amp * 0.12);

// Sky bands, top to bottom: [colour, rows].
const SKY: [string, number][] = [
  ["#06071a", 12],
  ["#0a0c26", 9],
  ["#111338", 8],
  ["#1c184a", 7],
  ["#33215c", 6],
  ["#5a2a5f", 5],
  ["#8b3a5c", 4],
  ["#c2573f", 4],
  ["#f08a4b", 8],
];

const font = (file: string) => fs.readFile(path.join(process.cwd(), "node_modules", file));

export default async function OpengraphImage() {
  const [serif, serifItalic, sans, mono] = await Promise.all([
    font("@fontsource/instrument-serif/files/instrument-serif-latin-400-normal.woff"),
    font("@fontsource/instrument-serif/files/instrument-serif-latin-400-italic.woff"),
    font("geist/dist/fonts/geist-sans/Geist-Regular.ttf"),
    font("geist/dist/fonts/geist-mono/GeistMono-Regular.ttf"),
  ]);

  const px = (x: number, y: number, w: number, h: number, color: string, key: string, opacity = 1) => (
    <div key={key} style={{ position: "absolute", left: x * P, top: y * P, width: w * P, height: h * P, background: color, opacity }} />
  );

  const cells: React.ReactNode[] = [];

  // Sky
  let row = 0;
  SKY.forEach(([color, rows], i) => {
    cells.push(px(0, row, COLS, rows, color, `sky${i}`));
    // A dotted row where two bands meet, for a dithered edge.
    if (i > 0) for (let x = i % 2; x < COLS; x += 2) cells.push(px(x, row, 1, 1, SKY[i - 1][0], `d${i}-${x}`));
    row += rows;
  });

  // Stars, kept clear of the text block on the left.
  for (let i = 0; i < 90; i++) {
    const x = Math.floor(hash(i * 3 + 1) * COLS);
    const y = Math.floor(hash(i * 7 + 2) * 38);
    if (x < 76 && y > 8 && y < 44) continue;
    const big = hash(i + 40) > 0.85;
    cells.push(px(x + 0.25, y + 0.25, 0.5, 0.5, "#fff8e6", `s${i}`, 0.45 + hash(i) * 0.55));
    if (big) {
      cells.push(px(x - 0.5, y + 0.25, 2, 0.5, "#fff8e6", `sh${i}`, 0.7));
      cells.push(px(x + 0.25, y - 0.5, 0.5, 2, "#fff8e6", `sv${i}`, 0.7));
    }
  }

  // Moon, with a soft halo.
  const mx = 98;
  const my = 15;
  for (let y = -9; y <= 9; y++) {
    const halo = Math.floor(Math.sqrt(81 - y * y));
    cells.push(px(mx - halo, my + y, halo * 2 + 1, 1, "#f6ecce", `h${y}`, 0.07));
    if (Math.abs(y) > 6) continue;
    const half = Math.floor(Math.sqrt(42 - y * y));
    cells.push(px(mx - half, my + y, half * 2 + 1, 1, "#f6ecce", `m${y}`));
    if (y > 0) cells.push(px(mx + 2, my + y, Math.max(0, half - 1), 1, "#cfc3a0", `ms${y}`));
  }

  // A comet, top right.
  for (let i = 0; i < 12; i++) cells.push(px(70 - i * 1.2, 7 - i * 0.55, i < 3 ? 1 : 0.5, i < 3 ? 1 : 0.5, "#ffb86e", `c${i}`, 1 - i / 13));

  // Three ridges, with pines on the nearest two.
  const layers: [string, number, number, number, number, boolean][] = [
    ["#1c1842", 47, 6, 0.045, 1.3, false],
    ["#110f2b", 54, 3.5, 0.075, 4.1, true],
    ["#07070d", 59, 1.6, 0.11, 2.2, true],
  ];
  layers.forEach(([color, base, amp, f, p, pines], li) => {
    for (let x = 0; x < COLS; x++) {
      const y = ridge(x, base, amp, f, p);
      cells.push(px(x, y, 1, ROWS - y, color, `r${li}-${x}`));
      if (pines && hash(x + li * 100) > 0.86) {
        const h = 2 + Math.floor(hash(x + 500) * (li === 2 ? 5 : 3));
        for (let i = 0; i < h; i++) {
          const half = Math.floor((i + 1) / 2);
          cells.push(px(x - half, y - h + i, half * 2 + 1, 1, color, `p${li}-${x}-${i}`));
        }
      }
    }
  });

  // Campfire in the foreground.
  const fx = 88;
  const fy = ridge(fx, 59, 1.6, 0.11, 2.2);
  cells.push(px(fx - 1, fy - 1, 3, 1, "#2b1a14", "logs"));
  cells.push(px(fx - 1, fy - 3, 3, 2, "#e2521d", "f1"));
  cells.push(px(fx, fy - 5, 1, 3, "#ffb347", "f2"));
  cells.push(px(fx - 4, fy, 9, 0.5, "#ff9646", "fg", 0.35));

  return new ImageResponse(
    (
      <div style={{ position: "relative", display: "flex", width: "100%", height: "100%", background: "#06071a" }}>
        {cells}
        <div style={{ position: "absolute", left: 80, top: 96, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontFamily: "Serif", fontSize: 132, lineHeight: 1, letterSpacing: -3, color: "#f4f1e8" }}>
            {site.name}
          </div>
          <div style={{ display: "flex", marginTop: 26, fontFamily: "Sans", fontSize: 38, color: "#b9b6c9" }}>{site.role}</div>
          <div style={{ display: "flex", marginTop: 8, fontFamily: "SerifItalic", fontSize: 44, color: "#ff8a52" }}>{site.tagline}</div>
          <div style={{ display: "flex", marginTop: 34 }}>
            {focus.slice(0, 3).map((f) => (
              <div
                key={f}
                style={{
                  display: "flex",
                  marginRight: 12,
                  padding: "8px 16px",
                  border: "2px solid #3a3566",
                  borderRadius: 999,
                  background: "#0d0e24",
                  fontFamily: "Mono",
                  fontSize: 20,
                  color: "#c9c6dc",
                }}
              >
                {f}
              </div>
            ))}
          </div>
        </div>
        <div style={{ position: "absolute", left: 80, bottom: 44, display: "flex", fontFamily: "Mono", fontSize: 24, color: "#e9e4d8" }}>
          {new URL(site.url).host}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Serif", data: serif, weight: 400, style: "normal" },
        { name: "SerifItalic", data: serifItalic, weight: 400, style: "normal" },
        { name: "Sans", data: sans, weight: 400, style: "normal" },
        { name: "Mono", data: mono, weight: 400, style: "normal" },
      ],
    },
  );
}
