"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";

/**
 * Light fade/slide-in on route content mount, keyed on pathname. Wraps only
 * the routed page content inside `<main>` — Navbar and Footer stay outside
 * so they never remount on navigation. Kept fast (180ms) and subtle, not a
 * full-screen loader.
 *
 * Under reduced-motion, renders children directly with no wrapper animation
 * (still keyed on pathname so any page-local mount effects still fire).
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reducedMotion = usePrefersReducedMotion();

  if (reducedMotion) {
    return (
      <div key={pathname} className="flex flex-1 flex-col">
        {children}
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-1 flex-col"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
