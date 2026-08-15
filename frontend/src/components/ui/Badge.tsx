"use client";

import type { HTMLAttributes } from "react";
import clsx from "clsx";
import { AnimatePresence, motion } from "motion/react";
import type { AffordabilityRatingId } from "@/lib/config/affordability";
import { CheckCircle2, CircleDot, TriangleAlert, CircleAlert } from "lucide-react";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";

export interface AffordabilityBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  rating: AffordabilityRatingId;
  label: string;
}

const ratingIcon: Record<AffordabilityRatingId, typeof CheckCircle2> = {
  comfortable: CheckCircle2,
  moderate: CircleDot,
  tight: TriangleAlert,
  difficult: CircleAlert,
};

const ratingBg: Record<AffordabilityRatingId, string> = {
  comfortable: "bg-comfortable/10 text-comfortable",
  moderate: "bg-moderate/10 text-moderate",
  tight: "bg-tight/10 text-tight",
  difficult: "bg-difficult/10 text-difficult",
};

export function AffordabilityBadge({ rating, label, className, ...props }: AffordabilityBadgeProps) {
  const Icon = ratingIcon[rating];
  const reducedMotion = usePrefersReducedMotion();

  const badge = (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold",
        ratingBg[rating],
        className
      )}
      {...props}
    >
      <Icon size={16} aria-hidden="true" />
      {label}
    </span>
  );

  if (reducedMotion) return badge;

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={rating}
        initial={{ opacity: 0, y: 6, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        style={{ display: "inline-flex" }}
      >
        {badge}
      </motion.span>
    </AnimatePresence>
  );
}

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full bg-sandstone-light px-3 py-1 text-xs font-semibold text-text",
        className
      )}
      {...props}
    />
  );
}
