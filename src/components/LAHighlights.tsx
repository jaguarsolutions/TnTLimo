"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { fadeUp, viewport } from "@/lib/motionVariants";
import { SITE_IMAGES } from "@/lib/siteImages";

const slides = [
  {
    name: "Hollywood Walk of Fame",
    label: "Hollywood",
    description:
      "Pink terrazzo stars under your feet — the same sidewalks where legends are honored. A real-deal moment from our tours.",
    bg: SITE_IMAGES.walkOfFameOliverStone,
    accent: "#C9A96E",
  },
  {
    name: "TCL Chinese Theatre",
    label: "Hollywood Blvd",
    description:
      "The pagoda roof and forecourt of one of Hollywood’s most photographed landmarks — movie premieres, handprints, and pure showbiz energy.",
    bg: SITE_IMAGES.tclChineseTheatre,
    accent: "#C9A96E",
  },
  {
    name: "Griffith Observatory",
    label: "Griffith Park",
    description:
      "The Astronomers Monument, copper domes, and views that stretch across the whole basin — a must-see stop above the city.",
    bg: SITE_IMAGES.griffithObservatoryApproach,
    accent: "#8BAACC",
  },
  {
    name: "Beverly Hills",
    label: "90210",
    description:
      "The landmark Beverly Hills sign, Rodeo Drive, world-class luxury, and celebrity estates. Pure California elegance at every corner.",
    bg: SITE_IMAGES.beverlyHillsSign,
    accent: "#C9B8E8",
  },
  {
    name: "Santa Monica",
    label: "Pacific Coast",
    description:
      "The iconic Yacht Harbor arch, the pier beyond, and the Pacific at your feet — the classic end-of-the-road California moment.",
    bg: SITE_IMAGES.santaMonicaYachtHarborSign,
    accent: "#6BBBC9",
  },
  {
    name: "Downtown Los Angeles",
    label: "The Arts",
    description:
      "World-class architecture and culture — from the Walt Disney Concert Hall to museums, music, and the energy of the city center.",
    bg: SITE_IMAGES.waltDisneyConcertHall,
    accent: "#E8906E",
  },
  {
    name: "Universal Studios Hollywood",
    label: "Universal City",
    description:
      "World-class theme park entertainment, film history, and unforgettable thrills beneath the iconic Universal globe.",
    bg: SITE_IMAGES.universalGlobe,
    accent: "#B89CC9",
  },
  {
    name: "Crypto.com Arena",
    label: "Downtown LA",
    description:
      "Home of championship energy in the heart of the city — sports, concerts, and the buzz of L.A. Live just steps away.",
    bg: SITE_IMAGES.cryptoComArenaExterior,
    accent: "#7BAFD4",
  },
  {
    name: "Star Plaza Legends",
    label: "Downtown LA",
    description:
      "Bronze legends and flags at the plaza — a perfect snapshot of LA’s sports and entertainment culture next to the arena.",
    bg: SITE_IMAGES.cryptoComArenaStarPlaza,
    accent: "#9BB8D4",
  },
  {
    name: "The Grove & Farmers Market",
    label: "Mid-City",
    description:
      "Trolley tracks, blooms, and one of LA’s favorite open-air destinations — ideal for a relaxed lunch stop on a full-day tour.",
    bg: SITE_IMAGES.theGroveVintageTruck,
    accent: "#8FBC8F",
  },
];

const moments = [
  {
    title: "Hollywood Boulevard",
    caption: "Hard Rock Cafe — live music and neon on the boulevard.",
    src: SITE_IMAGES.hardRockHollywood,
    alt: "Hard Rock Cafe on Hollywood Boulevard in Los Angeles",
  },
  {
    title: "Movie magic",
    caption: "Only-in-Hollywood moments — souvenirs and silver-screen icons.",
    src: SITE_IMAGES.hollywoodLaLaLandTerminator,
    alt: "Terminator display at a Hollywood souvenir shop",
  },
  {
    title: "Classic California",
    caption: "Vintage style and rock-and-roll heritage — pure LA personality.",
    src: SITE_IMAGES.classicHollywoodElvisCadillac,
    alt: "Classic convertible and Elvis display at a Hollywood exhibit",
  },
];

