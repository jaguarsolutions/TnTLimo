"use client";

import { motion } from "framer-motion";
import { stagger, fadeUp, viewport } from "@/lib/motionVariants";

const reviews = [
  {
    platform: "Google",
    quote: "The best tour experience we had in LA. Our guide knew every hidden gem.",
    author: "Sarah M.",
    location: "Chicago, IL",
  },
  {
    platform: "TripAdvisor",
    quote: "Absolutely worth every penny. Professional, punctual, and so much fun.",
    author: "James R.",
    location: "London, UK",
  },
  {
    platform: "Google",
    quote: "Our kids loved it. The Universal Studios pickup was seamless and stress-free.",
    author: "The Patel Family",
    location: "Dallas, TX",
  },
];

const PlatformBadge = ({ platform }: { platform: string }) => (
  <div className="flex items-center gap-1.5">
    {platform === "Google" ? (
      <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
      </svg>
    ) : (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#00AF87" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <path fill="white" d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" />
      </svg>
    )}
    <span className="font-sans text-xs font-medium text-muted">{platform}</span>
  </div>
);

const Stars = ({ count = 5 }: { count?: number }) => (
  <div className="flex gap-0.5" aria-label={`${count} out of 5 stars`}>
    {[...Array(count)].map((_, i) => (
      <svg key={i} className="w-3.5 h-3.5 fill-gold" viewBox="0 0 20 20" aria-hidden="true">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

export default function TrustStrip() {
  return (
    <section
      id="reviews"
      className="bg-sand py-20 border-y border-border"
      aria-label="Guest reviews"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        {/* Header */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={viewport}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2.5 mb-4">
            <hr className="gold-rule" aria-hidden="true" />
            <span className="font-sans text-xs font-semibold tracking-[0.18em] text-gold uppercase">
              Trusted by Travelers
            </span>
            <hr className="gold-rule" aria-hidden="true" />
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-ink">
            What Our Guests Are Saying
          </h2>
          <p className="mt-4 font-sans text-muted max-w-xl mx-auto text-base leading-relaxed">
            Verified reviews from Google and TripAdvisor — real guests, real experiences,
            consistent five-star service.
          </p>
        </motion.div>

        {/* Stat row */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={viewport}
          className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-14"
        >
          {[
            { value: "5.0", label: "Google Rating" },
            { value: "5.0", label: "TripAdvisor" },
            { value: "500+", label: "Happy Guests" },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              variants={fadeUp}
              className="text-center"
            >
              <p className="font-display text-4xl font-semibold text-gold">
                {stat.value}
              </p>
              <p className="font-sans text-xs text-muted mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Review cards */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={viewport}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {reviews.map((r) => (
            <motion.article
              key={r.author}
              variants={fadeUp}
              className="bg-white rounded-2xl p-7 border border-border shadow-sm cursor-default"
            >
              <div className="flex items-center justify-between mb-4">
                <Stars />
                <PlatformBadge platform={r.platform} />
              </div>
              <blockquote className="font-display text-lg italic text-ink leading-snug mb-5">
                &ldquo;{r.quote}&rdquo;
              </blockquote>
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full bg-sand flex items-center justify-center text-gold font-display font-semibold text-base"
                  aria-hidden="true"
                >
                  {r.author.charAt(0)}
                </div>
                <div>
                  <p className="font-sans text-sm font-semibold text-ink">{r.author}</p>
                  <p className="font-sans text-xs text-muted">{r.location}</p>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
