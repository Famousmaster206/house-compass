"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";

export interface ScrollRevealProps {
  children: ReactNode;
  /** Delay in seconds before the reveal starts (useful for manual staggering). */
  delay?: number;
  /** Pixels to translate up from on entry. Kept small/GPU-friendly. */
  distance?: number;
  className?: string;
}

/**
 * Fades + translates children up into view as they scroll into the viewport,
 * using `whileInView` (animates once, `amount: 0.2`, `margin` pre-triggers
 * slightly before entry). Under reduced-motion, children render already in
 * their final visible position with no animation.
 */
export function ScrollReveal({ children, delay = 0, distance = 20, className }: ScrollRevealProps) {
  const reducedMotion = usePrefersReducedMotion();

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2, margin: "0px 0px -80px 0px" }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

export interface ScrollRevealGroupProps {
  children: ReactNode;
  /** Delay between each direct child's reveal, in seconds. */
  staggerDelay?: number;
  distance?: number;
  className?: string;
}

/**
 * Stagger helper for lists/grids of cards: wraps each direct child in its
 * own `ScrollReveal` with an incrementing delay, capped so a large list
 * doesn't produce an absurdly long stagger tail.
 */
export function ScrollRevealGroup({
  children,
  staggerDelay = 0.08,
  distance = 20,
  className,
}: ScrollRevealGroupProps) {
  const reducedMotion = usePrefersReducedMotion();
  const items = Array.isArray(children) ? children : [children];
  const MAX_STAGGER_ITEMS = 12;

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={className}>
      {items.map((child, i) => (
        <ScrollReveal key={i} delay={Math.min(i, MAX_STAGGER_ITEMS) * staggerDelay} distance={distance}>
          {child}
        </ScrollReveal>
      ))}
    </div>
  );
}
