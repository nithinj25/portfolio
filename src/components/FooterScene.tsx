"use client";

import { useEffect, useRef } from "react";
import { COMET_CAUGHT, SCORE_KEY } from "./StarMargins";

// Full-width pixel campsite that closes the page, in the banner's palette.
//
// It is driven by two things:
//  · Scroll. As the footer scrolls into view the scene assembles: the three
//    ridges rise into place at different speeds, the horizon glow brightens,
//    the moon (or sun) climbs from behind the mountains, and the campfire
//    lights once you reach the bottom.
//  · Score. Every comet caught in the margin game becomes a star above the
//    camp. A new catch sends a streak down into the fire, which flares.
//
// Under prefers-reduced-motion the scene is shown fully assembled and still.
const H = 64; // internal height in pixels; width follows the viewport
const MAX_STARS = 60;
const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

const SCENES = {
  dark: {
    glow: ["#1a1640", "#48265e", "#853860", "#c2573f"],
    far: "#1c1842",
    mid: "#110f2b",
    near: "#07070d",
    tent: "#2a2456",
    tentShade: "#1a1638",
    smoke: "200,196,220",
    orb: "#f6ecce",
    orbShade: "#cfc3a0",
    star: "255,214,150",
  },
  light: {
    glow: ["#dcebf8", "#cfe6f8", "#f3ead6", "#fbe3bf"],
    far: "#a3bfd8",
    mid: "#7397b8",
    near: "#3f6284",
    tent: "#e2553a",
    tentShade: "#b9412b",
    smoke: "120,130,145",
    orb: "#fff1b0",
    orbShade: "#ffd772",
    star: "217,72,26",
  },
};

