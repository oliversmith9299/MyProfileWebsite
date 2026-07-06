"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

import { modes, type Mode } from "@/lib/content";
import { trackEvent } from "@/lib/api";
import { useMode } from "@/store/mode";

/** Recruiter / Freelancer / Founder lens — re-weights what the page emphasizes. */
export function ModeSwitcher() {
  const { mode, setMode } = useMode();
  const [open, setOpen] = useState(false);

  const pick = (m: Mode | null) => {
    setMode(m);
    setOpen(false);
    if (m) trackEvent("mode_switch", { mode: m });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
          mode
            ? "border-(--color-violet) text-(--color-ink)"
            : "border-(--color-line) text-(--color-ink-faint) hover:text-(--color-ink)"
        }`}
      >
        {mode ? modes[mode].label : "I'm a…"}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="glass absolute right-0 top-full z-50 mt-2 w-72 rounded-2xl p-2"
          >
            {(Object.keys(modes) as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => pick(m)}
                className="block w-full rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-white/5"
              >
                <span className="text-sm font-medium text-(--color-ink)">{modes[m].label}</span>
                <span className="mt-0.5 block text-xs leading-relaxed text-(--color-ink-faint)">
                  {modes[m].pitch}
                </span>
              </button>
            ))}
            {mode && (
              <button
                onClick={() => pick(null)}
                className="mt-1 w-full rounded-xl px-3 py-2 text-left text-xs text-(--color-ink-faint) hover:bg-white/5"
              >
                Clear mode
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
