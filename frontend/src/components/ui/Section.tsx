"use client";

import { motion } from "framer-motion";

import { useMode } from "@/store/mode";
import { modes } from "@/lib/content";

/** Scroll-reveal section wrapper. Dims sections outside the active visitor mode's highlights. */
export function Section({
  id,
  eyebrow,
  title,
  children,
  className = "",
}: {
  id: string;
  eyebrow: string;
  title: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  const mode = useMode((s) => s.mode);
  const dimmed = mode ? !modes[mode].highlights.includes(id) : false;

  return (
    <section
      id={id}
      className={`relative mx-auto max-w-6xl scroll-mt-28 px-6 py-24 transition-opacity duration-700 md:py-32 ${
        dimmed ? "opacity-40 saturate-50" : "opacity-100"
      } ${className}`}
    >
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: [0.21, 0.6, 0.35, 1] }}
      >
        <p className="mb-3 font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.28em] text-[--color-violet]">
          {eyebrow}
        </p>
        <h2 className="mb-12 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[--color-ink] md:text-5xl">
          {title}
        </h2>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.8, delay: 0.12, ease: [0.21, 0.6, 0.35, 1] }}
      >
        {children}
      </motion.div>
    </section>
  );
}
