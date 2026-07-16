import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Footer } from "@/components/ui/Footer";
import { Navbar } from "@/components/ui/Navbar";
import { CommandPalette } from "@/components/ui/CommandPalette";
import { PageAnalytics } from "@/components/PageAnalytics";
import { projects } from "@/lib/content";

/** Columns follow the metric count so the last cell never sits alone on its own row. */
const METRIC_COLS: Record<number, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-4",
};

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.tagline,
    openGraph: { title: project.title, description: project.description },
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();

  return (
    <>
      <Navbar />
      <CommandPalette />
      <PageAnalytics />
      <main className="mx-auto max-w-4xl px-6 pb-24 pt-36">
        <Link href="/#projects" className="text-sm text-(--color-ink-faint) transition-colors hover:text-(--color-ink)">
          ← All projects
        </Link>

        <header className="mt-8">
          <span
            className="rounded-full px-3 py-1 font-[family-name:var(--font-mono)] text-xs"
            style={{ background: `${project.accent}1f`, color: project.accent }}
          >
            {project.period}
          </span>
          <h1 className="mt-5 font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight md:text-5xl">
            {project.title}
          </h1>
          <p className="mt-3 text-lg" style={{ color: project.accent }}>
            {project.tagline}
          </p>
          <p className="mt-6 text-[15px] leading-relaxed text-(--color-ink-dim)">{project.description}</p>
        </header>

        <div
          className={`mt-10 grid grid-cols-2 gap-4 ${
            METRIC_COLS[project.metrics.length] ?? "sm:grid-cols-3"
          }`}
        >
          {project.metrics.map((m) => (
            <div key={m.label} className="card p-5 text-center">
              <p className="font-[family-name:var(--font-display)] text-2xl font-bold text-gradient">{m.value}</p>
              <p className="mt-1 text-xs text-(--color-ink-faint)">{m.label}</p>
            </div>
          ))}
        </div>

        <section className="mt-14 grid gap-6 md:grid-cols-2">
          <div className="card p-7">
            <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-(--color-rose)">The problem</h2>
            <p className="mt-3 text-sm leading-relaxed text-(--color-ink-dim)">{project.problem}</p>
          </div>
          <div className="card p-7">
            <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-(--color-cyan)">The solution</h2>
            <p className="mt-3 text-sm leading-relaxed text-(--color-ink-dim)">{project.solution}</p>
          </div>
        </section>

        <section className="mt-6">
          <div className="card p-7">
            <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">Architecture</h2>
            <ol className="mt-4 space-y-3">
              {project.architecture.map((a, i) => (
                <li key={a} className="flex gap-4 text-sm leading-relaxed text-(--color-ink-dim)">
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md font-[family-name:var(--font-mono)] text-xs"
                    style={{ background: `${project.accent}1f`, color: project.accent }}
                  >
                    {i + 1}
                  </span>
                  {a}
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mt-6">
          <div className="card p-7">
            <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">Tech stack</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {project.tech.map((t) => (
                <span key={t} className="rounded-lg border border-(--color-line) px-3 py-1.5 font-[family-name:var(--font-mono)] text-xs text-(--color-ink-dim)">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-6">
          <div className="card p-7">
            <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">Lessons learned</h2>
            <ul className="mt-4 space-y-3">
              {project.lessons.map((l) => (
                <li key={l.slice(0, 32)} className="flex gap-3 text-sm leading-relaxed text-(--color-ink-dim)">
                  <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-(--color-violet)" />
                  {l}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <div className="mt-14 flex flex-wrap items-center justify-center gap-4">
          {project.links.demo && (
            <a
              href={project.links.demo}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full px-7 py-3.5 text-sm font-semibold text-white transition-transform hover:scale-[1.03]"
              style={{ background: project.accent }}
            >
              Visit live site ↗
            </a>
          )}
          {project.links.video && (
            <a
              href={project.links.video}
              target="_blank"
              rel="noopener noreferrer"
              className="glass rounded-full px-7 py-3.5 text-sm font-semibold text-(--color-ink) transition-colors hover:border-(--color-violet)"
            >
              Watch the video ↗
            </a>
          )}
          {project.links.github && (
            <a
              href={project.links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="glass rounded-full px-7 py-3.5 text-sm font-semibold text-(--color-ink) transition-colors hover:border-(--color-violet)"
            >
              View source ↗
            </a>
          )}
          <Link
            href="/chat"
            className="rounded-full bg-gradient-to-r from-(--color-violet) to-(--color-cyan) px-7 py-3.5 text-sm font-semibold text-white transition-transform hover:scale-[1.03]"
          >
            Ask my AI about {project.title} →
          </Link>
          <a href="/#contact" className="glass rounded-full px-7 py-3.5 text-sm font-semibold text-(--color-ink) transition-colors hover:border-(--color-violet)">
            Build something like this
          </a>
        </div>
      </main>
      <Footer />
    </>
  );
}
