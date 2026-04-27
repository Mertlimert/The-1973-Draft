from __future__ import annotations

import asyncio
import json
from typing import AsyncGenerator

from app.services.ai_clients import MiniMaxLyricsService, MiniMaxMusicService, MiniMaxTextService
from app.services.qr_code import generate_qr_base64
from app.services.rag import RagService


class DraftPipeline:
    def __init__(self) -> None:
        self.rag_service = RagService()
        self.text_service = MiniMaxTextService()
        self.lyrics_service = MiniMaxLyricsService()
        self.music_service = MiniMaxMusicService()

    async def stream(self, user_input: str) -> AsyncGenerator[str, None]:
        yield self._event("stage", {"message": "Searching 1973 archives..."})
        contexts = self.rag_service.search(user_input, top_k=2)
        await asyncio.sleep(0.7)

        yield self._event("stage", {"message": "The poet is writing the first draft..."})
        draft_1 = await self.text_service.chat_text(
            system=(
                "You are Agent 1, a 1973 anti-war folk poet. Write exactly 4 lines in English. "
                "Channel farewell, sadness, rebellion, and the feeling of leaving for the unknown. "
                "Avoid quotation marks and titles."
            ),
            user=(
                f"User confession: {user_input}\n\n"
                f"Archive context:\n{self._format_contexts(contexts)}"
            ),
            temperature=0.95,
        )
        await asyncio.sleep(0.7)

        yield self._event("stage", {"message": "The judge is reviewing the emotions..."})
        feedback = await self.text_service.chat_json(
            system=(
                "You are Agent 2, a judge of poetic emotion. Inspect the poem for sadness, rebellion, and farewell. "
                "Return JSON with one key named feedback. The value must be a single English sentence about what is missing or needs improvement."
            ),
            user=f"Poem:\n{draft_1}",
            temperature=0.4,
        )
        await asyncio.sleep(0.7)

        yield self._event("stage", {"message": "Composing the final farewell..."})
        final_lyrics = await self.text_service.chat_text(
            system=(
                "You are Agent 1 again. Revise the poem into a final 4-line English lyric. "
                "Keep it lyrical, intimate, and anti-war. Keep exactly 4 lines."
            ),
            user=(
                f"Original poem:\n{draft_1}\n\n"
                f"Judge feedback:\n{feedback['feedback']}\n\n"
                "Revise the poem accordingly."
            ),
            temperature=0.9,
        )
        final_lyrics = self._ensure_lyrics(final_lyrics)

        audio_prompt = await self.text_service.chat_text(
            system=(
                "You are Agent 3, the music director. Write one English prompt for a music generation model. "
                "Describe genre, tempo, instrumentation, vocal feel, recording texture, and a 3-to-4 minute arrangement arc in one sentence."
            ),
            user=f"Lyrics:\n{final_lyrics}",
            temperature=0.8,
        )

        song_packet = await self.lyrics_service.write_full_song(
            prompt=(
                "Write a complete anti-war folk song in English inspired by 1973 draft anxiety, farewell, and quiet rebellion. "
                "Use clear structure tags like [Verse], [Chorus], and [Outro]. Aim for enough content for a 3-4 minute song. "
                f"Keep this poetic core visible:\n{final_lyrics}\n\n"
                f"Reference archive material:\n{self._format_contexts(contexts)}"
            )
        )

        song = await self.music_service.generate_song(lyrics=song_packet["lyrics"], audio_prompt=audio_prompt)
        qr_base64 = generate_qr_base64(song["audio_url"]) if song["audio_url"] else None

        payload = {
            "contexts": contexts,
            "draft_1": draft_1,
            "judge_feedback": feedback["feedback"],
            "final_lyrics": final_lyrics,
            "song_lyrics": song_packet["lyrics"],
            "audio_prompt": audio_prompt,
            "audio_url": song["audio_url"],
            "audio_base64": song["audio_base64"],
            "audio_mime": song["audio_mime"],
            "audio_status": song["provider"],
            "audio_duration_ms": song["duration_ms"],
            "qr_code": qr_base64,
            "provider": song["provider"],
        }
        yield self._event("result", payload)
        yield "event: done\ndata: {}\n\n"

    def _event(self, event_type: str, payload: dict) -> str:
        return f"event: {event_type}\ndata: {json.dumps(payload)}\n\n"

    def _format_contexts(self, contexts: list[dict]) -> str:
        return "\n".join([f"- ({item['source']}) {item['text']}" for item in contexts])

    def _ensure_lyrics(self, lyrics: str) -> str:
        cleaned = "\n".join([line.strip() for line in (lyrics or "").splitlines() if line.strip()])
        if cleaned:
            return cleaned

        return "\n".join(
            [
                "I leave my shadow hanging on the backyard line,",
                "My father's quiet hammer, my sister's Sunday song,",
                "The papers call it duty, but the wind calls it goodbye,",
                "And every mile to nowhere tells me I don't belong.",
            ]
        )
