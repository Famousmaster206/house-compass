"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

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
 * Tracks the user's `prefers-reduced-motion` OS/browser preference via
 * `useSyncExternalStore`. This reads the live media-query state on the
 * client (including the very first client render, avoiding a "flash of
 * animated content" before an effect would otherwise fire) while still
 * returning a stable `false` during SSR so hydration matches. All animated
 * effects in `src/components/effects` gate themselves on this hook and
 * no-op (or render an already-settled state) when it's `true`.
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
