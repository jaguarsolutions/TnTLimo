"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { stagger, fadeUp, viewport } from "@/lib/motionVariants";

type RelatedService = {
  title: string;
  description: string;
  href: string;
  bg: string;
  badge: string;
};

type Props = { services: RelatedService[] };

export default function RelatedServices({ services }: Props) {
  return (
    <section className="py-20 bg-sand border-t border-border" aria-label="Other services">
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
              Explore More
            </span>
            <hr className="gold-rule" aria-hidden="true" />
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink">
            Other Experiences You May Love
          </h2>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={viewport}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {services.map((svc) => (
            <motion.div
              key={svc.href}
              variants={fadeUp}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <Link
                href={svc.href}
                className="group block relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                aria-label={svc.title}
              >
                {/* Background image */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{ backgroundImage: `url(${svc.bg})` }}
                  aria-hidden="true"
                />
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(to top, rgba(12,11,10,0.90) 0%, rgba(12,11,10,0.40) 55%, transparent 100%)" }}
                  aria-hidden="true"
                />
                <div className="relative z-10 p-7 pt-28 md:pt-36">
                  <span className="inline-block mb-3 px-2.5 py-1 rounded-full text-[10px] font-sans font-semibold tracking-wider border border-gold/40 text-gold bg-gold/10">
                    {svc.badge}
                  </span>
                  <h3 className="font-display text-2xl font-semibold text-white mb-2">
                    {svc.title}
                  </h3>
                  <p className="font-sans text-sm text-white/65 leading-relaxed mb-4 max-w-xs">
                    {svc.description}
                  </p>
                  <span className="inline-flex items-center gap-1.5 font-sans text-sm text-gold font-medium group-hover:gap-3 transition-all duration-200">
                    Learn more
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
