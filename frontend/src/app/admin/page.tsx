"use client";

import { useCallback, useEffect, useState } from "react";

import { API_URL } from "@/lib/api";

/* ------------------------------------------------------------------ */
/* Admin dashboard: login -> overview, unanswered questions -> KB,     */
/* knowledge management, contact requests.                             */
/* ------------------------------------------------------------------ */

interface Q {
  id: string;
  visitor_name: string;
  company: string;
  email: string;
  phone: string;
  reason: string;
  question: string;
  context: Record<string, string>;
  status: string;
  answer: string | null;
  created_at: string;
}

interface KDoc { id: string; title: string; source_type: string; chunks: number; created_at: string }
interface Contact { id: string; name: string; email: string; company: string; kind: string; message: string; status: string; created_at: string }
interface Summary {
  visitors_30d: number; chat_sessions_30d: number; messages_30d: number;
  unanswered_questions: number; contacts_new: number; resume_downloads_30d: number;
  knowledge_documents: number; top_pages: { path: string; views: number }[];
}

function useToken() {
  const [token, setToken] = useState<string | null>(null);
  useEffect(() => {
    const url = new URL(window.location.href);
    const fromOauth = url.searchParams.get("token");
    if (fromOauth) {
      localStorage.setItem("admin_token", fromOauth);
      url.searchParams.delete("token");
      window.history.replaceState({}, "", url.toString());
    }
    setToken(localStorage.getItem("admin_token"));
  }, []);
  return {
    token,
    save: (t: string) => { localStorage.setItem("admin_token", t); setToken(t); },
    clear: () => { localStorage.removeItem("admin_token"); setToken(null); },
  };
}

async function adminApi<T>(token: string, path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}/api/v1${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(init.headers || {}) },
  });
  if (res.status === 401) throw new Error("unauthorized");
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

const inputCls =
  "w-full rounded-xl border border-(--color-line) bg-white/[0.03] px-4 py-3 text-sm text-(--color-ink) outline-none placeholder:text-(--color-ink-faint) focus:border-(--color-violet)";

function Login({ onToken }: { onToken: (t: string) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      onToken(data.access_token);
    } catch {
      setError("Invalid credentials or backend unreachable.");
    }
  };

  return (
    <main className="flex min-h-dvh items-center justify-center px-6">
      <form onSubmit={submit} className="card w-full max-w-sm space-y-4 p-8">
        <h1 className="font-[family-name:var(--font-display)] text-xl font-semibold">Admin sign-in</h1>
        <input required type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
        <input required type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} />
        <button className="w-full rounded-xl bg-gradient-to-r from-(--color-violet) to-(--color-cyan) py-3 text-sm font-semibold text-white">
          Sign in
        </button>
        {error && <p className="text-center text-xs text-(--color-rose)">{error}</p>}
        <div className="flex gap-2 pt-1">
          <a href={`${API_URL}/api/v1/auth/oauth/google/login`} className="glass flex-1 rounded-xl py-2.5 text-center text-xs text-(--color-ink-dim) hover:text-(--color-ink)">
            Google
          </a>
          <a href={`${API_URL}/api/v1/auth/oauth/github/login`} className="glass flex-1 rounded-xl py-2.5 text-center text-xs text-(--color-ink-dim) hover:text-(--color-ink)">
            GitHub
          </a>
        </div>
      </form>
    </main>
  );
}