export default function LAHighlights() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = back

  const goTo = useCallback((idx: number) => {
    setDirection(idx > current ? 1 : -1);
    setCurrent(idx);
  }, [current]);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrent((c) => (c - 1 + slides.length) % slides.length);
  }, []);

  const next = useCallback(() => {
    setDirection(1);
    setCurrent((c) => (c + 1) % slides.length);
  }, []);

  // Auto-advance every 5 seconds
  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  const slide = slides[current];

  return (
    <section className="py-24 bg-cream" aria-label="Los Angeles highlights">
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
              The Experience
            </span>
            <hr className="gold-rule" aria-hidden="true" />
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-ink">
            Los Angeles, Curated
          </h2>
          <p className="mt-4 font-sans text-muted max-w-xl mx-auto text-base leading-relaxed">
            One of the world&apos;s most iconic cities. Here&apos;s just a taste of what
            you&apos;ll experience on a TNT Tours day.
          </p>
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={viewport}>
          {/* Carousel photo */}
          <div className="relative rounded-3xl overflow-hidden shadow-xl" style={{ aspectRatio: "16/7" }}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={current}
                initial={{ opacity: 0, x: direction * 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -60 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${slide.bg})` }}
                  role="img"
                  aria-label={slide.name}
                />
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.10) 50%, transparent 100%)" }}
                  aria-hidden="true"
                />
              </motion.div>
            </AnimatePresence>

            {/* Location tag — top left */}
            <div className="absolute top-5 left-5 z-10">
              <span
                className="inline-block px-3 py-1.5 rounded-full font-sans text-xs font-semibold backdrop-blur-sm"
                style={{ backgroundColor: `${slide.accent}22`, border: `1px solid ${slide.accent}66`, color: slide.accent }}
              >
                {slide.label}
              </span>
            </div>

            {/* Slide counter — top right */}
            <div className="absolute top-5 right-5 z-10 font-sans text-xs text-white/60 bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full">
              {current + 1} / {slides.length}
            </div>

            {/* Nav arrows */}
            <button
              onClick={prev}
              aria-label="Previous destination"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-black/60 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={next}
              aria-label="Next destination"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-black/60 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Description below photo */}
          <div className="mt-6 text-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              >
                <h3 className="font-display text-2xl font-semibold text-ink mb-2">{slide.name}</h3>
                <p className="font-sans text-muted text-base leading-relaxed max-w-2xl mx-auto">{slide.description}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dot navigation */}
          <div className="flex justify-center gap-2 mt-6" role="tablist" aria-label="Carousel navigation">
            {slides.map((s, i) => (
              <button
                key={s.name}
                role="tab"
                aria-selected={i === current}
                aria-label={`Go to ${s.name}`}
                onClick={() => goTo(i)}
                className="cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-full transition-all duration-300"
                style={{
                  width: i === current ? "28px" : "8px",
                  height: "8px",
                  borderRadius: "9999px",
                  backgroundColor: i === current ? slide.accent : "#D4C4A8",
                }}
              />
            ))}
          </div>

          {/* Extra tour photos — Hollywood energy */}
          <div className="mt-16 pt-12 border-t border-border/60">
            <h3 className="font-display text-xl md:text-2xl font-semibold text-ink text-center mb-2">
              More from the boulevard
            </h3>
            <p className="text-center font-sans text-sm text-muted mb-8 max-w-2xl mx-auto leading-relaxed">
              Street-level stops our guests love — the kind of only-in-LA moments you can&apos;t get from a postcard.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5">
              {moments.map((m) => (
                <div
                  key={m.title}
                  className="relative rounded-2xl overflow-hidden shadow-md bg-sand aspect-[3/4] sm:aspect-[4/5]"
                >
                  <Image
                    src={m.src}
                    alt={m.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 33vw"
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"
                    aria-hidden="true"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-left">
                    <p className="font-display text-sm font-semibold text-white">{m.title}</p>
                    <p className="font-sans text-xs text-white/85 mt-1 leading-snug">{m.caption}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
