"use client";

import { motion } from "framer-motion";

import { Section } from "@/components/ui/Section";
import { aiSkills, softwareSkills } from "@/lib/content";

export function Skills() {
  return (
    <Section id="skills" eyebrow="04 · Skills" title="The AI stack, end to end.">
      <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
        {/* AI skills with animated meters */}
        <div className="card space-y-7 p-7">
          <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.24em] text-[--color-cyan]">
            AI Engineering
          </p>
          {aiSkills.map((s, i) => (
            <div key={s.name}>
              <div className="mb-2 flex items-baseline justify-between">
                <span className="text-sm font-medium text-[--color-ink]">{s.name}</span>
                <span className="font-[family-name:var(--font-mono)] text-xs text-[--color-ink-faint]">
                  {s.items.join(" · ")}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${s.level}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.1, delay: i * 0.1, ease: [0.21, 0.6, 0.35, 1] }}
                  className="h-full rounded-full bg-gradient-to-r from-[--color-violet] to-[--color-cyan]"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Software skills grouped as chips */}
        <div className="space-y-4">
          <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.24em] text-[--color-violet]">
            Software Engineering
          </p>
          {softwareSkills.map((g, i) => (
            <motion.div
              key={g.group}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              className="card p-4"
            >
              <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-[--color-ink-faint]">
                {g.group}
              </p>
              <div className="flex flex-wrap gap-2">
                {g.items.map((item) => (
                  <span
                    key={item}
                    className="rounded-lg border border-[--color-line] bg-white/[0.03] px-2.5 py-1 text-xs text-[--color-ink-dim] transition-colors hover:border-[--color-violet] hover:text-[--color-ink]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}
