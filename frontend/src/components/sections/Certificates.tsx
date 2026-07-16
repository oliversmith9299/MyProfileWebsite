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
            className="card border-l-2 border-l-(--color-violet)/40 p-5"
          >
            {/* Only certificates with a public verification page become links. */}
            {c.url ? (
              <a
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block"
                aria-label={`Verify ${c.title} (opens in a new tab)`}
              >
                <h3 className="flex items-start justify-between gap-2 text-sm font-semibold text-(--color-ink)">
                  {c.title}
                  <span
                    aria-hidden
                    className="text-(--color-ink-faint) transition-colors group-hover:text-(--color-violet)"
                  >
                    ↗
                  </span>
                </h3>
                <p className="mt-1 text-xs text-(--color-ink-faint)">
                  {c.issuer} · {c.year}
                </p>
                <span className="mt-3 inline-block font-[family-name:var(--font-mono)] text-[11px] text-(--color-violet) opacity-70 transition-opacity group-hover:opacity-100">
                  Verify credential
                </span>
              </a>
            ) : (
              <>
                <h3 className="text-sm font-semibold text-(--color-ink)">{c.title}</h3>
                <p className="mt-1 text-xs text-(--color-ink-faint)">
                  {c.issuer} · {c.year}
                </p>
              </>
            )}
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
