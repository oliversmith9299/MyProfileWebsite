"""The AI persona: answers as Afnan, grounded strictly in retrieved knowledge."""

from collections.abc import AsyncGenerator

from openai import AsyncOpenAI

from app.core.config import settings
from app.services.rag import RetrievedChunk

PERSONA_SYSTEM_PROMPT = """You are the AI version of Afnan Hany Youssef — an AI Developer from Egypt \
who builds production LLM systems (RAG pipelines, AI orchestrators, MCP-based agent workflows, FastAPI backends).

Speak in first person, as Afnan: warm, confident, concise, technically precise.

HARD RULES — never break these:
1. Answer ONLY from the KNOWLEDGE section below. Never invent projects, dates, employers, or skills.
2. If the knowledge doesn't contain the answer, reply exactly with: "I don't know that yet, but I can ask Afnan directly."
3. Keep answers short and useful (2 to 6 sentences) unless the visitor asks for depth.
4. When relevant, point visitors to the Projects section, the CV download, or the contact form.
5. Style: plain, human sentences. Never use em dashes or emojis.

KNOWLEDGE:
{knowledge}
"""

_client: AsyncOpenAI | None = None


def _get_client() -> AsyncOpenAI | None:
    global _client
    if not settings.openai_api_key:
        return None
    if _client is None:
        _client = AsyncOpenAI(
            api_key=settings.openai_api_key,
            base_url=settings.openai_base_url or None,
        )
    return _client


def build_system_prompt(chunks: list[RetrievedChunk]) -> str:
    knowledge = "\n\n---\n\n".join(f"[{c.document_title}]\n{c.content}" for c in chunks)
    return PERSONA_SYSTEM_PROMPT.format(knowledge=knowledge or "(empty)")


async def stream_answer(
    question: str,
    chunks: list[RetrievedChunk],
    history: list[dict] | None = None,
) -> AsyncGenerator[str, None]:
    """Yield answer tokens. Without an API key, falls back to extractive answers
    so the platform remains fully demoable."""
    client = _get_client()
    if client is None:
        best = chunks[0] if chunks else None
        text = (
            f"Here's what I can tell you from my knowledge base:\n\n{best.content}"
            if best
            else "I don't know that yet, but I can ask Afnan directly."
        )
        yield text
        return

    messages: list[dict] = [{"role": "system", "content": build_system_prompt(chunks)}]
    for m in (history or [])[-8:]:
        messages.append({"role": m["role"], "content": m["content"]})
    messages.append({"role": "user", "content": question})

    stream = await client.chat.completions.create(
        model=settings.chat_model,
        messages=messages,
        temperature=0.4,
        max_tokens=600,
        stream=True,
    )
    async for event in stream:
        delta = event.choices[0].delta.content if event.choices else None
        if delta:
            yield delta
