"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { stagger, fadeUp, viewport } from "@/lib/motionVariants";
import { SITE_IMAGES } from "@/lib/siteImages";
import { SITE_PRICING, formatAdultChildPrice } from "@/lib/sitePricing";
import { PEEK_BOOKING_URL } from "@/lib/siteBooking";

const services = [
  {
    id: "best-of-la",
    title: "Full-Day LA & Hollywood Tour",
    subtitle: "Departing from Anaheim",
    badge: "Most Popular",
    description:
      "The complete Los Angeles experience — purpose-built for guests staying in the Anaheim area. Hollywood Walk of Fame, Beverly Hills, Griffith Observatory, the Sunset Strip, and more. All with a knowledgeable local guide who brings the city to life.",
    highlights: [
      "Hotel pickup from Anaheim included",
      "Hollywood, Beverly Hills, Griffith Park & coast",
      "Small group — never a crowded bus",
      "Typical pickup 8:00–8:15 AM · Return ~5:00 PM",
    ],
    badges: ["Hotel Pickup", "Small Group", "Local Guide"],
    duration: "Full day",
    priceAnchor: formatAdultChildPrice(
      SITE_PRICING.fullDayTour.adult,
      SITE_PRICING.fullDayTour.child
    ),
    cta: "Book Now",
    learnMore: "/los-angeles-hollywood-tour-from-anaheim",
    bg: SITE_IMAGES.hollywoodSignHills,
    bgLabel: "Hollywood Sign above the hills",
    overlay: "linear-gradient(to top, rgba(30,18,6,0.90) 0%, rgba(30,18,6,0.45) 55%, transparent 100%)",
    accentColor: "#C9A96E",
    locationTag: "Starting: Anaheim, CA",
  },
  {
    id: "private-la",
    title: "Private LA & Hollywood Tour",
    subtitle: "From LA or Orange County",
    badge: "Fully Private",
    description:
      "Los Angeles, exactly the way you want it. Fully private and tailored to your group — choose your stops, set your pace, and enjoy a VIP day through Hollywood, Beverly Hills, Santa Monica, and beyond. Perfect for families and special occasions.",
    highlights: [
      "100% private — just your group",
      "Custom length & stops (e.g. 6–7 hrs)",
      "Movie-star homes & Rodeo add-ons for small groups",
      "Airport dropoff available after tour — ask us",
    ],
    badges: ["100% Private", "Customizable", "Family Friendly"],
    duration: "6–7+ hrs (custom)",
    priceAnchor: `6–7 hr tour · from $${SITE_PRICING.privateTour6to7Hr[0].price} (1–4 guests, per group)`,
    cta: "Book Now",
    learnMore: "/private-los-angeles-tour",
    bg: SITE_IMAGES.griffithSunsetAerial,
    bgLabel: "Griffith Observatory and the Los Angeles skyline at sunset",
    overlay: "linear-gradient(to top, rgba(6,14,30,0.90) 0%, rgba(6,14,30,0.45) 55%, transparent 100%)",
    accentColor: "#7BAFD4",
    locationTag: "Starting: LA or Orange County",
  },
  {
    id: "universal-transport",
    title: "Universal Studios Transportation",
    subtitle: "Roundtrip from Anaheim",
    badge: "Roundtrip",
    description:
      "Skip the parking, skip the stress. We pick you up in Anaheim, drop you off at Universal Studios Hollywood, and bring you back at the end of the day — comfortable, reliable, and on time every time.",
    highlights: [
      "Door-to-door from your Anaheim hotel",
      "Air-conditioned premium vehicle",
      "Pickup 8:00–8:15 AM · Return from Universal 6:00–7:00 PM",
      "Ideal for families & larger groups",
    ],
    badges: ["Roundtrip", "Hotel Pickup", "Stress-Free"],
    duration: "Full day",
    priceAnchor: `Roundtrip transport · from $${SITE_PRICING.universalRoundTripTransport[0].price} (1–4 guests, per group)`,
    cta: "Book Now",
    learnMore: "/universal-studios-transportation-anaheim",
    bg: SITE_IMAGES.universalGlobe,
    bgLabel: "Universal Studios Hollywood globe at night",
    overlay: "linear-gradient(to top, rgba(16,8,30,0.90) 0%, rgba(16,8,30,0.45) 55%, transparent 100%)",
    accentColor: "#B49CC9",
    locationTag: "Starting: Anaheim, CA",
  },
];

