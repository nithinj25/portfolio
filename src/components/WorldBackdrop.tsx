"use client";

import { useEffect, useRef, useState } from "react";

// One fixed, full-screen pixel scene behind the whole site. Scrolling the page
// moves a camera from the open sky down to the ground:
//
//   top of page    stars only
//   on the way     you drop through a band of clouds
//   lower          the horizon glow and the moon come up, ridges rise in layers
//   bottom         you have landed at the campsite, and the fire lights
//
// Comets fall the whole time. High up they are cold and blue; lower down they
// heat to orange, and once there is ground on screen they hit it and explode.
// Click one before it lands to catch it: it becomes a star, and the count is
// kept in this browser.
//
// Under prefers-reduced-motion this is a still star field with no comets.
const S = 3; // screen pixels per scene pixel
const COLUMN_HALF = 460 / S; // comets avoid the text column when there is room
const REACH = 46; // cursor influence on stars, scene px
const CATCH_RADIUS = 13;
const MAX_CAUGHT_STARS = 70;
const SCORE_KEY = "comets-caught";
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
    logs: "#2b1a14",
    orb: "#f6ecce",
    orbShade: "#cfc3a0",
    star: "255,248,230",
    caught: "255,214,150",
    cloud: "#15133a",
    cloudEdge: "#26215e",
    smoke: "200,196,220",
    cold: [170, 215, 255],
    hot: [255, 165, 85],
  },
  light: {
    glow: ["#dcebf8", "#cfe6f8", "#f3ead6", "#fbe3bf"],
    far: "#a3bfd8",
    mid: "#7397b8",
    near: "#3f6284",
    tent: "#e2553a",
    tentShade: "#b9412b",
    logs: "#5a3a2a",
    orb: "#fff1b0",
    orbShade: "#ffd772",
    star: "70,85,110",
    caught: "217,72,26",
    cloud: "#ffffff",
    cloudEdge: "#cfe0f0",
    smoke: "120,130,145",
    cold: [70, 130, 205],
    hot: [217, 72, 26],
  },
};

type Star = { x: number; y: number; depth: number; phase: number; speed: number; big: boolean; ox: number; oy: number; glow: number };
type Comet = { x: number; y: number; vx: number; vy: number };
type Spark = { x: number; y: number; vx: number; vy: number; born: number; life: number; rgb: string };
type Mark = { x: number; y: number; born: number }; // a glowing scar where a comet landed
type Pop = { x: number; y: number; born: number };
type Puff = { x: number; y: number; born: number };

// Deterministic 0…1 noise from a number, so the land is the same on every visit.
const hash = (n: number) => {
  const x = Math.sin(n * 127.1) * 43758.5453;
  return x - Math.floor(x);
};
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const smooth = (v: number) => v * v * (3 - 2 * v);

