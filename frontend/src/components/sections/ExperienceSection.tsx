"use client";

import { motion } from "framer-motion";

import { Section } from "@/components/ui/Section";
import { experience } from "@/lib/content";

export function ExperienceSection() {
  return (
    <Section id="experience" eyebrow="05 · Experience" title="Where I've built.">
      <div className="space-y-5">
        {experience.map((e, i) => (
          <motion.article
            key={e.org}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.55, delay: i * 0.08 }}
            className="card p-7"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold text-(--color-ink)">
                {e.org}
                <span className="ml-3 text-sm font-normal text-(--color-cyan)">{e.role}</span>
              </h3>
              <span className="font-[family-name:var(--font-mono)] text-xs text-(--color-ink-faint)">
                {e.period}
              </span>
            </div>
            <ul className="mt-4 space-y-2">
              {e.bullets.map((b) => (
                <li key={b.slice(0, 32)} className="flex gap-3 text-sm leading-relaxed text-(--color-ink-dim)">
                  <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-(--color-violet)" />
                  {b}
                </li>
              ))}
            </ul>
          </motion.article>
        ))}
      </div>
    </Section>
  );
}
