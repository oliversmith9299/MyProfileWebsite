import type { Metadata } from "next";
import Link from "next/link";

import { Footer } from "@/components/ui/Footer";
import { Navbar } from "@/components/ui/Navbar";
import { PageAnalytics } from "@/components/PageAnalytics";
import { blogPosts } from "@/lib/content";

export const metadata: Metadata = {
  title: "Writing",
  description: "Engineering notes on building production AI systems.",
};

export default function BlogIndex() {
  return (
    <>
      <Navbar />
      <PageAnalytics />
      <main className="mx-auto max-w-4xl px-6 pb-24 pt-36">
        <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.28em] text-(--color-violet)">
          Writing
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight">
          Engineering notes.
        </h1>
        <div className="mt-12 space-y-5">
          {blogPosts.map((p) => (
            <Link key={p.slug} href={`/blog/${p.slug}`} className="card group block p-7">
              <p className="font-[family-name:var(--font-mono)] text-xs text-(--color-ink-faint)">
                {new Date(p.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} · {p.readingMinutes} min read
              </p>
              <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold text-(--color-ink)">
                {p.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-(--color-ink-dim)">{p.excerpt}</p>
              <span className="mt-4 inline-block text-sm text-(--color-cyan)">Read →</span>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
