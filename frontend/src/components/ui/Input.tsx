import { forwardRef, type InputHTMLAttributes } from "react";
import clsx from "clsx";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, id, className, ...props }, ref) => {
    const inputId = id ?? `input-${label.replace(/\s+/g, "-").toLowerCase()}`;
    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={inputId} className="text-sm font-semibold text-text">
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            "rounded-xl border border-sandstone bg-white px-4 py-2.5 text-text",
            "transition-[border-color,box-shadow] duration-200",
            "focus-visible:outline-none focus-visible:border-primary focus-visible:shadow-[0_0_0_4px_color-mix(in_srgb,var(--color-primary)_18%,transparent)]",
            error && "border-difficult",
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
        {hint && !error && (
          <span id={`${inputId}-hint`} className="text-xs text-muted">
            {hint}
          </span>
        )}
        {error && (
          <span id={`${inputId}-error`} className="text-xs font-medium text-difficult">
            {error}
          </span>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";
