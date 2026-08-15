"use client";

import { useId, type ChangeEvent } from "react";

export interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  formatValue?: (value: number) => string;
  hint?: string;
}

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  formatValue,
  hint,
}: SliderProps) {
  const id = useId();

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    onChange(Number(e.target.value));
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-semibold text-text">
          {label}
        </label>
        <span className="text-sm font-bold text-primary tabular-nums">
          {formatValue ? formatValue(value) : value}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        className="w-full accent-[var(--color-primary)] cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        aria-describedby={hint ? `${id}-hint` : undefined}
      />
      {hint && (
        <span id={`${id}-hint`} className="text-xs text-muted">
          {hint}
        </span>
      )}
    </div>
  );
}
