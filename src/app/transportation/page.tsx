import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TransportationServiceCard from "@/components/transportation/TransportationServiceCard";
import { SectionHeading } from "@/components/transportation/TransportationSection";
import { SITE_IMAGES } from "@/lib/siteImages";
import { TRANSPORTATION_SERVICES, TRANSPORTATION_OVERVIEW_CARDS } from "@/lib/transportationData";

export default function TransportationPage() {
  return (
    <>
      <Header />
      <main className="bg-cream text-ink">
        <section className="relative overflow-hidden pt-36 pb-20 sm:pt-44">
          {/* Photo background — extends behind the fixed header */}
          <img
            src={SITE_IMAGES.santaMonicaPalms}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          {/* Cinematic overlay matched to homepage hero */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(160deg, rgba(12,11,10,0.82) 0%, rgba(30,18,6,0.62) 40%, rgba(20,14,5,0.66) 65%, rgba(12,11,10,0.86) 100%)",
            }}
            aria-hidden="true"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at 50% 110%, rgba(201,169,110,0.22) 0%, transparent 55%)",
            }}
            aria-hidden="true"
          />
          <div className="relative mx-auto max-w-6xl px-5 sm:px-8 lg:px-12">
            <div className="rounded-[2rem] border border-white/15 bg-black/55 p-10 sm:p-14 text-white shadow-2xl backdrop-blur-md">
              <span className="inline-flex items-center gap-2 rounded-full bg-gold/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-gold">
                Transportation services
              </span>
              <h1 className="mt-6 max-w-3xl font-display text-4xl md:text-5xl font-semibold leading-tight">
                Anaheim transportation made easy for airport travelers, families, and convention groups.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/80">
                Modern private transfers, point-to-point rides, and hourly charter service crafted to fit the same warm, premium TNT Tours experience visitors already trust.
              </p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/transportation/book"
                  className="inline-flex items-center justify-center rounded-full bg-gold px-7 py-3 text-sm font-semibold text-ink transition-colors hover:bg-gold-dark"
                >
                  Start booking
                </Link>
                <Link
                  href="#services"
                  className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 px-7 py-3 text-sm font-semibold text-white transition-colors hover:border-white hover:bg-white/15"
                >
                  Explore services
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section id="services" className="py-20 bg-sand">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-12">
            <SectionHeading
              eyebrow="Our transportation"
              title="Three safe, comfortable ways to travel with TNT."
              description="Choose the service that matches your arrival, itinerary, and group size. All services are designed for airport guests, family groups, and convention travelers."
            />

            <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {TRANSPORTATION_SERVICES.map((service) => (
                <TransportationServiceCard
                  key={service.code}
                  code={service.code}
                  title={service.title}
                  description={service.description}
                  href={service.href}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-cream">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-12">
            <SectionHeading
              eyebrow="Why choose transportation"
              title="A modern booking experience built to feel like the rest of TNT Tours."
              description="Responsive, travel-friendly, and mobile-first — the new transportation experience preserves the same warm brand voice and premium tone as TNT Tours."
            />

            <div className="mt-14 grid gap-6 lg:grid-cols-3">
              {TRANSPORTATION_OVERVIEW_CARDS.map((card) => (
                <div
                  key={card.title}
                  className="rounded-[2rem] border border-border bg-white p-7 shadow-[0_4px_16px_-6px_rgba(12,11,10,0.10)] transition-shadow duration-300 hover:shadow-[0_18px_38px_-12px_rgba(12,11,10,0.18)]"
                >
                  <span className="inline-flex rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
                    {card.badge}
                  </span>
                  <h3 className="mt-5 font-display text-2xl font-semibold text-ink">{card.title}</h3>
                  <p className="mt-4 text-sm text-muted leading-relaxed">{card.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-sand">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-12 grid gap-10 lg:grid-cols-2">
            <article className="rounded-[2rem] border border-border bg-white p-10 shadow-[0_4px_16px_-6px_rgba(12,11,10,0.10)]">
              <h2 className="font-display text-3xl font-semibold text-ink">Airport transfers with easy arrival timelines</h2>
              <p className="mt-5 text-sm text-muted leading-relaxed">
                From SNA to LAX and beyond, our airport transfer experience is designed for families, corporate travelers, and anyone arriving into Southern California who wants a calm, comfortable first impression.
              </p>
              <ul className="mt-8 space-y-4 text-sm text-ink">
                <li>Door-to-door pickup and drop-off at hotels, resorts, conference venues, or private addresses.</li>
                <li>Meet & greet available for fast arrivals and baggage assistance.</li>
                <li>Round-trip options for return flights and group departures.</li>
              </ul>
            </article>
            <article className="rounded-[2rem] border border-border bg-white p-10 shadow-[0_4px_16px_-6px_rgba(12,11,10,0.10)]">
              <h2 className="font-display text-3xl font-semibold text-ink">Disneyland hotels and convention venues</h2>
              <p className="mt-5 text-sm text-muted leading-relaxed">
                Whether you&apos;re staying near Disneyland, attending a convention in Anaheim, or moving between LA attractions, our transportation service provides easy scheduling, luggage capacity, and reliable local drivers.
              </p>
              <ul className="mt-8 space-y-4 text-sm text-ink">
                <li>Flexible stop planning for hotel pickups, theme park drop-offs, and event venues.</li>
                <li>Family-friendly vehicles with room for luggage and optional child seats.</li>
                <li>Personal support from an experienced local transportation team.</li>
              </ul>
            </article>
          </div>
        </section>

        <section className="py-20 bg-charcoal text-white">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-12">
            <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center">
              <div>
                <div className="inline-flex items-center gap-2.5 mb-4">
                  <hr className="gold-rule" aria-hidden="true" />
                  <span className="font-sans text-xs font-semibold tracking-[0.18em] text-gold uppercase">
                    Book Now
                  </span>
                </div>
                <h2 className="font-display text-3xl md:text-4xl font-semibold text-white">Ready to book your ride?</h2>
                <p className="mt-5 text-sm text-white/70 leading-relaxed max-w-lg">
                  Start a transportation booking wizard focused only on transfers and charters. This experience is separate from Peek tour checkout and built to grow into full payment and reservation support.
                </p>
              </div>
              <div className="flex items-center justify-center lg:justify-end">
                <Link
                  href="/transportation/book"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gold px-8 py-4 text-sm font-semibold text-ink transition-colors hover:bg-gold-dark active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-charcoal"
                >
                  Start Transportation Booking
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
