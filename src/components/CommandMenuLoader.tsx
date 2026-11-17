"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { OPEN_COMMAND_MENU } from "./commandEvents";

// The command menu (and its cmdk library) isn't part of the first download.
// This small listener waits for Ctrl/⌘ K or a search-button click, then loads
// the menu and opens it. After that, the menu handles its own shortcuts.
const CommandMenu = dynamic(() => import("./CommandMenu"), { ssr: false });

type Props = React.ComponentProps<typeof CommandMenu>;

export default function CommandMenuLoader(props: Omit<Props, "startOpen">) {
  const [requested, setRequested] = useState(false);

  useEffect(() => {
    if (requested) return;
    const load = () => setRequested(true);
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        load();
      }
    };
    // Start fetching the code as soon as someone heads for the search button.
    const warm = (e: Event) => {
      if ((e.target as Element | null)?.closest?.('[aria-keyshortcuts="Control+K Meta+K"]')) void import("./CommandMenu");
    };
    addEventListener("keydown", onKey);
    addEventListener(OPEN_COMMAND_MENU, load);
    addEventListener("pointerover", warm, { passive: true });
    addEventListener("focusin", warm);
    return () => {
      removeEventListener("keydown", onKey);
      removeEventListener(OPEN_COMMAND_MENU, load);
      removeEventListener("pointerover", warm);
      removeEventListener("focusin", warm);
    };
  }, [requested]);

  return requested ? <CommandMenu {...props} startOpen /> : null;
}