const CheckIcon = () => (
  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

export default function Services() {
  return (
    <section id="tours" className="py-24 bg-cream" aria-label="LA Tours">
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
              Tours
            </span>
            <hr className="gold-rule" aria-hidden="true" />
          </div>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-ink leading-tight">
            LA tours,<br />
            <span className="text-gold">guided by locals.</span>
          </h2>
          <p className="mt-5 font-sans text-muted text-base max-w-xl mx-auto leading-relaxed">
            Best of LA, fully private experiences, and Universal Studios transportation &mdash;
            all with hotel pickup from Anaheim and an expert local guide.
          </p>
        </motion.div>

        {/* Cards */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={viewport}
          className="grid grid-cols-1 lg:grid-cols-3 gap-7"
        >
          {services.map((svc) => (
            <motion.article
              key={svc.id}
              variants={fadeUp}
              whileHover={{
                y: -8,
                transition: { duration: 0.3, ease: [0.23, 1, 0.32, 1] },
              }}
              className="group relative rounded-3xl overflow-hidden border border-border shadow-[0_4px_16px_-6px_rgba(12,11,10,0.10)] hover:shadow-[0_18px_38px_-12px_rgba(12,11,10,0.22)] transition-shadow duration-300 cursor-pointer flex flex-col bg-white"
              style={{ transitionTimingFunction: "var(--ease-out-quint)" }}
              aria-label={svc.title}
            >
              {/* Photo header */}
              <div className="relative h-56 overflow-hidden">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{ backgroundImage: `url(${svc.bg})` }}
                  role="img"
                  aria-label={svc.bgLabel}
                />
                <div className="absolute inset-0" style={{ background: svc.overlay }} aria-hidden="true" />

                {/* Badges row */}
                <div className="absolute top-4 left-4 right-4 flex items-start justify-between z-10">
                  <span
                    className="inline-block px-3 py-1 rounded-full text-xs font-sans font-semibold tracking-wide backdrop-blur-sm"
                    style={{
                      backgroundColor: `${svc.accentColor}22`,
                      borderWidth: 1,
                      borderStyle: "solid",
                      borderColor: `${svc.accentColor}66`,
                      color: svc.accentColor,
                    }}
                  >
                    {svc.badge}
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-sans text-xs text-white/70 backdrop-blur-sm bg-black/20 px-2.5 py-1 rounded-full">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                      <circle cx="12" cy="12" r="10" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
                    </svg>
                    {svc.duration}
                  </span>
                </div>

                {/* Location pill at bottom */}
                <div className="absolute bottom-4 left-4 z-10 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <svg className="w-3.5 h-3.5 shrink-0" style={{ color: svc.accentColor }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="font-sans text-xs text-white/80">{svc.locationTag}</span>
                </div>
              </div>

              {/* Card body */}
              <div className="flex flex-col flex-1 bg-white p-7">
                <p className="font-sans text-xs font-semibold tracking-widest text-muted uppercase mb-2">
                  {svc.subtitle}
                </p>
                <h3 className="font-display text-2xl font-semibold text-ink leading-snug mb-3">
                  {svc.title}
                </h3>
                <p className="font-sans text-sm text-muted leading-relaxed mb-4">
                  {svc.description}
                </p>

                {/* Value badges */}
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {svc.badges.map((b) => (
                    <span
                      key={b}
                      className="inline-block px-2.5 py-1 rounded-full font-sans text-[11px] font-semibold bg-sand border border-border text-muted"
                    >
                      {b}
                    </span>
                  ))}
                </div>

                <ul className="space-y-2 mb-6" aria-label="Tour highlights">
                  {svc.highlights.map((h) => (
                    <li key={h} className="flex items-center gap-2.5 text-sm font-sans text-ink/80">
                      <span style={{ color: svc.accentColor }}><CheckIcon /></span>
                      {h}
                    </li>
                  ))}
                </ul>

                {/* Price anchor */}
                <div className="mb-6 pt-4 border-t border-border">
                  <p className="font-display text-xl font-semibold text-ink">
                    {svc.priceAnchor}
                  </p>
                  <p className="font-sans text-xs text-muted mt-0.5">Contact us for exact pricing</p>
                </div>

                <div className="mt-auto flex gap-3">
                  <Link
                    href={PEEK_BOOKING_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/cta flex-1 inline-flex items-center justify-center gap-1.5 px-5 py-3 bg-ink text-white font-sans text-sm font-semibold rounded-full transition-colors duration-200 hover:bg-charcoal active:scale-[0.97] cursor-pointer focus:outline-none focus:ring-2 focus:ring-ink focus:ring-offset-2"
                  >
                    {svc.cta}
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
                    href={svc.learnMore}
                    className="inline-flex items-center justify-center px-5 py-3 border border-border text-muted font-sans text-sm rounded-full transition-colors duration-200 hover:border-ink hover:text-ink active:scale-[0.97] cursor-pointer"
                  >
                    Learn More
                  </Link>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={viewport}
          className="text-center mt-10 font-sans text-sm text-muted"
        >
          All tours available year-round · Small groups guaranteed.{" "}
          <Link href="#contact" className="text-gold hover:text-gold-dark underline underline-offset-2 cursor-pointer transition-colors">
            Contact us
          </Link>{" "}
          to discuss the right experience for your group.
        </motion.p>
      </div>
    </section>
  );
}
