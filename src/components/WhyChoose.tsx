"use client";

import { motion } from "framer-motion";
import { stagger, slideLeft, slideRight, viewport } from "@/lib/motionVariants";

const benefits = [
  {
    title: "Local Anaheim experience",
    description:
      "Based right next to the Disneyland Resort — we know the hotels, the gates, the convention center, and every freeway shortcut between Anaheim and LA.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    title: "Family-friendly service",
    description:
      "Families with young kids, multi-generational groups, and conventions — we host them all. Luggage room and complimentary child seats on request.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
  {
    title: "Private transportation",
    description:
      "Your group, your vehicle, your day. Private rides for airport transfers, Disneyland trips, point-to-point, and hourly charters &mdash; never shared.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    title: "Airport & hotel pickup",
    description:
      "Door-to-door from your hotel, resort, or terminal at LAX, SNA, Long Beach, Burbank, Ontario, and San Diego &mdash; or any private address in the area.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.5 19.5l19-7.5-7.5-2.5-3.5 2.5-2.5-2.5L2.5 19.5z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6.5l3 2-1 2" />
      </svg>
    ),
  },
  {
    title: "Easy online booking",
    description:
      "Book transportation directly online, or use our secure tour checkout for guided experiences. Questions? Phone and email replies are quick.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    title: "Professional drivers",
    description:
      "Licensed, insured, and professionally maintained &mdash; with friendly local drivers who know the routes and treat every guest like family.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
  },
];

export default function WhyChoose() {
  return (
    <section className="py-24 bg-charcoal" aria-label="Why choose TNT Tours">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Heading */}
          <motion.div
            variants={slideLeft}
            initial="hidden"
            whileInView="show"
            viewport={viewport}
          >
            <div className="inline-flex items-center gap-2.5 mb-5">
              <hr className="gold-rule" aria-hidden="true" />
              <span className="font-sans text-xs font-semibold tracking-[0.18em] text-gold uppercase">
                Why Choose Us
              </span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl lg:text-[3.25rem] font-semibold text-white leading-tight">
              Why guests choose
              <br />
              <span className="text-gold italic">TNT Tours &amp; Transportation</span>
            </h2>
            <p className="mt-6 font-sans text-white/60 text-base leading-relaxed max-w-md">
              We&apos;re a local Anaheim team you can call your own &mdash; one trusted
              brand for tours, airport transfers, Disneyland transportation, and
              charter rides. Personal service, real local knowledge, and the kind of
              experience guests actually remember.
            </p>
            <div className="mt-8 flex items-center gap-5">
              <div className="text-center">
                <p className="font-display text-5xl font-semibold text-gold">5★</p>
                <p className="font-sans text-xs text-white/40 mt-1">Google Reviews</p>
              </div>
              <div className="w-px h-12 bg-white/10" aria-hidden="true" />
              <div className="text-center">
                <p className="font-display text-5xl font-semibold text-gold">5★</p>
                <p className="font-sans text-xs text-white/40 mt-1">TripAdvisor</p>
              </div>
              <div className="w-px h-12 bg-white/10" aria-hidden="true" />
              <div className="text-center">
                <p className="font-display text-5xl font-semibold text-gold">100%</p>
                <p className="font-sans text-xs text-white/40 mt-1">Recommend Rate</p>
              </div>
            </div>
          </motion.div>

          {/* Right: Benefits grid */}
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={viewport}
            className="grid grid-cols-1 sm:grid-cols-2 gap-5"
          >
            {benefits.map((b) => (
              <motion.div
                key={b.title}
                variants={slideRight}
                className="group p-5 rounded-2xl border border-white/8 bg-white/4 hover:bg-white/8 transition-colors duration-200 cursor-default"
              >
                <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold mb-4">
                  {b.icon}
                </div>
                <h3 className="font-display text-lg font-semibold text-white mb-2">
                  {b.title}
                </h3>
                <p className="font-sans text-sm text-white/55 leading-relaxed">
                  {b.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
