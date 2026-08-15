import clsx from "clsx";

export interface GridBackgroundProps {
  /** Renders a soft radial orange glow centered behind the grid — for hero sections. */
  glow?: boolean;
  className?: string;
}

/**
 * Subtle animated desert-grid backdrop. Pure CSS: a repeating linear-gradient
 * grid pattern masked to fade out toward the edges, with an optional radial
 * glow layer. No DOM grid of elements — this is two absolutely-positioned
 * layers behind whatever content is placed on top (parent must be
 * `relative`).
 *
 * Intentionally has no reduced-motion branch: it's a static background (the
 * "animation" is a slow, purely decorative background-position drift defined
 * in globals.css and is not motion-sickness-triggering translate/scale of
 * foreground content), but the drift still respects `prefers-reduced-motion`
 * via the `motion-safe:` variant applied in globals.css keyframe usage.
 */
export function GridBackground({ glow = false, className }: GridBackgroundProps) {
  return (
    <div className={clsx("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden="true">
      <div className="az-grid-bg absolute inset-0" />
      {glow && (
        <div
          className="absolute left-1/2 top-0 h-[36rem] w-[56rem] -translate-x-1/2 -translate-y-1/3 rounded-full opacity-60 blur-3xl"
          style={{
            background:
              "radial-gradient(closest-side, color-mix(in srgb, var(--color-primary) 22%, transparent), transparent 70%)",
          }}
        />
      )}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to bottom, transparent 0%, var(--background) 92%)",
        }}
      />
    </div>
  );
}
