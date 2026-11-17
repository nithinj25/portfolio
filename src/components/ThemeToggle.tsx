"use client";

import { MoonIcon, SunIcon } from "./icons";

/** Flip the theme. Given a point, the new theme wipes in as a circle from it. */
export function toggleTheme(x?: number, y?: number) {
  const root = document.documentElement;
  const next = root.dataset.theme === "dark" ? "light" : "dark";
  const apply = () => {
    root.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {}
  };
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

export default function ThemeToggle() {
  return (
    <button
      type="button"
      aria-label="Toggle light and dark theme"
      onClick={(e) => {
        const b = e.currentTarget.getBoundingClientRect();
        toggleTheme(b.left + b.width / 2, b.top + b.height / 2);
      }}
      className="grid size-11 place-items-center sm:size-8 rounded-full text-muted transition-colors hover:bg-line/60 hover:text-fg"
    >
      <SunIcon className="hidden dark:block" />
      <MoonIcon className="dark:hidden" />
    </button>
  );
}
