import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import FamilyCarSeats from "@/components/FamilyCarSeats";

interface Props {
  title: string;
  description: string;
  highlights: string[];
  image: string;
  imageAlt: string;
  ctaLabel: string;
  ctaHref: string;
  note?: ReactNode;
  /** Inject the "free car seats" callout below the What-to-expect card. */
  showCarSeatsCallout?: boolean;
}

export default function TransportationServiceDetail({
  title,
  description,
  highlights,
  image,
  imageAlt,
  ctaLabel,
  ctaHref,
  note,
  showCarSeatsCallout = false,
}: Props) {
  return (
    <main className="bg-cream text-ink">
      <section className="relative overflow-hidden pb-16 pt-36 sm:pt-44">
        <Image src={image} alt={imageAlt} fill className="object-cover object-center" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(160deg, rgba(12,11,10,0.82) 0%, rgba(30,18,6,0.62) 40%, rgba(20,14,5,0.66) 65%, rgba(12,11,10,0.86) 100%)",
          }}
          aria-hidden="true"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 110%, rgba(201,169,110,0.22) 0%, transparent 55%)",
          }}
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-6xl px-5 sm:px-8 lg:px-12">
          <div className="rounded-[2rem] border border-white/15 bg-black/55 p-10 sm:p-14 text-white shadow-2xl backdrop-blur-md">
            <span className="inline-flex items-center gap-2 rounded-full bg-gold/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-gold">
              Transportation service
            </span>
            <h1 className="mt-6 font-display text-4xl md:text-5xl font-semibold leading-tight">
              {title}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/80">
              {description}
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link href={ctaHref} className="inline-flex items-center justify-center rounded-full bg-gold px-7 py-3 text-sm font-semibold text-ink transition-colors hover:bg-gold-dark active:scale-[0.97]">
                {ctaLabel}
              </Link>
              <Link href="/transportation" className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 px-7 py-3 text-sm font-semibold text-white transition-colors hover:border-white hover:bg-white/15">
                Back to transportation
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-sand">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-12 grid gap-10 lg:grid-cols-[1.3fr_0.9fr]">
          <div className="space-y-6">
            <div className="rounded-[2rem] border border-border bg-white p-10 shadow-[0_4px_16px_-6px_rgba(12,11,10,0.10)]">
              <h2 className="font-display text-3xl font-semibold text-ink">What to expect</h2>
              <p className="mt-5 text-sm text-muted leading-relaxed">{description}</p>
              <div className="mt-8 space-y-3">
                {highlights.map((item) => (
                  <div key={item} className="flex items-start gap-4 rounded-2xl border border-border bg-cream p-5">
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold ring-1 ring-gold/25">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.6} aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <p className="text-sm text-ink leading-relaxed pt-1">{item}</p>
                  </div>
                ))}
              </div>
            </div>
            {showCarSeatsCallout && <FamilyCarSeats variant="callout" />}
          </div>
          <aside className="space-y-6">
            <div className="rounded-[2rem] border border-border bg-white p-8 shadow-[0_4px_16px_-6px_rgba(12,11,10,0.10)]">
              <h3 className="font-display text-2xl font-semibold text-ink">Ready to book?</h3>
              <p className="mt-4 text-sm text-muted leading-relaxed">
                Your transportation booking experience is built for travel-only reservations. Tours remain available through the main tour booking flow.
              </p>
              <Link href={ctaHref} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-charcoal active:scale-[0.97]">
                {ctaLabel}
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
            {note ? (
              <div className="rounded-[2rem] border border-border bg-white p-6 text-sm text-ink shadow-[0_4px_16px_-6px_rgba(12,11,10,0.10)]">
                {note}
              </div>
            ) : null}
          </aside>
        </div>
      </section>
    </main>
  );
}
