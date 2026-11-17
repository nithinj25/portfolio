"use client";

import { useEffect, useRef } from "react";

/**
 * "Sharpen into focus": each block of the post (paragraph, heading, image,
 * code) starts faded and reaches full contrast once it scrolls up past the
 * lower third of the screen. Blocks you have read stay sharp.
 *
 * Without JavaScript, or with reduced motion, everything is simply sharp:
 * the fading styles only apply once this component adds `focus-on`.
 */
export default function ReadingFocus({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const blocks = [...root.querySelectorAll<HTMLElement>(".prose > *")];
    let frame = 0;
    const update = () => {
      const line = innerHeight * 0.72;
      for (const b of blocks) if (!b.classList.contains("seen") && b.getBoundingClientRect().top < line) b.classList.add("seen");
    };
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    update();
    root.classList.add("focus-on");
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    // Jumping to a section (contents link, #hash) counts everything above it as read.
    addEventListener("hashchange", onScroll);
    return () => {
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
      removeEventListener("hashchange", onScroll);
    };
  }, []);

  return <div ref={ref}>{children}</div>;
}
