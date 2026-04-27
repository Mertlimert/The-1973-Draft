from __future__ import annotations

import math
import re
from collections import Counter

from app.data.seed_documents import SEED_DOCUMENTS


TOKEN_PATTERN = re.compile(r"[a-zA-Z']+")


class RagService:
    def __init__(self) -> None:
        self.documents = [
            {
                "id": doc["id"],
                "text": doc["text"],
                "source": doc["source"],
                "tokens": self._tokenize(doc["text"]),
            }
            for doc in SEED_DOCUMENTS
        ]

    def search(self, query: str, top_k: int = 2) -> list[dict]:
        query_tokens = self._tokenize(query)
        scored = []

        for document in self.documents:
            score = self._cosine_similarity(query_tokens, document["tokens"])
            scored.append(
                {
                    "id": document["id"],
                    "text": document["text"],
                    "source": document["source"],
                    "score": score,
                }
            )

        ranked = sorted(scored, key=lambda item: item["score"], reverse=True)[:top_k]
        return [{"id": item["id"], "text": item["text"], "source": item["source"]} for item in ranked]

    def _tokenize(self, text: str) -> Counter[str]:
        tokens = TOKEN_PATTERN.findall(text.lower())
        return Counter(tokens)

    def _cosine_similarity(self, left: Counter[str], right: Counter[str]) -> float:
        if not left or not right:
            return 0.0

        intersection = set(left) & set(right)
        dot_product = sum(left[token] * right[token] for token in intersection)
        left_norm = math.sqrt(sum(value * value for value in left.values()))
        right_norm = math.sqrt(sum(value * value for value in right.values()))

        if left_norm == 0 or right_norm == 0:
            return 0.0

        return dot_product / (left_norm * right_norm)
