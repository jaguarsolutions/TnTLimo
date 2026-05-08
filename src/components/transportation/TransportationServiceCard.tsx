import Link from "next/link";
import type { ReactNode } from "react";
import type { TransportationServiceCode } from "@/lib/transportationData";

const ICONS: Record<TransportationServiceCode, ReactNode> = {
  "airport-transfer": (
    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path d="M2.5 19.5l19-7.5-7.5-2.5-3.5 2.5-2.5-2.5L2.5 19.5z" />
      <path d="M10.5 6.5l3 2-1 2" />
    </svg>
  ),
  "disneyland-transportation": (
    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 21V10l9-6 9 6v11" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 21v-7h6v7" />
      <circle cx="12" cy="11" r="1" fill="currentColor" />
    </svg>
  ),
  "point-to-point": (
    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path d="M4 19V5h8" />
      <path d="M12 5l8 4v10" />
      <path d="M12 14h3m4 0h1" />
      <path d="M5 19h6" />
    </svg>
  ),
  "hourly-charter": (
    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  ),
};

interface Props {
  code: TransportationServiceCode;
  title: string;
  description: string;
  href: string;
}

export default function TransportationServiceCard({ code, title, description, href }: Props) {
  return (
    <article
      className="group rounded-3xl border border-border bg-white shadow-[0_4px_16px_-6px_rgba(12,11,10,0.10)] overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_38px_-12px_rgba(12,11,10,0.20)] hover:border-gold/40"
      style={{ transitionTimingFunction: "var(--ease-out-quint)" }}
    >
      <div className="p-7 flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gold/12 text-gold ring-1 ring-gold/20">
          {ICONS[code]}
        </div>
        <div className="min-w-0">
          <h3 className="font-display text-xl font-semibold text-ink leading-tight">{title}</h3>
          <p className="mt-2 font-sans text-sm text-muted leading-relaxed">{description}</p>
        </div>
      </div>
      <div className="mt-auto border-t border-border bg-sand p-6">
        <Link
          href={href}
          className="inline-flex items-center gap-2 text-sm font-semibold text-ink transition-colors duration-200 hover:text-gold"
        >
          Explore {title}
          <span aria-hidden="true" className="transition-transform duration-200 ease-out group-hover:translate-x-0.5">→</span>
        </Link>
      </div>
    </article>
  );
}