function QuestionCard({ q, token, onChanged }: { q: Q; token: string; onChanged: () => void }) {
  const [answer, setAnswer] = useState("");
  const [busy, setBusy] = useState(false);

  const act = async (path: string, body?: object) => {
    setBusy(true);
    try {
      await adminApi(token, path, { method: "POST", body: body ? JSON.stringify(body) : undefined });
      onChanged();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-semibold text-(--color-ink)">
          {q.visitor_name} <span className="font-normal text-(--color-ink-faint)">· {q.email}{q.company && ` · ${q.company}`}</span>
        </p>
        <span className="font-[family-name:var(--font-mono)] text-[11px] text-(--color-ink-faint)">
          {new Date(q.created_at).toLocaleString()} · {q.context?.country || "?"}
        </span>
      </div>
      <p className="mt-3 rounded-xl bg-white/[0.04] p-4 text-sm text-(--color-ink)">{q.question}</p>
      {q.reason && <p className="mt-2 text-xs text-(--color-ink-faint)">Reason: {q.reason}{q.phone && ` · ${q.phone}`}</p>}
      {q.status === "answered" ? (
        <p className="mt-3 rounded-xl border border-emerald-400/25 bg-emerald-400/5 p-4 text-sm text-emerald-200">{q.answer}</p>
      ) : (
        <div className="mt-4 space-y-2.5">
          <textarea
            rows={3}
            placeholder="Write the answer once and it joins the AI knowledge base automatically."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className={inputCls}
          />
          <div className="flex gap-2">
            <button
              disabled={busy || !answer.trim()}
              onClick={() => act(`/admin/questions/${q.id}/answer`, { answer })}
              className="rounded-lg bg-gradient-to-r from-(--color-violet) to-(--color-cyan) px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
            >
              Answer & teach the AI
            </button>
            <button
              disabled={busy}
              onClick={() => act(`/admin/questions/${q.id}/dismiss`)}
              className="rounded-lg border border-(--color-line) px-4 py-2 text-xs text-(--color-ink-dim)"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminPage() {
  const { token, save, clear } = useToken();
  const [tab, setTab] = useState<"overview" | "questions" | "knowledge" | "contacts">("overview");
  const [summary, setSummary] = useState<Summary | null>(null);
  const [questions, setQuestions] = useState<Q[]>([]);
  const [docs, setDocs] = useState<KDoc[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [newDoc, setNewDoc] = useState({ title: "", content: "" });

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const [s, qs, ds, cs] = await Promise.all([
        adminApi<Summary>(token, "/admin/analytics/summary"),
        adminApi<Q[]>(token, "/admin/questions"),
        adminApi<KDoc[]>(token, "/admin/knowledge"),
        adminApi<Contact[]>(token, "/admin/contacts"),
      ]);
      setSummary(s); setQuestions(qs); setDocs(ds); setContacts(cs);
    } catch (e) {
      if ((e as Error).message === "unauthorized") clear();
    }
  }, [token, clear]);

  useEffect(() => { load(); }, [load]);

  if (token === null) return <Login onToken={save} />;

  const stats = summary
    ? [
        { label: "Visitors (30d)", value: summary.visitors_30d },
        { label: "Chat sessions (30d)", value: summary.chat_sessions_30d },
        { label: "Messages (30d)", value: summary.messages_30d },
        { label: "Unanswered questions", value: summary.unanswered_questions },
        { label: "New contacts", value: summary.contacts_new },
        { label: "CV downloads (30d)", value: summary.resume_downloads_30d },
        { label: "Knowledge documents", value: summary.knowledge_documents },
      ]
    : [];

  return (
    <main className="mx-auto max-w-5xl px-6 pb-24 pt-14">
      <div className="flex items-center justify-between">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
          <span className="text-gradient">Admin</span> dashboard
        </h1>
        <button onClick={clear} className="text-xs text-(--color-ink-faint) hover:text-(--color-ink)">Sign out</button>
      </div>

      <div className="mt-8 flex gap-2">
        {(["overview", "questions", "knowledge", "contacts"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-2 text-xs font-medium capitalize transition-colors ${
              tab === t ? "bg-gradient-to-r from-(--color-violet) to-(--color-cyan) text-white" : "border border-(--color-line) text-(--color-ink-dim)"
            }`}
          >
            {t}
            {t === "questions" && summary && summary.unanswered_questions > 0 && (
              <span className="ml-1.5 rounded-full bg-(--color-rose) px-1.5 text-[10px] text-white">
                {summary.unanswered_questions}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="card p-5">
              <p className="font-[family-name:var(--font-display)] text-3xl font-bold text-gradient">{s.value}</p>
              <p className="mt-1 text-xs text-(--color-ink-faint)">{s.label}</p>
            </div>
          ))}
          {summary && summary.top_pages.length > 0 && (
            <div className="card col-span-2 p-5 md:col-span-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-(--color-ink-faint)">Top pages (30d)</p>
              {summary.top_pages.map((p) => (
                <div key={p.path} className="flex justify-between border-b border-(--color-line) py-2 text-sm last:border-0">
                  <span className="text-(--color-ink-dim)">{p.path}</span>
                  <span className="font-[family-name:var(--font-mono)] text-(--color-ink)">{p.views}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "questions" && (
        <div className="mt-8 space-y-4">
          {questions.length === 0 && <p className="text-sm text-(--color-ink-faint)">No visitor questions yet.</p>}
          {questions.map((q) => (
            <QuestionCard key={q.id} q={q} token={token} onChanged={load} />
          ))}
        </div>
      )}

      {tab === "knowledge" && (
        <div className="mt-8 space-y-6">
          <div className="card space-y-3 p-6">
            <p className="text-sm font-semibold">Teach the AI something new</p>
            <input placeholder="Title (e.g. 'New certificate: AWS AI Practitioner')" value={newDoc.title}
              onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })} className={inputCls} />
            <textarea rows={4} placeholder="Write facts in first person. They become retrievable knowledge immediately."
              value={newDoc.content} onChange={(e) => setNewDoc({ ...newDoc, content: e.target.value })} className={inputCls} />
            <button
              disabled={!newDoc.title.trim() || !newDoc.content.trim()}
              onClick={async () => {
                await adminApi(token, "/admin/knowledge", { method: "POST", body: JSON.stringify({ ...newDoc, source_type: "upload" }) });
                setNewDoc({ title: "", content: "" });
                load();
              }}
              className="rounded-lg bg-gradient-to-r from-(--color-violet) to-(--color-cyan) px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
            >
              Add to knowledge base
            </button>
          </div>
          {docs.map((d) => (
            <div key={d.id} className="card flex items-center justify-between p-5">
              <div>
                <p className="text-sm font-medium text-(--color-ink)">{d.title}</p>
                <p className="mt-0.5 font-[family-name:var(--font-mono)] text-[11px] text-(--color-ink-faint)">
                  {d.source_type} · {d.chunks} chunks · {new Date(d.created_at).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={async () => {
                  if (!confirm(`Delete "${d.title}" from the knowledge base?`)) return;
                  await adminApi(token, `/admin/knowledge/${d.id}`, { method: "DELETE" });
                  load();
                }}
                className="text-xs text-(--color-rose) opacity-70 hover:opacity-100"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === "contacts" && (
        <div className="mt-8 space-y-4">
          {contacts.length === 0 && <p className="text-sm text-(--color-ink-faint)">No contact requests yet.</p>}
          {contacts.map((c) => (
            <div key={c.id} className="card p-6">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm font-semibold text-(--color-ink)">
                  {c.name} <span className="font-normal text-(--color-ink-faint)">· {c.email}{c.company && ` · ${c.company}`}</span>
                </p>
                <span className="rounded-full border border-(--color-line) px-2.5 py-0.5 text-[10px] uppercase tracking-wide text-(--color-ink-faint)">
                  {c.kind}
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-(--color-ink-dim)">{c.message}</p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
