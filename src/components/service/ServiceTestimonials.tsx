"use client";

import { motion } from "framer-motion";
import { stagger, fadeUp, viewport } from "@/lib/motionVariants";

export type ServiceReview = {
  quote: string;
  author: string;
  location: string;
  initials: string;
  platform: "Google" | "TripAdvisor";
  date?: string;
};

type Props = {
  reviews: ServiceReview[];
  heading?: string;
  subheading?: string;
};

const Stars = () => (
  <div className="flex gap-0.5" aria-label="5 out of 5 stars">
    {[...Array(5)].map((_, i) => (
      <svg key={i} className="w-4 h-4 fill-gold" viewBox="0 0 20 20" aria-hidden="true">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

export default function ServiceTestimonials({
  reviews,
  heading = "What Guests Are Saying",
  subheading = "Verified reviews from Google and TripAdvisor.",
}: Props) {
  return (
    <section className="py-20 bg-cream" aria-label="Guest reviews">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={viewport} className="mb-12">
          <div className="inline-flex items-center gap-2.5 mb-4">
            <hr className="gold-rule" aria-hidden="true" />
            <span className="font-sans text-xs font-semibold tracking-[0.18em] text-gold uppercase">Guest Reviews</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink">{heading}</h2>
          <p className="mt-3 font-sans text-muted text-base max-w-lg leading-relaxed">{subheading}</p>
        </motion.div>

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
              className="bg-white border border-border rounded-2xl p-7 flex flex-col gap-4 cursor-default"
            >
              <div className="flex items-center justify-between">
                <Stars />
                <span className="font-sans text-xs text-muted px-2.5 py-1 rounded-full bg-sand border border-border">
                  ✓ {r.platform}
                </span>
              </div>
              <blockquote className="font-display text-lg italic text-ink leading-snug flex-1">
                &ldquo;{r.quote}&rdquo;
              </blockquote>
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-charcoal flex items-center justify-center font-display font-semibold text-gold text-sm" aria-hidden="true">
                    {r.initials}
                  </div>
                  <div>
                    <p className="font-sans text-sm font-semibold text-ink">{r.author}</p>
                    <p className="font-sans text-xs text-muted">{r.location}</p>
                  </div>
                </div>
                {r.date && <span className="font-sans text-xs text-muted/60">{r.date}</span>}
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
