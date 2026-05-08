import type { Variants } from "framer-motion";

/** Fade up — default section reveal */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  },
};

/** Fade in — no vertical movement */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: 0.55, ease: "easeOut" },
  },
};

/** Stagger container */
export const stagger: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
  },
};

/** Stagger container — faster */
export const staggerFast: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0 },
  },
};

/** Slide in from left */
export const slideLeft: Variants = {
  hidden: { opacity: 0, x: -30 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

/** Slide in from right */
export const slideRight: Variants = {
  hidden: { opacity: 0, x: 30 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

/** Shared viewport settings */
export const viewport = { once: true, margin: "-80px" } as const;
