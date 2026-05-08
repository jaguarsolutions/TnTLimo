"use client";

import { motion } from "framer-motion";
import { stagger, fadeUp, viewport } from "@/lib/motionVariants";

const featuredTestimonial = {
  quote:
    "Our guide was absolutely fantastic — funny, knowledgeable, and genuinely passionate about LA. We saw so much more than I expected and left feeling like we truly understood the city. One of the best tour experiences I've had anywhere in the world.",
  author: "Michael T.",
  role: "Visited from New York, NY",
  initials: "MT",
  platform: "Google",
  tour: "Full-Day LA & Hollywood Tour",
  date: "March 2025",
};

const testimonials = [
  {
    quote:
      "We booked the private tour for a family celebration and it couldn't have been better. The communication was excellent, the vehicle was spotless, and our guide went above and beyond for every single one of us.",
    author: "The Hendersons",
    role: "Family of 5 from Arizona",
    initials: "H",
    platform: "TripAdvisor",
    tour: "Private LA & Hollywood Tour",
    date: "February 2025",
  },
  {
    quote:
      "Such a stress-free way to get to Universal Studios from Anaheim. Pickup was right on time, the driver was friendly and professional, and we didn't think about parking for a second. Totally worth it.",
    author: "Priya S.",
    role: "Visited from Toronto, Canada",
    initials: "PS",
    platform: "Google",
    tour: "Universal Studios Transportation",
    date: "January 2025",
  },
  {
    quote:
      "My husband and I aren't group tour people, but this felt nothing like that. Personal, unhurried, and full of local insight. We left knowing a side of LA most tourists never see. Already recommending it to everyone.",
    author: "Claire & David W.",
    role: "Anniversary trip from Seattle, WA",
    initials: "CW",
    platform: "TripAdvisor",
    tour: "Private LA & Hollywood Tour",
    date: "April 2025",
  },
];

const Stars = () => (
  <div className="flex gap-0.5" aria-label="5 out of 5 stars">
    {[...Array(5)].map((_, i) => (
      <svg key={i} className="w-4 h-4 fill-gold" viewBox="0 0 20 20" aria-hidden="true">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

const PlatformBadge = ({ platform }: { platform: string }) => (
  <span className="font-sans text-xs text-muted px-3 py-1 rounded-full bg-sand border border-border">
    ✓ Verified · {platform}
  </span>
);

export default function Testimonials() {
  return (
    <section id="reviews" className="py-24 bg-cream" aria-label="Guest testimonials">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">

        {/* Header */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={viewport}
          className="max-w-2xl mb-14"
        >
          <div className="inline-flex items-center gap-2.5 mb-4">
            <hr className="gold-rule" aria-hidden="true" />
            <span className="font-sans text-xs font-semibold tracking-[0.18em] text-gold uppercase">
              Guest Stories
            </span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-ink leading-tight">
            Real People,<br />
            <span className="text-gold italic">Real Experiences</span>
          </h2>
          <p className="mt-5 font-sans text-muted text-base leading-relaxed">
            Every review represents a real family, couple, or group of friends who
            trusted us with their LA experience. Verified on Google &amp; TripAdvisor.
          </p>
        </motion.div>

        {/* Featured review */}
        <motion.article
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={viewport}
          className="bg-charcoal rounded-3xl p-8 sm:p-10 mb-6 cursor-default"
          aria-label={`Featured review by ${featuredTestimonial.author}`}
        >
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <Stars />
            <PlatformBadge platform={featuredTestimonial.platform} />
          </div>
          <blockquote className="font-display text-2xl sm:text-3xl italic text-white leading-snug mb-8 max-w-3xl">
            &ldquo;{featuredTestimonial.quote}&rdquo;
          </blockquote>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6 border-t border-white/10">
            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-full bg-gold/20 flex items-center justify-center font-display font-semibold text-gold text-base"
                aria-hidden="true"
              >
                {featuredTestimonial.initials}
              </div>
              <div>
                <p className="font-sans text-sm font-semibold text-white">{featuredTestimonial.author}</p>
                <p className="font-sans text-xs text-white/50">{featuredTestimonial.role}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-1 h-4 rounded-full bg-gold" aria-hidden="true" />
                <span className="font-sans text-xs text-white/50">{featuredTestimonial.tour}</span>
              </div>
              <span className="font-sans text-xs text-white/30 hidden sm:block">{featuredTestimonial.date}</span>
            </div>
          </div>
        </motion.article>

        {/* Supporting reviews grid */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={viewport}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {testimonials.map((t) => (
            <motion.article
              key={t.author}
              variants={fadeUp}
              className="bg-white border border-border rounded-2xl p-7 flex flex-col gap-5 cursor-default"
              aria-label={`Review by ${t.author}`}
            >
              {/* Top row */}
              <div className="flex items-center justify-between">
                <Stars />
                <PlatformBadge platform={t.platform} />
              </div>

              {/* Quote */}
              <blockquote className="font-display text-lg italic text-ink leading-snug flex-1">
                &ldquo;{t.quote}&rdquo;
              </blockquote>

              {/* Tour badge */}
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 rounded-full bg-gold" aria-hidden="true" />
                <span className="font-sans text-xs text-muted">{t.tour}</span>
              </div>

              {/* Author */}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full bg-charcoal flex items-center justify-center font-display font-semibold text-gold text-sm"
                    aria-hidden="true"
                  >
                    {t.initials}
                  </div>
                  <div>
                    <p className="font-sans text-sm font-semibold text-ink">{t.author}</p>
                    <p className="font-sans text-xs text-muted">{t.role}</p>
                  </div>
                </div>
                <span className="font-sans text-xs text-muted/60">{t.date}</span>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
