"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { fadeUp, stagger, viewport } from "@/lib/motionVariants";

/**
 * "Free car seats" section.
 *
 * Highlights one of TNT's biggest competitive advantages for family travel:
 * we provide infant seats, rear- and forward-facing seats, and boosters at
 * no charge on request. Designed to slot between WhyChoose and VehicleComfort
 * on the homepage, and as a callout block elsewhere (Disneyland transport,
 * airport-transfer detail pages).
 *
 * Photos slot in via the `photos` prop — when empty, the section gracefully
 * renders an icon grid that still reads as a complete design.
 */

const SEAT_TYPES = [
  {
    id: "infant",
    label: "Infant seat",
    ageHint: "Birth – 12 months",
    icon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M14 36c0-10 8-18 18-18s18 8 18 18v6H14v-6z" />
        <path d="M22 30s4-4 10-4 10 4 10 4" />
        <path d="M14 42v10c0 2 2 4 4 4h28c2 0 4-2 4-4v-10" />
        <path d="M20 28l-4-4M44 28l4-4" />
      </svg>
    ),
  },
  {
    id: "rear-facing",
    label: "Rear-facing",
    ageHint: "Up to 2 years",
    icon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M16 14h22c4 0 8 4 8 8v24c0 4-4 8-8 8H22c-4 0-6-2-6-6V14z" />
        <path d="M20 22h22M20 32h22" />
        <path d="M32 14v8" />
      </svg>
    ),
  },
  {
    id: "forward-facing",
    label: "Forward-facing",
    ageHint: "2 – 4 years",
    icon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M18 14h20c4 0 8 4 8 8v16c0 4-4 8-8 8H22c-2 0-4-2-4-4V14z" />
        <path d="M26 22h12v12H26z" />
        <path d="M32 14v6M22 46v8M42 46v8" />
      </svg>
    ),
  },
  {
    id: "booster",
    label: "Booster",
    ageHint: "4 – 8 years",
    icon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M14 34h36v10c0 2-2 4-4 4H18c-2 0-4-2-4-4V34z" />
        <path d="M14 34l4-10c1-2 3-4 6-4h16c3 0 5 2 6 4l4 10" />
        <path d="M22 48v6M42 48v6" />
      </svg>
    ),
  },
  {
    id: "high-back-booster",
    label: "High-back booster",
    ageHint: "4 – 8 years",
    icon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M18 14h20c2 0 4 2 4 4v18H14V18c0-2 2-4 4-4z" />
        <path d="M14 36h28v8c0 2-2 4-4 4H18c-2 0-4-2-4-4v-8z" />
        <path d="M22 14v22M34 14v22" />
        <path d="M20 48v6M36 48v6" />
      </svg>
    ),
  },
];

export interface FamilyCarSeatsProps {
  /** Optional URLs for actual car-seat photos. When empty, an icon grid renders. */
  photos?: Array<{ src: string; alt: string }>;
  /**
   * Render mode:
   *  - "section" (default): full homepage section with header
   *  - "callout": compact card that fits inside another page
   */
  variant?: "section" | "callout";
}

export default function FamilyCarSeats({ photos = [], variant = "section" }: FamilyCarSeatsProps) {
  if (variant === "callout") {
    const photo = photos[0];
    return (
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={viewport}
        className="rounded-3xl border border-gold/20 bg-gradient-to-br from-cream to-sand/60 p-7 sm:p-9"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          {photo ? (
            <div className="relative h-40 w-full overflow-hidden rounded-3xl bg-sand sm:h-44 sm:w-44">
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(max-width: 640px) 100vw, 240px"
                loading="eager"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gold/20 ring-1 ring-gold/30">
              <svg className="w-6 h-6 text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-display text-lg sm:text-xl font-semibold text-ink">
                Car seats included — free of charge
              </h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-gold text-ink px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                Free
              </span>
            </div>
            <p className="mt-2 font-sans text-sm text-muted leading-relaxed">
              Travelling with little ones? Just ask. We&apos;ll install an
              infant seat, rear- or forward-facing seat, or booster — at no
              extra cost — so your kids ride safely on day one and on the
              ride home.
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <section className="py-24 bg-cream border-y border-border" aria-label="Free car seats with every booking">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        {/* Header */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={viewport}
          className="text-center mb-12 max-w-2xl mx-auto"
        >
          <div className="inline-flex items-center gap-2.5 mb-4">
            <hr className="gold-rule" aria-hidden="true" />
            <span className="font-sans text-xs font-semibold tracking-[0.18em] text-gold uppercase">
              Family Friendly
            </span>
            <hr className="gold-rule" aria-hidden="true" />
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-ink leading-tight">
            Car seats included &mdash;{" "}
            <span className="text-gold italic">free of charge.</span>
          </h2>
          <p className="mt-5 font-sans text-muted text-base leading-relaxed">
            Travelling with children? Just tell us their ages and we&apos;ll install
            the right seat for every passenger. Infants, toddlers, and bigger kids
            &mdash; covered, every time, no add-on fees.
          </p>
        </motion.div>

        {/* Seat type grid */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={viewport}
          className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5"
        >
          {SEAT_TYPES.map((seat) => (
            <motion.div
              key={seat.id}
              variants={fadeUp}
              className="group relative rounded-2xl border border-border bg-white p-5 hover:border-gold/40 hover:shadow-[0_8px_24px_-12px_rgba(12,11,10,0.16)] transition-all duration-300"
              style={{ transitionTimingFunction: "var(--ease-out-quint)" }}
            >
              <div className="absolute top-3 right-3 inline-flex items-center rounded-full bg-gold text-ink px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                Free
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gold/12 text-gold ring-1 ring-gold/20 mb-4">
                <span className="block w-8 h-8">{seat.icon}</span>
              </div>
              <p className="font-display text-base font-semibold text-ink leading-tight">
                {seat.label}
              </p>
              <p className="mt-1 font-sans text-xs text-muted">{seat.ageHint}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Optional photos rail — renders only when provided */}
        {photos.length > 0 && (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={viewport}
            className="mt-12 grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          >
            {photos.map((p, idx) => (
              <div
                key={idx}
                className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-sand shadow-[0_4px_16px_-6px_rgba(12,11,10,0.10)]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.src}
                  alt={p.alt}
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </motion.div>
        )}

        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={viewport}
          className="mt-10 text-center font-sans text-sm text-muted max-w-xl mx-auto"
        >
          Tell us your children&apos;s ages in the booking notes and we&apos;ll have
          the right seats installed before pickup. Licensed, insured, and inspected
          regularly.
        </motion.p>
      </div>
    </section>
  );
}
