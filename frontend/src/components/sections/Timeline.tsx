"use client";

import { motion } from "framer-motion";

import { Section } from "@/components/ui/Section";
import { timeline } from "@/lib/content";

const KIND_COLOR: Record<string, string> = {
  education: "#22d3ee",
  work: "#8b5cf6",
  award: "#fbbf24",
};

export function Timeline() {
  return (
    <Section id="journey" eyebrow="02 · Journey" title="From SAP scripts to agent systems.">
      <div className="relative ml-3 border-l border-[--color-line] pl-8 md:ml-6">
        {timeline.map((item, i) => (
          <motion.div
            key={`${item.year}-${item.title}`}
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: i * 0.06 }}
            className="relative pb-10 last:pb-0"
          >
            <span
              className="absolute -left-[37px] top-1 h-3.5 w-3.5 rounded-full border-2 border-[--color-bg] md:-left-[39px]"
              style={{ background: KIND_COLOR[item.kind] }}
            />
            <p className="font-[family-name:var(--font-mono)] text-xs text-[--color-ink-faint]">
              {item.year} · {item.kind}
            </p>
            <h3 className="mt-1 font-[family-name:var(--font-display)] text-lg font-semibold text-[--color-ink]">
              {item.title}
            </h3>
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-[--color-ink-dim]">{item.detail}</p>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
