"use client";

import Link from "next/link";

import { Section } from "@/components/ui/Section";
import { blogPosts } from "@/lib/content";

export function BlogPreview() {
  return (
    <Section id="blog" eyebrow="08 · Writing" title="Engineering notes.">
      <div className="grid gap-5">
        {blogPosts.map((p) => (
          <Link key={p.slug} href={`/blog/${p.slug}`} className="card group flex flex-col gap-3 p-7 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-[family-name:var(--font-mono)] text-xs text-[--color-ink-faint]">
                {new Date(p.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} · {p.readingMinutes} min read
              </p>
              <h3 className="mt-2 font-[family-name:var(--font-display)] text-xl font-semibold text-[--color-ink] transition-colors group-hover:text-gradient">
                {p.title}
              </h3>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[--color-ink-dim]">{p.excerpt}</p>
            </div>
            <span className="shrink-0 text-[--color-ink-faint] transition-transform duration-300 group-hover:translate-x-1.5 group-hover:text-[--color-cyan]">
              Read →
            </span>
          </Link>
        ))}
      </div>
    </Section>
  );
}
