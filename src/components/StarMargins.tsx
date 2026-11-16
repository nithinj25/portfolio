"use client";

import { useEffect, useRef, useState } from "react";

// The space left and right of the content column, at 1280px and wider:
//  · sparse pixel stars that brighten and drift away from the cursor
//  · a small game: comets fall through the margins, click one to catch it.
//    The count is kept in this browser.
// Under prefers-reduced-motion the stars are static and the game is off.
const COLUMN_HALF = 460; // keep everything out of the 800px column plus a gutter
const REACH = 150; // cursor influence radius, px
const CATCH_RADIUS = 38;
const SCORE_KEY = "comets-caught";

type Star = { x: number; y: number; size: number; depth: number; phase: number; speed: number; ox: number; oy: number; glow: number };
type Comet = { x: number; y: number; vx: number; vy: number };
type Spark = { x: number; y: number; vx: number; vy: number; born: number };
type Pop = { x: number; y: number; born: number };

export default function StarMargins() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const wide = matchMedia("(min-width: 1280px)");
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let stars: Star[] = [];
    let comets: Comet[] = [];
    let sparks: Spark[] = [];
    let pops: Pop[] = [];
    let w = 0;
    let h = 0;
    let margin = 0;
    let mx = -9999;
    let my = -9999;
    let raf = 0;
    let last = 0;
    let nextComet = 2.5;
    let caught = 0;

    if (!reduce) {
      try {
        caught = Number(localStorage.getItem(SCORE_KEY)) || 0;
      } catch {}
      setScore(caught);
    }

    const build = () => {
      w = canvas.width = innerWidth;
      h = canvas.height = innerHeight;
      margin = Math.max(0, w / 2 - COLUMN_HALF);
      const count = Math.round((margin * 2 * h) / 11000);
      stars = Array.from({ length: count }, () => {
        const inLeft = Math.random() < 0.5;
        return {
          x: Math.floor((inLeft ? 0 : w / 2 + COLUMN_HALF) + Math.random() * margin),
          y: Math.random() * h,
          size: Math.random() > 0.8 ? 3 : 2,
          depth: 0.04 + Math.random() * 0.12,
          phase: Math.random() * Math.PI * 2,
          speed: 0.4 + Math.random() * 1.2,
          ox: 0,
          oy: 0,
          glow: 0,
        };
      });
    };

    const spawnComet = () => {
      if (margin < 60) return;
      const inLeft = Math.random() < 0.5;
      const lane = 30 + Math.random() * (margin - 60);
      comets.push({
        x: inLeft ? lane : w / 2 + COLUMN_HALF + lane,
        y: -30,
        vx: (Math.random() - 0.5) * 90,
        vy: 95 + Math.random() * 70,
      });
    };

    const draw = (time: number, dt: number) => {
      const t = time / 1000;
      const light = document.documentElement.dataset.theme === "light";
      const rgb = light ? "60,70,90" : "255,248,230";
      const hot = light ? "217,72,26" : "255,190,110";
      ctx.clearRect(0, 0, w, h);

      for (const s of stars) {
        // Slow vertical parallax, wrapping at the edges.
        const baseY = (((s.y - scrollY * s.depth) % h) + h) % h;
        const dx = s.x - mx;
        const dy = baseY - my;
        const dist = Math.hypot(dx, dy);
        const pull = reduce ? 0 : Math.max(0, 1 - dist / REACH);
        s.ox += ((pull ? (dx / (dist || 1)) * pull * 16 : 0) - s.ox) * 0.1;
        s.oy += ((pull ? (dy / (dist || 1)) * pull * 16 : 0) - s.oy) * 0.1;
        s.glow += (pull - s.glow) * 0.12;

        const twinkle = reduce ? 0.6 : 0.45 + 0.3 * Math.sin(t * s.speed + s.phase);
        const alpha = Math.min(1, twinkle * (light ? 0.55 : 0.75) + s.glow * 0.7);
        const x = Math.round(s.x + s.ox);
        const y = Math.round(baseY + s.oy);
        ctx.fillStyle = `rgba(${rgb},${alpha})`;
        ctx.fillRect(x, y, s.size, s.size);
        if (s.glow > 0.35 || s.size === 3) {
          ctx.fillStyle = `rgba(${rgb},${alpha * 0.5})`;
          ctx.fillRect(x - s.size, y, s.size * 3, s.size);
          ctx.fillRect(x, y - s.size, s.size, s.size * 3);
        }
      }
      if (reduce) return;

      // ── Comets ──
      if (t > nextComet) {
        spawnComet();
        nextComet = t + 2.5 + Math.random() * 3;
      }
      comets = comets.filter((c) => c.y < h + 60);
      for (const c of comets) {
        c.x += c.vx * dt;
        c.y += c.vy * dt;
        const speed = Math.hypot(c.vx, c.vy);
        for (let i = 12; i >= 1; i--) {
          // Trail: shrinking squares back along the path, snapped to a 2px grid.
          const size = i < 3 ? 6 : i < 7 ? 4 : 2;
          ctx.fillStyle = `rgba(${hot},${0.9 * (1 - i / 13)})`;
          ctx.fillRect(
            Math.round((c.x - (c.vx / speed) * i * 6) / 2) * 2,
            Math.round((c.y - (c.vy / speed) * i * 6) / 2) * 2,
            size,
            size,
          );
        }
        const hx = Math.round(c.x / 2) * 2;
        const hy = Math.round(c.y / 2) * 2;
        ctx.fillStyle = `rgba(${hot},1)`;
        ctx.fillRect(hx - 4, hy - 4, 10, 10);
        ctx.fillRect(hx - 8, hy, 18, 2); // sparkle arms
        ctx.fillRect(hx, hy - 8, 2, 18);
        ctx.fillStyle = light ? "rgba(255,240,220,1)" : "rgba(255,250,235,1)";
        ctx.fillRect(hx - 2, hy - 2, 6, 6);
      }

      // ── Catch effects ──
      sparks = sparks.filter((s) => t - s.born < 0.8);
      for (const s of sparks) {
        s.vy += 260 * dt;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        ctx.fillStyle = `rgba(${hot},${1 - (t - s.born) / 0.8})`;
        ctx.fillRect(Math.round(s.x / 2) * 2, Math.round(s.y / 2) * 2, 4, 4);
      }
      pops = pops.filter((p) => t - p.born < 0.9);
      ctx.font = "12px var(--font-geist-mono), monospace";
      for (const p of pops) {
        const k = (t - p.born) / 0.9;
        ctx.fillStyle = `rgba(${hot},${1 - k})`;
        ctx.fillText("+1", p.x + 10, p.y - 10 - k * 26);
      }
    };

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
      if (!wide.matches) return;
      if (reduce) draw(0, 0);
      else if (!document.hidden) {
        last = performance.now();
        raf = requestAnimationFrame(loop);
      }
    };
    const rebuild = () => {
      if (wide.matches) build();
      start();
    };

    rebuild();

    const near = (x: number, y: number) => comets.find((c) => Math.hypot(c.x - x, c.y - y) < CATCH_RADIUS);

    const onMove = (e: PointerEvent) => {
      mx = e.clientX;
      my = e.clientY;
      document.body.style.cursor = near(mx, my) ? "crosshair" : "";
    };
    const onLeave = () => (mx = my = -9999);
    const onDown = (e: PointerEvent) => {
      // Never steal a click meant for a link, button or field.
      if ((e.target as Element | null)?.closest?.("a,button,input,textarea,[role=dialog]")) return;
      const c = near(e.clientX, e.clientY);
      if (!c) return;
      comets = comets.filter((x) => x !== c);
      const born = performance.now() / 1000;
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2;
        const v = 70 + Math.random() * 130;
        sparks.push({ x: c.x, y: c.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 60, born });
      }
      pops.push({ x: c.x, y: c.y, born });
      caught += 1;
      setScore(caught);
      try {
        localStorage.setItem(SCORE_KEY, String(caught));
      } catch {}
      document.body.style.cursor = "";
    };
    const onScroll = () => reduce && wide.matches && draw(0, 0);
    const mo = new MutationObserver(() => reduce && wide.matches && draw(0, 0));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    addEventListener("resize", rebuild);
    addEventListener("scroll", onScroll, { passive: true });
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
      removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", start);
      removeEventListener("pointermove", onMove);
      removeEventListener("pointerdown", onDown);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <>
      <canvas
        ref={ref}
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 hidden size-full opacity-70 [image-rendering:pixelated] xl:block"
      />
      {score !== null && (
        <p
          aria-live="polite"
          className="pointer-events-none fixed bottom-4 right-4 z-30 hidden items-center gap-2 rounded-full border border-line bg-card/80 px-3 py-1.5 font-mono text-[11px] text-muted backdrop-blur xl:flex"
        >
          <span aria-hidden className="text-accent">
            ✦
          </span>
          {score === 0 ? "click a comet to catch it" : `${score} ${score === 1 ? "comet" : "comets"} caught`}
        </p>
      )}
    </>
  );
}
