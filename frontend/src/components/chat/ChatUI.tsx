"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { api, streamChat } from "@/lib/api";
import { person } from "@/lib/content";

interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  sources?: { title: string; score: number }[];
  unknown?: boolean;
  streaming?: boolean;
}

const SUGGESTIONS = [
  "What did you build at IBM?",
  "Tell me about Bizify",
  "What's your AI stack?",
  "Are you available for freelance work?",
];

const WELCOME: ChatMessage = {
  id: 0,
  role: "assistant",
  content: `Hi! I'm Afnan's AI twin, trained on her real CV, projects, and experience. Ask me anything about her work. If I don't know something, I won't make it up. Instead, I'll ask the real Afnan and she'll get back to you.`,
};

/** Lead-capture form shown when the AI can't answer. */
function AskAfnanForm({
  question,
  sessionId,
  onDone,
}: {
  question: string;
  sessionId: string | null;
  onDone: () => void;
}) {
  const [form, setForm] = useState({ visitor_name: "", email: "", company: "", phone: "", reason: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      await api("/questions", {
        method: "POST",
        body: JSON.stringify({ ...form, question, session_id: sessionId }),
      });
      setStatus("sent");
      setTimeout(onDone, 2600);
    } catch {
      setStatus("error");
    }
  };

  const inputCls =
    "w-full rounded-lg border border-(--color-line) bg-white/[0.03] px-3 py-2 text-xs text-(--color-ink) outline-none placeholder:text-(--color-ink-faint) focus:border-(--color-violet)";

  if (status === "sent") {
    return (
      <div className="mt-3 rounded-xl border border-emerald-400/30 bg-emerald-400/5 p-4 text-xs text-emerald-300">
        Sent! Afnan gets an email right now and will reply to you directly.
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-3 space-y-2.5 rounded-xl border border-(--color-violet)/30 bg-(--color-violet)/5 p-4">
      <p className="text-xs text-(--color-ink-dim)">
        Leave your details and your question goes straight to Afnan&apos;s inbox:
      </p>
      <div className="grid grid-cols-2 gap-2.5">
        <input required placeholder="Your name *" value={form.visitor_name}
          onChange={(e) => setForm({ ...form, visitor_name: e.target.value })} className={inputCls} />
        <input required type="email" placeholder="Email *" value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} />
        <input placeholder="Company" value={form.company}
          onChange={(e) => setForm({ ...form, company: e.target.value })} className={inputCls} />
        <input placeholder="Phone (optional)" value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputCls} />
      </div>
      <input placeholder="Reason (hiring, project, curiosity…)" value={form.reason}
        onChange={(e) => setForm({ ...form, reason: e.target.value })} className={inputCls} />
      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full rounded-lg bg-gradient-to-r from-(--color-violet) to-(--color-cyan) py-2 text-xs font-semibold text-white disabled:opacity-60"
      >
        {status === "sending" ? "Sending…" : "Ask Afnan directly"}
      </button>
      {status === "error" && (
        <p className="text-center text-[11px] text-(--color-rose)">
          Couldn&apos;t send. Email {person.email} instead.
        </p>
      )}
    </form>
  );
}

export function ChatUI() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(1);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, pendingQuestion]);

  const send = async (text?: string) => {
    const message = (text ?? input).trim();
    if (!message || busy) return;
    setInput("");
    setPendingQuestion(null);
    setBusy(true);

    const userMsg: ChatMessage = { id: idRef.current++, role: "user", content: message };
    const aiId = idRef.current++;
    setMessages((m) => [...m, userMsg, { id: aiId, role: "assistant", content: "", streaming: true }]);

    const update = (patch: Partial<ChatMessage>) =>
      setMessages((m) => m.map((msg) => (msg.id === aiId ? { ...msg, ...patch } : msg)));

    let acc = "";
    await streamChat(
      { message, session_id: sessionId, mode: "default" },
      {
        onMeta: (d) => setSessionId(d.session_id),
        onToken: (t) => {
          acc += t;
          update({ content: acc });
        },
        onSources: (s) => update({ sources: s }),
        onUnknown: (msg) => {
          update({ content: msg, unknown: true });
          setPendingQuestion(message);
        },
        onDone: () => update({ streaming: false }),
        onError: () =>
          update({
            streaming: false,
            content: `I'm offline right now, the backend isn't reachable. You can email Afnan directly at ${person.email}.`,
          }),
      }
    );
    setBusy(false);
  };

  return (
    <main className="mx-auto flex h-dvh max-w-3xl flex-col px-4 pt-24">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-(--color-line) pb-4">
        <div className="ring-spin relative flex h-11 w-11 items-center justify-center rounded-xl">
          <span className="font-[family-name:var(--font-display)] text-sm font-bold text-gradient">AH</span>
        </div>
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-base font-semibold">Afnan&apos;s AI</h1>
          <p className="flex items-center gap-1.5 text-xs text-(--color-ink-faint)">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Answers only from verified knowledge
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-6 overflow-y-auto py-6">
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-gradient-to-r from-(--color-violet) to-[#7c4fe0] text-white"
                    : "glass text-(--color-ink)"
                }`}
              >
                {m.content ? (
                  <p className="whitespace-pre-wrap">{m.content}</p>
                ) : (
                  <span className="flex gap-1.5 py-1" aria-label="Thinking">
                    <span className="dot h-1.5 w-1.5 rounded-full bg-(--color-ink-dim)" />
                    <span className="dot h-1.5 w-1.5 rounded-full bg-(--color-ink-dim)" />
                    <span className="dot h-1.5 w-1.5 rounded-full bg-(--color-ink-dim)" />
                  </span>
                )}
                {m.sources && m.sources.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5 border-t border-(--color-line) pt-2.5">
                    {m.sources.map((s) => (
                      <span key={s.title} className="rounded-md bg-white/5 px-2 py-0.5 font-[family-name:var(--font-mono)] text-[10px] text-(--color-ink-faint)">
                        source: {s.title}
                      </span>
                    ))}
                  </div>
                )}
                {m.unknown && pendingQuestion && (
                  <AskAfnanForm
                    question={pendingQuestion}
                    sessionId={sessionId}
                    onDone={() => setPendingQuestion(null)}
                  />
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Suggestions (before first user message) */}
      {messages.length <= 1 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="rounded-full border border-(--color-line) px-3.5 py-1.5 text-xs text-(--color-ink-dim) transition-colors hover:border-(--color-violet) hover:text-(--color-ink)"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Composer */}
      <div className="pb-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="glass flex items-center gap-2 rounded-2xl p-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about my projects, skills, experience…"
            className="flex-1 bg-transparent px-3 py-2.5 text-sm text-(--color-ink) outline-none placeholder:text-(--color-ink-faint)"
            aria-label="Message"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="rounded-xl bg-gradient-to-r from-(--color-violet) to-(--color-cyan) px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.03] disabled:opacity-50"
          >
            {busy ? "…" : "Send"}
          </button>
        </form>
        <p className="mt-2 text-center text-[10px] text-(--color-ink-faint)">
          Answers come only from Afnan&apos;s verified knowledge base. Unknown questions are forwarded to her inbox.
        </p>
      </div>
    </main>
  );
}
