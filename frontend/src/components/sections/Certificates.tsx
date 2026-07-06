"use client";

import { motion } from "framer-motion";

import { Section } from "@/components/ui/Section";
import { certificates } from "@/lib/content";

export function Certificates() {
  return (
    <Section id="certificates" eyebrow="06 · Certificates" title="Proof of depth.">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {certificates.map((c, i) => (
          <motion.div
            key={c.title}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: i * 0.06 }}
            className="card flex items-start gap-4 p-5"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[--color-violet]/20 to-[--color-cyan]/20 text-lg">
              🎓
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[--color-ink]">{c.title}</h3>
              <p className="mt-1 text-xs text-[--color-ink-faint]">
                {c.issuer} · {c.year}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
