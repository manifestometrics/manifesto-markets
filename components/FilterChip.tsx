"use client";

import type { ButtonHTMLAttributes } from "react";

interface FilterChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active: boolean;
}

/**
 * Small toggleable chip used by the directory filters. Inactive = outlined,
 * active = filled with the editorial ink colour. Stays keyboard-focusable.
 */
export function FilterChip({
  active,
  className = "",
  children,
  ...rest
}: FilterChipProps) {
  const base =
    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs uppercase tracking-wide transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/40";
  const state = active
    ? "border-ink bg-ink text-bg hover:bg-ink/90"
    : "border-line text-ink-soft hover:border-ink/40 hover:text-ink";

  return (
    <button
      type="button"
      aria-pressed={active}
      className={`${base} ${state} ${className}`.trim()}
      {...rest}
    >
      {children}
    </button>
  );
}
