"use client";

import { useRef, type HTMLAttributes, type ReactNode } from "react";
import clsx from "clsx";
import { usePointerFine } from "@/lib/hooks/usePointerFine";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";

export interface SpotlightCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

/**
 * Wraps card content with a cursor-following radial spotlight, a hover
 * lift/scale, and a brighter border. The shared hover treatment used for
 * city cards, home page cards, etc.
 *
 * On touch devices / reduced-motion, degrades to a plain CSS hover state
 * (lift + border only, no cursor tracking). The spotlight layer simply
 * isn't rendered and pointer tracking never attaches, so there's no wasted
 * work on devices that can't benefit from it.
 *
 * Perf: pointer position is written straight to CSS custom properties via
 * ref + direct style mutation (no React state), so hovering/moving over a
 * grid of these never triggers a re-render.
 */
export function SpotlightCard({ children, className, ...props }: SpotlightCardProps) {
  const pointerFine = usePointerFine();
  const reducedMotion = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const trackingEnabled = pointerFine && !reducedMotion;

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!trackingEnabled) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--spotlight-x", `${e.clientX - rect.left}px`);
    el.style.setProperty("--spotlight-y", `${e.clientY - rect.top}px`);
  }

  return (
    <div
      ref={ref}
      onPointerMove={handlePointerMove}
      className={clsx(
        "group/spotlight relative overflow-hidden transition-[transform,box-shadow,border-color] duration-300 ease-out",
        "hover:-translate-y-1 hover:scale-[1.01] hover:shadow-xl hover:shadow-black/[0.06] hover:border-primary/40",
        "focus-within:-translate-y-1 focus-within:shadow-xl focus-within:border-primary/40",
        className
      )}
      {...props}
    >
      {trackingEnabled && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/spotlight:opacity-100"
          style={{
            background:
              "radial-gradient(320px circle at var(--spotlight-x, 50%) var(--spotlight-y, 50%), color-mix(in srgb, var(--color-primary) 12%, transparent), transparent 70%)",
          }}
        />
      )}
      <div className="relative">{children}</div>
    </div>
  );
}
