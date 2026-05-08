"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import {
  filterLocations,
  categoryLabel,
  type LocationCategory,
} from "@/lib/transportationLocations";

interface Props {
  id?: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Categories to keep out of suggestions (e.g. exclude "airport" if already chosen). */
  excludeCategories?: LocationCategory[];
  required?: boolean;
  autoComplete?: string;
  inputRef?: (el: HTMLInputElement | null) => void;
}

const inputClass =
  "w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-ink placeholder:text-muted/70 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30";

export default function AddressAutocomplete({
  id,
  label,
  value,
  onChange,
  placeholder = "Hotel, address, or city",
  excludeCategories,
  required,
  autoComplete = "street-address",
  inputRef,
}: Props) {
  const reactId = useId();
  const inputId = id ?? `addr-${reactId}`;
  const listId = `${inputId}-list`;
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [touched, setTouched] = useState(false);

  const suggestions = useMemo(
    () => filterLocations(value, { exclude: excludeCategories, limit: 10 }),
    [value, excludeCategories],
  );

  /* Close popover on click outside. */
  useEffect(() => {
    if (!open) return;
    const onClick = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, [open]);

  function chooseSuggestion(name: string) {
    onChange(name);
    setOpen(false);
    setActiveIndex(-1);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!open) setOpen(true);
      setActiveIndex((current) => Math.min(suggestions.length - 1, current + 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) setOpen(true);
      setActiveIndex((current) => Math.max(0, current - 1));
    } else if (event.key === "Enter") {
      if (open && activeIndex >= 0 && suggestions[activeIndex]) {
        event.preventDefault();
        chooseSuggestion(suggestions[activeIndex].name);
      }
    } else if (event.key === "Escape") {
      if (open) {
        event.preventDefault();
        setOpen(false);
        setActiveIndex(-1);
      }
    }
  }

  const trimmed = value.trim();
  const isInList = trimmed.length > 0 && suggestions.some((s) => s.name.toLowerCase() === trimmed.toLowerCase());
  const showOutsideHint = touched && trimmed.length > 2 && !isInList && !open;

  return (
    <div className="relative" ref={wrapperRef}>
      {label && (
        <label htmlFor={inputId} className="block font-sans text-xs font-semibold text-muted uppercase tracking-wide mb-1.5">
          {label} {required && <span className="text-sunset" aria-hidden="true">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTouched(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          aria-controls={listId}
          aria-activedescendant={
            open && activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined
          }
          ref={inputRef}
          className={`${inputClass} pr-10`}
        />
        {value && (
          <button
            type="button"
            onClick={() => {
              onChange("");
              setOpen(true);
              setActiveIndex(-1);
            }}
            aria-label="Clear address"
            className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center rounded-full text-muted hover:text-ink hover:bg-cream cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        )}
        {!value && (
          <svg
            className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
        )}
      </div>

      {open && suggestions.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-50 mt-2 max-h-72 w-full overflow-auto rounded-xl border border-border bg-white shadow-lg"
        >
          {suggestions.map((s, index) => (
            <li
              key={`${s.name}-${index}`}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              onMouseDown={(event) => {
                event.preventDefault();
                chooseSuggestion(s.name);
              }}
              onMouseEnter={() => setActiveIndex(index)}
              className={`flex items-start gap-3 px-4 py-2.5 cursor-pointer ${
                index === activeIndex ? "bg-gold/10" : "bg-white hover:bg-cream"
              }`}
            >
              <CategoryIcon category={s.category} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-ink truncate">{s.name}</p>
                <p className="text-[11px] uppercase tracking-[0.14em] text-muted/80 mt-0.5">
                  {categoryLabel(s.category)}
                  {s.area ? ` · ${s.area}` : ""}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {showOutsideHint && (
        <p className="mt-2 text-xs text-muted">
          Outside our standard service area? You can still book — we’ll confirm coverage and quote within hours.
        </p>
      )}
    </div>
  );
}

function CategoryIcon({ category }: { category: LocationCategory }) {
  const className = "mt-0.5 w-5 h-5 shrink-0 text-gold";
  if (category === "airport") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M2.5 19.5l19-7.5-7.5-2.5-3.5 2.5-2.5-2.5L2.5 19.5z" />
      </svg>
    );
  }
  if (category === "theme-park") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 21h18M5 21V10l7-5 7 5v11" />
        <path d="M9 21v-6h6v6" />
      </svg>
    );
  }
  if (category === "hotel") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 21V8l9-5 9 5v13" />
        <path d="M9 21v-6h6v6" />
      </svg>
    );
  }
  if (category === "convention") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="6" width="18" height="13" rx="2" />
        <path d="M3 10h18" />
      </svg>
    );
  }
  if (category === "city") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 21s7-7.5 7-12a7 7 0 10-14 0c0 4.5 7 12 7 12z" />
        <circle cx="12" cy="9" r="2.5" />
      </svg>
    );
  }
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z" />
    </svg>
  );
}
