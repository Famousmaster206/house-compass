import { forwardRef, type SelectHTMLAttributes } from "react";
import clsx from "clsx";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
  hint?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, hint, id, className, ...props }, ref) => {
    const selectId = id ?? `select-${label.replace(/\s+/g, "-").toLowerCase()}`;
    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={selectId} className="text-sm font-semibold text-text">
          {label}
        </label>
        <select
          ref={ref}
          id={selectId}
          className={clsx(
            "rounded-xl border border-sandstone bg-white px-4 py-2.5 text-text",
            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary",
            className
          )}
          aria-describedby={hint ? `${selectId}-hint` : undefined}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {hint && (
          <span id={`${selectId}-hint`} className="text-xs text-muted">
            {hint}
          </span>
        )}
      </div>
    );
  }
);
Select.displayName = "Select";
