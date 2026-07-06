/** Thin client for the FastAPI backend. All calls degrade gracefully if the API is down. */

// Empty string (combined single-service deploy) => same-origin /api/v1 calls.
// Undefined (local dev without env) => the local FastAPI default.
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export function visitorId(): string {
  if (typeof window === "undefined") return "ssr";
  let id = localStorage.getItem("vid");
  if (!id) {
    id = crypto.randomUUID().replace(/-/g, "");
    localStorage.setItem("vid", id);
  }
  return id;
}

export async function api<T = unknown>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_URL}/api/v1${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "X-Visitor-Id": visitorId(),
      ...(init.headers || {}),
    },
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
  return res.json();
}

export function trackEvent(event: string, meta: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  api("/events", {
    method: "POST",
    body: JSON.stringify({ event, path: window.location.pathname, meta }),
  }).catch(() => {});
}

/** Parse an SSE stream from POST /chat/stream, invoking handlers per event. */
export async function streamChat(
  body: { message: string; session_id?: string | null; mode?: string },
  handlers: {
    onMeta?: (d: { session_id: string }) => void;
    onToken?: (text: string) => void;
    onSources?: (s: { title: string; score: number }[]) => void;
    onUnknown?: (message: string) => void;
    onDone?: () => void;
    onError?: (err: Error) => void;
  }
) {
  try {
    const res = await fetch(`${API_URL}/api/v1/chat/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Visitor-Id": visitorId() },
      body: JSON.stringify(body),
    });
    if (!res.ok || !res.body) throw new Error(`Chat unavailable (${res.status})`);

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let sep: number;
      while ((sep = buffer.indexOf("\n\n")) !== -1) {
        const raw = buffer.slice(0, sep);
        buffer = buffer.slice(sep + 2);
        let event = "message";
        let data = "";
        for (const line of raw.split("\n")) {
          if (line.startsWith("event: ")) event = line.slice(7).trim();
          else if (line.startsWith("data: ")) data += line.slice(6);
        }
        if (!data) continue;
        const parsed = JSON.parse(data);
        if (event === "meta") handlers.onMeta?.(parsed);
        else if (event === "token") handlers.onToken?.(parsed.text);
        else if (event === "sources") handlers.onSources?.(parsed);
        else if (event === "unknown") handlers.onUnknown?.(parsed.message);
        else if (event === "done") handlers.onDone?.();
      }
    }
  } catch (err) {
    handlers.onError?.(err instanceof Error ? err : new Error(String(err)));
  }
}
