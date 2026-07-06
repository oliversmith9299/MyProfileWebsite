"use client";

import { useState } from "react";

import { Section } from "@/components/ui/Section";
import { api } from "@/lib/api";
import { person } from "@/lib/content";

type Status = "idle" | "sending" | "sent" | "error";

export function Contact() {
  const [status, setStatus] = useState<Status>("idle");
  const [form, setForm] = useState({ name: "", email: "", company: "", kind: "hire", message: "" });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      await api("/contact", { method: "POST", body: JSON.stringify(form) });
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  const inputCls =
    "w-full rounded-xl border border-[--color-line] bg-white/[0.03] px-4 py-3 text-sm text-[--color-ink] outline-none transition-colors placeholder:text-[--color-ink-faint] focus:border-[--color-violet]";

  return (
    <Section id="contact" eyebrow="09 · Contact" title="Let's build something.">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-6">
          <p className="text-[15px] leading-relaxed text-[--color-ink-dim]">
            Hiring for an AI role, need an AI MVP, or want a second brain on an LLM architecture?
            I usually reply within a day. Prefer instant answers? My{" "}
            <a href="/chat" className="text-[--color-cyan] underline-offset-4 hover:underline">AI assistant</a>{" "}
            knows everything on this site.
          </p>
          <div className="space-y-3 font-[family-name:var(--font-mono)] text-sm">
            <a href={`mailto:${person.email}`} className="block text-[--color-ink-dim] transition-colors hover:text-[--color-cyan]">
              ✉ {person.email}
            </a>
            <a href={person.linkedin} target="_blank" rel="noreferrer" className="block text-[--color-ink-dim] transition-colors hover:text-[--color-cyan]">
              in/ afnan-hany
            </a>
            <p className="text-[--color-ink-faint]">📍 {person.location}</p>
          </div>
        </div>

        {status === "sent" ? (
          <div className="card flex flex-col items-center justify-center gap-3 p-12 text-center">
            <span className="text-4xl">✨</span>
            <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold">Message received.</h3>
            <p className="text-sm text-[--color-ink-dim]">I&apos;ll get back to you shortly — thank you!</p>
          </div>
        ) : (
          <form onSubmit={submit} className="card space-y-4 p-7">
            <div className="grid gap-4 sm:grid-cols-2">
              <input required placeholder="Your name" value={form.name} onChange={set("name")} className={inputCls} />
              <input required type="email" placeholder="Email" value={form.email} onChange={set("email")} className={inputCls} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <input placeholder="Company (optional)" value={form.company} onChange={set("company")} className={inputCls} />
              <select value={form.kind} onChange={set("kind")} className={inputCls}>
                <option value="hire">Hiring — full-time role</option>
                <option value="freelance">Freelance project</option>
                <option value="consulting">AI consulting</option>
                <option value="general">Something else</option>
              </select>
            </div>
            <textarea
              required
              rows={5}
              placeholder="Tell me about the role or project…"
              value={form.message}
              onChange={set("message")}
              className={inputCls}
            />
            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full rounded-xl bg-gradient-to-r from-[--color-violet] to-[--color-cyan] py-3.5 text-sm font-semibold text-white transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
            >
              {status === "sending" ? "Sending…" : "Send message"}
            </button>
            {status === "error" && (
              <p className="text-center text-xs text-[--color-rose]">
                Couldn&apos;t reach the server — email me directly at {person.email}.
              </p>
            )}
          </form>
        )}
      </div>
    </Section>
  );
}
