"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { fadeUp, slideLeft, slideRight, viewport } from "@/lib/motionVariants";
import { SITE_IMAGES } from "@/lib/siteImages";

const features = [
  "Premium vehicle — spacious & comfortable",
  "Custom Luxury Leather Seating",
  "Climate-Controlled Throughout",
  "LED Ambient Lighting",
  "Ideal for Families & Groups",
  "Licensed, Insured & Professionally Maintained",
];

export default function VehicleComfort() {
  return (
    <section className="py-24 bg-sand border-y border-border" aria-label="Our tour vehicle">
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
              The Vehicle
            </span>
            <hr className="gold-rule" aria-hidden="true" />
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-ink leading-tight">
            Ride in Comfort<br />
            <span className="text-gold">Every Mile of the Way</span>
          </h2>
          <p className="mt-5 font-sans text-muted text-base max-w-xl mx-auto leading-relaxed">
            Our vehicles are built for the premium group
            experience — luxury leather seating, climate control, and plenty of
            space between every stop. Below is a glimpse of the LA icons
            you&apos;ll see along the way.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">

          {/* Left — destination mood (fleet photos can replace later) */}
          <motion.div
            variants={slideLeft}
            initial="hidden"
            whileInView="show"
            viewport={viewport}
            className="flex flex-col gap-3"
          >
              <div className="relative rounded-2xl overflow-hidden shadow-lg" style={{ aspectRatio: "4/3" }}>
              <Image
                src={SITE_IMAGES.walkOfFameOliverStone}
                alt="Hollywood Walk of Fame star on the sidewalk — a signature TNT Tours stop"
                fill
                className="object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              {/* Subtle bottom gradient for caption legibility */}
              <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/50 to-transparent" aria-hidden="true" />
              <p className="absolute bottom-4 left-4 right-4 font-sans text-xs text-white/90 text-center">
                Hollywood Walk of Fame — real stars under your feet
              </p>
            </div>
          </motion.div>

          {/* Right — Interior + features */}
          <motion.div
            variants={slideRight}
            initial="hidden"
            whileInView="show"
            viewport={viewport}
            className="flex flex-col gap-6"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-lg" style={{ aspectRatio: "16/9" }}>
              <Image
                src={SITE_IMAGES.griffithObservatoryApproach}
                alt="Griffith Observatory and Astronomers Monument — panoramic views on many TNT Tours itineraries"
                fill
                className="object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/50 to-transparent" aria-hidden="true" />
              <p className="absolute bottom-4 left-4 right-4 font-sans text-xs text-white/90 text-center">
                Griffith Observatory — sweeping views over the city
              </p>
            </div>

            {/* Feature checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {features.map((feature) => (
                <div key={feature} className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-gold/15 flex items-center justify-center shrink-0">
                    <svg className="w-3 h-3 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="font-sans text-sm text-ink/80">{feature}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
