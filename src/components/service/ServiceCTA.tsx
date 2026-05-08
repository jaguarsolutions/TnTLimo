"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { fadeUp, stagger, viewport } from "@/lib/motionVariants";
import { PEEK_BOOKING_URL } from "@/lib/siteBooking";

type Props = {
  headline?: string;
  subtext?: string;
  primaryCTA?: string;
  secondaryCTA?: string;
  trustPoints?: string[];
};

export default function ServiceCTA({
  headline = "Ready to Book Your Experience?",
  subtext = "Check availability for your preferred date and let us take care of the rest.",
  primaryCTA = "Book Now",
  secondaryCTA = "Ask a Question",
  trustPoints = ["5-Star on Google & TripAdvisor", "Serving Anaheim, LA & Orange County", "Fast, Friendly Communication"],
}: Props) {
  return (
    <section id="book" className="relative py-24 overflow-hidden bg-charcoal" aria-label="Book this experience">
      <div className="absolute inset-0 hero-gradient opacity-80" aria-hidden="true" />
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-gold/5 blur-3xl pointer-events-none" aria-hidden="true" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-gold/4 blur-3xl pointer-events-none" aria-hidden="true" />

      <div className="relative z-10 max-w-3xl mx-auto px-5 sm:px-8 text-center">
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={viewport}>
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2.5 mb-6">
            <hr className="gold-rule" aria-hidden="true" />
            <span className="font-sans text-xs font-semibold tracking-[0.18em] text-gold uppercase">Ready to Go?</span>
            <hr className="gold-rule" aria-hidden="true" />
          </motion.div>

          <motion.h2 variants={fadeUp} className="font-display text-4xl sm:text-5xl md:text-6xl font-semibold text-white leading-tight">
            {headline}
          </motion.h2>

          <motion.p variants={fadeUp} className="mt-6 font-sans text-white/60 text-base max-w-xl mx-auto leading-relaxed">
            {subtext}
          </motion.p>

          <motion.div variants={fadeUp} className="mt-9 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={PEEK_BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-9 py-4 bg-gold text-ink font-sans font-semibold text-base rounded-full transition-all duration-200 hover:bg-gold-dark cursor-pointer focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-charcoal"
            >
              {primaryCTA}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href="/#contact"
              className="inline-flex items-center justify-center gap-2 px-9 py-4 border border-white/25 text-white font-sans font-medium text-base rounded-full transition-all duration-200 hover:border-white/60 hover:bg-white/8 cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-charcoal"
            >
              {secondaryCTA}
            </Link>
          </motion.div>

          <motion.div variants={fadeUp} className="mt-10 flex flex-wrap items-center justify-center gap-5 text-white/40">
            {trustPoints.map((pt, i) => (
              <div key={pt} className="flex items-center gap-3">
                {i > 0 && <span className="w-px h-3 bg-white/20 hidden sm:block" aria-hidden="true" />}
                <span className="font-sans text-xs">{pt}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
