"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { stagger, fadeUp, slideLeft, slideRight, viewport } from "@/lib/motionVariants";
import { SITE_IMAGES } from "@/lib/siteImages";
import { GROUP_OVER_12_CALL_TEXT, SITE_PRICING } from "@/lib/sitePricing";
import { SITE_CONTACT } from "@/lib/siteContact";
import { PEEK_BOOKING_URL } from "@/lib/siteBooking";

const whyBetter = [
  {
    title: "No $45+ Parking Fee",
    desc: "Universal Studios parking adds up fast, especially for families. Skip it entirely.",
    icon: "💰",
  },
  {
    title: "No Freeway Navigation",
    desc: "The 101 toward Universal City can be unpredictable. We know exactly how to time it.",
    icon: "🗺️",
  },
  {
    title: "No Rideshare Uncertainty",
    desc: "Rideshares surge in price and availability on busy days. We're confirmed before you leave.",
    icon: "📱",
  },
  {
    title: "Start and End Relaxed",
    desc: "A comfortable, coordinated ride means you arrive energized — and return without the hassle.",
    icon: "😌",
  },
];

const included = [
  "Hotel pickup from Anaheim & neighboring cities — typically 8:00–8:15 AM",
  "Roundtrip transportation to Universal Studios Hollywood",
  "Return pickup from Universal — typically 6:00–7:00 PM",
  "Comfortable air-conditioned premium vehicle",
  "Professional, punctual driver",
  "Pre-trip communication and timing confirmation",
];

const perfectFor = [
  { label: "Families with Kids", desc: "No car seats to wrangle in rideshares. Just comfortable, stress-free door-to-door service." },
  { label: "First-Time Visitors", desc: "Never been to LA? Don't navigate alone. We take care of logistics so you can enjoy." },
  { label: "Disneyland-Area Guests", desc: "Staying near Disneyland? Universal is a natural next stop — and we make it effortless." },
  { label: "Groups Who Want Simplicity", desc: "Coordinating a group? Having one vehicle and one plan makes everything easier." },
];

const steps = [
  { num: "01", title: "Book Your Trip", desc: "Contact us with your preferred date, group size, and hotel location." },
  { num: "02", title: "Confirm Your Pickup", desc: "We coordinate a pickup time that works for your day and confirm all details." },
  { num: "03", title: "Enjoy the Ride", desc: "Step outside your hotel and into a comfortable vehicle. We handle everything." },
  { num: "04", title: "Return Comfortably", desc: "When you're ready to head back, we're there. Relaxed end to a long day." },
];

