"use client";

import { useEffect, useRef } from "react";
import { everyMinute, paletteForMode } from "@/lib/daycycle";
import { getThemeMode, THEME_CHANGED } from "./ThemeToggle";

// Procedural pixel landscape drawn at 320×90 and scaled up with crisp pixels.
// Dark theme: night sky, twinkling stars, glowing moon, shooting stars.
// Light theme: day sky with drifting clouds.
// Layers shift by different amounts with the cursor (far = less, near = more).
const W = 320;
const H = 90;
const M = 10; // spare pixels on each side of a layer, so it can slide
const LW = W + M * 2;
const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];
// How many pixels each layer moves at full cursor deflection.
const DEPTH = { stars: 1, orb: 2, clouds: 3, far: 3, mid: 5, near: 9 };

const SCENES = {
  dark: {
    sky: ["#05061a", "#090c28", "#12143c", "#241b52", "#48265e", "#853860", "#c2573f", "#f08a4b"],
    far: "#1c1842",
    mid: "#110f2b",
    near: "#07070d",
    orb: "#f6ecce",
    orbShade: "#cfc3a0",
    glow: "246,236,206",
  },
  light: {
    sky: ["#3a86dc", "#4b96e4", "#62a8ec", "#80bcf1", "#a3d0f5", "#cfe6f8", "#f3ead6", "#fbe3bf"],
    far: "#a3bfd8",
    mid: "#7397b8",
    near: "#3f6284",
    orb: "#fff6cf",
    orbShade: "#ffe9a3",
    glow: "255,246,207",
  },
};
type Theme = keyof typeof SCENES;

function rng(seed: number) {
  return () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
}

function ridge(seed: number, base: number, amp: number) {
  const r = rng(seed);
  const p = [r() * 6, r() * 6, r() * 6];
  return Array.from({ length: LW }, (_, x) =>
    Math.round(
      base -
        Math.sin(x * 0.028 + p[0]) * amp -
        Math.sin(x * 0.07 + p[1]) * amp * 0.45 -
        Math.sin(x * 0.19 + p[2]) * amp * 0.16,
    ),
  );
}

function layer(w = LW) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = H;
  return c;
}

