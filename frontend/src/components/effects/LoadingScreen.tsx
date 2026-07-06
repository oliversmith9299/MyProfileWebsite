"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

/** One-time boot screen: monogram draws in, then the page reveals. */
export function LoadingScreen() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDone(true), 1400);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-[--color-bg]"
          exit={{ opacity: 0, transition: { duration: 0.6, ease: "easeInOut" } }}
          aria-hidden
        >
          <div className="flex flex-col items-center gap-6">
            <motion.div
              className="relative flex h-20 w-20 items-center justify-center rounded-2xl ring-spin"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <span className="font-[family-name:var(--font-display)] text-3xl font-bold text-gradient">
                AH
              </span>
            </motion.div>
            <motion.p
              className="font-[family-name:var(--font-mono)] text-xs tracking-[0.3em] text-[--color-ink-faint] uppercase"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0.4, 1] }}
              transition={{ duration: 1.2 }}
            >
              initializing ai systems
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
