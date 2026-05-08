"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { stagger, fadeUp, slideLeft, slideRight, viewport } from "@/lib/motionVariants";
import { SITE_IMAGES } from "@/lib/siteImages";
import { GROUP_OVER_12_CALL_TEXT, SITE_PRICING } from "@/lib/sitePricing";
import { SITE_CONTACT } from "@/lib/siteContact";
import { PEEK_BOOKING_URL } from "@/lib/siteBooking";

const whyPrivate = [
  {
    title: "No Strangers on Your Tour",
    desc: "The vehicle is yours. No shared space, no waiting on other guests, no compromised itinerary.",
    icon: "🔒",
  },
  {
    title: "Go at Your Own Pace",
    desc: "Love a neighborhood? Stay longer. Want to skip a stop? No problem. The day bends to you.",
    icon: "⏱️",
  },
  {
    title: "Completely Custom Itinerary",
    desc: "Tell us what you want to see, and we build the day around it — including stops no group tour visits.",
    icon: "🗺️",
  },
  {
    title: "Perfect for Special Occasions",
    desc: "Anniversaries, birthdays, celebrations — a private tour elevates any milestone into a memory.",
    icon: "✨",
  },
];

const included = [
  "Exclusive use of the vehicle — just your group",
  "Hotel pickup from Anaheim area",
  "Expert local guide for the full day",
  "Fully customizable itinerary",
  "Roundtrip transportation — we bring you home",
  "Pre-trip planning and coordination",
  "Comfortable climate-controlled premium vehicle",
];

const destinations = [
  {
    name: "Hollywood Walk of Fame",
    sub: "Hollywood",
    desc: "The iconic stars, TCL Chinese Theatre, and the heart of classic Hollywood.",
    bg: SITE_IMAGES.walkOfFameOliverStone,
  },
  {
    name: "Beverly Hills & Rodeo Drive",
    sub: "Beverly Hills",
    desc: "World-famous luxury shopping, stunning mansions, and picture-perfect streets.",
    bg: SITE_IMAGES.beverlyHillsSign,
  },
  {
    name: "Griffith Observatory",
    sub: "Griffith Park",
    desc: "Sweeping panoramic views of LA and the iconic Hollywood Sign backdrop.",
    bg: SITE_IMAGES.griffithObservatoryApproach,
  },
  {
    name: "Santa Monica & the Pier",
    sub: "Santa Monica",
    desc: "Pacific Ocean views, the famous pier, and the end of Route 66.",
    bg: SITE_IMAGES.santaMonicaYachtHarborSign,
  },
  {
    name: "Sunset Strip & West Hollywood",
    sub: "West Hollywood",
    desc: "Legendary music venues, celebrity hotspots, and the Sunset Boulevard scene.",
    bg: SITE_IMAGES.waltDisneyConcertHall,
  },
  {
    name: "Your Custom Stop",
    sub: "Your Choice",
    desc: "A neighborhood, a viewpoint, a restaurant — if you have something in mind, we'll make it happen.",
    bg: SITE_IMAGES.hollywoodSignHills,
  },
];

const perfectFor = [
  {
    label: "Families",
    desc: "Move at kid-friendly speed. Spend more time at what the kids love, skip what they don't.",
  },
  {
    label: "Couples & Special Occasions",
    desc: "Anniversaries, honeymoons, proposals — a private tour creates the space for a truly special day.",
  },
  {
    label: "Groups of Friends",
    desc: "One vehicle, one plan, zero compromises. Everyone travels together and stays together.",
  },
  {
    label: "First-Time Visitors",
    desc: "See LA the right way on your first trip — with an expert guide and no logistics to figure out.",
  },
];

const steps = [
  { num: "01", title: "Tell Us What You Want", desc: "Share your group size, travel dates, and the experiences that matter most to you." },
  { num: "02", title: "We Build Your Day", desc: "We design a customized itinerary around your preferences and confirm all the details." },
  { num: "03", title: "We Pick You Up", desc: "Step outside your hotel. Your private vehicle and guide are ready and waiting." },
  { num: "04", title: "Experience LA, Your Way", desc: "Explore freely, at your pace, with a knowledgeable guide. We handle everything else." },
];

