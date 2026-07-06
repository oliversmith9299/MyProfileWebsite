"""Embedding service.

Uses OpenAI `text-embedding-3-small` when OPENAI_API_KEY is set.
Falls back to a deterministic local hashing embedder otherwise, so the whole
platform (including retrieval) still works in demos and CI without a key.
"""

import hashlib
import math
import re

from openai import AsyncOpenAI

from app.core.config import settings

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


def _local_embed(text: str) -> list[float]:
    """Deterministic bag-of-words hashing embedding (cosine-comparable)."""
    dim = settings.embedding_dim
    vec = [0.0] * dim
    tokens = re.findall(r"[a-z0-9]+", text.lower())
    for i, tok in enumerate(tokens):
        # include bigrams for slightly better matching
        for gram in (tok, tokens[i - 1] + "_" + tok if i > 0 else None):
            if not gram:
                continue
            h = int.from_bytes(hashlib.sha1(gram.encode()).digest()[:8], "big")
            vec[h % dim] += 1.0
    norm = math.sqrt(sum(v * v for v in vec)) or 1.0
    return [v / norm for v in vec]


async def embed_texts(texts: list[str]) -> list[list[float]]:
    client = _get_client()
    if client is None:
        return [_local_embed(t) for t in texts]
    resp = await client.embeddings.create(model=settings.embedding_model, input=texts)
    return [item.embedding for item in resp.data]


async def embed_text(text: str) -> list[float]:
    return (await embed_texts([text]))[0]