export default function UniversalContent() {
  return (
    <>
      {/* Overview + Included */}
      <section className="py-16 bg-cream">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div variants={slideLeft} initial="hidden" whileInView="show" viewport={viewport}>
              <div className="inline-flex items-center gap-2.5 mb-4">
                <hr className="gold-rule" aria-hidden="true" />
                <span className="font-sans text-xs font-semibold tracking-[0.18em] text-gold uppercase">The Service</span>
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink mb-5">
                Simple, Reliable, Comfortable
              </h2>
              <p className="font-sans text-muted text-base leading-relaxed mb-4">
                This is straightforward transportation done right. We pick you up at your Anaheim hotel, drive you to Universal Studios Hollywood, and bring you back at the end of the day.
              </p>
              <p className="font-sans text-muted text-base leading-relaxed mb-6">
                No parking fees, no GPS, no rideshare surprises. Just a comfortable, professional service that takes one logistical headache completely off your plate — so you can focus on the fun.
              </p>
              <div className="flex gap-4 flex-wrap">
                {["Roundtrip", "Hotel Pickup", "Family Friendly", "Premium Vehicle"].map((b) => (
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
                  <p className="font-display text-lg font-semibold text-ink mb-3">
                    Universal round-trip · transportation only · per group
                  </p>
                  <ul className="space-y-2 mb-4">
                    {SITE_PRICING.universalRoundTripTransport.map((row) => (
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
                  <p className="font-sans text-xs text-muted">
                    Questions? {SITE_CONTACT.phoneDisplay} · {SITE_CONTACT.email}
                  </p>
                  <Link
                    href={PEEK_BOOKING_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 block w-full text-center px-6 py-3 bg-ink text-white font-sans font-semibold text-sm rounded-full hover:bg-charcoal transition-colors cursor-pointer"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Better Than Driving */}
      <section className="py-20 bg-charcoal">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={viewport} className="text-center mb-12">
            <div className="inline-flex items-center gap-2.5 mb-4">
              <hr className="gold-rule" aria-hidden="true" />
              <span className="font-sans text-xs font-semibold tracking-[0.18em] text-gold uppercase">Why It&apos;s Worth It</span>
              <hr className="gold-rule" aria-hidden="true" />
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-white">Better Than Driving Yourself</h2>
            <p className="mt-3 font-sans text-white/55 max-w-md mx-auto text-base leading-relaxed">
              Every guest who books our transportation service tells us the same thing — they wish they&apos;d done it sooner.
            </p>
          </motion.div>
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={viewport}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {whyBetter.map((item) => (
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

      {/* Perfect For */}
      <section className="py-20 bg-sand border-y border-border">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={viewport} className="text-center mb-12">
            <div className="inline-flex items-center gap-2.5 mb-4">
              <hr className="gold-rule" aria-hidden="true" />
              <span className="font-sans text-xs font-semibold tracking-[0.18em] text-gold uppercase">Who It&apos;s For</span>
              <hr className="gold-rule" aria-hidden="true" />
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink">Perfect For Every Group</h2>
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
            <motion.div variants={slideRight} initial="hidden" whileInView="show" viewport={viewport} className="lg:order-2">
              <div className="inline-flex items-center gap-2.5 mb-4">
                <hr className="gold-rule" aria-hidden="true" />
                <span className="font-sans text-xs font-semibold tracking-[0.18em] text-gold uppercase">The Vehicle</span>
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink mb-4">
                Arrive Comfortable, Leave Happy
              </h2>
              <p className="font-sans text-muted text-base leading-relaxed mb-4">
                Our spacious premium vehicles are the opposite of a cramped rideshare or a crowded shuttle. Leather seating, climate control, and room for your whole group — we may use our own vans or trusted partner vehicles in the same luxury class.
              </p>
              <p className="font-sans text-muted text-base leading-relaxed">
                You&apos;ll start your Universal Studios day the right way — rested, comfortable, and looking forward to what&apos;s ahead.
                Photos show your destination and the LA region we serve.
              </p>
            </motion.div>
            <motion.div variants={slideLeft} initial="hidden" whileInView="show" viewport={viewport} className="lg:order-1 flex flex-col gap-5">
              <div className="relative rounded-2xl overflow-hidden shadow-lg" style={{ aspectRatio: "16/9" }}>
                <Image
                  src={SITE_IMAGES.universalGlobe}
                  alt="Universal Studios Hollywood globe at night — your destination"
                  fill className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent" aria-hidden="true" />
                <p className="absolute bottom-3 left-4 font-sans text-xs text-white/90">Universal Studios Hollywood — where your day begins</p>
              </div>
              <div className="relative rounded-2xl overflow-hidden shadow-lg" style={{ aspectRatio: "4/3" }}>
                <Image
                  src={SITE_IMAGES.hero}
                  alt="Downtown Los Angeles skyline at twilight — roundtrip service from Anaheim"
                  fill className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent" aria-hidden="true" />
                <p className="absolute bottom-3 left-4 font-sans text-xs text-white/90">Comfortable transport across LA &amp; Orange County</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-sand border-t border-border">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={viewport} className="text-center mb-14">
            <div className="inline-flex items-center gap-2.5 mb-4">
              <hr className="gold-rule" aria-hidden="true" />
              <span className="font-sans text-xs font-semibold tracking-[0.18em] text-gold uppercase">The Process</span>
              <hr className="gold-rule" aria-hidden="true" />
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink">Simple from Start to Finish</h2>
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
        </div>
      </section>
    </>
  );
}
