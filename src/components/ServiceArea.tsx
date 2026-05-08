"use client";

import { motion } from "framer-motion";
import { stagger, fadeUp, viewport } from "@/lib/motionVariants";

const groups = [
  {
    label: "Anaheim & Orange County",
    items: [
      "Anaheim",
      "Disneyland Resort",
      "Anaheim Convention Center",
      "Garden Grove",
      "Buena Park",
      "Santa Ana",
      "Irvine",
      "Long Beach",
    ],
  },
  {
    label: "Los Angeles",
    items: [
      "Los Angeles",
      "Hollywood",
      "Beverly Hills",
      "Santa Monica",
      "Universal Studios",
      "Downtown LA",
      "Griffith Observatory",
    ],
  },
  {
    label: "Airports",
    items: [
      "LAX — Los Angeles International",
      "SNA — John Wayne, Orange County",
      "LGB — Long Beach",
      "BUR — Bob Hope / Burbank",
      "ONT — Ontario International",
      "SAN — San Diego International",
    ],
  },
];

export default function ServiceArea() {
  return (
    <section
      id="service-area"
      className="py-24 bg-cream border-y border-border"
      aria-label="Service area"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={viewport}
          className="text-center mb-14 max-w-2xl mx-auto"
        >
          <div className="inline-flex items-center gap-2.5 mb-4">
            <hr className="gold-rule" aria-hidden="true" />
            <span className="font-sans text-xs font-semibold tracking-[0.18em] text-gold uppercase">
              Service Area
            </span>
            <hr className="gold-rule" aria-hidden="true" />
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-ink leading-tight">
            All across <span className="text-gold">Southern California.</span>
          </h2>
          <p className="mt-5 font-sans text-muted text-base leading-relaxed">
            Our tours and transportation services run from Anaheim out to LA, the
            beaches, and every major airport in the region.
          </p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={viewport}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {groups.map((group) => (
            <motion.div
              key={group.label}
              variants={fadeUp}
              className="rounded-3xl border border-border bg-white p-7 shadow-[0_4px_16px_-6px_rgba(12,11,10,0.08)]"
            >
              <div className="flex items-center gap-2 mb-5">
                <svg
                  className="w-5 h-5 text-gold"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <h3 className="font-display text-lg font-semibold text-ink">{group.label}</h3>
              </div>
              <ul className="space-y-2.5">
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 font-sans text-sm text-ink/85 leading-relaxed"
                  >
                    <span
                      className="mt-1.5 inline-block w-1 h-1 rounded-full bg-gold/70 shrink-0"
                      aria-hidden="true"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={viewport}
          className="mt-10 text-center font-sans text-sm text-muted max-w-2xl mx-auto"
        >
          Need a stop that&apos;s not on the list? We&apos;re flexible &mdash; reach
          out and we&apos;ll work it into your itinerary.
        </motion.p>
      </div>
    </section>
  );
}
