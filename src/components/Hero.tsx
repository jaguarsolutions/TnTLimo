"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import Logo from "@/components/Logo";
import { SITE_IMAGES } from "@/lib/siteImages";

const Stars = () => (
  <div className="flex gap-1" aria-hidden="true">
    {[...Array(5)].map((_, i) => (
      <svg key={i} className="w-4 h-4 fill-gold" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

export default function Hero() {
  const reducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const dur = reducedMotion ? 0 : 0.75;
  const del = reducedMotion ? 0 : 0.15;

  // Parallax: content rises slightly as you scroll down
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const photoScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);

  return (
    <section
      id="home"
      ref={sectionRef}
      className="relative min-h-svh flex flex-col items-center justify-center overflow-hidden"
      aria-label="Hero — TNT Tours Los Angeles"
    >
      {/* ─── Background Photo with Ken Burns + Parallax ───────── */}
      <motion.div
        className="absolute inset-0"
        style={reducedMotion ? {} : { scale: photoScale }}
      >
        {/* Slow Ken Burns scale on the photo itself */}
        <motion.div
          className="absolute inset-0"
          animate={reducedMotion ? {} : { scale: [1, 1.07] }}
          transition={{ duration: 10, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" }}
        >
          <Image
            src={SITE_IMAGES.hero}
            alt="Downtown Los Angeles skyline at twilight"
            fill
            className="object-cover object-center"
            priority
          />
        </motion.div>

        {/* Warm cinematic overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(160deg, rgba(12,11,10,0.80) 0%, rgba(30,18,6,0.60) 40%, rgba(20,14,5,0.65) 65%, rgba(12,11,10,0.85) 100%)",
          }}
          aria-hidden="true"
        />
        {/* Gold warmth from bottom */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 110%, rgba(201,169,110,0.22) 0%, transparent 55%)",
          }}
          aria-hidden="true"
        />
      </motion.div>

      {/* ─── Floating Ambient Orbs (Framer Motion) ────────────── */}
      {!reducedMotion && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <motion.div
            className="absolute w-72 h-72 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(201,169,110,0.10) 0%, transparent 70%)", top: "15%", left: "8%" }}
            animate={{ y: [0, -22, 0], x: [0, 10, 0] }}
            transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute w-96 h-96 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(201,169,110,0.07) 0%, transparent 70%)", bottom: "10%", right: "6%" }}
            animate={{ y: [0, 18, 0], x: [0, -12, 0] }}
            transition={{ duration: 8.5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
          <motion.div
            className="absolute w-48 h-48 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(255,200,120,0.06) 0%, transparent 70%)", top: "60%", left: "55%" }}
            animate={{ y: [0, -14, 0] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          />
        </div>
      )}

      {/* ─── Hero Content with Parallax ───────────────────────── */}
      <motion.div
        className="relative z-10 max-w-5xl mx-auto px-5 sm:px-8 text-center"
        style={reducedMotion ? {} : { y: contentY }}
      >
        {/* Brand mark */}
        <motion.div
          initial={{ opacity: 0, y: reducedMotion ? 0 : 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: dur, ease: "easeOut" }}
          className="mb-8 flex justify-center"
        >
          <Logo
            size="hero"
            priority
            className="drop-shadow-[0_6px_40px_rgba(0,0,0,0.55)]"
          />
        </motion.div>

        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: reducedMotion ? 0 : 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: dur, delay: reducedMotion ? 0 : 0.06, ease: "easeOut" }}
          className="inline-flex items-center gap-2.5 mb-8"
        >
          <hr className="gold-rule" aria-hidden="true" />
          <span className="font-sans text-xs font-semibold tracking-[0.18em] text-gold uppercase">
            Tours &amp; Transportation · Anaheim · Southern California
          </span>
          <hr className="gold-rule" aria-hidden="true" />
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: reducedMotion ? 0 : 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: dur, delay: del + 0.06, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-[4.75rem] font-semibold text-white leading-[1.05] tracking-tight"
        >
          Anaheim&rsquo;s Premier
          <br />
          <em className="not-italic text-gold">Tours &amp; Transportation</em>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: reducedMotion ? 0 : 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: dur, delay: del + 0.18, ease: "easeOut" }}
          className="mt-7 font-sans text-lg sm:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed"
        >
          Airport transfers, Disneyland transportation, LA tours, private tours,
          and group transportation across Southern California &mdash; from one
          trusted local team based in Anaheim.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: reducedMotion ? 0 : 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: dur, delay: del + 0.28, ease: "easeOut" }}
          className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <motion.div whileHover={reducedMotion ? {} : { scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/transportation/book"
              className="inline-flex items-center justify-center gap-2 px-9 py-4 bg-gold text-ink font-sans font-bold text-base rounded-full shadow-lg shadow-gold/30 transition-colors duration-200 hover:bg-gold-dark cursor-pointer focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-charcoal"
            >
              Book Transportation
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </motion.div>
          <motion.div whileHover={reducedMotion ? {} : { scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="#tours"
              className="inline-flex items-center justify-center gap-2 px-9 py-4 border border-white/40 text-white font-sans font-medium text-base rounded-full backdrop-blur-sm bg-white/5 transition-colors duration-200 hover:border-white/70 hover:bg-white/12 cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/40 focus:ring-offset-2 focus:ring-offset-charcoal"
            >
              Explore Tours
            </Link>
          </motion.div>
        </motion.div>

        {/* Trust strip — staggered entrance */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.1, delayChildren: del + 0.5 } },
          }}
          className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-5 sm:gap-8"
        >
          {[
            {
              icon: <Stars />,
              label: "5.0 Google Rating",
            },
            {
              icon: (
                <svg className="w-4 h-4 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              ),
              label: "Hotel Pickup Available",
            },
            {
              icon: (
                <svg className="w-4 h-4 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
              label: "500+ Happy Guests",
            },
            {
              icon: (
                <svg className="w-4 h-4 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              ),
              label: "Family Friendly",
            },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              variants={{
                hidden: { opacity: 0, y: 10 },
                show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
              }}
              className="flex items-center gap-2"
            >
              {i > 0 && <span className="hidden sm:block w-px h-4 bg-white/20 mr-3" aria-hidden="true" />}
              {item.icon}
              <span className="font-sans text-sm text-white/65 font-medium">{item.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Animated scroll mouse */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        aria-hidden="true"
      >
        <div className="w-6 h-9 rounded-full border border-white/30 flex items-start justify-center pt-1.5">
          <motion.div
            className="w-1 h-2 rounded-full bg-gold/80"
            animate={reducedMotion ? {} : { y: [0, 14, 0], opacity: [1, 0, 1] }}
            transition={{ duration: 1.45, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </motion.div>
    </section>
  );
}
