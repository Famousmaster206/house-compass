"use client";

import { useEffect, useRef } from "react";
import { motion, useSpring, useTransform } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";
import { formatCurrency, formatPercent } from "@/lib/utils/format";

export interface AnimatedNumberProps {
  value: number;
  /** How to format the settled number. Defaults to "number" (locale-formatted integer). */
  format?: "currency" | "percent" | "number";
  fractionDigits?: number;
  className?: string;
}

/**
 * Animates a numeric display counting smoothly from its previous value to a
 * new one via a `motion` spring. Reuses the shared currency/percent
 * formatters from `src/lib/utils/format.ts` rather than reimplementing
 * formatting.
 *
 * The formatted string is a derived `MotionValue` rendered directly as
 * `motion.span` text. Motion subscribes to it and mutates the DOM node
 * itself on each spring tick, so this never drives a React re-render/setState
 * on every frame.
 *
 * Under `prefers-reduced-motion`, the spring is skipped entirely. The
 * formatted value is rendered immediately with no transition.
 */
export function AnimatedNumber({ value, format = "number", fractionDigits, className }: AnimatedNumberProps) {
  const reducedMotion = usePrefersReducedMotion();
  const spring = useSpring(value, { stiffness: 120, damping: 24, mass: 0.6 });
  const formatted = useTransform(spring, (v) => formatValue(v, format, fractionDigits));
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (reducedMotion || isFirstRender.current) {
      isFirstRender.current = false;
      spring.jump(value);
      return;
    }
    spring.set(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, reducedMotion]);

  if (reducedMotion) {
    return <span className={className}>{formatValue(value, format, fractionDigits)}</span>;
  }

  return <motion.span className={className}>{formatted}</motion.span>;
}

function formatValue(value: number, format: AnimatedNumberProps["format"], fractionDigits?: number): string {
  const rounded = Math.round(value);
  if (format === "currency") return formatCurrency(rounded);
  if (format === "percent") return formatPercent(value, fractionDigits ?? 0);
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: fractionDigits ?? 0,
  }).format(rounded);
}