export default function Banner() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const r = rng(25);
    const stars = Array.from({ length: 120 }, () => ({
      x: Math.floor(r() * LW),
      y: Math.floor(r() * H * 0.66),
      phase: r() * Math.PI * 2,
      speed: 0.5 + r() * 1.8,
      big: r() > 0.9,
    }));
    const clouds = Array.from({ length: 7 }, (_, i) => ({
      x: r() * (W + 80),
      y: 7 + i * 7 + r() * 4,
      w: 22 + Math.floor(r() * 26),
      speed: 1 + r() * 2,
    }));
    const ridges = { far: ridge(7, H - 24, 10), mid: ridge(19, H - 15, 7), near: ridge(42, H - 7, 4) };
    const pines = Array.from({ length: 26 }, () => ({ x: Math.floor(r() * LW), h: 3 + Math.floor(r() * 5) }));
    const cabinX = Math.floor(LW * 0.24);

    const sky = layer(W);
    const land = { far: layer(), mid: layer(), near: layer() };
    let theme: Theme = "dark";
    let scene: (typeof SCENES)[Theme] = SCENES.dark;
    let arc = paletteForMode("dark").arc;
    let starDim = 1;

    const paintStatic = () => {
      theme = document.documentElement.dataset.theme === "light" ? "light" : "dark";
      // Sky, ridges and sun/moon follow the day cycle (src/lib/daycycle.ts).
      const cycle = paletteForMode(getThemeMode());
      const p = cycle.palette;
      const glow = [1, 3, 5].map((i) => parseInt(p.orb.slice(i, i + 2), 16)).join(",");
      scene = { ...SCENES[theme], sky: p.bannerSky, far: p.far, mid: p.mid, near: p.near, orb: p.orb, orbShade: p.orbShade, glow };
      arc = cycle.arc;
      starDim = p.starDim;
      const s = scene;

      const sctx = sky.getContext("2d")!;
      const n = s.sky.length - 1;
      for (let y = 0; y < H; y++) {
        const t = Math.pow(y / (H - 1), 1.3) * n;
        const i = Math.min(n - 1, Math.floor(t));
        for (let x = 0; x < W; x++) {
          sctx.fillStyle = t - i > (BAYER[y % 4][x % 4] + 0.5) / 16 ? s.sky[i + 1] : s.sky[i];
          sctx.fillRect(x, y, 1, 1);
        }
      }

      for (const key of ["far", "mid", "near"] as const) {
        const lctx = land[key].getContext("2d")!;
        lctx.clearRect(0, 0, LW, H);
        lctx.fillStyle = s[key];
        for (let x = 0; x < LW; x++) lctx.fillRect(x, ridges[key][x], 1, H);
      }

      // Horizon detail on the nearest ridge: pines and a small cabin.
      const nctx = land.near.getContext("2d")!;
      nctx.fillStyle = s.near;
      for (const p of pines) {
        const base = ridges.near[p.x];
        for (let i = 0; i < p.h; i++) {
          const half = Math.floor((i + 1) / 2);
          nctx.fillRect(p.x - half, base - p.h + i, half * 2 + 1, 1);
        }
      }
      const cy = ridges.near[cabinX];
      nctx.fillRect(cabinX - 1, cy - 5, 9, 6);
      for (let i = 0; i < 4; i++) nctx.fillRect(cabinX + 2 - i, cy - 9 + i, 3 + i * 2, 1);
      nctx.fillRect(cabinX + 6, cy - 10, 1, 3); // chimney
    };

    // Smoothed cursor position, −1…1.
    let tx = 0;
    let ty = 0;
    let px = 0;
    let py = 0;

    type Shot = { t0: number; x: number; y: number };
    let shots: Shot[] = [];
    let nextShot = 4;
    let now = 0;

    const draw = (time: number) => {
      const t = (now = time / 1000);
      const s = scene;
      px += (tx - px) * 0.12;
      py += (ty - py) * 0.12;
      const off = (k: number) => Math.round(px * k);

      ctx.drawImage(sky, 0, 0);

      // Moon / sun with a soft dithered-looking glow.
      // Rises on the left, peaks mid-sky, sets on the right behind the ridges.
      const ox = Math.round(W * (0.1 + 0.8 * arc.frac)) + off(DEPTH.orb);
      const oy = Math.round(H * 0.62 - Math.sin(Math.PI * arc.frac) * H * 0.45 + py);
      for (let y = -17; y <= 17; y++)
        for (let x = -17; x <= 17; x++) {
          const d = Math.sqrt(x * x + y * y);
          if (d > 17) continue;
          if (d > 7.2) {
            const a = Math.pow(1 - (d - 7.2) / 9.8, 2) * (theme === "dark" ? 0.3 : 0.45);
            ctx.fillStyle = `rgba(${s.glow},${a})`;
          } else {
            ctx.fillStyle = d > 5.8 || (theme === "dark" && x > 1 && y > 0 && d > 3) ? s.orbShade : s.orb;
          }
          ctx.fillRect(ox + x, oy + y, 1, 1);
        }

      if (theme === "dark") {
        const so = off(DEPTH.stars);
        for (const st of stars) {
          const a = 0.5 + 0.5 * Math.sin(t * st.speed + st.phase);
          if (a < 0.2) continue;
          ctx.fillStyle = `rgba(255,248,230,${a * starDim})`;
          const sx = st.x - M + so;
          ctx.fillRect(sx, st.y, 1, 1);
          if (st.big && a > 0.75) {
            ctx.fillRect(sx - 1, st.y, 3, 1);
            ctx.fillRect(sx, st.y - 1, 1, 3);
          }
        }
        if (t > nextShot) {
          shots.push({ t0: t, x: 30 + Math.random() * (W - 110), y: 4 + Math.random() * 22 });
          nextShot = t + 6 + Math.random() * 4; // every 6–10 s
        }
        shots = shots.filter((sh) => t - sh.t0 < 0.9);
        for (const sh of shots) {
          const k = (t - sh.t0) / 0.9;
          for (let i = 0; i < 12; i++) {
            ctx.fillStyle = `rgba(255,240,210,${(1 - i / 12) * (1 - k)})`;
            ctx.fillRect(Math.round(sh.x + k * 60 - i), Math.round(sh.y + k * 22 - i * 0.37), 1, 1);
          }
        }
      } else {
        const co = off(DEPTH.clouds);
        for (const c of clouds) {
          const cx = Math.round(((c.x + t * c.speed) % (W + 80)) - 40) + co;
          const cy = Math.round(c.y);
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(cx, cy, c.w, 3);
          ctx.fillRect(cx + 4, cy - 1, c.w - 10, 1);
          ctx.fillRect(cx + 8, cy - 2, Math.max(3, c.w - 20), 1);
          ctx.fillStyle = "#dcebf8";
          ctx.fillRect(cx + 3, cy + 3, c.w - 6, 1);
        }
      }

      ctx.drawImage(land.far, -M + off(DEPTH.far), 0);
      ctx.drawImage(land.mid, -M + off(DEPTH.mid), 1);
      const nx = -M + off(DEPTH.near);
      ctx.drawImage(land.near, nx, 2);

      // Cabin window: warm and flickering at night.
      if (theme === "dark") {
        const flicker = 0.75 + 0.25 * Math.sin(t * 5.3) * Math.sin(t * 2.1);
        ctx.fillStyle = `rgba(255,190,96,${flicker})`;
        ctx.fillRect(nx + cabinX + 2, ridges.near[cabinX] - 1, 2, 2);
      }
    };

    paintStatic();

    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let last = 0;
    let onScreen = true;

    const loop = (time: number) => {
      raf = requestAnimationFrame(loop);
      if (time - last < 40) return; // ~24 fps
      last = time;
      draw(time);
    };
    const start = () => {
      cancelAnimationFrame(raf);
      if (!reduce && onScreen && !document.hidden) raf = requestAnimationFrame(loop);
    };
    const stop = () => cancelAnimationFrame(raf);

    if (reduce) draw(0);
    else start();

    // Pause when off screen or when the tab is hidden.
    const io = new IntersectionObserver(([e]) => {
      onScreen = e.isIntersecting;
      if (onScreen) start();
      else stop();
    });
    io.observe(canvas);
    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVisibility);

    const repaint = () => {
      paintStatic();
      if (reduce) draw(0);
    };
    const mo = new MutationObserver(repaint);
    const unwatchSky = everyMinute(repaint);
    addEventListener(THEME_CHANGED, repaint);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    const onMove = (e: PointerEvent) => {
      tx = (e.clientX / innerWidth - 0.5) * 2;
      ty = (e.clientY / innerHeight - 0.5) * 2;
    };
    const onClick = (e: MouseEvent) => {
      const b = canvas.getBoundingClientRect();
      shots.push({
        t0: now,
        x: ((e.clientX - b.left) / b.width) * W - 20,
        y: ((e.clientY - b.top) / b.height) * H - 8,
      });
    };
    if (!reduce) {
      window.addEventListener("pointermove", onMove, { passive: true });
      canvas.addEventListener("click", onClick);
    }

    return () => {
      stop();
      io.disconnect();
      mo.disconnect();
      unwatchSky();
      removeEventListener(THEME_CHANGED, repaint);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      width={W}
      height={H}
      role="img"
      aria-label="Pixel-art landscape: a starry night in dark mode, a clear day in light mode"
      className="block w-full rounded-2xl border border-line bg-card [image-rendering:pixelated]"
      style={{ aspectRatio: `${W} / ${H}` }}
    />
  );
}
