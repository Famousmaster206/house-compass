"use client";

import { useEffect, useRef } from "react";
import { usePointerFine } from "@/lib/hooks/usePointerFine";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";

const LERP_FACTOR = 0.12;

/**
 * A soft radial glow that trails the cursor with smooth lerp interpolation.
 * Desktop-only (fine pointer) and disabled under reduced-motion.
 *
 * Perf notes: position is tracked entirely in refs + direct style mutation
 * inside a rAF loop. No React state updates on mousemove, so this never
 * triggers a re-render. Mount this once, high in the tree (e.g. behind a
 * hero section or as a page-level accent), not once per card.
 */
export function CursorGlow({ className }: { className?: string }) {
  const pointerFine = usePointerFine();
  const reducedMotion = usePrefersReducedMotion();
  const elRef = useRef<HTMLDivElement>(null);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const raf = useRef<number | null>(null);
  const active = pointerFine && !reducedMotion;

  useEffect(() => {
    if (!active) return;

    function handleMove(e: PointerEvent) {
      target.current.x = e.clientX;
      target.current.y = e.clientY;
    }

    function tick() {
      current.current.x += (target.current.x - current.current.x) * LERP_FACTOR;
      current.current.y += (target.current.y - current.current.y) * LERP_FACTOR;
      const el = elRef.current;
      if (el) {
        el.style.transform = `translate3d(${current.current.x}px, ${current.current.y}px, 0) translate(-50%, -50%)`;
      }
      raf.current = requestAnimationFrame(tick);
    }

    window.addEventListener("pointermove", handleMove, { passive: true });
    raf.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", handleMove);
      if (raf.current !== null) cancelAnimationFrame(raf.current);
    };
  }, [active]);

  if (!active) return null;

  return (
    <div
      ref={elRef}
      aria-hidden="true"
      className={className}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: 420,
        height: 420,
        borderRadius: "9999px",
        pointerEvents: "none",
        zIndex: 0,
        background:
          "radial-gradient(circle, color-mix(in srgb, var(--color-primary) 16%, transparent) 0%, transparent 70%)",
        filter: "blur(24px)",
        willChange: "transform",
      }}
    />
  );
}
