"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { PEEK_BOOKING_URL } from "@/lib/siteBooking";

type TrustBadge = { label: string; icon?: React.ReactNode };

type ServiceHeroProps = {
  eyebrow?: string;
  headline: string;
  subheadline: string;
  primaryCTA?: string;
  primaryHref?: string;
  secondaryCTA?: string;
  secondaryHref?: string;
  trustBadges: TrustBadge[];
  bgUrl: string;
  bgAlt?: string;
  overlay?: string;
};

const CheckIcon = () => (
  <svg className="w-3.5 h-3.5 shrink-0 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

export default function ServiceHero({
  eyebrow = "TNT Tours & Transportation",
  headline,
  subheadline,
  primaryCTA = "Book Now",
  primaryHref = PEEK_BOOKING_URL,
  secondaryCTA = "Ask a Question",
  secondaryHref = "/#contact",
  trustBadges,
  bgUrl,
  bgAlt = "TNT Tours service hero image",
  overlay = "linear-gradient(160deg, rgba(12,11,10,0.82) 0%, rgba(30,18,6,0.62) 45%, rgba(12,11,10,0.88) 100%)",
}: ServiceHeroProps) {
  const rm = useReducedMotion();
  const dur = rm ? 0 : 0.7;

  return (
    <section
      className="relative flex items-center justify-center overflow-hidden"
      style={{ minHeight: "clamp(420px, 70vh, 700px)" }}
      aria-label={headline}
    >
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${bgUrl})` }}
        role="img"
        aria-label={bgAlt}
      />
      <div className="absolute inset-0" style={{ background: overlay }} aria-hidden="true" />
      {/* Gold warmth */}
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 110%, rgba(201,169,110,0.18) 0%, transparent 55%)" }} aria-hidden="true" />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-5 sm:px-8 text-center py-20 md:py-28">
        <motion.div
          initial={{ opacity: 0, y: rm ? 0 : 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: dur, ease: "easeOut" }}
          className="inline-flex items-center gap-2.5 mb-6"
        >
          <hr className="gold-rule" aria-hidden="true" />
          <span className="font-sans text-xs font-semibold tracking-[0.18em] text-gold uppercase">
            {eyebrow}
          </span>
          <hr className="gold-rule" aria-hidden="true" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: rm ? 0 : 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: dur, delay: rm ? 0 : 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-4xl sm:text-5xl md:text-6xl font-semibold text-white leading-tight tracking-tight"
        >
          {headline}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: rm ? 0 : 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: dur, delay: rm ? 0 : 0.18, ease: "easeOut" }}
          className="mt-5 font-sans text-base sm:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed"
        >
          {subheadline}
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: rm ? 0 : 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: dur, delay: rm ? 0 : 0.25, ease: "easeOut" }}
          className="mt-8 flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Link
            href={primaryHref}
            target={primaryHref.startsWith("http") ? "_blank" : undefined}
            rel={primaryHref.startsWith("http") ? "noopener noreferrer" : undefined}
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gold text-ink font-sans font-bold text-sm rounded-full shadow-lg shadow-gold/25 transition-all duration-200 hover:bg-gold-dark cursor-pointer focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-charcoal"
          >
            {primaryCTA}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <Link
            href={secondaryHref}
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 border border-white/35 text-white font-sans font-medium text-sm rounded-full backdrop-blur-sm bg-white/5 transition-all duration-200 hover:border-white/65 hover:bg-white/10 cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/30"
          >
            {secondaryCTA}
          </Link>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: dur, delay: rm ? 0 : 0.38, ease: "easeOut" }}
          className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2.5"
        >
          {trustBadges.map((b) => (
            <div key={b.label} className="flex items-center gap-1.5">
              {b.icon ?? <CheckIcon />}
              <span className="font-sans text-xs text-white/70 font-medium">{b.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
