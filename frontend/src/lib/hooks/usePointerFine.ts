"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(pointer: fine)";

function subscribe(callback: () => void): () => void {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getSnapshot(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia(QUERY).matches;
}

function getServerSnapshot(): boolean {
  return false;
}

/**
 * True when the primary input is a fine pointer (mouse/trackpad), false for
 * touch-only devices. Uses a media query rather than viewport width so wide
 * touch tablets are correctly excluded from cursor-tracking effects.
 *
 * Built on `useSyncExternalStore` so it reads the real value on the client's
 * first render (no extra effect-driven re-render) while staying SSR-safe
 * (`false` on the server, matching the client's pre-hydration snapshot when
 * `matchMedia` isn't available yet).
 */
export function usePointerFine(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
