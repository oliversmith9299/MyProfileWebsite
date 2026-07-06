"use client";

import { motion } from "framer-motion";

import { Section } from "@/components/ui/Section";
import { services } from "@/lib/content";

export function Services() {
  return (
    <Section id="services" eyebrow="07 · Services" title="What I can build for you.">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {services.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.06 }}
            className="card group border-t-2 border-t-transparent p-6 transition-colors hover:border-t-[--color-violet]"
          >
            <h3 className="font-[family-name:var(--font-display)] text-base font-semibold text-[--color-ink]">
              {s.title}
            </h3>
            <p className="mt-2 text-[13px] leading-relaxed text-[--color-ink-dim]">{s.desc}</p>
          </motion.div>
        ))}
      </div>
      <p className="mt-8 text-center text-sm text-[--color-ink-faint]">
        Every engagement ships with docs, tests, and deployment, the same way I built{" "}
        <a href="/projects/bizify" className="text-[--color-cyan] underline-offset-4 hover:underline">
          Bizify
        </a>
        .
      </p>
    </Section>
  );
}
