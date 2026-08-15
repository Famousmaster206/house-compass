"use client";

import type { ReactNode } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";

export interface ParallaxProps {
  children: ReactNode;
  /** Max vertical displacement in pixels as the element scrolls through the viewport. Kept small on purpose. */
  offset?: number;
  className?: string;
}

/**
 * Subtle scroll-based parallax: translates children a small distance (capped
 * at `offset`, default well under 20px) as the wrapped element moves through
 * the viewport. Uses `useScroll`'s scroll-linked transform (GPU transform
 * only), not layout properties. No-op under reduced-motion — renders a plain
 * static div.
 */
export function Parallax({ children, offset = 16, className }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [-offset, offset]);

  if (reducedMotion) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div ref={ref} className={className} style={{ y }}>
      {children}
    </motion.div>
  );
}
