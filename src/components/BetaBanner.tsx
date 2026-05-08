"use client";

import { useState, useSyncExternalStore } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SITE_CONTACT } from "@/lib/siteContact";

const STORAGE_KEY = "tnt-beta-banner-dismissed";

/** Subscribe to localStorage so the banner reflects the persisted dismiss state without
 *  reading window during render (hydration-safe via useSyncExternalStore). */
function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}
function getSnapshot() {
  return window.localStorage.getItem(STORAGE_KEY) === "1";
}
function getServerSnapshot() {
  return true; // SSR: assume dismissed so the banner only appears post-hydration
}

export default function BetaBanner() {
  const dismissed = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [localDismissed, setLocalDismissed] = useState(false);
  const visible = !dismissed && !localDismissed;

  const dismiss = () => {
    window.localStorage.setItem(STORAGE_KEY, "1");
    setLocalDismissed(true);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
          className="fixed bottom-3 left-3 z-[55] flex items-center gap-3 rounded-full bg-ink/95 backdrop-blur-md text-white shadow-[0_10px_30px_-12px_rgba(12,11,10,0.6)] pl-4 pr-1.5 py-1.5 max-w-[calc(100vw-1.5rem)]"
          role="status"
          aria-label="Beta environment notice"
        >
          <span className="inline-flex items-center gap-2 font-sans text-xs">
            <span className="inline-flex items-center gap-1.5 font-semibold uppercase tracking-[0.18em] text-gold">
              <span
                className="inline-block w-1.5 h-1.5 rounded-full bg-gold animate-pulse"
                aria-hidden="true"
              />
              Beta
            </span>
            <span className="hidden sm:inline text-white/70">
              Testing site &mdash; feedback to{" "}
              <a
                href={`mailto:${SITE_CONTACT.email}?subject=${encodeURIComponent("[BETA] Site feedback")}`}
                className="underline underline-offset-2 hover:text-white transition-colors"
              >
                {SITE_CONTACT.email}
              </a>
            </span>
            <span className="sm:hidden text-white/70">Testing site</span>
          </span>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss beta notice"
            className="inline-flex items-center justify-center w-7 h-7 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.4}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6l-12 12" />
            </svg>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
