"use client";

import { useRef, type ReactElement } from "react";
import { motion, useSpring } from "motion/react";
import { usePointerFine } from "@/lib/hooks/usePointerFine";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";

const ACTIVATION_RADIUS = 70;
const MAX_OFFSET = 8;
const SPRING = { stiffness: 300, damping: 20, mass: 0.5 };

export interface MagneticButtonProps {
  children: ReactElement;
  className?: string;
}

/**
 * Wraps a button/CTA so it subtly translates toward the cursor when the
 * pointer is within `ACTIVATION_RADIUS`, spring-releasing back to rest on
 * pointer leave. No-op wrapper (plain span, no listeners) on touch devices
 * or under reduced-motion — the child renders exactly as passed.
 */
export function MagneticButton({ children, className }: MagneticButtonProps) {
  const pointerFine = usePointerFine();
  const reducedMotion = usePrefersReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const active = pointerFine && !reducedMotion;

  const x = useSpring(0, SPRING);
  const y = useSpring(0, SPRING);

  function handlePointerMove(e: React.PointerEvent<HTMLSpanElement>) {
    if (!active) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;
    const distance = Math.hypot(dx, dy);

    if (distance < ACTIVATION_RADIUS + rect.width / 2) {
      const pull = Math.min(1, 1 - distance / (ACTIVATION_RADIUS + rect.width));
      x.set((dx / distance || 0) * MAX_OFFSET * pull);
      y.set((dy / distance || 0) * MAX_OFFSET * pull);
    } else {
      x.set(0);
      y.set(0);
    }
  }

  function handlePointerLeave() {
    x.set(0);
    y.set(0);
  }

  if (!active) {
    return (
      <span ref={ref} className={className}>
        {children}
      </span>
    );
  }

  return (
    <motion.span
      ref={ref}
      className={className}
      style={{ display: "inline-block", x, y }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {children}
    </motion.span>
  );
}
