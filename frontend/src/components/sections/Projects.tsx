"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRef } from "react";

import { Section } from "@/components/ui/Section";
import { projects, type Project } from "@/lib/content";

/** Columns follow the metric count so the last cell never sits alone on its own row. */
const METRIC_COLS: Record<number, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-4",
};

/** 3D-tilting project card with accent lighting that follows the cursor. */
function ProjectCard({ project, index }: { project: Project; index: number }) {
  const ref = useRef<HTMLAnchorElement>(null);

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(900px) rotateY(${px * 6}deg) rotateX(${py * -6}deg) translateY(-4px)`;
    el.style.setProperty("--mx", `${(px + 0.5) * 100}%`);
    el.style.setProperty("--my", `${(py + 0.5) * 100}%`);
  };
  const onLeave = () => {
    if (ref.current) ref.current.style.transform = "";
  };

  // Open the live demo without triggering the card's navigation to the detail page.
  const openDemo = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (project.links.demo) window.open(project.links.demo, "_blank", "noopener,noreferrer");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: index * 0.12 }}
    >
      <Link
        ref={ref}
        href={`/projects/${project.slug}`}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        className="card group relative block overflow-hidden p-7 transition-transform duration-200 will-change-transform"
        style={{ transformStyle: "preserve-3d" }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: `radial-gradient(420px circle at var(--mx, 50%) var(--my, 50%), ${project.accent}18, transparent 60%)`,
          }}
        />
        <div className="relative">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="rounded-full px-3 py-1 font-[family-name:var(--font-mono)] text-[11px]"
                style={{ background: `${project.accent}1f`, color: project.accent }}
              >
                {project.period}
              </span>
              {project.links.demo && (
                <span
                  role="link"
                  tabIndex={0}
                  aria-label="Open live demo in a new tab"
                  onClick={openDemo}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") openDemo(e);
                  }}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 font-[family-name:var(--font-mono)] text-[11px] font-medium text-emerald-300 transition-colors hover:border-emerald-400/70 hover:bg-emerald-400/20"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                  </span>
                  Live demo ↗
                </span>
              )}
            </div>
            <span className="text-(--color-ink-faint) transition-transform duration-300 group-hover:translate-x-1 group-hover:text-(--color-ink)">
              →
            </span>
          </div>
          <h3 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-(--color-ink)">
            {project.title}
          </h3>
          <p className="mt-1 text-sm font-medium" style={{ color: project.accent }}>
            {project.tagline}
          </p>
          <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-(--color-ink-dim)">
            {project.description}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {project.tech.slice(0, 5).map((t) => (
              <span
                key={t}
                className="rounded-md border border-(--color-line) px-2 py-1 font-[family-name:var(--font-mono)] text-[11px] text-(--color-ink-dim)"
              >
                {t}
              </span>
            ))}
            {project.tech.length > 5 && (
              <span className="px-1 py-1 text-[11px] text-(--color-ink-faint)">
                +{project.tech.length - 5}
              </span>
            )}
          </div>
          <div
            className={`mt-6 grid grid-cols-2 gap-4 border-t border-(--color-line) pt-5 ${
              METRIC_COLS[project.metrics.length] ?? "sm:grid-cols-3"
            }`}
          >
            {project.metrics.map((m) => (
              <div key={m.label}>
                <p className="font-[family-name:var(--font-display)] text-lg font-bold text-(--color-ink)">
                  {m.value}
                </p>
                <p className="text-[11px] text-(--color-ink-faint)">{m.label}</p>
              </div>
            ))}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function Projects() {
  return (
    <Section id="projects" eyebrow="03 · Projects" title="Systems that shipped.">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="lg:col-span-2">
          <ProjectCard project={projects[0]} index={0} />
        </div>
        {projects.slice(1).map((p, i) => (
          <ProjectCard key={p.slug} project={p} index={i + 1} />
        ))}
      </div>
    </Section>
  );
}
