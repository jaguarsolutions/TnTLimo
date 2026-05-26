"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { stagger, fadeUp, slideLeft, slideRight, viewport } from "@/lib/motionVariants";
import { SITE_IMAGES } from "@/lib/siteImages";
import { SITE_PRICING, formatAdultChildPrice } from "@/lib/sitePricing";
import { PEEK_BOOKING_URL } from "@/lib/siteBooking";

const stops = [
  {
    name: "Hollywood Walk of Fame",
    desc: "Walk alongside the stars — literally. See the famous terrazzo stars of Hollywood legends and take in the energy of one of LA's most iconic streets.",
    bg: SITE_IMAGES.walkOfFameOliverStone,
  },
  {
    name: "Beverly Hills",
    desc: "Cruise through the most famous zip code in the world. Rodeo Drive, the luxury boutiques, and the architecture speak for themselves.",
    bg: SITE_IMAGES.beverlyHillsSign,
  },
  {
    name: "Griffith Observatory",
    desc: "The best Hollywood Sign viewpoint in the city. Sweeping panoramas of Los Angeles, the observatory itself, and Griffith Park.",
    bg: SITE_IMAGES.griffithObservatoryApproach,
  },
  {
    name: "The Sunset Strip",
    desc: "Drive the legendary Sunset Boulevard through West Hollywood. Rock music history, iconic billboards, and pure LA culture.",
    bg: SITE_IMAGES.waltDisneyConcertHall,
  },
  {
    name: "Santa Monica",
    desc: "End your day at the Pacific Ocean. The pier, the beach, the breeze — a perfect finale to a full LA experience.",
    bg: SITE_IMAGES.santaMonicaYachtHarborSign,
  },
  {
    name: "And More",
    desc: "Our guides know the best vantage points, hidden gems, and timing tricks that make the difference between a good tour and a great one.",
    bg: SITE_IMAGES.tclChineseTheatre,
  },
];

const included = [
  { icon: "📍", label: "Hotel pickup from Anaheim area (typically 7:45–8:00 AM)" },
  { icon: "🎤", label: "Expert local guide throughout" },
  { icon: "🚐", label: "Comfortable air-conditioned vehicle" },
  { icon: "🏙️", label: "Downtown LA pass-by — Disney Concert Hall, Music Center, Crypto.com Arena area" },
  { icon: "🔭", label: "Griffith Park & Observatory — Hollywood Sign views" },
  { icon: "⭐", label: "Hollywood Walk of Fame & TCL Chinese Theatre" },
  { icon: "🌆", label: "Sunset Strip & Beverly Hills / Rodeo Drive" },
  { icon: "🥙", label: "Lunch stop — Original Farmers Market & The Grove" },
  { icon: "🎡", label: "Santa Monica Pier, Venice Beach & Marina del Rey" },
  { icon: "🕐", label: "Return to Anaheim between 5:30 and 6:00 PM (typical full day)" },
];

const whyChoose = [
  {
    title: "No Driving in LA Traffic",
    desc: "Los Angeles traffic is notorious. Sit back, enjoy the ride, and let us navigate while you take it all in.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
      </svg>
    ),
  },
  {
    title: "Pickup Right From Your Hotel",
    desc: "Staying near Disneyland? We come to you. No shuttles, no rideshare confusion — just step outside and we handle everything.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    title: "Small Group — Personal Attention",
    desc: "We keep groups intentionally small. You'll get real interaction with your guide and the flexibility that big bus tours can never offer.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    title: "Local Knowledge That Makes a Difference",
    desc: "Our guides know the best viewpoints, the quieter hours, the stories behind the landmarks, and the hidden spots tourists miss.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    ),
  },
];

