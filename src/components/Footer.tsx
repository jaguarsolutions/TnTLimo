"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { fadeUp, stagger, viewport } from "@/lib/motionVariants";
import Logo from "@/components/Logo";
import { SITE_CONTACT } from "@/lib/siteContact";

const quickLinks = [
  { label: "Home", href: "/#home" },
  { label: "Reviews", href: "/#reviews" },
  { label: "FAQ", href: "/#faq" },
  { label: "Service area", href: "/#service-area" },
  { label: "Contact", href: "/#contact" },
];

const transportationLinks = [
  { label: "All transportation", href: "/transportation" },
  { label: "Airport Transfers", href: "/transportation/airport-transfer" },
  { label: "Disneyland & Hotel", href: "/transportation/disneyland-transportation" },
  { label: "Point-to-Point", href: "/transportation/point-to-point" },
  { label: "Hourly Charter", href: "/transportation/hourly-charter" },
];

const tourLinks = [
  { label: "Best of LA & Hollywood", href: "/los-angeles-hollywood-tour-from-anaheim" },
  { label: "Private LA Tour", href: "/private-los-angeles-tour" },
  { label: "Universal Studios Transportation", href: "/universal-studios-transportation-anaheim" },
];

export default function Footer() {
  return (
    <footer className="bg-charcoal text-white/80 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={viewport}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10"
        >
          {/* Brand column */}
          <motion.div variants={fadeUp} className="lg:col-span-2">
            <Logo
              size="footer"
              className="drop-shadow-[0_2px_16px_rgba(0,0,0,0.35)]"
            />
            <p className="mt-4 font-sans text-sm leading-relaxed text-white/60 max-w-xs">
              Anaheim&apos;s premier tours &amp; transportation service. Airport
              transfers, Disneyland transportation, LA tours, private tours, and
              group transportation across Southern California.
            </p>
            {/* Social icons */}
            <div className="flex gap-4 mt-6">
              {[
                {
                  label: "Facebook",
                  href: "#",
                  icon: (
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
                      <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                    </svg>
                  ),
                },
                {
                  label: "Instagram",
                  href: "#",
                  icon: (
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-2" aria-hidden="true">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <circle cx="12" cy="12" r="4" />
                      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                    </svg>
                  ),
                },
                {
                  label: "TripAdvisor",
                  href: "#",
                  icon: (
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                    </svg>
                  ),
                },
              ].map((s) => (
                <Link
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-9 h-9 flex items-center justify-center rounded-full border border-white/20 text-white/60 hover:text-gold hover:border-gold transition-colors duration-200 cursor-pointer"
                >
                  {s.icon}
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Transportation */}
          <motion.div variants={fadeUp}>
            <h3 className="font-sans text-xs font-semibold uppercase tracking-widest text-white/40 mb-5">
              Transportation
            </h3>
            <ul className="space-y-3">
              {transportationLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="font-sans text-sm text-white/60 hover:text-gold transition-colors duration-200 cursor-pointer"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Tours */}
          <motion.div variants={fadeUp}>
            <h3 className="font-sans text-xs font-semibold uppercase tracking-widest text-white/40 mb-5">
              Tours
            </h3>
            <ul className="space-y-3">
              {tourLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="font-sans text-sm text-white/60 hover:text-gold transition-colors duration-200 cursor-pointer"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <h3 className="font-sans text-xs font-semibold uppercase tracking-widest text-white/40 mt-8 mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="font-sans text-sm text-white/60 hover:text-gold transition-colors duration-200 cursor-pointer"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div variants={fadeUp}>
            <h3 className="font-sans text-xs font-semibold uppercase tracking-widest text-white/40 mb-5">
              Get in Touch
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <svg className="w-4 h-4 text-gold mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="font-sans text-sm text-white/60">
                  Serving Anaheim, Los Angeles<br />& Orange County, CA
                </span>
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-4 h-4 text-gold shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <Link href={`mailto:${SITE_CONTACT.email}`} className="font-sans text-sm text-white/60 hover:text-gold transition-colors">
                  {SITE_CONTACT.email}
                </Link>
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-4 h-4 text-gold shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <Link href={SITE_CONTACT.phoneHref} className="font-sans text-sm text-white/60 hover:text-gold transition-colors">
                  {SITE_CONTACT.phoneDisplay}
                </Link>
              </li>
            </ul>

            {/* Review badges */}
            <div className="mt-6 flex gap-3">
              <div className="px-3 py-2 rounded-lg border border-white/10 text-center">
                <div className="flex gap-0.5 justify-center">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-3 h-3 fill-gold" viewBox="0 0 20 20" aria-hidden="true">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="font-sans text-[10px] text-white/50 mt-0.5">Google</p>
              </div>
              <div className="px-3 py-2 rounded-lg border border-white/10 text-center">
                <div className="flex gap-0.5 justify-center">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-3 h-3 fill-gold" viewBox="0 0 20 20" aria-hidden="true">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="font-sans text-[10px] text-white/50 mt-0.5">TripAdvisor</p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-sans text-xs text-white/30 text-center sm:text-left">
            © {new Date().getFullYear()} TNT Tours. All rights reserved.
            <span className="mx-2">·</span>
            Serving Los Angeles, Anaheim & Orange County
          </p>
          <div className="flex gap-4">
            <Link href="#" className="font-sans text-xs text-white/30 hover:text-white/60 transition-colors cursor-pointer">
              Privacy Policy
            </Link>
            <Link href="#" className="font-sans text-xs text-white/30 hover:text-white/60 transition-colors cursor-pointer">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
