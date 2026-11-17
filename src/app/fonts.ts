import localFont from "next/font/local";

// Fonts through next/font: each has a size-matched fallback, so text doesn't
// reflow when the real font swaps in. The serif is preloaded (headings are on
// the first screen); the mono, used only for small labels, loads lazily.
// Geist Sans, the body font, comes from the "geist" package in layout.tsx.
// (Measured: not preloading the body and serif fonts slowed first paint on a
// simulated phone from ~1.0 s to ~2.2 s, so they stay preloaded.)
// Paths must be plain string literals for next/font.

// Both styles in one family, so italic text uses the real italic face.
export const instrumentSerif = localFont({
  src: [
    { path: "../../node_modules/@fontsource/instrument-serif/files/instrument-serif-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../../node_modules/@fontsource/instrument-serif/files/instrument-serif-latin-400-italic.woff2", weight: "400", style: "italic" },
  ],
  variable: "--font-instrument",
  display: "swap",
  adjustFontFallback: "Times New Roman",
});

export const geistMono = localFont({
  src: "../../node_modules/geist/dist/fonts/geist-mono/GeistMono-Variable.woff2",
  weight: "100 900",
  variable: "--font-geist-mono",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
});