export default function LAHollywoodContent() {
  return (
    <>
      {/* Overview */}
      <section className="py-16 bg-cream">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div variants={slideLeft} initial="hidden" whileInView="show" viewport={viewport}>
              <div className="inline-flex items-center gap-2.5 mb-4">
                <hr className="gold-rule" aria-hidden="true" />
                <span className="font-sans text-xs font-semibold tracking-[0.18em] text-gold uppercase">Overview</span>
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink leading-tight mb-5">
                The Best of Los Angeles in One Full Day
              </h2>
              <p className="font-sans text-muted text-base leading-relaxed mb-4">
                This tour was built specifically for guests staying in the Anaheim and Orange County area who want to experience Los Angeles without the stress of renting a car, navigating freeways, or paying for parking.
              </p>
              <p className="font-sans text-muted text-base leading-relaxed mb-6">
                We pick you up directly from your hotel, spend the day exploring the most iconic neighborhoods and landmarks in the city, and drop you back off by evening. Your guide will bring LA to life with stories, local knowledge, and genuine enthusiasm for the city.
              </p>
              <div className="flex items-center gap-4">
                <div className="text-center px-5 py-3 rounded-xl bg-sand border border-border">
                  <p className="font-display text-3xl font-semibold text-gold">5★</p>
                  <p className="font-sans text-xs text-muted mt-0.5">Rated</p>
                </div>
                <div className="w-px h-10 bg-border" />
                <div className="text-center px-5 py-3 rounded-xl bg-sand border border-border">
                  <p className="font-display text-3xl font-semibold text-gold">~9h</p>
                  <p className="font-sans text-xs text-muted mt-0.5">8 AM → ~5 PM</p>
                </div>
                <div className="w-px h-10 bg-border" />
                <div className="text-center px-5 py-3 rounded-xl bg-sand border border-border">
                  <p className="font-display text-3xl font-semibold text-gold">SG</p>
                  <p className="font-sans text-xs text-muted mt-0.5">Small Group</p>
                </div>
              </div>
            </motion.div>

            <motion.div variants={slideRight} initial="hidden" whileInView="show" viewport={viewport}>
              <div className="bg-white rounded-2xl border border-border p-7">
                <h3 className="font-display text-xl font-semibold text-ink mb-5">What&apos;s Included</h3>
                <ul className="space-y-3">
                  {included.map((item) => (
                    <li key={item.label} className="flex items-center gap-3">
                      <span className="text-lg" aria-hidden="true">{item.icon}</span>
                      <span className="font-sans text-sm text-ink/80">{item.label}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 pt-5 border-t border-border">
                  <p className="font-display text-2xl font-semibold text-ink">
                    {formatAdultChildPrice(SITE_PRICING.fullDayTour.adult, SITE_PRICING.fullDayTour.child)}{" "}
                    <span className="text-base font-sans font-normal text-muted">per person</span>
                  </p>
                  <p className="font-sans text-xs text-muted mt-1">Taxes may apply · confirm availability when you book</p>
                  <Link
                    href={PEEK_BOOKING_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 block w-full text-center px-6 py-3 bg-ink text-white font-sans font-semibold text-sm rounded-full hover:bg-charcoal transition-colors cursor-pointer"
                  >
                    Book This Tour
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Tour Stops */}
      <section className="py-20 bg-sand border-y border-border">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={viewport} className="text-center mb-12">
            <div className="inline-flex items-center gap-2.5 mb-4">
              <hr className="gold-rule" aria-hidden="true" />
              <span className="font-sans text-xs font-semibold tracking-[0.18em] text-gold uppercase">The Highlights</span>
              <hr className="gold-rule" aria-hidden="true" />
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink">Where We Take You</h2>
            <p className="mt-3 font-sans text-muted max-w-lg mx-auto text-base leading-relaxed">
              Six iconic Los Angeles destinations, curated for the best possible day in the city.
            </p>
          </motion.div>
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={viewport}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {stops.map((stop) => (
              <motion.div
                key={stop.name}
                variants={fadeUp}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group relative rounded-2xl overflow-hidden cursor-default"
                style={{ height: 220 }}
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{ backgroundImage: `url(${stop.bg})` }}
                  aria-hidden="true"
                />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(12,11,10,0.92) 0%, rgba(12,11,10,0.35) 50%, transparent 100%)" }} aria-hidden="true" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <h3 className="font-display text-lg font-semibold text-white mb-1">{stop.name}</h3>
                  <p className="font-sans text-xs text-white/65 leading-relaxed">{stop.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Why Choose */}
      <section className="py-20 bg-charcoal">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={viewport} className="text-center mb-12">
            <div className="inline-flex items-center gap-2.5 mb-4">
              <hr className="gold-rule" aria-hidden="true" />
              <span className="font-sans text-xs font-semibold tracking-[0.18em] text-gold uppercase">Why Choose This Tour</span>
              <hr className="gold-rule" aria-hidden="true" />
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-white">Built for Anaheim Visitors</h2>
            <p className="mt-3 font-sans text-white/55 max-w-lg mx-auto text-base leading-relaxed">
              Most Disneyland visitors miss LA entirely. This tour makes it effortless.
            </p>
          </motion.div>
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={viewport}
            className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {whyChoose.map((item) => (
              <motion.div key={item.title} variants={fadeUp}
                className="p-6 rounded-2xl border border-white/8 bg-white/4">
                <div className="w-11 h-11 rounded-xl bg-gold/10 flex items-center justify-center text-gold mb-4">
                  {item.icon}
                </div>
                <h3 className="font-display text-xl font-semibold text-white mb-2">{item.title}</h3>
                <p className="font-sans text-sm text-white/55 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Vehicle Section */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <motion.div variants={slideLeft} initial="hidden" whileInView="show" viewport={viewport}>
              <div className="inline-flex items-center gap-2.5 mb-4">
                <hr className="gold-rule" aria-hidden="true" />
                <span className="font-sans text-xs font-semibold tracking-[0.18em] text-gold uppercase">The Vehicle</span>
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink mb-4">
                Ride in Comfort from Anaheim to LA
              </h2>
              <p className="font-sans text-muted text-base leading-relaxed mb-4">
                Our small-group vehicles are designed for comfort. Luxury leather seating, climate control, and panoramic windows — so you can enjoy the scenery without the stress.
              </p>
              <p className="font-sans text-muted text-base leading-relaxed">
                This is not a coach bus. This is your private-feeling group vehicle for the day.
                Photos below show a glimpse of the LA icons you&apos;ll see on tour.
              </p>
            </motion.div>
            <motion.div variants={slideRight} initial="hidden" whileInView="show" viewport={viewport} className="flex flex-col gap-5">
              <div className="relative rounded-2xl overflow-hidden shadow-lg" style={{ aspectRatio: "4/3" }}>
                <Image
                  src={SITE_IMAGES.walkOfFameOliverStone}
                  alt="Hollywood Walk of Fame star on the sidewalk — a signature sight on TNT Tours"
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent" aria-hidden="true" />
                <p className="absolute bottom-3 left-4 font-sans text-xs text-white/90">Hollywood Walk of Fame — classic LA sightseeing</p>
              </div>
              <div className="relative rounded-2xl overflow-hidden shadow-lg" style={{ aspectRatio: "16/9" }}>
                <Image
                  src={SITE_IMAGES.griffithObservatoryApproach}
                  alt="Griffith Observatory and Astronomers Monument — panoramic views on many TNT Tours itineraries"
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent" aria-hidden="true" />
                <p className="absolute bottom-3 left-4 font-sans text-xs text-white/90">Griffith Observatory — sweeping views over the city</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
