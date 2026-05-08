"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { fadeUp, stagger, viewport } from "@/lib/motionVariants";
import { PEEK_BOOKING_URL } from "@/lib/siteBooking";

export default function FinalCTA() {
  return (
    <section
      id="book"
      className="relative py-28 overflow-hidden bg-charcoal"
      aria-label="Book your tour"
    >
      {/* Background elements */}
      <div className="absolute inset-0 hero-gradient opacity-80" aria-hidden="true" />

      {/* Gold accent orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-gold/5 blur-3xl pointer-events-none" aria-hidden="true" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-gold/4 blur-3xl pointer-events-none" aria-hidden="true" />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#C9A96E 1px, transparent 1px), linear-gradient(90deg, #C9A96E 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-4xl mx-auto px-5 sm:px-8 text-center">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={viewport}
        >
          {/* Eyebrow */}
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2.5 mb-7">
            <hr className="gold-rule" aria-hidden="true" />
            <span className="font-sans text-xs font-semibold tracking-[0.18em] text-gold uppercase">
              Ready to Explore?
            </span>
            <hr className="gold-rule" aria-hidden="true" />
          </motion.div>

          {/* Headline */}
          <motion.h2
            variants={fadeUp}
            className="font-display text-5xl sm:text-6xl md:text-7xl font-semibold text-white leading-tight"
          >
            One trusted team
            <br />
            <em className="not-italic text-gold">for every Anaheim trip.</em>
          </motion.h2>

          {/* Subline */}
          <motion.p
            variants={fadeUp}
            className="mt-7 font-sans text-white/60 text-lg max-w-xl mx-auto leading-relaxed"
          >
            Airport transfers, Disneyland transportation, point-to-point rides,
            hourly charters &mdash; or a guided LA tour. Pick your service and
            we&apos;ll handle the rest.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={fadeUp}
            className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/transportation/book"
              className="group/cta inline-flex items-center justify-center gap-2 px-9 py-4 bg-gold text-ink font-sans font-semibold text-base rounded-full transition-colors duration-200 hover:bg-gold-dark active:scale-[0.97] cursor-pointer focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-charcoal"
            >
              Book Transportation
              <svg
                className="w-4 h-4 transition-transform duration-200 ease-out group-hover/cta:translate-x-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href={PEEK_BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-9 py-4 border border-white/30 bg-white/5 text-white font-sans font-medium text-base rounded-full transition-colors duration-200 hover:border-white/70 hover:bg-white/12 active:scale-[0.97] cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-charcoal"
            >
              Book a Tour
            </Link>
            <Link
              href="#contact"
              className="inline-flex items-center justify-center gap-2 px-9 py-4 border border-white/25 text-white font-sans font-medium text-base rounded-full transition-colors duration-200 hover:border-white/60 hover:bg-white/8 cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-charcoal"
            >
              Ask a Question
            </Link>
          </motion.div>

          {/* Trust micro-line */}
          <motion.div
            variants={fadeUp}
            className="mt-12 flex flex-wrap items-center justify-center gap-6 text-white/40"
          >
            {[
              "5-Star on Google & TripAdvisor",
              "Serving Anaheim, LA & Orange County",
              "Fast, Friendly Communication",
            ].map((point, i) => (
              <div key={point} className="flex items-center gap-3">
                {i > 0 && <span className="w-px h-3 bg-white/20 hidden sm:block" aria-hidden="true" />}
                <span className="font-sans text-xs">{point}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
