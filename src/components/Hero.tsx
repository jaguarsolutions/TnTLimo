"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { SITE_IMAGES } from "@/lib/siteImages";

type Row = {
  title: string;
  subtitle: string;
  href: string;
  cta: string;
  icon?: React.ReactNode;
  thumb?: string;
};

const transportationRows: Row[] = [
  {
    title: "Airport Transfers",
    subtitle: "LAX, SNA, LGB & more",
    href: "/transportation/airport-transfer",
    cta: "Book Now",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.5 19h17M10 5l1-1.5h2L14 5l5 4v3l-9-2-3 4H4l1.5-3L4 9l3-1 3-3z" />
      </svg>
    ),
  },
  {
    title: "Hourly Charter",
    subtitle: "By the hour, on your schedule",
    href: "/transportation/hourly-charter",
    cta: "Book Now",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 2" />
      </svg>
    ),
  },
  {
    title: "Point to Point",
    subtitle: "Direct rides to any destination",
    href: "/transportation/point-to-point",
    cta: "Book Now",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <circle cx="12" cy="11" r="2.5" />
      </svg>
    ),
  },
];

const tourRows: Row[] = [
  {
    title: "Best of Los Angeles & Hollywood",
    subtitle: "See LA's most iconic sights",
    href: "/los-angeles-hollywood-tour-from-anaheim",
    cta: "Book Tour",
    thumb: SITE_IMAGES.hollywoodSignHills,
  },
  {
    title: "Private Tour LA",
    subtitle: "Your LA. Your way.",
    href: "/private-los-angeles-tour",
    cta: "Book Tour",
    thumb: SITE_IMAGES.griffithSunsetAerial,
  },
  {
    title: "Universal Studios",
    subtitle: "Stress-free transportation from Anaheim",
    href: "/universal-studios-transportation-anaheim",
    cta: "Book Tour",
    thumb: SITE_IMAGES.universalGlobe,
  },
];

