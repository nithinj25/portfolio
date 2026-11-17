"use client";

import { useEffect, useRef } from "react";

// The 404 page's picture: "404" standing on a ridge like monoliths, with
// comets coming down on the zero. Same pixel world as the rest of the site.
const W = 180;
const H = 64;
const GROUND = H - 12;
const DIGITS: Record<string, string[]> = {
  "4": ["101", "101", "111", "001", "001"],
  "0": ["111", "101", "101", "101", "111"],
};
const SCALE = 5; // size of one digit block, in scene pixels
const COLORS = {
  dark: { digit: "#ecebe6", shade: "#8e8c9c", far: "#1c1842", near: "#07070d", star: "255,248,230", smoke: "200,196,220" },
  light: { digit: "#17160f", shade: "#6a6961", far: "#a3bfd8", near: "#3f6284", star: "70,85,110", smoke: "120,130,145" },
};

const hash = (n: number) => {
  const x = Math.sin(n * 127.1) * 43758.5453;
  return x - Math.floor(x);
};

export default function LostScene() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Where the three digits stand, and the top of the zero (the comets' target).
    const width = 3 * SCALE;
    const gap = 6;
    const left = Math.round((W - (width * 3 + gap * 2)) / 2);
    const top = GROUND - 5 * SCALE;
    const targetX = left + width + gap + width / 2;

    type Spark = { x: number; y: number; vx: number; vy: number; born: number };
    let sparks: Spark[] = [];
    let impact = -99;
    let cometStart = 0.8;

    const draw = (time: number) => {
      const t = time / 1000;
      const c = COLORS[document.documentElement.dataset.theme === "light" ? "light" : "dark"];
      ctx.clearRect(0, 0, W, H);

      for (let i = 0; i < 46; i++) {
        const a = reduce ? 0.6 : 0.45 + 0.4 * Math.sin(t * (0.6 + hash(i) * 1.5) + i);
        ctx.fillStyle = `rgba(${c.star},${a})`;
        ctx.fillRect(Math.floor(hash(i * 3 + 1) * W), Math.floor(hash(i * 7 + 2) * (GROUND - 8)), 1, 1);
      }

      // A far ridge behind the digits.
      ctx.fillStyle = c.far;
      for (let x = 0; x < W; x++) ctx.fillRect(x, Math.round(GROUND - 9 - Math.sin(x * 0.045 + 1) * 6 - Math.sin(x * 0.13) * 2), 1, H);

      // The digits, shaking briefly when hit.
      const shake = !reduce && t - impact < 0.25 ? Math.round(Math.sin(t * 90) * 1) : 0;
      "404".split("").forEach((d, i) => {
        const x0 = left + i * (width + gap) + (i === 1 ? shake : 0);
        DIGITS[d].forEach((line, row) =>
          line.split("").forEach((on, col) => {
            if (on !== "1") return;
            ctx.fillStyle = c.digit;
            ctx.fillRect(x0 + col * SCALE, top + row * SCALE, SCALE, SCALE);
            ctx.fillStyle = c.shade;
            ctx.fillRect(x0 + col * SCALE + SCALE - 1, top + row * SCALE, 1, SCALE); // right-hand shadow
          }),
        );
      });

      // Ground and pines.
      ctx.fillStyle = c.near;
      ctx.fillRect(0, GROUND, W, H - GROUND);
      for (let x = 4; x < W; x += 1) {
        if (hash(x + 9) < 0.9 || (x > left - 6 && x < left + width * 3 + gap * 2 + 6)) continue;
        const h = 4 + Math.floor(hash(x + 70) * 6);
        for (let i = 0; i < h; i++) ctx.fillRect(x - Math.floor((i + 1) / 2), GROUND - h + i, Math.floor((i + 1) / 2) * 2 + 1, 1);
      }
      if (reduce) return;

      // A comet every few seconds, coming down on the zero.
      const k = (t - cometStart) / 0.9;
      if (k >= 0 && k < 1) {
        const x = targetX + 60 * (1 - k);
        const y = top - 2 - 46 * (1 - k);
        for (let i = 0; i < 12; i++) {
          ctx.fillStyle = `rgba(255,170,90,${1 - i / 12})`;
          ctx.fillRect(Math.round(x + i * 1.6), Math.round(y - i * 1.25), i < 3 ? 2 : 1, i < 3 ? 2 : 1);
        }
      } else if (k >= 1) {
        impact = t;
        for (let i = 0; i < 20; i++) {
          const a = Math.PI + (i / 19) * Math.PI;
          const v = 14 + hash(i + t) * 26;
          sparks.push({ x: targetX, y: top - 1, vx: Math.cos(a) * v, vy: Math.sin(a) * v, born: t });
        }
        cometStart = t + 2.5 + Math.random() * 2.5;
      }

      // Glow in the zero and smoke after a hit.
      const heat = Math.max(0, 1 - (t - impact) / 2.2);
      if (heat > 0) {
        ctx.fillStyle = `rgba(255,150,70,${heat})`;
        ctx.fillRect(left + width + gap + SCALE, top + SCALE, SCALE, SCALE * 3);
        for (let i = 0; i < 5; i++) {
          const age = (t - impact + i * 0.35) % 2.2;
          ctx.fillStyle = `rgba(${c.smoke},${0.45 * (1 - age / 2.2) * heat})`;
          ctx.fillRect(Math.round(targetX + Math.sin(age * 2 + i) * 2 + age), Math.round(top - 2 - age * 7), age > 1 ? 2 : 1, age > 1 ? 2 : 1);
        }
      }
      sparks = sparks.filter((p) => t - p.born < 1);
      for (const p of sparks) {
        const age = t - p.born;
        ctx.fillStyle = `rgba(255,190,110,${1 - age})`;
        ctx.fillRect(Math.round(p.x + p.vx * age), Math.round(p.y + p.vy * age + 40 * age * age), 1, 1);
      }
    };

    let raf = 0;
    let last = 0;
    const loop = (time: number) => {
      raf = requestAnimationFrame(loop);
      if (time - last < 40) return;
      last = time;
      draw(time);
    };
    const start = () => {
      cancelAnimationFrame(raf);
      if (reduce) draw(0);
      else if (!document.hidden) raf = requestAnimationFrame(loop);
    };
    start();
    const mo = new MutationObserver(() => reduce && draw(0));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    document.addEventListener("visibilitychange", start);
    return () => {
      cancelAnimationFrame(raf);
      mo.disconnect();
      document.removeEventListener("visibilitychange", start);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      width={W}
      height={H}
      role="img"
      aria-label="Pixel art: the number 404 standing on a ridge, with comets landing on the zero"
      className="mx-auto block w-full max-w-[540px] [image-rendering:pixelated]"
      style={{ aspectRatio: `${W} / ${H}` }}
    />
  );
}
