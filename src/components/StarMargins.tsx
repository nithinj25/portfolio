"use client";

import { useEffect, useRef } from "react";

// Sparse pixel stars in the empty space left and right of the content column.
// Only runs at 1280px and wider. Stars near the cursor brighten and drift away
// from it, and the field slides slowly as the page scrolls.
const COLUMN_HALF = 400; // keep stars out of the 680px column plus a gutter
const REACH = 150; // cursor influence radius, px

type Star = { x: number; y: number; size: number; depth: number; phase: number; speed: number; ox: number; oy: number; glow: number };

export default function StarMargins() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const wide = matchMedia("(min-width: 1280px)");
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let stars: Star[] = [];
    let w = 0;
    let h = 0;
    let mx = -9999;
    let my = -9999;
    let raf = 0;
    let last = 0;

    const build = () => {
      w = canvas.width = innerWidth;
      h = canvas.height = innerHeight;
      const margin = Math.max(0, w / 2 - COLUMN_HALF);
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

    const draw = (time: number) => {
      const t = time / 1000;
      const light = document.documentElement.dataset.theme === "light";
      const rgb = light ? "60,70,90" : "255,248,230";
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        // Slow vertical parallax, wrapping at the edges.
        const baseY = (((s.y - scrollY * s.depth) % h) + h) % h;
        const dx = s.x - mx;
        const dy = baseY - my;
        const dist = Math.hypot(dx, dy);
        const pull = reduce ? 0 : Math.max(0, 1 - dist / REACH);
        const targetX = pull ? (dx / (dist || 1)) * pull * 16 : 0;
        const targetY = pull ? (dy / (dist || 1)) * pull * 16 : 0;
        s.ox += (targetX - s.ox) * 0.1;
        s.oy += (targetY - s.oy) * 0.1;
        s.glow += (pull - s.glow) * 0.12;

        const twinkle = reduce ? 0.6 : 0.45 + 0.3 * Math.sin(t * s.speed + s.phase);
        const alpha = Math.min(1, twinkle * (light ? 0.55 : 0.75) + s.glow * 0.7);
        const x = Math.round(s.x + s.ox);
        const y = Math.round(baseY + s.oy);
        ctx.fillStyle = `rgba(${rgb},${alpha})`;
        ctx.fillRect(x, y, s.size, s.size);
        if (s.glow > 0.35 || s.size === 3) {
          // Pixel cross for the larger and the lit-up stars.
          ctx.fillStyle = `rgba(${rgb},${alpha * 0.5})`;
          ctx.fillRect(x - s.size, y, s.size * 3, s.size);
          ctx.fillRect(x, y - s.size, s.size, s.size * 3);
        }
      }
    };

    const loop = (time: number) => {
      raf = requestAnimationFrame(loop);
      if (time - last < 33) return;
      last = time;
      draw(time);
    };
    const stop = () => cancelAnimationFrame(raf);
    const start = () => {
      stop();
      if (!wide.matches) return;
      if (reduce) draw(0);
      else if (!document.hidden) raf = requestAnimationFrame(loop);
    };
    const rebuild = () => {
      if (wide.matches) build();
      start();
    };

    rebuild();

    const onMove = (e: PointerEvent) => {
      mx = e.clientX;
      my = e.clientY;
    };
    const onLeave = () => (mx = my = -9999);
    const onScroll = () => reduce && wide.matches && draw(0);
    const mo = new MutationObserver(() => reduce && wide.matches && draw(0));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    addEventListener("resize", rebuild);
    addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", start);
    if (!reduce) {
      addEventListener("pointermove", onMove, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);
    }

    return () => {
      stop();
      mo.disconnect();
      removeEventListener("resize", rebuild);
      removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", start);
      removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 hidden size-full opacity-60 [image-rendering:pixelated] xl:block"
    />
  );
}
