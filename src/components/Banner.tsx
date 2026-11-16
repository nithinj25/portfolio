"use client";

import { useEffect, useRef } from "react";

// A tiny procedural pixel landscape: starry night in dark mode, drifting clouds
// in light mode. Rendered at 200×56 and scaled up with crisp pixels.
const W = 200;
const H = 56;
const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

const SCENES = {
  dark: {
    sky: ["#06071a", "#0b0e2c", "#171744", "#33215c", "#6e3160", "#c2573f", "#f08a4b"],
    far: "#15122e",
    near: "#07070d",
    orb: "#f6ecce",
    orbShade: "#cfc3a0",
  },
  light: {
    sky: ["#3a86dc", "#559fe8", "#78b8f0", "#a3d0f5", "#cfe6f8", "#f3ead6", "#fbe3bf"],
    far: "#86a9c9",
    near: "#3f6284",
    orb: "#fff6cf",
    orbShade: "#ffe9a3",
  },
};

function rng(seed: number) {
  return () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
}

function ridge(seed: number, base: number, amp: number) {
  const r = rng(seed);
  const p = [r() * 6, r() * 6, r() * 6];
  return Array.from({ length: W }, (_, x) => {
    const h =
      Math.sin(x * 0.045 + p[0]) * amp +
      Math.sin(x * 0.11 + p[1]) * amp * 0.45 +
      Math.sin(x * 0.31 + p[2]) * amp * 0.18;
    return Math.round(base - h);
  });
}

export default function Banner() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const r = rng(25);
    const stars = Array.from({ length: 70 }, () => ({
      x: Math.floor(r() * W),
      y: Math.floor(r() * (H * 0.62)),
      phase: r() * Math.PI * 2,
      speed: 0.6 + r() * 1.8,
      big: r() > 0.88,
    }));
    const clouds = Array.from({ length: 6 }, (_, i) => ({
      x: r() * W,
      y: 5 + i * 5 + r() * 4,
      w: 14 + Math.floor(r() * 18),
      speed: 0.6 + r() * 1.2,
    }));
    const farRidge = ridge(7, H - 13, 7);
    const nearRidge = ridge(42, H - 6, 4);

    const sky = document.createElement("canvas");
    const land = document.createElement("canvas");
    sky.width = land.width = W;
    sky.height = land.height = H;

    let theme: keyof typeof SCENES = "dark";
    const paintStatic = () => {
      theme = document.documentElement.dataset.theme === "light" ? "light" : "dark";
      const s = SCENES[theme];
      const sctx = sky.getContext("2d")!;
      const n = s.sky.length - 1;
      for (let y = 0; y < H; y++) {
        const t = Math.pow(y / (H - 1), 1.35) * n;
        const i = Math.min(n - 1, Math.floor(t));
        for (let x = 0; x < W; x++) {
          sctx.fillStyle = t - i > (BAYER[y % 4][x % 4] + 0.5) / 16 ? s.sky[i + 1] : s.sky[i];
          sctx.fillRect(x, y, 1, 1);
        }
      }
      const lctx = land.getContext("2d")!;
      lctx.clearRect(0, 0, W, H);
      for (let x = 0; x < W; x++) {
        lctx.fillStyle = s.far;
        lctx.fillRect(x, farRidge[x], 1, H);
        lctx.fillStyle = s.near;
        lctx.fillRect(x, nearRidge[x], 1, H);
      }
    };

    let px = 0;
    let py = 0;
    let shoot = { t0: -10, x: 0, y: 0 };

    const draw = (time: number) => {
      const t = time / 1000;
      const s = SCENES[theme];
      ctx.drawImage(sky, 0, 0);

      // Moon or sun, with a one-pixel shaded edge.
      const ox = Math.round(W * 0.78 + px * 1.5);
      const oy = Math.round(13 + py);
      for (let y = -5; y <= 5; y++)
        for (let x = -5; x <= 5; x++) {
          const d = x * x + y * y;
          if (d > 27) continue;
          ctx.fillStyle = d > 17 || (theme === "dark" && x > 1 && y > 0) ? s.orbShade : s.orb;
          ctx.fillRect(ox + x, oy + y, 1, 1);
        }

      if (theme === "dark") {
        for (const st of stars) {
          const a = 0.5 + 0.5 * Math.sin(t * st.speed + st.phase);
          if (a < 0.25) continue;
          ctx.fillStyle = `rgba(255,248,230,${a})`;
          const sx = (st.x + Math.round(px * 3) + W) % W;
          ctx.fillRect(sx, st.y, 1, 1);
          if (st.big && a > 0.8) {
            ctx.fillRect(sx - 1, st.y, 3, 1);
            ctx.fillRect(sx, st.y - 1, 1, 3);
          }
        }
        if (t - shoot.t0 > 7) shoot = { t0: t, x: 30 + Math.random() * 110, y: 3 + Math.random() * 12 };
        const k = (t - shoot.t0) / 0.7;
        if (k < 1)
          for (let i = 0; i < 8; i++) {
            ctx.fillStyle = `rgba(255,240,210,${(1 - i / 8) * (1 - k)})`;
            ctx.fillRect(Math.round(shoot.x + k * 36 - i), Math.round(shoot.y + k * 14 - i * 0.4), 1, 1);
          }
      } else {
        for (const c of clouds) {
          const cx = Math.round(((c.x + t * c.speed + px * 4) % (W + 40)) - 20);
          const cy = Math.round(c.y);
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(cx, cy, c.w, 2);
          ctx.fillRect(cx + 3, cy - 1, c.w - 8, 1);
          ctx.fillRect(cx + 6, cy - 2, Math.max(2, c.w - 16), 1);
          ctx.fillStyle = "#dcebf8";
          ctx.fillRect(cx + 2, cy + 2, c.w - 4, 1);
        }
      }
      ctx.drawImage(land, 0, 0);
    };

    paintStatic();
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let last = 0;
    const loop = (time: number) => {
      raf = requestAnimationFrame(loop);
      if (time - last < 80) return; // ~12 fps suits the pixel look
      last = time;
      draw(time);
    };
    if (reduce) draw(0);
    else raf = requestAnimationFrame(loop);

    const mo = new MutationObserver(() => {
      paintStatic();
      if (reduce) draw(0);
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    const onMove = (e: PointerEvent) => {
      const b = canvas.getBoundingClientRect();
      px = ((e.clientX - b.left) / b.width - 0.5) * 2;
      py = ((e.clientY - b.top) / b.height - 0.5) * 2;
    };
    const onLeave = () => (px = py = 0);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      mo.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      width={W}
      height={H}
      role="img"
      aria-label="Pixel-art landscape: a night sky in dark mode, a clear day in light mode"
      className="block w-full rounded-2xl border border-line bg-card [image-rendering:pixelated]"
      style={{ aspectRatio: `${W} / ${H}` }}
    />
  );
}