export default function WorldBackdrop() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const make = () => document.createElement("canvas");
    const layers = { glow: make(), far: make(), mid: make(), near: make() };
    let theme: keyof typeof SCENES = "dark";
    let W = 0;
    let H = 0;
    let fireX = 0;
    let fireY = 0;
    let nearTop: number[] = [];
    let stars: Star[] = [];
    let comets: Comet[] = [];
    let sparks: Spark[] = [];
    let marks: Mark[] = [];
    let pops: Pop[] = [];
    let smoke: Puff[] = [];
    const caughtBorn = new Map<number, number>();
    let mx = -9999;
    let my = -9999;
    let cam = 0; // smoothed scroll progress, 0 (sky) … 1 (ground)
    let now = 0;
    let nextComet = 1.5;
    let lastPuff = 0;
    let flareAt = -99;
    let caught = 0;

    if (!reduce) {
      try {
        caught = Number(localStorage.getItem(SCORE_KEY)) || 0;
      } catch {}
      setScore(caught);
    }

    const ridge = (x: number, base: number, amp: number, f: number, p: number) =>
      Math.round(base - Math.sin(x * f + p) * amp - Math.sin(x * f * 2.7 + p * 2) * amp * 0.4 - Math.sin(x * f * 6.1) * amp * 0.12);
    const pine = (c: CanvasRenderingContext2D, x: number, y: number, h: number) => {
      for (let i = 0; i < h; i++) c.fillRect(x - Math.floor((i + 1) / 2), y - h + i, Math.floor((i + 1) / 2) * 2 + 1, 1);
    };

    /** Paints the land layers as they sit once you have fully landed (camera = 1). */
    const build = () => {
      theme = document.documentElement.dataset.theme === "light" ? "light" : "dark";
      const s = SCENES[theme];
      W = canvas.width = Math.ceil(innerWidth / S);
      H = canvas.height = Math.ceil(innerHeight / S);
      for (const l of Object.values(layers)) {
        l.width = W;
        l.height = H;
      }
      fireX = Math.round(W / 2);

      stars = Array.from({ length: Math.round((W * H) / 520) }, () => ({
        x: Math.floor(Math.random() * W),
        y: Math.random() * H,
        depth: 0.25 + Math.random() * 0.75,
        phase: Math.random() * Math.PI * 2,
        speed: 0.4 + Math.random() * 1.3,
        big: Math.random() > 0.9,
        ox: 0,
        oy: 0,
        glow: 0,
      }));

      // Horizon glow, dithered up into the page colour.
      const g = layers.glow.getContext("2d")!;
      const n = s.glow.length;
      const top = H * 0.26;
      const horizon = H * 0.7;
      for (let y = Math.floor(top); y < H; y++) {
        const t = Math.pow(clamp01((y - top) / (horizon - top)), 1.5) * n;
        for (let x = 0; x < W; x++) {
          const level = Math.min(n, Math.floor(t) + (t - Math.floor(t) > (BAYER[y % 4][x % 4] + 0.5) / 16 ? 1 : 0));
          if (level < 1) continue;
          g.fillStyle = s.glow[level - 1];
          g.fillRect(x, y, 1, 1);
        }
      }

      const far = layers.far.getContext("2d")!;
      far.fillStyle = s.far;
      for (let x = 0; x < W; x++) far.fillRect(x, ridge(x, H * 0.7, H * 0.075, 0.016, 1.3), 1, H);

      const mid = layers.mid.getContext("2d")!;
      mid.fillStyle = s.mid;
      for (let x = 0; x < W; x++) {
        const y = ridge(x, H * 0.81, H * 0.04, 0.027, 4.1);
        mid.fillRect(x, y, 1, H);
        if (hash(x) > 0.87) pine(mid, x, y, 4 + Math.floor(hash(x + 500) * 5));
      }

      // Foreground, flattened into a clearing around the fire.
      const near = layers.near.getContext("2d")!;
      const ground = (x: number) => {
        const flat = Math.max(0, 1 - Math.abs(x - fireX) / 44);
        return Math.round(ridge(x, H * 0.92, H * 0.018, 0.04, 2.2) * (1 - flat) + H * 0.92 * flat);
      };
      nearTop = Array.from({ length: W }, (_, x) => ground(x));
      fireY = nearTop[fireX];
      near.fillStyle = s.near;
      for (let x = 0; x < W; x++) {
        near.fillRect(x, nearTop[x], 1, H);
        if (Math.abs(x - fireX) > 40 && hash(x + 90) > 0.9) {
          pine(near, x, nearTop[x], 7 + Math.floor(hash(x + 700) * 9));
          near.fillRect(x, nearTop[x] - 1, 1, 2);
        }
      }
      const tx = fireX - 28;
      for (let i = 0; i < 11; i++) {
        near.fillStyle = s.tent;
        near.fillRect(tx - i, fireY - 11 + i, i + 1, 1);
        near.fillStyle = s.tentShade;
        near.fillRect(tx + 1, fireY - 11 + i, i, 1);
      }
      near.fillStyle = s.near;
      near.fillRect(tx, fireY - 4, 2, 4); // tent door
      near.fillStyle = s.logs;
      near.fillRect(fireX - 3, fireY - 1, 7, 1);
      near.fillRect(fireX + 11, fireY - 2, 5, 2); // a log to sit on
    };

    const burst = (x: number, y: number, count: number, rgb: string, power: number, up = false) => {
      for (let i = 0; i < count; i++) {
        const a = up ? Math.PI + (i / (count - 1)) * Math.PI : (i / count) * Math.PI * 2;
        const v = power * (0.4 + Math.random() * 0.8);
        sparks.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - (up ? 0 : 12), born: now, life: 0.6 + Math.random() * 0.6, rgb });
      }
    };

    const draw = (time: number, dt: number) => {
      const t = (now = time / 1000);
      const s = SCENES[theme];

      const max = document.documentElement.scrollHeight - innerHeight;
      const target = reduce || max < 40 ? 0 : clamp01(scrollY / max);
      cam += (target - cam) * (reduce ? 1 : 0.14);
      const e = smooth(cam);

      // Where each layer sits this frame. Nearer layers travel further.
      const farOff = Math.round((1 - e) * H * 0.55);
      const midOff = Math.round((1 - e) * H * 0.8);
      const nearOff = Math.round((1 - e) * H * 1.05);
      const landed = e > 0.93;
      const groundAt = (x: number) => nearTop[Math.max(0, Math.min(W - 1, Math.round(x)))] + nearOff;

      ctx.clearRect(0, 0, W, H);

      // ── Stars: slide up as the camera drops, and fade towards the horizon ──
      const fadeLine = H * 0.3 + farOff;
      const drawStar = (x: number, y: number, rgb: string, a: number, big: boolean) => {
        const f = clamp01(1 - (y - fadeLine) / (H * 0.3));
        if (a * f < 0.04) return;
        ctx.fillStyle = `rgba(${rgb},${a * f})`;
        ctx.fillRect(x, y, 1, 1);
        if (big) {
          ctx.fillStyle = `rgba(${rgb},${a * f * 0.55})`;
          ctx.fillRect(x - 1, y, 3, 1);
          ctx.fillRect(x, y - 1, 1, 3);
        }
      };
      for (const st of stars) {
        const baseY = (((st.y - e * H * 0.6 * st.depth) % H) + H) % H;
        const dx = st.x - mx;
        const dy = baseY - my;
        const dist = Math.hypot(dx, dy);
        const pull = reduce ? 0 : Math.max(0, 1 - dist / REACH);
        st.ox += ((pull ? (dx / (dist || 1)) * pull * 5 : 0) - st.ox) * 0.1;
        st.oy += ((pull ? (dy / (dist || 1)) * pull * 5 : 0) - st.oy) * 0.1;
        st.glow += (pull - st.glow) * 0.12;
        const twinkle = reduce ? 0.55 : 0.4 + 0.3 * Math.sin(t * st.speed + st.phase);
        drawStar(Math.round(st.x + st.ox), Math.round(baseY + st.oy), s.star, Math.min(1, twinkle * (theme === "light" ? 0.5 : 0.8) + st.glow * 0.7), st.big || st.glow > 0.4);
      }
      // One brighter star for every comet caught.
      for (let i = 0; i < Math.min(caught, MAX_CAUGHT_STARS); i++) {
        const age = t - (caughtBorn.get(i) ?? -99);
        const y = (((4 + hash(i * 7 + 2) * H * 0.55 - e * H * 0.25) % H) + H) % H;
        const twinkle = 0.6 + 0.35 * Math.sin(t * (0.8 + hash(i) * 1.6) + i);
        drawStar(Math.round(4 + hash(i * 3 + 1) * (W - 8)), Math.round(y), s.caught, Math.min(1, twinkle + (age < 1 ? 1 - age : 0)), true);
      }
      if (reduce) return;

      // ── Clouds: a band you fall through around the middle of the page ──
      for (let i = 0; i < 11; i++) {
        const w = 26 + Math.floor(hash(i + 3) * 44);
        const worldY = H * (1.05 + hash(i * 5 + 1) * 1.5);
        const y = Math.round(worldY - e * H * 2.9);
        if (y < -8 || y > H + 4) continue;
        const x = Math.round(((hash(i * 9 + 4) * (W + 80) + t * (1.5 + hash(i) * 2.5)) % (W + 80)) - 40);
        ctx.fillStyle = s.cloudEdge;
        ctx.fillRect(x + 6, y - 2, Math.max(4, w - 20), 1);
        ctx.fillRect(x + 3, y - 1, w - 9, 1);
        ctx.fillStyle = s.cloud;
        ctx.fillRect(x, y, w, 3);
        ctx.fillRect(x + 4, y + 3, w - 9, 1);
      }

      // ── Horizon glow, moon or sun, and the three ridges ──
      ctx.globalAlpha = clamp01((e - 0.28) / 0.45);
      ctx.drawImage(layers.glow, 0, farOff);
      ctx.globalAlpha = 1;

      const ox = Math.round(W * 0.8);
      const oy = Math.round(H * 0.38 + (1 - e) * H * 0.75);
      if (oy < H + 10)
        for (let y = -8; y <= 8; y++)
          for (let x = -8; x <= 8; x++) {
            const d = x * x + y * y;
            if (d > 60) continue;
            ctx.fillStyle = d > 42 || (theme === "dark" && x > 1 && y > 0 && d > 12) ? s.orbShade : s.orb;
            ctx.fillRect(ox + x, oy + y, 1, 1);
          }

      ctx.drawImage(layers.far, 0, farOff);
      ctx.drawImage(layers.mid, 0, midOff);
      ctx.drawImage(layers.near, 0, nearOff);

      // ── Campfire: lights once you have landed, flares when you catch a comet ──
      const fy = fireY + nearOff;
      const flare = Math.max(0, 1 - (t - flareAt) / 1.6);
      if (landed) {
        if (t - lastPuff > 0.45) {
          smoke.push({ x: fireX + 0.5, y: fireY - 6, born: t });
          lastPuff = t;
        }
        const flick = (k: number) => 0.5 + 0.5 * Math.sin(t * (9 + k * 3.7) + k * 2);
        const reach = flare > 0 ? 3 : 2;
        ctx.fillStyle = `rgba(255,150,70,${0.16 + 0.08 * flick(5) + flare * 0.25})`;
        ctx.fillRect(fireX - 10 - reach * 3, fy, 21 + reach * 6, 1);
        ctx.fillRect(fireX - 6 - reach, fy + 1, 13 + reach * 2, 1);
        for (let k = -reach; k <= reach; k++) {
          const h = 2 + Math.round(flick(k + 2) * (4 - Math.abs(k)) + flare * (7 - Math.abs(k) * 1.5));
          ctx.fillStyle = "#e2521d";
          ctx.fillRect(fireX + k, fy - 1 - h, 1, h);
          ctx.fillStyle = "#ffb347";
          ctx.fillRect(fireX + k, fy - 1 - Math.max(1, h - 2), 1, Math.max(1, h - 2));
        }
        ctx.fillStyle = "#fff1b8";
        ctx.fillRect(fireX, fy - 3, 1, 2 + Math.round(flare * 2));
      }
      smoke = smoke.filter((p) => t - p.born < 6);
      for (const p of smoke) {
        const age = t - p.born;
        ctx.fillStyle = `rgba(${s.smoke},${0.4 * (1 - age / 6)})`;
        const size = age > 2.5 ? 2 : 1;
        ctx.fillRect(Math.round(p.x + Math.sin(age * 1.3 + p.born) * 2 + age * 1.4), Math.round(p.y + nearOff - age * 5.5), size, size);
      }

      // Fireflies by night, birds by day, once you are near the ground.
      if (e > 0.75) {
        const fade = clamp01((e - 0.75) / 0.2);
        if (theme === "dark") {
          for (let i = 0; i < 22; i++) {
            const blink = 0.5 + 0.5 * Math.sin(t * (1.2 + hash(i + 77)) + hash(i + 13) * 6.28);
            if (blink < 0.35) continue;
            const x = (hash(i + 31) * W + Math.sin(t * (0.3 + hash(i) * 0.5) + i) * 10 + W) % W;
            const y = H * 0.9 - hash(i + 5) * H * 0.22 + Math.cos(t * 0.5 + i) * 3 + nearOff;
            ctx.fillStyle = `rgba(222,255,150,${blink * fade})`;
            ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
          }
        } else {
          ctx.fillStyle = `rgba(63,98,132,${fade})`;
          for (let i = 0; i < 4; i++) {
            const x = Math.round(((t * (6 + i * 2) + i * 137) % (W + 20)) - 10);
            const y = Math.round(H * (0.34 + i * 0.045) + Math.sin(t * 2 + i) + farOff);
            const flap = Math.sin(t * 6 + i) > 0 ? -1 : 1;
            ctx.fillRect(x, y, 1, 1);
            ctx.fillRect(x - 1, y + flap, 1, 1);
            ctx.fillRect(x + 1, y + flap, 1, 1);
            ctx.fillRect(x - 2, y + flap * 2, 1, 1);
            ctx.fillRect(x + 2, y + flap * 2, 1, 1);
          }
        }
      }

      // ── Scars left where comets landed ──
      marks = marks.filter((m) => t - m.born < 2.6);
      for (const m of marks) {
        const k = (t - m.born) / 2.6;
        const y = groundAt(m.x);
        ctx.fillStyle = `rgba(255,150,70,${0.75 * (1 - k)})`;
        ctx.fillRect(Math.round(m.x) - 3, y, 7, 1);
        ctx.fillRect(Math.round(m.x) - 1, y + 1, 3, 1);
        if (k < 0.12) {
          // The flash on impact.
          ctx.fillStyle = `rgba(255,240,210,${1 - k / 0.12})`;
          ctx.fillRect(Math.round(m.x) - 5, y - 2, 11, 2);
          ctx.fillRect(Math.round(m.x) - 2, y - 5, 5, 3);
        }
      }

      // ── Comets: cold in the high sky, hot near the ground ──
      const heat = clamp01((e - 0.15) / 0.6);
      const rgb = s.cold.map((c, i) => Math.round(c + (s.hot[i] - c) * heat)).join(",");
      if (t > nextComet) {
        const room = W / 2 - COLUMN_HALF;
        const x = room > 24 ? (Math.random() < 0.5 ? 0 : W / 2 + COLUMN_HALF) + 8 + Math.random() * (room - 16) : 8 + Math.random() * (W - 16);
        comets.push({ x, y: -8, vx: (Math.random() - 0.5) * 26, vy: 34 + Math.random() * 26 });
        nextComet = t + 2.2 + Math.random() * 2.8;
      }
      comets = comets.filter((c) => {
        c.x += c.vx * dt;
        c.y += c.vy * dt;
        if (c.y >= groundAt(c.x) - 1) {
          // Landed: explode against the ground.
          burst(c.x, c.y - 1, 18, s.hot.join(","), 34, true);
          marks.push({ x: c.x, y: c.y, born: t });
          return false;
        }
        return c.y < H + 12;
      });
      for (const c of comets) {
        const speed = Math.hypot(c.vx, c.vy);
        const tail = 9 + Math.round(heat * 7); // hotter comets drag a longer tail
        for (let i = tail; i >= 1; i--) {
          ctx.fillStyle = `rgba(${rgb},${0.85 * (1 - i / (tail + 1))})`;
          const size = i < 3 ? 2 : 1;
          ctx.fillRect(Math.round(c.x - (c.vx / speed) * i * 2), Math.round(c.y - (c.vy / speed) * i * 2), size, size);
        }
        const hx = Math.round(c.x);
        const hy = Math.round(c.y);
        ctx.fillStyle = `rgba(${rgb},1)`;
        ctx.fillRect(hx - 1, hy - 1, 3, 3);
        ctx.fillRect(hx - 2, hy, 5, 1);
        ctx.fillRect(hx, hy - 2, 1, 5);
        ctx.fillStyle = "rgba(255,252,240,1)";
        ctx.fillRect(hx, hy, 1, 1);
      }

      sparks = sparks.filter((p) => t - p.born < p.life);
      for (const p of sparks) {
        const age = t - p.born;
        ctx.fillStyle = `rgba(${p.rgb},${1 - age / p.life})`;
        ctx.fillRect(Math.round(p.x + p.vx * age), Math.round(p.y + p.vy * age + 30 * age * age), 1, 1);
      }

      // "+1", drawn as pixels so it matches the scene.
      pops = pops.filter((p) => t - p.born < 0.9);
      for (const p of pops) {
        const k = (t - p.born) / 0.9;
        const x = Math.round(p.x + 4);
        const y = Math.round(p.y - 6 - k * 9);
        ctx.fillStyle = `rgba(${s.caught},${1 - k})`;
        ctx.fillRect(x, y + 2, 3, 1);
        ctx.fillRect(x + 1, y + 1, 1, 3);
        ctx.fillRect(x + 5, y, 1, 5);
        ctx.fillRect(x + 4, y + 1, 1, 1);
      }
    };

    let raf = 0;
    let last = 0;
    const loop = (time: number) => {
      raf = requestAnimationFrame(loop);
      const dt = (time - last) / 1000;
      if (dt < 0.033) return;
      last = time;
      draw(time, Math.min(dt, 0.1));
    };
    const stop = () => cancelAnimationFrame(raf);
    const start = () => {
      stop();
      if (reduce) draw(0, 0);
      else if (!document.hidden) {
        last = performance.now();
        raf = requestAnimationFrame(loop);
      }
    };
    const rebuild = () => {
      build();
      start();
    };
    rebuild();

    const near = (x: number, y: number) => comets.find((c) => Math.hypot(c.x - x, c.y - y) < CATCH_RADIUS);
    const onMove = (ev: PointerEvent) => {
      mx = ev.clientX / S;
      my = ev.clientY / S;
      document.body.style.cursor = near(mx, my) ? "crosshair" : "";
    };
    const onLeave = () => (mx = my = -9999);
    const onDown = (ev: PointerEvent) => {
      // Never steal a click meant for a link, button or field.
      if ((ev.target as Element | null)?.closest?.("a,button,input,textarea,[role=dialog]")) return;
      const c = near(ev.clientX / S, ev.clientY / S);
      if (!c) return;
      comets = comets.filter((x) => x !== c);
      burst(c.x, c.y, 16, SCENES[theme].caught, 30);
      pops.push({ x: c.x, y: c.y, born: now });
      if (caught < MAX_CAUGHT_STARS) caughtBorn.set(caught, now);
      caught += 1;
      flareAt = now;
      setScore(caught);
      try {
        localStorage.setItem(SCORE_KEY, String(caught));
      } catch {}
      document.body.style.cursor = "";
    };
    const mo = new MutationObserver(rebuild);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    addEventListener("resize", rebuild);
    document.addEventListener("visibilitychange", start);
    if (!reduce) {
      addEventListener("pointermove", onMove, { passive: true });
      addEventListener("pointerdown", onDown);
      document.documentElement.addEventListener("pointerleave", onLeave);
    }

    return () => {
      stop();
      mo.disconnect();
      document.body.style.cursor = "";
      removeEventListener("resize", rebuild);
      document.removeEventListener("visibilitychange", start);
      removeEventListener("pointermove", onMove);
      removeEventListener("pointerdown", onDown);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <>
      <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 -z-10 size-full [image-rendering:pixelated]" />
      {score !== null && (
        <p
          aria-live="polite"
          className="pointer-events-none fixed bottom-4 right-4 z-30 hidden items-center gap-2 rounded-full border border-line bg-card/80 px-3 py-1.5 font-mono text-[11px] text-muted backdrop-blur sm:flex"
        >
          <span aria-hidden className="text-accent">
            ✦
          </span>
          {score === 0 ? "click a comet before it lands" : `${score} ${score === 1 ? "comet" : "comets"} caught`}
        </p>
      )}
    </>
  );
}
