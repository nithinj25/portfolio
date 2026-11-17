// Time-of-day for the pixel scenes (the banner and the full-screen backdrop).
//
// The light/dark toggle still decides the page colours. Within that theme,
// the visitor's own clock picks the sky:
//
//   dark theme    night, or a sunset at dusk, or first light at dawn
//   light theme   day, or a pink sunrise at dawn, or golden hour at dusk
//
// To preview one without waiting for the hour, add ?sky=dawn (or day, dusk,
// night) to any page URL.
export type SkyPhase = "dawn" | "day" | "dusk" | "night";

const PHASES: SkyPhase[] = ["dawn", "day", "dusk", "night"];

export function skyPhase(now = new Date()): SkyPhase {
  if (typeof location !== "undefined") {
    const forced = new URLSearchParams(location.search).get("sky");
    if (forced && PHASES.includes(forced as SkyPhase)) return forced as SkyPhase;
  }
  const h = now.getHours() + now.getMinutes() / 60;
  if (h >= 5 && h < 8) return "dawn";
  if (h >= 8 && h < 17) return "day";
  if (h >= 17 && h < 19.5) return "dusk";
  return "night";
}

/** Calls `onChange` when the phase moves on (checked every minute). Returns a cleanup function. */
export function watchSkyPhase(onChange: () => void) {
  let current = skyPhase();
  const id = setInterval(() => {
    const next = skyPhase();
    if (next !== current) {
      current = next;
      onChange();
    }
  }, 60_000);
  return () => clearInterval(id);
}
