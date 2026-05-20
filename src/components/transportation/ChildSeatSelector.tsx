"use client";

import { CHILD_SEAT_OPTIONS } from "@/lib/booking/pricing/data";
import type { ChildSeatOption } from "@/lib/booking/pricing/data";

interface ChildSeatSelectorProps {
  label?: string;
  hint?: string;
  options?: readonly ChildSeatOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export default function ChildSeatSelector({
  label = "Child seats — free, on request",
  hint = "Select any seats you need and we’ll have them ready.",
  options = CHILD_SEAT_OPTIONS,
  selected,
  onChange,
}: ChildSeatSelectorProps) {
  const toggleSeat = (value: string) => {
    const next = selected.includes(value)
      ? selected.filter((seat) => seat !== value)
      : [...selected, value];
    onChange(next);
  };

  return (
    <div className="rounded-2xl border border-border bg-white p-5">
      <div className="mb-3">
        <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-muted">{label}</span>
        <p className="mt-2 text-sm text-muted">{hint}</p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((option) => {
          const checked = selected.includes(option.value);
          return (
            <label
              key={option.value}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition min-h-[48px] ${
                checked ? "border-gold bg-gold/5" : "border-border bg-white hover:border-ink/40"
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggleSeat(option.value)}
                className="h-4 w-4 rounded border-border text-gold focus:ring-gold"
              />
              <span className="text-sm font-medium text-ink">{option.label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
