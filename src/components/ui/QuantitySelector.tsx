"use client";

import { forwardRef } from "react";

interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
  "aria-label"?: string;
}

export const QuantitySelector = forwardRef<HTMLDivElement, QuantitySelectorProps>(
  (
    { value, onChange, min = 1, max = 99, className = "", "aria-label": ariaLabel },
    ref
  ) => {
    const handleIncrement = () => {
      if (value < max) onChange(value + 1);
    };

    const handleDecrement = () => {
      if (value > min) onChange(value - 1);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseInt(e.target.value, 10);
      if (!isNaN(newValue) && newValue >= min && newValue <= max) {
        onChange(newValue);
      }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      const newValue = parseInt(e.target.value, 10);
      if (isNaN(newValue) || newValue < min) {
        onChange(min);
      } else if (newValue > max) {
        onChange(max);
      }
    };

    return (
      <div
        ref={ref}
        className={`inline-flex items-center border border-zinc-300 dark:border-zinc-700 rounded-lg overflow-hidden ${className}`}
        role="group"
        aria-label={ariaLabel || "Quantity selector"}
      >
        <button
          type="button"
          onClick={handleDecrement}
          disabled={value <= min}
          className="h-10 px-3 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2"
          aria-label="Decrease quantity"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
        <input
          type="number"
          value={value}
          onChange={handleInputChange}
          onBlur={handleBlur}
          min={min}
          max={max}
          className="w-16 h-10 text-center border-none bg-transparent focus:outline-none focus:ring-0 text-zinc-950 dark:text-zinc-50"
          aria-label="Quantity"
          inputMode="numeric"
        />
        <button
          type="button"
          onClick={handleIncrement}
          disabled={value >= max}
          className="h-10 px-3 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2"
          aria-label="Increase quantity"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    );
  }
);

QuantitySelector.displayName = "QuantitySelector";