const Stars = () => (
  <div className="flex gap-0.5" aria-hidden="true">
    {[...Array(5)].map((_, i) => (
      <svg key={i} className="w-3.5 h-3.5 fill-gold" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

const ChevronRight = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

function BookingCard({
  eyebrowIcon,
  title,
  subtitle,
  rows,
  variant,
}: {
  eyebrowIcon: React.ReactNode;
  title: string;
  subtitle: string;
  rows: Row[];
  variant: "transport" | "tours";
}) {
  return (
    <div className="rounded-[22px] bg-white/90 backdrop-blur-xl border border-white/55 shadow-[0_24px_60px_-22px_rgba(12,11,10,0.38)] overflow-hidden">
      {/* Card header — same gold-rule accent on both cards balances the
          Transportation card (which leads with gold CTA buttons) against the
          Tours card so neither feels like the secondary option. */}
      <div className="px-5 sm:px-6 pt-4 pb-3.5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-ink text-gold shrink-0">
            {eyebrowIcon}
          </div>
          <div className="min-w-0">
            <h3 className="font-display text-xl sm:text-[1.4rem] font-semibold text-ink leading-tight tracking-tight">
              {title}
            </h3>
            <p className="font-sans text-xs sm:text-[13px] text-muted leading-snug">{subtitle}</p>
          </div>
        </div>
        <hr className="gold-rule mt-3" aria-hidden="true" />
      </div>

      {/* Rows */}
      <ul className="divide-y divide-border/70">
        {rows.map((row) => (
          <li key={row.title}>
            <Link
              href={row.href}
              className="group flex items-center gap-3 sm:gap-4 px-5 sm:px-6 py-3 sm:py-3.5 transition-colors duration-200 hover:bg-sand/70 focus:outline-none focus-visible:bg-sand/70 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold"
            >
              {/* Leading icon or thumb */}
              {row.thumb ? (
                <div className="relative h-10 w-10 sm:h-11 sm:w-11 shrink-0 overflow-hidden rounded-lg ring-1 ring-border">
                  <Image
                    src={row.thumb}
                    alt=""
                    fill
                    sizes="44px"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
              ) : (
                <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center shrink-0 rounded-lg bg-ink text-gold">
                  {row.icon}
                </div>
              )}

              {/* Text */}
              <div className="min-w-0 flex-1">
                <p className="font-sans text-sm sm:text-[15px] font-semibold text-ink leading-snug">
                  {row.title}
                </p>
                <p className="font-sans text-xs sm:text-[13px] text-muted leading-snug">
                  {row.subtitle}
                </p>
              </div>

              {/* CTA */}
              <span
                className={
                  variant === "transport"
                    ? "inline-flex shrink-0 items-center gap-1 rounded-full bg-gold px-3.5 sm:px-4 py-2 font-sans text-[11px] sm:text-xs font-bold uppercase tracking-wider text-ink shadow-sm transition-all duration-200 group-hover:bg-gold-dark group-hover:translate-x-0.5"
                    : "inline-flex shrink-0 items-center gap-1 rounded-full border border-ink/80 bg-white px-3.5 sm:px-4 py-2 font-sans text-[11px] sm:text-xs font-bold uppercase tracking-wider text-ink transition-all duration-200 group-hover:bg-ink group-hover:text-white group-hover:translate-x-0.5"
                }
              >
                {row.cta}
                <ChevronRight />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Hero() {
  const reducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const dur = reducedMotion ? 0 : 0.75;
  const del = reducedMotion ? 0 : 0.15;

  // Content parallax only applies on lg+, where the brand message and cards
  // sit side-by-side in one viewport. On narrow widths they stack to ~1500px
  // and translating that block downward would push the bottom card row out of
  // the visible section. Default `false` to match SSR.
  const [isLg, setIsLg] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsLg(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

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
      className="relative min-h-svh"
      aria-label="Hero — TNT Tours Transportation & Tours"
    >
      {/* ─── Background Photo with Ken Burns + Parallax ───────── */}
      {/* Wrapper owns `overflow-hidden` so the Ken-Burns scale stays inside
          the section — but the hero content itself is *not* clipped, so
          stacked cards on narrow viewports never get cut off. */}
      <motion.div
        className="absolute inset-0 overflow-hidden"
        style={reducedMotion ? {} : { scale: photoScale }}
      >
        <motion.div
          className="absolute inset-0"
          animate={reducedMotion ? {} : { scale: [1, 1.07] }}
          transition={{ duration: 10, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" }}
        >
          <Image
            src={SITE_IMAGES.heroSuvAnaheim}
            alt="TNT Tours black SUV at the Anaheim Convention Center at golden hour"
            fill
            className="object-cover object-center"
            priority
          />
        </motion.div>

        {/* Cinematic overlay — darker on left for text contrast, fading right so the sunset + SUV + convention center stay visible behind the floating cards */}
        <div
          className="absolute inset-0 hidden lg:block"
          style={{
            background:
              "linear-gradient(100deg, rgba(8,12,22,0.88) 0%, rgba(10,14,28,0.62) 30%, rgba(12,14,28,0.18) 55%, rgba(12,14,28,0.10) 100%)",
          }}
          aria-hidden="true"
        />
        {/* Mobile overlay — stronger and uniform, since the text stacks above the cards over the full image */}
        <div
          className="absolute inset-0 lg:hidden"
          style={{
            background:
              "linear-gradient(180deg, rgba(8,12,22,0.82) 0%, rgba(10,14,28,0.70) 55%, rgba(8,12,22,0.88) 100%)",
          }}
          aria-hidden="true"
        />
        {/* Subtle bottom-vignette to anchor the section across all breakpoints */}
        <div
          className="absolute inset-x-0 bottom-0 h-40 hidden lg:block"
          style={{
            background:
              "linear-gradient(to top, rgba(8,12,22,0.65) 0%, transparent 100%)",
          }}
          aria-hidden="true"
        />
        {/* Gold warmth from bottom-left to lift the sunset palette */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 25% 105%, rgba(224,122,74,0.20) 0%, rgba(201,169,110,0.10) 30%, transparent 60%)",
          }}
          aria-hidden="true"
        />
      </motion.div>

      {/* ─── Floating Ambient Orbs ────────────────────────────── */}
      {/* Also self-clipped so the orbs never bleed into adjacent sections. */}
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

      {/* ─── Hero Content ─────────────────────────────────────── */}
      {/* `min-h-svh` on the grid so the content stretches to viewport height on
          desktop but is free to grow on narrow widths where cards stack.
          Parallax `y` only applies on lg+ — see `isLg` comment above. */}
      <motion.div
        className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 pt-24 pb-20 sm:pt-28 sm:pb-24 lg:pt-32 lg:pb-28 min-h-svh grid grid-cols-1 lg:grid-cols-[1.05fr_minmax(0,1fr)] gap-10 lg:gap-14 xl:gap-20 lg:items-center"
        style={reducedMotion || !isLg ? {} : { y: contentY }}
      >
        {/* ─── LEFT — Brand message + CTAs ─────────────────── */}
        <div className="text-center lg:text-left">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: reducedMotion ? 0 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: dur, delay: reducedMotion ? 0 : 0.06, ease: "easeOut" }}
            className="inline-flex items-center gap-2.5 mb-6"
          >
            <hr className="gold-rule" aria-hidden="true" />
            <span className="font-sans text-[11px] sm:text-xs font-semibold tracking-[0.18em] text-gold uppercase">
              Anaheim · Los Angeles
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: reducedMotion ? 0 : 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: dur, delay: del + 0.06, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-[2.25rem] sm:text-[2.75rem] lg:text-[3.5rem] xl:text-[4rem] font-semibold text-white leading-[1.06] tracking-tight"
          >
            Private Transportation
            <span className="block mt-1.5">
              &amp; <span className="text-gold">Southern California Tours</span>
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: reducedMotion ? 0 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: dur, delay: del + 0.18, ease: "easeOut" }}
            className="mt-6 font-sans text-base sm:text-lg text-white/75 max-w-xl mx-auto lg:mx-0 leading-relaxed"
          >
            Airport transfers, hourly charters, point-to-point transportation, and
            unforgettable Los Angeles experiences &mdash; all with friendly local
            service and hotel pickup available.
          </motion.p>

          {/* Trust statement — small, brighter than body, elegant italic line.
              Sits between the subheadline and the booking actions to reassure
              before the CTA. */}
          <motion.p
            initial={{ opacity: 0, y: reducedMotion ? 0 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: dur, delay: del + 0.24, ease: "easeOut" }}
            className="mt-5 font-display italic text-[15px] sm:text-base text-white/90 max-w-xl mx-auto lg:mx-0 leading-relaxed"
          >
            Trusted by thousands of Southern California visitors for airport
            transfers, private transportation, and guided tours.
          </motion.p>

          {/* Google review badge — stars + 5.0 rating + happy-guests count,
              placed directly above the CTAs as the final piece of social proof
              before the user commits. */}
          <motion.div
            initial={{ opacity: 0, y: reducedMotion ? 0 : 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: dur, delay: del + 0.30, ease: "easeOut" }}
            className="mt-5 inline-flex flex-wrap items-center justify-center lg:justify-start gap-x-3 gap-y-2 rounded-full border border-white/15 bg-white/8 backdrop-blur-sm px-4 py-2"
          >
            <span className="flex items-center gap-1.5">
              <Stars />
              <span className="font-sans text-sm font-semibold text-white">5.0 Google Rating</span>
            </span>
            <span className="h-3.5 w-px bg-white/25" aria-hidden="true" />
            <span className="font-sans text-sm text-white/80">500+ Happy Guests</span>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: reducedMotion ? 0 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: dur, delay: del + 0.36, ease: "easeOut" }}
            className="mt-7 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start"
          >
            <motion.div whileHover={reducedMotion ? {} : { scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/transportation/book"
                className="inline-flex items-center justify-center gap-2 px-7 sm:px-8 py-3.5 sm:py-4 bg-gold text-ink font-sans font-bold text-sm sm:text-base rounded-full shadow-lg shadow-gold/30 transition-colors duration-200 hover:bg-gold-dark cursor-pointer focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-charcoal"
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
                className="inline-flex items-center justify-center gap-2 px-7 sm:px-8 py-3.5 sm:py-4 border border-white/45 text-white font-sans font-medium text-sm sm:text-base rounded-full backdrop-blur-sm bg-white/5 transition-colors duration-200 hover:border-white/75 hover:bg-white/12 cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/40 focus:ring-offset-2 focus:ring-offset-charcoal"
              >
                Explore Tours
              </Link>
            </motion.div>
          </motion.div>

        </div>

        {/* ─── RIGHT — Booking cards ───────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: reducedMotion ? 0 : 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: dur, delay: del + 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col gap-4 sm:gap-5 w-full max-w-xl mx-auto lg:max-w-none"
        >
          <BookingCard
            variant="transport"
            title="Book Transportation"
            subtitle="Fast, private rides on your schedule."
            rows={transportationRows}
            eyebrowIcon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13l2-7h14l2 7M5 13h14m-14 0v6a1 1 0 001 1h2a1 1 0 001-1v-2h8v2a1 1 0 001 1h2a1 1 0 001-1v-6" />
                <circle cx="8" cy="16" r="1.4" fill="currentColor" />
                <circle cx="16" cy="16" r="1.4" fill="currentColor" />
              </svg>
            }
          />

          <BookingCard
            variant="tours"
            title="Explore Tours"
            subtitle="Choose your Southern California experience."
            rows={tourRows}
            eyebrowIcon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h1.586a1 1 0 00.707-.293l1.414-1.414A1 1 0 019.414 5h5.172a1 1 0 01.707.293l1.414 1.414A1 1 0 0017.414 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <circle cx="12" cy="13" r="3.5" />
              </svg>
            }
          />
        </motion.div>
      </motion.div>

      {/* Animated scroll mouse — hidden on mobile, where it would crowd the cards */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.6 }}
        className="hidden lg:flex absolute bottom-6 left-1/2 -translate-x-1/2 flex-col items-center gap-2 z-10"
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
