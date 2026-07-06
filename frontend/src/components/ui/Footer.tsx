"use client";

import Link from "next/link";

import { person } from "@/lib/content";
import { trackEvent } from "@/lib/api";

export function Footer() {
  return (
    <footer className="border-t border-[--color-line] py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 md:flex-row">
        <div>
          <p className="font-[family-name:var(--font-display)] font-bold">
            <span className="text-gradient">Afnan</span>
            <span className="text-[--color-ink-dim]">.ai</span>
          </p>
          <p className="mt-1 text-xs text-[--color-ink-faint]">
            © {new Date().getFullYear()} {person.name}. Built with Next.js, FastAPI & a RAG-grounded AI twin.
          </p>
        </div>
        <div className="flex items-center gap-5 text-sm text-[--color-ink-dim]">
          <a
            href="/Afnan-Hany-CV.pdf"
            onClick={() => trackEvent("resume_download")}
            className="transition-colors hover:text-[--color-cyan]"
          >
            Download CV
          </a>
          <a href={person.linkedin} target="_blank" rel="noreferrer" className="transition-colors hover:text-[--color-cyan]">
            LinkedIn
          </a>
          <Link href="/chat" className="transition-colors hover:text-[--color-cyan]">
            AI Chat
          </Link>
          <Link href="/admin" className="text-[--color-ink-faint] transition-colors hover:text-[--color-ink-dim]">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
