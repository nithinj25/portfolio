"use client";

import { useEffect, useState } from "react";
import { daylight } from "@/lib/daycycle";
import { MoonIcon, SunIcon } from "./icons";

// Theme modes:
//   auto   (default) follows the visitor's day (src/lib/daycycle.ts): light
//          06:00–18:59 in three shades, dark otherwise in two, and skies
//          that change minute by minute
//   dark   always dark
//   light  always light
// The mode is saved in localStorage under "theme"; "auto" removes the key.
// The same rule runs before first paint in src/app/layout.tsx, so there's no flash.
export type ThemeMode = "auto" | "dark" | "light";
const ORDER: ThemeMode[] = ["auto", "dark", "light"];
export const THEME_CHANGED = "theme-mode-changed";

/** Sets the page theme and, in auto mode, the shade step (data-daylight). */
export function applyMode(mode: ThemeMode) {
  const root = document.documentElement;
  if (mode === "auto") {
    const d = daylight();
    root.dataset.theme = d.theme;
    root.dataset.daylight = d.step;
  } else {
    root.dataset.theme = mode;
    delete root.dataset.daylight;
  }
}

export function getThemeMode(): ThemeMode {
  try {
    const t = localStorage.getItem("theme");
    if (t === "dark" || t === "light") return t;
  } catch {}
  return "auto";
}

/** Apply a mode. Given a point, the new theme wipes in as a circle from it. */
export function setThemeMode(mode: ThemeMode, x?: number, y?: number) {
  const root = document.documentElement;
  const next = mode === "auto" ? daylight().theme : mode;
  try {
    if (mode === "auto") localStorage.removeItem("theme");
    else localStorage.setItem("theme", mode);
  } catch {}
  const apply = () => {
    applyMode(mode);
    window.dispatchEvent(new Event(THEME_CHANGED));
  };
  if (root.dataset.theme === next) return apply();
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!document.startViewTransition || reduce || x == null || y == null) return apply();
  const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  document.startViewTransition(apply).ready.then(() =>
    root.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
      { duration: 480, easing: "cubic-bezier(0.4, 0, 0.2, 1)", pseudoElement: "::view-transition-new(root)" },
    ),
  );
}

/** Move to the next mode: auto → dark → light → auto. */
export function cycleThemeMode(x?: number, y?: number) {
  const mode = getThemeMode();
  setThemeMode(ORDER[(ORDER.indexOf(mode) + 1) % ORDER.length], x, y);
}

const LABEL: Record<ThemeMode, string> = {
  auto: "Theme: auto, follows the time of day",
  dark: "Theme: dark",
  light: "Theme: light",
};

export default function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>("auto");

  useEffect(() => {
    const sync = () => setMode(getThemeMode());
    sync();
    // In auto mode, keep the page shade in step with the day while it's open.
    const tick = setInterval(() => {
      if (getThemeMode() === "auto") applyMode("auto");
    }, 60_000);
    window.addEventListener(THEME_CHANGED, sync);
    return () => {
      clearInterval(tick);
      window.removeEventListener(THEME_CHANGED, sync);
    };
  }, []);

  const next = ORDER[(ORDER.indexOf(mode) + 1) % ORDER.length];
  return (
    <button
      type="button"
      aria-label={`${LABEL[mode]}. Switch to ${next}.`}
      title={LABEL[mode]}
      onClick={(e) => {
        const b = e.currentTarget.getBoundingClientRect();
        cycleThemeMode(b.left + b.width / 2, b.top + b.height / 2);
      }}
      className="relative grid size-11 place-items-center rounded-full text-muted transition-colors hover:bg-line/60 hover:text-fg sm:size-8"
    >
      {mode === "dark" ? <MoonIcon /> : <SunIcon />}
      {mode === "auto" && (
        <span aria-hidden className="absolute bottom-1 right-1 rounded-sm bg-card px-0.5 font-mono text-[9px] font-semibold leading-none text-accent sm:-bottom-0.5 sm:-right-0.5">
          A
        </span>
      )}
    </button>
  );
}
