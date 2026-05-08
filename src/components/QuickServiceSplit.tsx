"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { stagger, fadeUp, viewport } from "@/lib/motionVariants";

const cards = [
  {
    eyebrow: "I Need Transportation",
    title: "Get there, stress-free",
    description:
      "Anaheim airport transportation, Disneyland & hotel transfers, point-to-point rides, and hourly charters. Door-to-door, on time, every time.",
    bullets: [
      "LAX, SNA, Long Beach, Burbank, Ontario, San Diego",
      "Disneyland & convention hotel transfers",
      "Private group vehicles",
    ],
    primary: { label: "Book Transportation", href: "/transportation/book" },
    secondary: { label: "See all options", href: "/transportation" },
    accent: "#C9A96E",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13l2-7h14l2 7M5 13h14m-14 0v6a1 1 0 001 1h2a1 1 0 001-1v-2h8v2a1 1 0 001 1h2a1 1 0 001-1v-6" />
        <circle cx="8" cy="16" r="1.4" fill="currentColor" />
        <circle cx="16" cy="16" r="1.4" fill="currentColor" />
      </svg>
    ),
    ariaLabel: "Transportation services",
  },
  {
    eyebrow: "I Want a Tour",
    title: "Explore LA with a local",
    description:
      "Full-day Best of LA & Hollywood, fully private LA experiences, and Universal Studios transportation — all with hotel pickup from Anaheim.",
    bullets: [
      "Hollywood, Beverly Hills, Santa Monica, Griffith",
      "Small groups & fully private options",
      "5-star rated on Google & TripAdvisor",
    ],
    primary: { label: "Explore Tours", href: "#tours" },
    secondary: { label: "How it works", href: "#how-it-works" },
    accent: "#7BAFD4",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    ariaLabel: "LA tours",
  },
];

export default function QuickServiceSplit() {
  return (
    <section
      id="get-started"
      className="py-20 bg-cream border-b border-border"
      aria-label="Choose your service"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
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
              Two Ways to Travel
            </span>
            <hr className="gold-rule" aria-hidden="true" />
          </div>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-ink leading-tight">
            What brings you to Anaheim today?
          </h2>
          <p className="mt-4 font-sans text-muted max-w-xl mx-auto leading-relaxed">
            Whether you need a ride or a guided experience, you&apos;re in the right place.
          </p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={viewport}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8"
        >
          {cards.map((card) => (
            <motion.article
              key={card.eyebrow}
              variants={fadeUp}
              whileHover={{ y: -6, transition: { duration: 0.3, ease: [0.23, 1, 0.32, 1] } }}
              className="group relative rounded-3xl border border-border bg-white p-8 sm:p-10 shadow-[0_4px_16px_-6px_rgba(12,11,10,0.10)] hover:shadow-[0_18px_38px_-12px_rgba(12,11,10,0.20)] transition-shadow duration-300 flex flex-col"
              aria-label={card.ariaLabel}
            >
              {/* Accent bar */}
              <div
                className="absolute left-0 top-8 h-12 w-1 rounded-r-full"
                style={{ backgroundColor: card.accent }}
                aria-hidden="true"
              />
              <div className="flex items-center gap-4 mb-5">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl ring-1"
                  style={{
                    backgroundColor: `${card.accent}1A`,
                    color: card.accent,
                    borderColor: `${card.accent}33`,
                  }}
                >
                  {card.icon}
                </div>
                <span className="font-sans text-xs font-semibold tracking-[0.18em] uppercase text-muted">
                  {card.eyebrow}
                </span>
              </div>

              <h3 className="font-display text-2xl sm:text-3xl font-semibold text-ink leading-tight">
                {card.title}
              </h3>
              <p className="mt-3 font-sans text-base text-muted leading-relaxed">
                {card.description}
              </p>

              <ul className="mt-6 space-y-2.5">
                {card.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2.5 font-sans text-sm text-ink/85">
                    <svg
                      className="w-4 h-4 shrink-0 mt-0.5"
                      style={{ color: card.accent }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {b}
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link
                  href={card.primary.href}
                  className="group/cta flex-1 inline-flex items-center justify-center gap-1.5 px-5 py-3 bg-ink text-white font-sans text-sm font-semibold rounded-full transition-colors duration-200 hover:bg-charcoal active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-ink focus:ring-offset-2"
                >
                  {card.primary.label}
                  <svg
                    className="w-3.5 h-3.5 transition-transform duration-200 ease-out group-hover/cta:translate-x-0.5"
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
                  href={card.secondary.href}
                  className="inline-flex items-center justify-center px-5 py-3 border border-border text-muted font-sans text-sm rounded-full transition-colors duration-200 hover:border-ink hover:text-ink active:scale-[0.97]"
                >
                  {card.secondary.label}
                </Link>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
