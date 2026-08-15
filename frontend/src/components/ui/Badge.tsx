import type { HTMLAttributes } from "react";
import clsx from "clsx";
import type { AffordabilityRatingId } from "@/lib/config/affordability";
import { CheckCircle2, CircleDot, TriangleAlert, CircleAlert } from "lucide-react";

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
  return (
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