export default function PrivateTourContent() {
  return (
    <>
      {/* Overview + Included */}
      <section className="py-16 bg-cream">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div variants={slideLeft} initial="hidden" whileInView="show" viewport={viewport}>
              <div className="inline-flex items-center gap-2.5 mb-4">
                <hr className="gold-rule" aria-hidden="true" />
                <span className="font-sans text-xs font-semibold tracking-[0.18em] text-gold uppercase">The Experience</span>
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink mb-5">
                Los Angeles, Built Around You
              </h2>
              <p className="font-sans text-muted text-base leading-relaxed mb-4">
                The private tour is the complete opposite of a crowded bus tour. It&apos;s your vehicle, your guide, and your itinerary — designed entirely around what your group wants to see and do.
              </p>
              <p className="font-sans text-muted text-base leading-relaxed mb-4">
                Whether you don&apos;t need a full 8–9 hour day or you want to focus on specific neighborhoods, we&apos;ll customize the tour to fit your schedule. Smaller groups can add movie-star home drives and Rodeo shopping; have a late flight? We can often drop you at LAX, SNA, or other area airports after your tour.
              </p>
              <p className="font-sans text-muted text-base leading-relaxed mb-6">
                Whether you&apos;re celebrating a milestone, traveling with family, or simply want the freedom to explore on your own terms, this is the way to do Los Angeles right.
              </p>
              <div className="flex gap-4 flex-wrap">
                {["100% Private", "Hotel Pickup", "Fully Custom", "Expert Guide"].map((b) => (
                  <span key={b} className="inline-block px-3 py-1.5 rounded-full font-sans text-xs font-semibold bg-sand border border-border text-muted">
                    {b}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.div variants={slideRight} initial="hidden" whileInView="show" viewport={viewport}>
              <div className="bg-white rounded-2xl border border-border p-7">
                <h3 className="font-display text-xl font-semibold text-ink mb-5">What&apos;s Included</h3>
                <ul className="space-y-3 mb-6">
                  {included.map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <svg className="w-4 h-4 shrink-0 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="font-sans text-sm text-ink/80">{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="pt-5 border-t border-border">
                  <p className="font-display text-lg font-semibold text-ink mb-3">6–7 hour private tour · per group</p>
                  <ul className="space-y-2 mb-4">
                    {SITE_PRICING.privateTour6to7Hr.map((row) => (
                      <li
                        key={row.guests}
                        className="flex justify-between gap-4 font-sans text-sm text-ink/90 border-b border-border/60 pb-2 last:border-0"
                      >
                        <span>{row.guests} guests</span>
                        <span className="font-semibold tabular-nums">${row.price}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="font-sans text-xs text-muted mb-3">{GROUP_OVER_12_CALL_TEXT}</p>
                  <p className="font-sans text-xs text-muted mb-3">
                    Longer full-day itineraries and custom routes are quoted on request. Call{" "}
                    <a href={SITE_CONTACT.phoneHref} className="text-gold hover:underline">
                      {SITE_CONTACT.phoneDisplay}
                    </a>{" "}
                    or email{" "}
                    <a href={`mailto:${SITE_CONTACT.email}`} className="text-gold hover:underline">
                      {SITE_CONTACT.email}
                    </a>
                    .
                  </p>
                  <Link
                    href={PEEK_BOOKING_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 block w-full text-center px-6 py-3 bg-ink text-white font-sans font-semibold text-sm rounded-full hover:bg-charcoal transition-colors cursor-pointer"
                  >
                    Book This Tour
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Private */}
      <section className="py-20 bg-charcoal">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={viewport} className="text-center mb-12">
            <div className="inline-flex items-center gap-2.5 mb-4">
              <hr className="gold-rule" aria-hidden="true" />
              <span className="font-sans text-xs font-semibold tracking-[0.18em] text-gold uppercase">Why Private</span>
              <hr className="gold-rule" aria-hidden="true" />
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-white">Why Choose a Private Tour?</h2>
            <p className="mt-3 font-sans text-white/55 max-w-md mx-auto text-base leading-relaxed">
              Group tours follow a schedule. Private tours follow you.
            </p>
          </motion.div>
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={viewport}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {whyPrivate.map((item) => (
              <motion.div key={item.title} variants={fadeUp}
                className="p-6 rounded-2xl border border-white/8 bg-white/4 text-center">
                <div className="text-3xl mb-4" aria-hidden="true">{item.icon}</div>
                <h3 className="font-display text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="font-sans text-sm text-white/55 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={viewport} className="text-center mb-12">
            <div className="inline-flex items-center gap-2.5 mb-4">
              <hr className="gold-rule" aria-hidden="true" />
              <span className="font-sans text-xs font-semibold tracking-[0.18em] text-gold uppercase">Where We Go</span>
              <hr className="gold-rule" aria-hidden="true" />
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink">Popular Private Tour Highlights</h2>
            <p className="mt-3 font-sans text-muted max-w-md mx-auto text-base leading-relaxed">
              These are the stops guests love most — but your itinerary is entirely up to you.
            </p>
          </motion.div>
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={viewport}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {destinations.map((dest) => (
              <motion.div key={dest.name} variants={fadeUp}
                className="relative rounded-2xl overflow-hidden group" style={{ aspectRatio: "4/3" }}>
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url('${dest.bg}')` }}
                  aria-hidden="true"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" aria-hidden="true" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <p className="font-sans text-xs font-semibold text-gold/90 uppercase tracking-widest mb-1">{dest.sub}</p>
                  <h3 className="font-display text-xl font-semibold text-white mb-1">{dest.name}</h3>
                  <p className="font-sans text-sm text-white/70 leading-relaxed">{dest.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Perfect For */}
      <section className="py-20 bg-sand border-y border-border">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={viewport} className="text-center mb-12">
            <div className="inline-flex items-center gap-2.5 mb-4">
              <hr className="gold-rule" aria-hidden="true" />
              <span className="font-sans text-xs font-semibold tracking-[0.18em] text-gold uppercase">Who It&apos;s For</span>
              <hr className="gold-rule" aria-hidden="true" />
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink">Designed Around Your Group</h2>
          </motion.div>
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={viewport}
            className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {perfectFor.map((item) => (
              <motion.div key={item.label} variants={fadeUp}
                className="flex gap-4 p-6 bg-white rounded-2xl border border-border">
                <div className="w-2 rounded-full bg-gold/40 shrink-0 mt-1" aria-hidden="true" />
                <div>
                  <h3 className="font-display text-lg font-semibold text-ink mb-1">{item.label}</h3>
                  <p className="font-sans text-sm text-muted leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Vehicle Section */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <motion.div variants={slideLeft} initial="hidden" whileInView="show" viewport={viewport} className="lg:order-2">
              <div className="inline-flex items-center gap-2.5 mb-4">
                <hr className="gold-rule" aria-hidden="true" />
                <span className="font-sans text-xs font-semibold tracking-[0.18em] text-gold uppercase">The Vehicle</span>
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink mb-4">
                Premium Comfort for Your Entire Group
              </h2>
              <p className="font-sans text-muted text-base leading-relaxed mb-4">
                Your private tour is served in a comfortable luxury vehicle — the same quality our guests rate five stars for comfort. We may use our own vans or trusted partner vehicles in the same luxury class. Custom leather seating, LED ambient lighting, and climate control throughout.
              </p>
              <p className="font-sans text-muted text-base leading-relaxed mb-6">
                It&apos;s not just a vehicle — it&apos;s part of the experience. Arrive at every stop looking the part, and travel between them in genuine comfort.
                Photos below show destinations you can include on a private day — not the vehicle itself.
              </p>
              <ul className="space-y-2">
                {[
                  "Premium vehicle — spacious & comfortable",
                  "Custom Luxury Leather Seating",
                  "Climate-Controlled Throughout",
                  "LED Ambient Lighting",
                  "Spacious for Groups of All Sizes",
                ].map((feat) => (
                  <li key={feat} className="flex items-center gap-3">
                    <svg className="w-4 h-4 shrink-0 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="font-sans text-sm text-ink/80">{feat}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div variants={slideRight} initial="hidden" whileInView="show" viewport={viewport} className="lg:order-1 flex flex-col gap-5">
              <div className="relative rounded-2xl overflow-hidden shadow-lg" style={{ aspectRatio: "4/3" }}>
                <Image
                  src={SITE_IMAGES.walkOfFameOliverStone}
                  alt="Hollywood Walk of Fame — a favorite private tour stop with TNT Tours"
                  fill className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent" aria-hidden="true" />
                <p className="absolute bottom-3 left-4 font-sans text-xs text-white/90">Hollywood Walk of Fame — tailored to your pace</p>
              </div>
              <div className="relative rounded-2xl overflow-hidden shadow-lg" style={{ aspectRatio: "16/9" }}>
                <Image
                  src={SITE_IMAGES.griffithObservatoryApproach}
                  alt="Griffith Observatory and the Astronomers Monument — panoramic private tour views"
                  fill className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent" aria-hidden="true" />
                <p className="absolute bottom-3 left-4 font-sans text-xs text-white/90">Griffith Observatory &amp; the LA skyline</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Planning Process */}
      <section className="py-20 bg-sand border-t border-border">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={viewport} className="text-center mb-14">
            <div className="inline-flex items-center gap-2.5 mb-4">
              <hr className="gold-rule" aria-hidden="true" />
              <span className="font-sans text-xs font-semibold tracking-[0.18em] text-gold uppercase">The Process</span>
              <hr className="gold-rule" aria-hidden="true" />
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink">Easy Planning from Start to Finish</h2>
            <p className="mt-3 font-sans text-muted max-w-sm mx-auto text-base leading-relaxed">
              We make it simple to book, plan, and enjoy your private day in LA.
            </p>
          </motion.div>
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={viewport}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <motion.div key={step.num} variants={fadeUp} className="flex flex-col items-center text-center">
                <div className="relative mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-white border border-border flex items-center justify-center shadow-sm">
                    <span className="font-display text-2xl font-semibold text-gold">{step.num}</span>
                  </div>
                </div>
                <h3 className="font-display text-xl font-semibold text-ink mb-2">{step.title}</h3>
                <p className="font-sans text-sm text-muted leading-relaxed max-w-[200px]">{step.desc}</p>
                {i < steps.length - 1 && (
                  <div className="mt-6 w-px h-8 bg-gradient-to-b from-border to-transparent sm:hidden" aria-hidden="true" />
                )}
              </motion.div>
            ))}
          </motion.div>
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={viewport} className="text-center mt-12">
            <Link href="/#contact" className="inline-flex items-center gap-2 font-sans text-sm font-semibold text-gold hover:text-gold/80 transition-colors">
              Have a special request? Contact us directly
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
