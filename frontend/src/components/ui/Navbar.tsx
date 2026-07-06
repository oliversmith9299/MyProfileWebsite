"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { sections } from "@/lib/content";
import { ModeSwitcher } from "@/components/ui/ModeSwitcher";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled ? "glass border-b border-(--color-line) py-3" : "bg-transparent py-5"
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="font-[family-name:var(--font-display)] text-lg font-bold tracking-tight"
        >
          <span className="text-gradient">Afnan</span>
          <span className="text-(--color-ink-dim)">.ai</span>
        </Link>

        <div className="hidden items-center gap-6 lg:flex">
          {sections.slice(0, 6).map((s) => (
            <a
              key={s.id}
              href={`/#${s.id}`}
              className="text-sm text-(--color-ink-dim) transition-colors hover:text-(--color-ink)"
            >
              {s.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <ModeSwitcher />
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("open-palette"))}
            className="hidden items-center gap-2 rounded-full border border-(--color-line) px-3 py-1.5 text-xs text-(--color-ink-faint) transition-colors hover:border-(--color-violet) hover:text-(--color-ink) md:flex"
            aria-label="Open command palette"
          >
            <span>Search</span>
            <kbd className="rounded bg-white/5 px-1.5 py-0.5 font-[family-name:var(--font-mono)]">⌘K</kbd>
          </button>
          <Link
            href="/chat"
            className="group relative overflow-hidden rounded-full bg-gradient-to-r from-(--color-violet) to-(--color-cyan) px-4 py-2 text-sm font-medium text-white transition-transform hover:scale-[1.03] active:scale-[0.98]"
          >
            <span className="relative z-10">Talk with my AI</span>
          </Link>
          <button
            className="lg:hidden text-(--color-ink-dim)"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </nav>

      {open && (
        <div className="glass mx-4 mt-3 rounded-2xl p-4 lg:hidden">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`/#${s.id}`}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-sm text-(--color-ink-dim) hover:bg-white/5 hover:text-(--color-ink)"
            >
              {s.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}
