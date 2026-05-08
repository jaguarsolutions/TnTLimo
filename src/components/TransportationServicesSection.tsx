"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { stagger, fadeUp, viewport } from "@/lib/motionVariants";
import { TRANSPORTATION_SERVICES } from "@/lib/transportationData";
import TransportationServiceCard from "@/components/transportation/TransportationServiceCard";

export default function TransportationServicesSection() {
  return (
    <section
      id="transportation"
      className="py-24 bg-sand border-y border-border"
      aria-label="Transportation services"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={viewport}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2.5 mb-4">
            <hr className="gold-rule" aria-hidden="true" />
            <span className="font-sans text-xs font-semibold tracking-[0.18em] text-gold uppercase">
              Transportation
            </span>
            <hr className="gold-rule" aria-hidden="true" />
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-ink leading-tight">
            Anaheim transportation,
            <br />
            <span className="text-gold">made easy.</span>
          </h2>
          <p className="mt-5 font-sans text-muted text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Private airport transfers, Disneyland and hotel transportation, point-to-point
            rides, and hourly charters &mdash; door-to-door across Southern California.
          </p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={viewport}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {TRANSPORTATION_SERVICES.map((svc) => (
            <motion.div key={svc.code} variants={fadeUp} className="flex">
              <TransportationServiceCard
                code={svc.code}
                title={svc.title}
                description={svc.description}
                href={svc.href}
              />
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={viewport}
          className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/transportation/book"
            className="group/cta inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-ink text-white font-sans text-sm font-semibold rounded-full transition-colors duration-200 hover:bg-charcoal active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-ink focus:ring-offset-2"
          >
            Book Transportation
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
            href="/transportation"
            className="inline-flex items-center justify-center px-7 py-3.5 border border-border text-ink font-sans text-sm font-semibold rounded-full transition-colors duration-200 hover:border-ink hover:bg-cream active:scale-[0.97]"
          >
            See all transportation services
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
