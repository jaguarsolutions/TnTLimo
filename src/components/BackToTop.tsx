"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > window.innerHeight * 1.5);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const onClick = () => {
    window.scrollTo({
      top: 0,
      behavior: reducedMotion ? "auto" : "smooth",
    });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          onClick={onClick}
          aria-label="Back to top"
          initial={{ opacity: 0, y: 16, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.9 }}
          transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
          whileHover={reducedMotion ? undefined : { y: -2 }}
          whileTap={{ scale: 0.94 }}
          className="fixed bottom-6 right-5 z-40 hidden lg:flex items-center justify-center w-11 h-11 rounded-full bg-white/95 backdrop-blur-md border border-border text-ink shadow-lg cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
          style={{ transitionTimingFunction: "var(--ease-out-quint)" }}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.4}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
