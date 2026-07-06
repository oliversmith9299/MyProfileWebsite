import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Footer } from "@/components/ui/Footer";
import { Navbar } from "@/components/ui/Navbar";
import { PageAnalytics } from "@/components/PageAnalytics";
import { blogPosts } from "@/lib/content";

export function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) return {};
  return { title: post.title, description: post.excerpt };
}

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) notFound();

  return (
    <>
      <Navbar />
      <PageAnalytics />
      <main className="mx-auto max-w-3xl px-6 pb-24 pt-36">
        <Link href="/blog" className="text-sm text-[--color-ink-faint] transition-colors hover:text-[--color-ink]">
          ← All posts
        </Link>
        <article className="mt-8">
          <p className="font-[family-name:var(--font-mono)] text-xs text-[--color-ink-faint]">
            {new Date(post.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} · {post.readingMinutes} min read
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-bold leading-tight tracking-tight">
            {post.title}
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-[--color-ink-dim]">{post.excerpt}</p>
          <hr className="my-10 border-[--color-line]" />
          <div className="space-y-10">
            {post.sections.map((s) => (
              <section key={s.heading}>
                <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[--color-ink]">
                  {s.heading}
                </h2>
                <p className="mt-4 text-[15px] leading-[1.85] text-[--color-ink-dim]">{s.body}</p>
              </section>
            ))}
          </div>
        </article>
        <div className="mt-16 flex justify-center">
          <Link
            href="/chat"
            className="rounded-full bg-gradient-to-r from-[--color-violet] to-[--color-cyan] px-7 py-3.5 text-sm font-semibold text-white transition-transform hover:scale-[1.03]"
          >
            Questions? Ask my AI →
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
