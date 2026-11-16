"use client";

import { useEffect, useRef } from "react";

// Full-width pixel campsite that closes the page. It shares the banner's
// palette: an ember glow on the horizon, three ridges, pines, a tent and a
// campfire with rising smoke. Fireflies at night, birds by day.
const H = 46; // internal height in pixels; width follows the viewport
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
  },
  light: {
    glow: ["#dcebf8", "#cfe6f8", "#f3ead6", "#fbe3bf"],
    far: "#a3bfd8",
    mid: "#7397b8",
    near: "#3f6284",
    tent: "#e2553a",
    tentShade: "#b9412b",
    smoke: "120,130,145",
  },
};

// Deterministic 0…1 noise from an integer, so the scene is stable across resizes.
const hash = (n: number) => {
  const x = Math.sin(n * 127.1) * 43758.5453;
  return x - Math.floor(x);
};

export default function FooterScene() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const bg = document.createElement("canvas");
    let W = 0;
    let fireX = 0;
    let groundY = 0;
    let theme: keyof typeof SCENES = "dark";
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ridge = (x: number, base: number, amp: number, f: number, p: number) =>
      Math.round(base - Math.sin(x * f + p) * amp - Math.sin(x * f * 2.7 + p * 2) * amp * 0.4 - Math.sin(x * f * 6.1) * amp * 0.12);

    const paint = () => {
      theme = document.documentElement.dataset.theme === "light" ? "light" : "dark";
      const s = SCENES[theme];
      const scale = canvas.clientWidth < 640 ? 3 : 4;
      W = canvas.width = bg.width = Math.ceil(canvas.clientWidth / scale);
      canvas.height = bg.height = H;
      const b = bg.getContext("2d")!;
      b.clearRect(0, 0, W, H);

      // Horizon glow, dithered up into the page background.
      const n = s.glow.length;
      for (let y = 0; y < H; y++) {
        const t = Math.min(n, Math.pow(y / (H - 17), 1.5) * n); // brightest at the far ridge line
        for (let x = 0; x < W; x++) {
          const level = Math.floor(t) + (t - Math.floor(t) > (BAYER[y % 4][x % 4] + 0.5) / 16 ? 1 : 0);
          if (level < 1) continue;
          b.fillStyle = s.glow[Math.min(n, level) - 1];
          b.fillRect(x, y, 1, 1);
        }
      }

      fireX = Math.round(W * 0.5);
      for (let x = 0; x < W; x++) {
        b.fillStyle = s.far;
        b.fillRect(x, ridge(x, H - 19, 8, 0.021, 1.3), 1, H);
      }
      for (let x = 0; x < W; x++) {
        const y = ridge(x, H - 12, 5, 0.034, 4.1);
        b.fillStyle = s.mid;
        b.fillRect(x, y, 1, H);
        // Pines on the middle ridge.
        if (hash(x) > 0.86) {
          const h = 3 + Math.floor(hash(x + 500) * 4);
          for (let i = 0; i < h; i++) b.fillRect(x - Math.floor((i + 1) / 2), y - h + i, Math.floor((i + 1) / 2) * 2 + 1, 1);
        }
      }
      // Foreground, flattened into a clearing around the fire.
      const ground = (x: number) => {
        const flat = Math.max(0, 1 - Math.abs(x - fireX) / 34);
        return Math.round(ridge(x, H - 5, 2.5, 0.05, 2.2) * (1 - flat) + (H - 5) * flat);
      };
      groundY = ground(fireX);
      b.fillStyle = s.near;
      for (let x = 0; x < W; x++) {
        const y = ground(x);
        b.fillRect(x, y, 1, H);
        if (Math.abs(x - fireX) > 30 && hash(x + 90) > 0.9) {
          const h = 5 + Math.floor(hash(x + 700) * 6);
          for (let i = 0; i < h; i++) b.fillRect(x - Math.floor((i + 1) / 2), y - h + i, Math.floor((i + 1) / 2) * 2 + 1, 1);
          b.fillRect(x, y - 1, 1, 2);
        }
      }

      // Tent, left of the fire.
      const tx = fireX - 22;
      for (let i = 0; i < 8; i++) {
        b.fillStyle = s.tent;
        b.fillRect(tx - i, groundY - 8 + i, i + 1, 1);
        b.fillStyle = s.tentShade;
        b.fillRect(tx + 1, groundY - 8 + i, i, 1);
      }
      b.fillStyle = s.near;
      b.fillRect(tx, groundY - 3, 1, 3); // door
      // Logs, and a seat on the far side of the fire.
      b.fillStyle = theme === "dark" ? "#2b1a14" : "#5a3a2a";
      b.fillRect(fireX - 2, groundY - 1, 5, 1);
      b.fillRect(fireX + 9, groundY - 2, 4, 2);
    };

    const flies = Array.from({ length: 14 }, (_, i) => ({ a: hash(i + 1) * 6.28, r: hash(i + 31), sp: 0.3 + hash(i + 77) * 0.6, ph: hash(i + 13) * 6.28 }));
    type Puff = { x: number; y: number; born: number };
    let smoke: Puff[] = [];
    let lastPuff = 0;

    const draw = (time: number) => {
      const t = time / 1000;
      const s = SCENES[theme];
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(bg, 0, 0);

      // Smoke
      if (!reduce && t - lastPuff > 0.45) {
        smoke.push({ x: fireX + 0.5, y: groundY - 5, born: t });
        lastPuff = t;
      }
      smoke = smoke.filter((p) => t - p.born < 5);
      for (const p of smoke) {
        const age = t - p.born;
        ctx.fillStyle = `rgba(${s.smoke},${0.4 * (1 - age / 5)})`;
        const size = age > 2.5 ? 2 : 1;
        ctx.fillRect(Math.round(p.x + Math.sin(age * 1.3 + p.born) * 2 + age * 1.2), Math.round(p.y - age * 4.5), size, size);
      }

      // Fire: three flickering columns over a glow on the ground.
      const flick = (k: number) => (reduce ? 0.5 : 0.5 + 0.5 * Math.sin(t * (9 + k * 3.7) + k * 2));
      ctx.fillStyle = `rgba(255,150,70,${0.16 + 0.08 * flick(5)})`;
      ctx.fillRect(fireX - 7, groundY, 15, 1);
      ctx.fillRect(fireX - 4, groundY + 1, 9, 1);
      for (let k = -1; k <= 1; k++) {
        const h = 2 + Math.round(flick(k + 2) * (k === 0 ? 3 : 1.6));
        ctx.fillStyle = "#e2521d";
        ctx.fillRect(fireX + k, groundY - 1 - h, 1, h);
        ctx.fillStyle = "#ffb347";
        ctx.fillRect(fireX + k, groundY - 1 - Math.max(1, h - 2), 1, Math.max(1, h - 2));
      }
      ctx.fillStyle = "#fff1b8";
      ctx.fillRect(fireX, groundY - 2, 1, 1);

      if (theme === "dark") {
        // Fireflies drifting above the clearing.
        for (const f of flies) {
          const blink = reduce ? 0.7 : 0.5 + 0.5 * Math.sin(t * (1.2 + f.sp) + f.ph);
          if (blink < 0.35) continue;
          const x = (f.r * W + Math.sin(t * f.sp + f.a) * 9 + W) % W;
          const y = H - 12 - hash(f.ph) * 16 + Math.cos(t * f.sp * 0.8 + f.a) * 3;
          ctx.fillStyle = `rgba(222,255,150,${blink})`;
          ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
        }
      } else {
        // A few birds crossing the sky.
        ctx.fillStyle = "#3f6284";
        for (let i = 0; i < 3; i++) {
          const x = Math.round(((t * (5 + i * 2) + i * 97) % (W + 20)) - 10);
          const y = 6 + i * 5 + Math.round(Math.sin(t * 2 + i) * 1);
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
      if (time - last < 80) return; // ~12 fps suits the fire
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

    repaint();
    const io = new IntersectionObserver(([e]) => {
      onScreen = e.isIntersecting;
      start();
    });
    io.observe(canvas);
    const ro = new ResizeObserver(repaint);
    ro.observe(canvas);
    const mo = new MutationObserver(repaint);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    document.addEventListener("visibilitychange", start);

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      mo.disconnect();
      document.removeEventListener("visibilitychange", start);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      height={H}
      role="img"
      aria-label="Pixel-art campsite: a tent and a campfire under the mountains"
      className="mt-10 block h-[138px] w-full [image-rendering:pixelated] sm:h-[184px]"
    />
  );
}