// Deterministic 0…1 noise from an integer, so the scene is stable across resizes.
const hash = (n: number) => {
  const x = Math.sin(n * 127.1) * 43758.5453;
  return x - Math.floor(x);
};
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export default function FooterScene() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const make = () => document.createElement("canvas");
    const layers = { glow: make(), far: make(), mid: make(), near: make() };
    let W = 0;
    let fireX = 0;
    let groundY = 0;
    let glowKey = "";
    let theme: keyof typeof SCENES = "dark";
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ridge = (x: number, base: number, amp: number, f: number, p: number) =>
      Math.round(base - Math.sin(x * f + p) * amp - Math.sin(x * f * 2.7 + p * 2) * amp * 0.4 - Math.sin(x * f * 6.1) * amp * 0.12);

    const pine = (c: CanvasRenderingContext2D, x: number, y: number, h: number) => {
      for (let i = 0; i < h; i++) c.fillRect(x - Math.floor((i + 1) / 2), y - h + i, Math.floor((i + 1) / 2) * 2 + 1, 1);
    };

    const paint = () => {
      theme = document.documentElement.dataset.theme === "light" ? "light" : "dark";
      const s = SCENES[theme];
      const scale = canvas.clientWidth < 640 ? 3 : 4;
      W = canvas.width = Math.ceil(canvas.clientWidth / scale);
      canvas.height = H;
      for (const l of Object.values(layers)) {
        l.width = W;
        l.height = H;
      }
      glowKey = "";
      fireX = Math.round(W * 0.5);

      const far = layers.far.getContext("2d")!;
      far.fillStyle = s.far;
      for (let x = 0; x < W; x++) far.fillRect(x, ridge(x, H - 22, 9, 0.021, 1.3), 1, H);

      const mid = layers.mid.getContext("2d")!;
      mid.fillStyle = s.mid;
      for (let x = 0; x < W; x++) {
        const y = ridge(x, H - 13, 5, 0.034, 4.1);
        mid.fillRect(x, y, 1, H);
        if (hash(x) > 0.86) pine(mid, x, y, 3 + Math.floor(hash(x + 500) * 4));
      }

      // Foreground, flattened into a clearing around the fire.
      const near = layers.near.getContext("2d")!;
      const ground = (x: number) => {
        const flat = Math.max(0, 1 - Math.abs(x - fireX) / 34);
        return Math.round(ridge(x, H - 5, 2.5, 0.05, 2.2) * (1 - flat) + (H - 5) * flat);
      };
      groundY = ground(fireX);
      near.fillStyle = s.near;
      for (let x = 0; x < W; x++) {
        const y = ground(x);
        near.fillRect(x, y, 1, H);
        if (Math.abs(x - fireX) > 30 && hash(x + 90) > 0.9) {
          pine(near, x, y, 5 + Math.floor(hash(x + 700) * 7));
          near.fillRect(x, y - 1, 1, 2);
        }
      }
      // Tent, left of the fire.
      const tx = fireX - 22;
      for (let i = 0; i < 8; i++) {
        near.fillStyle = s.tent;
        near.fillRect(tx - i, groundY - 8 + i, i + 1, 1);
        near.fillStyle = s.tentShade;
        near.fillRect(tx + 1, groundY - 8 + i, i, 1);
      }
      near.fillStyle = s.near;
      near.fillRect(tx, groundY - 3, 1, 3); // door
      // Logs, and a seat on the far side of the fire.
      near.fillStyle = theme === "dark" ? "#2b1a14" : "#5a3a2a";
      near.fillRect(fireX - 2, groundY - 1, 5, 1);
      near.fillRect(fireX + 9, groundY - 2, 4, 2);
    };

    /** Horizon glow, dithered up into the page background. Brighter as `e` goes 0 → 1. */
    const paintGlow = (e: number) => {
      const step = Math.round(e * 14);
      const key = `${theme}|${W}|${step}`;
      if (key === glowKey) return;
      glowKey = key;
      const s = SCENES[theme];
      const g = layers.glow.getContext("2d")!;
      g.clearRect(0, 0, W, H);
      const n = s.glow.length;
      const strength = 0.3 + 0.7 * (step / 14);
      for (let y = 0; y < H; y++) {
        const t = Math.min(n, Math.pow(y / (H - 20), 1.5) * n) * strength;
        for (let x = 0; x < W; x++) {
          const level = Math.floor(t) + (t - Math.floor(t) > (BAYER[y % 4][x % 4] + 0.5) / 16 ? 1 : 0);
          if (level < 1) continue;
          g.fillStyle = s.glow[Math.min(n, level) - 1];
          g.fillRect(x, y, 1, 1);
        }
      }
    };

    // ── Score state ──
    let count = 0;
    try {
      count = Number(localStorage.getItem(SCORE_KEY)) || 0;
    } catch {}
    const starBorn = new Map<number, number>(); // star index → time it appeared
    let lastCatch = -99; // time the newest streak started

    const flies = Array.from({ length: 16 }, (_, i) => ({ a: hash(i + 1) * 6.28, r: hash(i + 31), sp: 0.3 + hash(i + 77) * 0.6, ph: hash(i + 13) * 6.28 }));
    type Puff = { x: number; y: number; born: number };
    type Spark = { x: number; y: number; vx: number; vy: number; born: number };
    let smoke: Puff[] = [];
    let sparks: Spark[] = [];
    let lastPuff = 0;
    let flared = true;
    let eased = reduce ? 1 : 0;
    let now = 0;

    const draw = (time: number) => {
      const t = (now = time / 1000);
      const s = SCENES[theme];

      // How far the scene has scrolled into view: 0 = just entering, 1 = fully visible.
      const box = canvas.getBoundingClientRect();
      const target = reduce ? 1 : clamp01((innerHeight - box.top) / box.height);
      eased += (target - eased) * 0.18;
      const e = eased * eased * (3 - 2 * eased);
      const lit = e > 0.82;

      ctx.clearRect(0, 0, W, H);
      paintGlow(e);
      ctx.drawImage(layers.glow, 0, 0);

      // One star per comet caught.
      const shown = Math.min(count, MAX_STARS);
      for (let i = 0; i < shown; i++) {
        const x = Math.round(4 + hash(i * 3 + 1) * (W - 8));
        const y = Math.round(3 + hash(i * 7 + 2) * (H * 0.4));
        const age = t - (starBorn.get(i) ?? -99);
        const twinkle = reduce ? 0.8 : 0.55 + 0.35 * Math.sin(t * (0.8 + hash(i) * 1.6) + i);
        ctx.fillStyle = `rgba(${s.star},${Math.min(1, twinkle * e + (age < 1 ? 1 - age : 0))})`;
        ctx.fillRect(x, y, 1, 1);
        if (age < 1.2 || hash(i + 40) > 0.75) {
          ctx.fillRect(x - 1, y, 3, 1);
          ctx.fillRect(x, y - 1, 1, 3);
        }
      }

      // Moon or sun, climbing from behind the far ridge.
      const ox = Math.round(W * 0.72);
      const oy = Math.round(H - 16 - e * (H - 30));
      for (let y = -5; y <= 5; y++)
        for (let x = -5; x <= 5; x++) {
          const d = x * x + y * y;
          if (d > 27) continue;
          ctx.fillStyle = d > 17 || (theme === "dark" && x > 1 && y > 0) ? s.orbShade : s.orb;
          ctx.fillRect(ox + x, oy + y, 1, 1);
        }

      // Ridges rise into place, the nearest travelling furthest.
      const rise = (px: number) => Math.round((1 - e) * px);
      ctx.drawImage(layers.far, 0, rise(9));
      ctx.drawImage(layers.mid, 0, rise(17));
      const ny = rise(27);
      ctx.drawImage(layers.near, 0, ny);
      const gy = groundY + ny;

      // A fresh catch: a streak falls into the fire, then the fire flares.
      const streak = (t - lastCatch) / 0.5;
      if (streak >= 0 && streak < 1) {
        const sx = fireX + 46 * (1 - streak);
        const sy = (gy - 3) * streak;
        for (let i = 0; i < 9; i++) {
          ctx.fillStyle = `rgba(255,214,150,${1 - i / 9})`;
          ctx.fillRect(Math.round(sx + i * 1.4), Math.round(sy - i * 1.6), i < 2 ? 2 : 1, i < 2 ? 2 : 1);
        }
      } else if (streak >= 1 && !flared) {
        flared = true;
        for (let i = 0; i < 18; i++) {
          const a = Math.PI + (i / 17) * Math.PI;
          const v = 9 + hash(i + t) * 16;
          sparks.push({ x: fireX, y: gy - 3, vx: Math.cos(a) * v, vy: Math.sin(a) * v, born: t });
        }
      }
      const flare = flared ? Math.max(0, 1 - (t - lastCatch - 0.5) / 1.6) : 0;

      if (lit) {
        // Smoke
        if (!reduce && t - lastPuff > 0.45) {
          smoke.push({ x: fireX + 0.5, y: gy - 5, born: t });
          lastPuff = t;
        }
        smoke = smoke.filter((p) => t - p.born < 6);
        for (const p of smoke) {
          const age = t - p.born;
          ctx.fillStyle = `rgba(${s.smoke},${0.4 * (1 - age / 6)})`;
          const size = age > 2.5 ? 2 : 1;
          ctx.fillRect(Math.round(p.x + Math.sin(age * 1.3 + p.born) * 2 + age * 1.2), Math.round(p.y - age * 4.5), size, size);
        }

        // Fire: flickering columns over a glow on the ground. Taller while flaring.
        const flick = (k: number) => (reduce ? 0.5 : 0.5 + 0.5 * Math.sin(t * (9 + k * 3.7) + k * 2));
        const reach = flare > 0 ? 2 : 1;
        ctx.fillStyle = `rgba(255,150,70,${0.16 + 0.08 * flick(5) + flare * 0.25})`;
        ctx.fillRect(fireX - 7 - reach * 3, gy, 15 + reach * 6, 1);
        ctx.fillRect(fireX - 4 - reach, gy + 1, 9 + reach * 2, 1);
        for (let k = -reach; k <= reach; k++) {
          const h = 2 + Math.round(flick(k + 2) * (k === 0 ? 3 : 1.6) + flare * (5 - Math.abs(k) * 1.5));
          ctx.fillStyle = "#e2521d";
          ctx.fillRect(fireX + k, gy - 1 - h, 1, h);
          ctx.fillStyle = "#ffb347";
          ctx.fillRect(fireX + k, gy - 1 - Math.max(1, h - 2), 1, Math.max(1, h - 2));
        }
        ctx.fillStyle = "#fff1b8";
        ctx.fillRect(fireX, gy - 2, 1, 1 + Math.round(flare * 2));
      }

      sparks = sparks.filter((p) => t - p.born < 1.1);
      for (const p of sparks) {
        const age = t - p.born;
        ctx.fillStyle = `rgba(255,190,110,${1 - age / 1.1})`;
        ctx.fillRect(Math.round(p.x + p.vx * age), Math.round(p.y + p.vy * age + 14 * age * age), 1, 1);
      }

      if (theme === "dark") {
        // Fireflies wake up as the camp settles.
        for (const f of flies) {
          const blink = reduce ? 0.7 : 0.5 + 0.5 * Math.sin(t * (1.2 + f.sp) + f.ph);
          if (blink < 0.35) continue;
          const x = (f.r * W + Math.sin(t * f.sp + f.a) * 9 + W) % W;
          const y = H - 12 - hash(f.ph) * 18 + Math.cos(t * f.sp * 0.8 + f.a) * 3 + ny;
          ctx.fillStyle = `rgba(222,255,150,${blink * e})`;
          ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
        }
      } else {
        // A few birds crossing the sky.
        ctx.fillStyle = s.near;
        for (let i = 0; i < 3; i++) {
          const x = Math.round(((t * (5 + i * 2) + i * 97) % (W + 20)) - 10);
          const y = 8 + i * 6 + Math.round(Math.sin(t * 2 + i));
          const flap = reduce || Math.sin(t * 6 + i) > 0 ? -1 : 1; // wings up, then down
          ctx.fillRect(x, y, 1, 1);
          ctx.fillRect(x - 1, y + flap, 1, 1);
          ctx.fillRect(x + 1, y + flap, 1, 1);
          ctx.fillRect(x - 2, y + flap * 2, 1, 1);
          ctx.fillRect(x + 2, y + flap * 2, 1, 1);
        }
      }
    };

    let raf = 0;
    let last = 0;
    let onScreen = false;
    const loop = (time: number) => {
      raf = requestAnimationFrame(loop);
      if (time - last < 33) return; // ~30 fps keeps the scroll motion smooth
      last = time;
      draw(time);
    };
    const stop = () => cancelAnimationFrame(raf);
    const start = () => {
      stop();
      if (reduce) draw(0);
      else if (onScreen && !document.hidden) raf = requestAnimationFrame(loop);
    };
    const repaint = () => {
      paint();
      draw(performance.now());
      start();
    };

    const onCaught = (ev: Event) => {
      const next = Number((ev as CustomEvent<number>).detail) || count + 1;
      if (next <= MAX_STARS) starBorn.set(next - 1, now + 0.5);
      count = next;
      if (reduce) return draw(0);
      lastCatch = now;
      flared = false;
    };

    repaint();
    const io = new IntersectionObserver(([en]) => {
      onScreen = en.isIntersecting;
      start();
    });
    io.observe(canvas);
    const ro = new ResizeObserver(repaint);
    ro.observe(canvas);
    const mo = new MutationObserver(repaint);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    document.addEventListener("visibilitychange", start);
    window.addEventListener(COMET_CAUGHT, onCaught);

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      mo.disconnect();
      document.removeEventListener("visibilitychange", start);
      window.removeEventListener(COMET_CAUGHT, onCaught);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      height={H}
      role="img"
      aria-label="Pixel-art campsite: a tent and a campfire under the mountains, with a star for every comet caught"
      className="mt-10 block h-[192px] w-full [image-rendering:pixelated] sm:h-[256px]"
    />
  );
}
