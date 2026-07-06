"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { ParticleField } from "@/components/effects/ParticleField";
import { person } from "@/lib/content";
import { trackEvent } from "@/lib/api";
import { useMode } from "@/store/mode";
import { modes } from "@/lib/content";

/** Typewriter that cycles through the role titles. */
function TypedRoles() {
  const roles = person.roles;
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = roles[index % roles.length];
    const timeout = setTimeout(
      () => {
        if (!deleting) {
          const next = current.slice(0, text.length + 1);
          setText(next);
          if (next === current) setTimeout(() => setDeleting(true), 1600);
        } else {
          const next = current.slice(0, text.length - 1);
          setText(next);
          if (next === "") {
            setDeleting(false);
            setIndex((i) => (i + 1) % roles.length);
          }
        }
      },
      deleting ? 32 : 65
    );
    return () => clearTimeout(timeout);
  }, [text, deleting, index, roles]);

  // "a" vs "an" must follow the current role (an AI Engineer, a Founder)
  const article = /^[aeiou]/i.test(roles[index % roles.length]) ? "an" : "a";

  return (
    <>
      <span className="text-(--color-ink-dim)">{article} </span>
      <span className="text-gradient font-semibold">
        {text}
        <span className="caret ml-0.5 inline-block h-[0.9em] w-[2px] translate-y-[2px] bg-(--color-cyan)" />
      </span>
    </>
  );
}

/** Portrait with animated ring; falls back to a monogram if /profile.jpg is missing. */
function Portrait() {
  const [failed, setFailed] = useState(false);
  return (
    <div className="ring-spin relative h-40 w-40 overflow-hidden rounded-3xl md:h-52 md:w-52">
      {failed ? (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1b1636] to-[#0a2230]">
          <span className="font-[family-name:var(--font-display)] text-5xl font-bold text-gradient">AH</span>
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/profile.jpg"
          alt={person.name}
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}

export function Hero() {
  const mode = useMode((s) => s.mode);
  const ref = useRef<HTMLDivElement>(null);

  // Mouse-parallax tilt on the whole hero content
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 20 });
  const sy = useSpring(my, { stiffness: 60, damping: 20 });
  const glowX = useTransform(sx, (v) => `${50 + v * 18}%`);
  const glowY = useTransform(sy, (v) => `${40 + v * 18}%`);

  const onMove = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set((e.clientX - rect.left) / rect.width - 0.5);
    my.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      className="relative flex min-h-screen items-center overflow-hidden"
    >
      {/* Layered background: grid, aurora, particles, cursor glow */}
      <div className="grid-bg absolute inset-0" />
      <div className="aurora left-[8%] top-[12%] h-96 w-96 bg-(--color-violet)" />
      <div className="aurora right-[6%] top-[38%] h-80 w-80 bg-(--color-cyan)" style={{ animationDelay: "-7s" }} />
      <ParticleField />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: useTransform(
            [glowX, glowY],
            ([x, y]) => `radial-gradient(600px circle at ${x} ${y}, rgba(139,92,246,0.09), transparent 65%)`
          ),
        }}
      />

      <div className="relative z-10 mx-auto grid w-full max-w-6xl gap-14 px-6 pb-20 pt-36 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.3 }}
            className="glass mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs text-(--color-ink-dim)"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            Open to AI roles, freelance, and startup collabs · {person.location}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.45 }}
            className="font-[family-name:var(--font-display)] text-4xl font-bold leading-[1.08] tracking-tight md:text-6xl"
          >
            {person.name.split(" ").slice(0, 2).join(" ")}
            <br />
            <span className="text-2xl text-(--color-ink-dim) md:text-4xl">I&apos;m </span>
            <span className="text-2xl md:text-4xl"><TypedRoles /></span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.6 }}
            className="mt-6 max-w-xl text-base leading-relaxed text-(--color-ink-dim) md:text-lg"
          >
            {mode ? modes[mode].pitch : person.intro}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.75 }}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <a
              href="/#contact"
              onClick={() => trackEvent("cta_hire_me")}
              className="group relative overflow-hidden rounded-full bg-gradient-to-r from-(--color-violet) to-(--color-cyan) px-7 py-3.5 text-sm font-semibold text-white shadow-[0_8px_40px_-8px_rgba(139,92,246,0.6)] transition-transform hover:scale-[1.04] active:scale-[0.98]"
            >
              <span className="relative z-10">Hire Me</span>
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            </a>
            <Link
              href="/chat"
              onClick={() => trackEvent("cta_talk_ai")}
              className="glass rounded-full px-7 py-3.5 text-sm font-semibold text-(--color-ink) transition-all hover:border-(--color-violet) hover:shadow-[0_8px_40px_-12px_rgba(34,211,238,0.4)]"
            >
              Talk with my AI <span aria-hidden>→</span>
            </Link>
          </motion.div>

          <motion.dl
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 2 }}
            className="mt-14 grid max-w-xl grid-cols-2 gap-6 sm:grid-cols-4"
          >
            {person.stats.map((s) => (
              /* col-reverse keeps dt-before-dd markup while showing the value on
                 top, so all numbers sit on one aligned row and labels on the next */
              <div key={s.label} className="flex flex-col-reverse justify-end">
                <dt className="mt-1 text-xs leading-snug text-(--color-ink-faint)">{s.label}</dt>
                <dd className="font-[family-name:var(--font-display)] text-2xl font-bold leading-none text-gradient">
                  {s.value}
                </dd>
              </div>
            ))}
          </motion.dl>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 1.5 }}
          className="mx-auto"
        >
          <Portrait />
        </motion.div>
      </div>

      <motion.a
        href="/#about"
        aria-label="Scroll to about"
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-(--color-ink-faint)"
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M6 13l6 6 6-6" />
        </svg>
      </motion.a>
    </div>
  );
}
