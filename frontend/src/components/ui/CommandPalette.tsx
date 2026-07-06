"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { person, projects, sections } from "@/lib/content";

interface Command {
  label: string;
  hint: string;
  action: () => void;
}

/** ⌘K / Ctrl+K palette — navigate anywhere, jump to projects, grab contact info. */
export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands = useMemo<Command[]>(
    () => [
      ...sections.map((s) => ({
        label: `Go to ${s.label}`,
        hint: "Section",
        action: () => (window.location.href = `/#${s.id}`),
      })),
      ...projects.map((p) => ({
        label: `Project: ${p.title}`,
        hint: p.tagline,
        action: () => router.push(`/projects/${p.slug}`),
      })),
      { label: "Talk with my AI", hint: "RAG assistant", action: () => router.push("/chat") },
      { label: "Read the blog", hint: "Writing", action: () => router.push("/blog") },
      {
        label: "Copy email address",
        hint: person.email,
        action: () => navigator.clipboard.writeText(person.email),
      },
      {
        label: "Open LinkedIn",
        hint: "Profile",
        action: () => window.open(person.linkedin, "_blank"),
      },
    ],
    [router]
  );

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return q ? commands.filter((c) => c.label.toLowerCase().includes(q)) : commands;
  }, [commands, query]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("open-palette", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("open-palette", onOpen);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  const run = (c: Command) => {
    setOpen(false);
    c.action();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[150] flex items-start justify-center bg-black/60 pt-[18vh] backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.96, y: -12 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, y: -12 }}
            transition={{ duration: 0.18 }}
            className="glass w-full max-w-lg overflow-hidden rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
              }}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") setActive((a) => Math.min(a + 1, filtered.length - 1));
                if (e.key === "ArrowUp") setActive((a) => Math.max(a - 1, 0));
                if (e.key === "Enter" && filtered[active]) run(filtered[active]);
              }}
              placeholder="Type a command or search…"
              className="w-full border-b border-(--color-line) bg-transparent px-5 py-4 text-sm text-(--color-ink) outline-none placeholder:text-(--color-ink-faint)"
            />
            <div className="max-h-72 overflow-y-auto p-2">
              {filtered.length === 0 && (
                <p className="px-3 py-6 text-center text-sm text-(--color-ink-faint)">No results</p>
              )}
              {filtered.map((c, i) => (
                <button
                  key={c.label}
                  onClick={() => run(c)}
                  onMouseEnter={() => setActive(i)}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                    i === active ? "bg-white/8 text-(--color-ink)" : "text-(--color-ink-dim)"
                  }`}
                >
                  <span>{c.label}</span>
                  <span className="max-w-[45%] truncate text-xs text-(--color-ink-faint)">{c.hint}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
