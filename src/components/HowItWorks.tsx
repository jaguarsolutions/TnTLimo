"use client";

import { motion } from "framer-motion";
import { stagger, fadeUp, viewport } from "@/lib/motionVariants";

const steps = [
  {
    number: "01",
    title: "Choose Your Experience",
    description:
      "Browse our three carefully designed offerings and select the one that fits your group, travel dates, and starting location.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Book with Confidence",
    description:
      "Our booking process is simple and secure. Have questions? We&apos;re happy to assist by phone or email before you commit to anything.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Meet Your Guide",
    description:
      "We'll confirm your pickup location and time in advance. For Anaheim departures, we'll come to you. For private tours, we'll meet wherever is most convenient.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    number: "04",
    title: "Enjoy Los Angeles",
    description:
      "Sit back, relax, and let us take care of the rest. Great stories, insider knowledge, and a memorable day in one of the world's most iconic cities.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-sand border-y border-border" aria-label="How it works">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        {/* Header */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={viewport}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2.5 mb-4">
            <hr className="gold-rule" aria-hidden="true" />
            <span className="font-sans text-xs font-semibold tracking-[0.18em] text-gold uppercase">
              The Process
            </span>
            <hr className="gold-rule" aria-hidden="true" />
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-ink">
            Simple from Start to Finish
          </h2>
          <p className="mt-4 font-sans text-muted max-w-lg mx-auto text-base leading-relaxed">
            Getting on tour with TNT Tours takes minutes, not hours. Here&apos;s
            how it works.
          </p>
        </motion.div>

        {/* Steps */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={viewport}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative"
        >
          {/* Connector line (desktop) */}
          <div
            className="absolute top-[2.25rem] left-[calc(12.5%+1.25rem)] right-[calc(12.5%+1.25rem)] h-px bg-gradient-to-r from-transparent via-border to-transparent hidden lg:block"
            aria-hidden="true"
          />

          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              variants={fadeUp}
              className="relative flex flex-col items-center text-center group"
            >
              {/* Step number + icon */}
              <div className="relative mb-6">
                <div className="w-14 h-14 rounded-2xl bg-white border border-border flex items-center justify-center text-gold shadow-sm group-hover:border-gold/50 transition-colors duration-200 relative z-10">
                  {step.icon}
                </div>
                <span
                  className="absolute -top-2 -right-2 font-sans text-[10px] font-bold text-gold/60 leading-none"
                  aria-hidden="true"
                >
                  {step.number}
                </span>
              </div>

              <h3 className="font-display text-xl font-semibold text-ink mb-3">
                {step.title}
              </h3>
              <p
                className="font-sans text-sm text-muted leading-relaxed max-w-[220px]"
                dangerouslySetInnerHTML={{ __html: step.description }}
              />

              {/* Mobile connector */}
              {i < steps.length - 1 && (
                <div
                  className="mt-6 w-px h-8 bg-gradient-to-b from-border to-transparent sm:hidden"
                  aria-hidden="true"
                />
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
